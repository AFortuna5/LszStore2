import "server-only";

import { env } from "@/server/config/env";
import { prisma } from "@/server/database/client";
import { moneyToNumber } from "@/server/money";

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

  if (!env.melhorEnvioToken) return [fallbackQuote()];
  const baseUrl = env.melhorEnvioSandbox ? "https://sandbox.melhorenvio.com.br" : "https://melhorenvio.com.br";
  const response = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.melhorEnvioToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": `${env.storeName} (${env.supportEmail})`,
    },
    body: JSON.stringify({
      from: { postal_code: env.originZip }, to: { postal_code: zip },
      products: items.map((item) => {
        const product = byId.get(item.productId)!;
        const variant = product.variants.find((entry) => entry.id === item.variantId);
        return {
          id: product.id, width: product.width, height: product.height, length: product.length,
          weight: product.weight,
          insurance_value: moneyToNumber(variant?.priceOverride ?? product.promoPrice ?? product.price),
          quantity: item.quantity,
        };
      }),
      options: { receipt: false, own_hand: false },
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    console.error("Melhor Envio indisponivel", response.status, await response.text());
    throw new Error("Nao foi possivel consultar as transportadoras. Tente novamente.");
  }
  const result = await response.json() as unknown;
  if (!Array.isArray(result)) throw new Error("Resposta invalida do servico de frete");
  const quotes = result.filter((quote) => !quote.error && quote.price).map((quote) => ({
    id: String(quote.id), name: String(quote.name ?? "Entrega"),
    company: String((quote.company as { name?: string } | undefined)?.name ?? "Transportadora"),
    price: Number(quote.custom_price ?? quote.price),
    deliveryDays: Number(quote.custom_delivery_time ?? quote.delivery_time ?? env.fallbackShippingDays),
  })).filter((quote) => Number.isFinite(quote.price));
  if (!quotes.length) throw new Error("Nenhuma opcao de frete disponivel para este CEP");
  return quotes;
}

function fallbackQuote(): ShippingQuote {
  return { id: "STANDARD", name: "Entrega padrao", company: env.storeName, price: env.fallbackShippingPrice, deliveryDays: env.fallbackShippingDays };
}
