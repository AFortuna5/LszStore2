import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/server/database/client";
import { changeInventory } from "@/server/services/inventory";

export type CartItemInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

type CheckoutAddressInput = {
  fullName: string;
  phone: string;
  email: string;
  zipCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement?: string | null;
};

type CheckoutOrderInput = {
  address: CheckoutAddressInput;
  paymentMethod: string;
  shippingCost: number;
  shippingService?: string;
  shippingServiceId?: string;
  shippingDeadline?: number;
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
      variant: true,
    },
  },
  shippingAddress: true,
} satisfies Prisma.OrderInclude;

export async function createOrderFromCart(
  userId: string,
  items: CartItemInput[],
  checkout?: CheckoutOrderInput
) {
  const normalizedItems = mergeCartItems(items);
  if (normalizedItems.length === 0) {
    throw new Error("Adicione pelo menos um produto ao pedido");
  }

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      throw new Error("Usuario nao encontrado");
    }

    const productIds = normalizedItems.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { id: { in: productIds } },
      include: {
        variants: true,
        category: true,
      },
    });

    const productsById = new Map(
      products.map((product) => [product.id, product])
    );

    for (const item of normalizedItems) {
      const product = productsById.get(item.productId);

      if (!product) {
        throw new Error(`Produto ${item.productId} nao encontrado`);
      }

      const variant = item.variantId
        ? product.variants.find((entry) => entry.id === item.variantId)
        : product.variants.find((entry) => entry.isDefault) ?? product.variants[0];

      const availableInventory = variant?.inventory ?? product.inventory;

      if (availableInventory < item.quantity) {
        throw new Error(`Estoque insuficiente para ${product.name}`);
      }
    }

    const orderItems = normalizedItems.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) throw new Error("Produto nao encontrado");

      const variant = item.variantId
        ? product.variants.find((entry) => entry.id === item.variantId)
        : product.variants.find((entry) => entry.isDefault) ?? product.variants[0];

      const price = variant?.priceOverride ?? product.promoPrice ?? product.price;

      return {
        productId: product.id,
        variantId: variant?.id ?? null,
        productName: product.name,
        variantLabel: variant?.label ?? null,
        variantSku: variant?.sku ?? null,
        quantity: item.quantity,
        price,
      };
    });

    const total = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const shippingCost = checkout?.shippingCost ?? 0;
    const subtotal = total;
    const address = checkout?.address;

    const shippingAddress = address
      ? await tx.address.create({
          data: {
            userId,
            ...address,
          },
        })
      : null;

    const order = await tx.order.create({
      data: {
        userId,
        addressId: shippingAddress?.id,
        subtotal,
        shippingCost,
        total: subtotal + shippingCost,
        paymentMethod: checkout?.paymentMethod ?? "PENDING",
        paymentProvider: checkout?.paymentMethod === "MERCADO_PAGO" ? "MERCADO_PAGO" : "MANUAL",
        shippingService: checkout?.shippingService,
        shippingServiceId: checkout?.shippingServiceId,
        shippingDeadline: checkout?.shippingDeadline,
        status: "PENDING",
        customerName: address?.fullName ?? "",
        customerEmail: address?.email ?? "",
        customerPhone: address?.phone ?? null,
        zipCode: address?.zipCode ?? "",
        street: address?.street ?? "",
        number: address?.number ?? "",
        neighborhood: address?.neighborhood ?? "",
        city: address?.city ?? "",
        state: address?.state ?? "",
        complement: address?.complement ?? null,
        items: {
          create: orderItems,
        },
      },
      include: orderInclude,
    });

    for (const item of orderItems) {
      await changeInventory(
        tx,
        { productId: item.productId, variantId: item.variantId },
        -item.quantity,
        {
          type: "SALE",
          actorUserId: user.id,
          actorName: user.name,
          actorEmail: user.email,
          orderId: order.id,
          customerName: address?.fullName ?? user.name,
          customerEmail: address?.email ?? user.email,
          reason: "Reserva de estoque para venda",
          reference: `Pedido #${order.id.slice(-8).toUpperCase()}`,
        },
      );
    }

    return order;
  });
}

export { orderInclude };

function mergeCartItems(items: CartItemInput[]) {
  const merged = new Map<string, CartItemInput>();

  for (const item of items) {
    const key = `${item.productId}:${item.variantId ?? "default"}`;
    const current = merged.get(key);
    merged.set(key, {
      productId: item.productId,
      variantId: item.variantId ?? null,
      quantity: (current?.quantity ?? 0) + item.quantity,
    });
  }

  return [...merged.values()];
}
