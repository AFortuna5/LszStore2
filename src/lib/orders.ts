import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

export type CartItemInput = {
  productId: string;
  quantity: number;
};

const orderInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: {
    include: {
      product: {
        include: {
          category: true,
        },
      },
    },
  },
} satisfies Prisma.OrderInclude;

export async function createOrderFromCart(userId: string, items: CartItemInput[]) {
  const normalizedItems = mergeCartItems(items);
  if (normalizedItems.length === 0) {
    throw new Error("Adicione pelo menos um produto ao pedido");
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw new Error("Usuario nao encontrado");
    }

    const productIds = normalizedItems.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
    });

    const productsById = new Map(
      products.map((product) => [product.id, product])
    );

    for (const item of normalizedItems) {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new Error(`Produto ${item.productId} nao encontrado`);
      }

      if (product.inventory < item.quantity) {
        throw new Error(`Estoque insuficiente para ${product.name}`);
      }
    }

    const orderItems = normalizedItems.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) throw new Error("Produto nao encontrado");

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.promoPrice ?? product.price,
      };
    });

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = await tx.order.create({
      data: {
        userId,
        total,
        status: "PENDING",
        items: {
          create: orderItems,
        },
      },
      include: orderInclude,
    });

    await Promise.all(
      orderItems.map((item) =>
        tx.product.update({
          where: { id: item.productId },
          data: {
            inventory: {
              decrement: item.quantity,
            },
          },
        })
      )
    );

    return order;
  });
}

export { orderInclude };

function mergeCartItems(items: CartItemInput[]) {
  const merged = new Map<string, CartItemInput>();

  for (const item of items) {
    const current = merged.get(item.productId);
    merged.set(item.productId, {
      productId: item.productId,
      quantity: (current?.quantity ?? 0) + item.quantity,
    });
  }

  return [...merged.values()];
}
