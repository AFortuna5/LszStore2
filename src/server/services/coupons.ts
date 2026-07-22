import "server-only";

import { Prisma } from "@prisma/client";

import { moneyToCents, moneyToNumber } from "../money";

export type CouponCartItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export class CouponValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CouponValidationError";
  }
}

export function normalizeCouponCode(value: string) {
  return value.trim().toUpperCase().replace(/\s+/g, "");
}

export async function getCouponQuote(
  tx: Prisma.TransactionClient,
  rawCode: string,
  items: CouponCartItem[],
  now = new Date(),
) {
  const code = normalizeCouponCode(rawCode);
  if (!code) throw new CouponValidationError("Informe um cupom");

  const coupon = await tx.coupon.findUnique({
    where: { code },
    include: { category: { select: { id: true, name: true, slug: true } } },
  });

  if (!coupon) throw new CouponValidationError("Cupom nao encontrado");
  if (!coupon.active) throw new CouponValidationError("Este cupom esta desativado");
  if (coupon.startsAt.getTime() > now.getTime()) throw new CouponValidationError("Este cupom ainda nao esta disponivel");
  if (coupon.endsAt.getTime() < now.getTime()) throw new CouponValidationError("Este cupom expirou");

  const products = await tx.product.findMany({
    where: { id: { in: [...new Set(items.map((item) => item.productId))] } },
    include: { variants: true },
  });
  const productsById = new Map(products.map((product) => [product.id, product]));

  let eligibleCents = 0;
  for (const item of items) {
    const product = productsById.get(item.productId);
    if (!product || !Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new CouponValidationError("Carrinho invalido");
    }
    if (coupon.categoryId && product.categoryId !== coupon.categoryId) continue;

    const variant = item.variantId
      ? product.variants.find((entry) => entry.id === item.variantId)
      : product.variants.find((entry) => entry.isDefault) ?? product.variants[0];
    if (item.variantId && !variant) throw new CouponValidationError("Variacao do produto invalida");

    const unitPrice = variant?.priceOverride ?? product.promoPrice ?? product.price;
    eligibleCents += moneyToCents(unitPrice) * item.quantity;
  }

  if (eligibleCents <= 0) {
    const categoryName = coupon.category?.name;
    throw new CouponValidationError(categoryName
      ? `Este cupom vale apenas para a categoria ${categoryName}`
      : "Este cupom nao se aplica aos produtos do carrinho");
  }

  const discountCents = Math.min(
    eligibleCents,
    Math.round((eligibleCents * coupon.discountPercent) / 100),
  );

  return {
    coupon,
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    category: coupon.category,
    eligibleSubtotal: moneyToNumber(eligibleCents / 100),
    discountAmount: moneyToNumber(discountCents / 100),
  };
}
