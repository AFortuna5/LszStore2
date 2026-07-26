import "server-only";

import { env } from "@/server/config/env";
import { prisma } from "@/server/database/client";
import { moneyToNumber } from "@/server/money";
import {
  getMelhorEnvioQuotes,
  isMelhorEnvioConfigured,
} from "@/server/services/melhor-envio";

export type ShippingCartItem = { productId: string; variantId?: string | null; quantity: number };
export type ShippingQuote = { id: string; name: string; company: string; price: number; deliveryDays: number };

export async function getShippingQuotes(items: ShippingCartItem[], destinationZip: string) {
  const zip = destinationZip.replace(/\D/g, "");
  if (zip.length !== 8) throw new Error("CEP invalido");
  if (!items.length) throw new Error("Carrinho vazio");

  const products = await prisma.product.findMany({ where: { id: { in: items.map((item) => item.productId) } }, include: { variants: true } });
  if (products.length !== new Set(items.map((item) => item.productId)).size) throw new Error("Produto invalido");
  const byId = new Map(products.map((product) => [product.id, product]));
  const subtotal = items.reduce((sum, item) => {
    const product = byId.get(item.productId)!;
    const variant = product.variants.find((entry) => entry.id === item.variantId);
    if (item.variantId && !variant) throw new Error("Variacao de produto invalida");
    return sum + moneyToNumber(variant?.priceOverride ?? product.promoPrice ?? product.price) * item.quantity;
  }, 0);

  if (subtotal >= env.freeShippingFrom) {
    return [{ id: "FREE", name: "Frete gratis", company: env.storeName, price: 0, deliveryDays: env.fallbackShippingDays }];
  }

  if (!isMelhorEnvioConfigured()) return [fallbackQuote()];

  const quotes = await getMelhorEnvioQuotes(zip, items.map((item) => {
    const product = byId.get(item.productId)!;
    const variant = product.variants.find((entry) => entry.id === item.variantId);
    return {
      id: item.variantId ? `${product.id}:${item.variantId}` : product.id,
      quantity: item.quantity,
      weight: product.weight,
      width: product.width,
      height: product.height,
      length: product.length,
      insuranceValue: moneyToNumber(
        variant?.priceOverride ?? product.promoPrice ?? product.price,
      ),
    };
  }));
  if (!quotes.length) throw new Error("Nenhuma opcao de frete disponivel para este CEP");
  return quotes;
}

function fallbackQuote(): ShippingQuote {
  return { id: "STANDARD", name: "Entrega padrao", company: env.storeName, price: env.fallbackShippingPrice, deliveryDays: env.fallbackShippingDays };
}
