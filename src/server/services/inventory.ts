import "server-only";

import { Prisma } from "@prisma/client";

type InventoryTx = Prisma.TransactionClient;

export type InventoryMovementContext = {
  type: string;
  actorUserId?: string | null;
  actorName?: string | null;
  actorEmail?: string | null;
  orderId?: string | null;
  customerName?: string | null;
  customerEmail?: string | null;
  reason?: string | null;
  reference?: string | null;
  createdAt?: Date;
};

export async function changeInventory(
  tx: InventoryTx,
  target: { productId: string; variantId?: string | null },
  delta: number,
  context: InventoryMovementContext,
) {
  if (!Number.isInteger(delta) || delta === 0) throw new Error("INVENTORY_DELTA_INVALID");

  const product = await tx.product.findUnique({
    where: { id: target.productId },
    select: { id: true, name: true, inventory: true },
  });
  if (!product) throw new Error("INVENTORY_PRODUCT_NOT_FOUND");

  const variant = target.variantId
    ? await tx.productVariant.findFirst({
        where: { id: target.variantId, productId: target.productId },
        select: { id: true, label: true, sku: true, inventory: true },
      })
    : null;
  if (target.variantId && !variant) throw new Error("INVENTORY_VARIANT_NOT_FOUND");

  const previousStock = variant?.inventory ?? product.inventory;
  const newStock = previousStock + delta;
  if (newStock < 0) throw new Error("INVENTORY_INSUFFICIENT");

  if (variant) {
    await tx.productVariant.update({ where: { id: variant.id }, data: { inventory: newStock } });
  } else {
    await tx.product.update({ where: { id: product.id }, data: { inventory: newStock } });
  }

  return tx.inventoryMovement.create({
    data: {
      productId: product.id,
      variantId: variant?.id,
      orderId: context.orderId,
      actorUserId: context.actorUserId,
      type: context.type,
      direction: delta > 0 ? "IN" : "OUT",
      quantity: Math.abs(delta),
      previousStock,
      newStock,
      productName: product.name,
      variantName: variant?.label,
      sku: variant?.sku,
      actorName: context.actorName,
      actorEmail: context.actorEmail,
      customerName: context.customerName,
      customerEmail: context.customerEmail,
      reason: context.reason,
      reference: context.reference,
      createdAt: context.createdAt,
    },
  });
}

export async function recordInventorySnapshot(
  tx: InventoryTx,
  input: {
    productId?: string | null;
    variantId?: string | null;
    productName: string;
    variantName?: string | null;
    sku?: string | null;
    previousStock: number;
    newStock: number;
  },
  context: InventoryMovementContext,
) {
  const delta = input.newStock - input.previousStock;
  if (delta === 0) return null;
  return tx.inventoryMovement.create({
    data: {
      productId: input.productId,
      variantId: input.variantId,
      orderId: context.orderId,
      actorUserId: context.actorUserId,
      type: context.type,
      direction: delta > 0 ? "IN" : "OUT",
      quantity: Math.abs(delta),
      previousStock: input.previousStock,
      newStock: input.newStock,
      productName: input.productName,
      variantName: input.variantName,
      sku: input.sku,
      actorName: context.actorName,
      actorEmail: context.actorEmail,
      customerName: context.customerName,
      customerEmail: context.customerEmail,
      reason: context.reason,
      reference: context.reference,
      createdAt: context.createdAt,
    },
  });
}

export async function ensureInventoryBaselines(tx: InventoryTx) {
  const [products, existingMovements] = await Promise.all([
    tx.product.findMany({
      select: {
        id: true, name: true, inventory: true, createdAt: true,
        variants: { select: { id: true, label: true, sku: true, inventory: true, createdAt: true } },
      },
    }),
    tx.inventoryMovement.findMany({ select: { productId: true, variantId: true, sku: true } }),
  ]);
  const existingKeys = new Set(existingMovements.map((movement) => `${movement.productId ?? "deleted"}:${movement.sku ? `sku:${movement.sku}` : "general"}`));

  for (const product of products) {
    const items = product.variants.length
      ? product.variants.map((variant) => ({
          variantId: variant.id, variantName: variant.label, sku: variant.sku,
          inventory: variant.inventory, createdAt: variant.createdAt,
        }))
      : [{ variantId: null, variantName: null, sku: null, inventory: product.inventory, createdAt: product.createdAt }];
    for (const item of items) {
      const key = `${product.id}:${item.sku ? `sku:${item.sku}` : "general"}`;
      if (existingKeys.has(key) || item.inventory <= 0) continue;
      await recordInventorySnapshot(tx, {
        productId: product.id,
        variantId: item.variantId,
        productName: product.name,
        variantName: item.variantName,
        sku: item.sku,
        previousStock: 0,
        newStock: item.inventory,
      }, {
        type: "INITIAL_IMPORT",
        actorName: "Sistema",
        reason: "Saldo existente importado para o controle de inventario",
        createdAt: item.createdAt,
      });
      existingKeys.add(key);
    }
  }
}
