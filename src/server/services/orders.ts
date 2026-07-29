import "server-only";

import { Prisma } from "@prisma/client";

import { prisma } from "@/server/database/client";
import { moneySum, moneyToNumber } from "@/server/money";
import { getCouponQuote } from "@/server/services/coupons";
import { changeInventory } from "@/server/services/inventory";

export type CartItemInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export class OrderInventoryError extends Error {
  constructor(
    public readonly productName: string,
    public readonly available: number,
    public readonly requested: number,
  ) {
    super(`Estoque insuficiente para ${productName}`);
    this.name = "OrderInventoryError";
  }
}

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
  checkoutKey?: string;
  couponCode?: string | null;
};

const orderInclude = {
  store: true,
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

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(async (tx) => {
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

    const storeIds = new Set(products.map((product) => product.storeId));
    if (storeIds.size !== 1) throw new Error("O carrinho deve conter produtos de uma unica loja");
    const storeId = [...storeIds][0];
    const store = await tx.store.findUnique({ where: { id: storeId } });
    if (!store) throw new Error("Loja nao encontrada");

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

      if (item.variantId && !variant) {
        throw new Error(`Variacao invalida para ${product.name}`);
      }

      const availableInventory = variant?.inventory ?? product.inventory;

      if (availableInventory < item.quantity) {
        throw new OrderInventoryError(
          product.name,
          availableInventory,
          item.quantity,
        );
      }
    }

    const orderItems = normalizedItems.map((item) => {
      const product = productsById.get(item.productId);
      if (!product) throw new Error("Produto nao encontrado");

      const variant = item.variantId
        ? product.variants.find((entry) => entry.id === item.variantId)
        : product.variants.find((entry) => entry.isDefault) ?? product.variants[0];

      if (item.variantId && !variant) throw new Error("Variacao do produto invalida");

      const price = moneyToNumber(variant?.priceOverride ?? product.promoPrice ?? product.price);

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

    const subtotal = moneySum(orderItems.map((item) => item.price * item.quantity));
    const couponQuote = checkout?.couponCode
      ? await getCouponQuote(tx, checkout.couponCode, normalizedItems)
      : null;
    const discountAmount = couponQuote?.discountAmount ?? 0;

    const shippingCost = moneyToNumber(checkout?.shippingCost ?? 0);
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
        storeId,
        addressId: shippingAddress?.id,
        subtotal,
        discountAmount,
        shippingCost,
        total: moneySum([subtotal, shippingCost, -discountAmount]),
        couponId: couponQuote?.coupon.id,
        couponCode: couponQuote?.code,
        checkoutKey: checkout?.checkoutKey,
        paymentMethod: checkout?.paymentMethod ?? "PENDING",
        paymentProvider: checkout?.paymentMethod === "STRIPE" ? "STRIPE" : "MANUAL",
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

    if (couponQuote) {
      await tx.coupon.update({
        where: { id: couponQuote.coupon.id },
        data: { usageCount: { increment: 1 } },
      });
    }

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
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      const retryable = String(error).includes("INVENTORY_CONFLICT") || String(error).includes("P2034");
      if (!retryable || attempt === 2) throw error;
    }
  }
  throw new Error("INVENTORY_CONFLICT");
}

export { orderInclude };

export function serializeOrder<T extends Record<string, unknown>>(order: T) {
  const items = Array.isArray(order.items)
    ? order.items.map((item) => {
        const record = item as Record<string, unknown>;
        return { ...record, price: moneyToNumber(record.price as number | string | { toString(): string }) };
      })
    : order.items;
  return {
    ...order,
    subtotal: moneyToNumber(order.subtotal as number | string | { toString(): string }),
    discountAmount: moneyToNumber(order.discountAmount as number | string | { toString(): string }),
    shippingCost: moneyToNumber(order.shippingCost as number | string | { toString(): string }),
    total: moneyToNumber(order.total as number | string | { toString(): string }),
    items,
  };
}

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
