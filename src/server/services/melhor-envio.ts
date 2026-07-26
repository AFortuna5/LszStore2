import "server-only";

import { env } from "@/server/config/env";

export type MelhorEnvioProduct = {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insuranceValue: number;
  quantity: number;
};

export type MelhorEnvioQuote = {
  id: string;
  name: string;
  company: string;
  price: number;
  deliveryDays: number;
};

export function isMelhorEnvioConfigured() {
  return Boolean(env.melhorEnvioToken && env.originZip.length === 8);
}

export async function getMelhorEnvioQuotes(
  destinationZip: string,
  products: MelhorEnvioProduct[],
): Promise<MelhorEnvioQuote[]> {
  if (!isMelhorEnvioConfigured()) return [];

  const host = env.melhorEnvioSandbox
    ? "https://sandbox.melhorenvio.com.br"
    : "https://melhorenvio.com.br";
  const response = await fetch(`${host}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${env.melhorEnvioToken}`,
      "Content-Type": "application/json",
      "User-Agent": `${env.storeName} (${env.supportEmail})`,
    },
    body: JSON.stringify({
      from: { postal_code: env.originZip },
      to: { postal_code: destinationZip },
      products: products.map((product) => ({
        id: product.id,
        width: product.width,
        height: product.height,
        length: product.length,
        weight: product.weight,
        insurance_value: Number(product.insuranceValue.toFixed(2)),
        quantity: product.quantity,
      })),
      options: { receipt: false, own_hand: false },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const details = (await response.text()).slice(0, 500);
    console.error("Melhor Envio indisponivel", response.status, details);
    throw new Error("Nao foi possivel consultar o frete. Tente novamente.");
  }

  const payload = await response.json() as unknown;
  if (!Array.isArray(payload)) throw new Error("Resposta invalida do servico de frete");

  return payload.flatMap((entry): MelhorEnvioQuote[] => {
    if (!isRecord(entry) || entry.error) return [];

    const price = toFiniteNumber(entry.custom_price ?? entry.price);
    const deliveryDays = toFiniteNumber(
      entry.custom_delivery_time ?? entry.delivery_time,
    );
    if (price === null || deliveryDays === null) return [];

    const company = isRecord(entry.company) && typeof entry.company.name === "string"
      ? entry.company.name
      : "Transportadora";

    return [{
      id: String(entry.id),
      name: typeof entry.name === "string" ? entry.name : "Entrega",
      company,
      price,
      deliveryDays,
    }];
  }).sort((first, second) => first.price - second.price);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toFiniteNumber(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
