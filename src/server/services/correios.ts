import "server-only";

import { env } from "@/server/config/env";

export type CorreiosPackage = {
  weightGrams: number;
  widthCm: number;
  heightCm: number;
  lengthCm: number;
  declaredValue: number;
};

export type CorreiosQuote = {
  id: string;
  name: string;
  company: "Correios";
  price: number;
  deliveryDays: number;
};

type CachedToken = { value: string; expiresAt: number };

let cachedToken: CachedToken | null = null;
let tokenRequest: Promise<string> | null = null;

export function isCorreiosConfigured() {
  return Boolean(
    env.correiosId &&
    env.correiosApiCode &&
    env.correiosPostingCard &&
    env.originZip.length === 8 &&
    env.correiosServices.length,
  );
}

export async function getCorreiosQuotes(
  destinationZip: string,
  shippingPackage: CorreiosPackage,
): Promise<CorreiosQuote[]> {
  if (!isCorreiosConfigured()) return [];

  const quotes = await Promise.all(
    env.correiosServices.map((service) => quoteService(service, destinationZip, shippingPackage)),
  );

  return quotes
    .filter((quote): quote is CorreiosQuote => quote !== null)
    .sort((first, second) => first.price - second.price);
}

async function quoteService(
  service: { code: string; name: string },
  destinationZip: string,
  shippingPackage: CorreiosPackage,
) {
  const priceUrl = new URL(`${getApiHost()}/preco/v1/nacional/${service.code}`);
  priceUrl.searchParams.set("cepOrigem", env.originZip);
  priceUrl.searchParams.set("cepDestino", destinationZip);
  priceUrl.searchParams.set("psObjeto", String(Math.ceil(shippingPackage.weightGrams)));
  priceUrl.searchParams.set("tpObjeto", "2");
  priceUrl.searchParams.set("comprimento", String(Math.ceil(shippingPackage.lengthCm)));
  priceUrl.searchParams.set("largura", String(Math.ceil(shippingPackage.widthCm)));
  priceUrl.searchParams.set("altura", String(Math.ceil(shippingPackage.heightCm)));
  priceUrl.searchParams.set("vlDeclarado", shippingPackage.declaredValue.toFixed(2));
  if (env.correiosContract) priceUrl.searchParams.set("nuContrato", env.correiosContract);
  if (env.correiosDr) priceUrl.searchParams.set("nuDR", env.correiosDr);

  const deadlineUrl = new URL(`${getApiHost()}/prazo/v1/nacional/${service.code}`);
  deadlineUrl.searchParams.set("cepOrigem", env.originZip);
  deadlineUrl.searchParams.set("cepDestino", destinationZip);

  const [priceResponse, deadlineResponse] = await Promise.all([
    correiosFetch(priceUrl),
    correiosFetch(deadlineUrl),
  ]);

  if (!priceResponse.ok || !deadlineResponse.ok) {
    console.error(
      `Correios indisponivel para ${service.code}`,
      priceResponse.status,
      deadlineResponse.status,
    );
    return null;
  }

  const [pricePayload, deadlinePayload] = await Promise.all([
    priceResponse.json() as Promise<Record<string, unknown>>,
    deadlineResponse.json() as Promise<Record<string, unknown>>,
  ]);

  if (pricePayload.txErro || deadlinePayload.txErro) return null;

  const price = parseCorreiosMoney(pricePayload.pcFinal);
  const deliveryDays = Number(deadlinePayload.prazoEntrega);
  if (!Number.isFinite(price) || !Number.isFinite(deliveryDays)) return null;

  return {
    id: service.code,
    name: service.name,
    company: "Correios" as const,
    price,
    deliveryDays,
  };
}

async function correiosFetch(url: URL) {
  let token = await getToken();
  let response = await fetch(url, {
    headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (response.status === 401) {
    cachedToken = null;
    token = await getToken();
    response = await fetch(url, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
  }

  return response;
}

async function getToken() {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;
  tokenRequest ??= requestToken().finally(() => {
    tokenRequest = null;
  });
  return tokenRequest;
}

async function requestToken() {
  const response = await fetch(`${getApiHost()}/token/v1/autentica/cartaopostagem`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Basic ${Buffer.from(`${env.correiosId}:${env.correiosApiCode}`).toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      numero: env.correiosPostingCard,
      ...(env.correiosContract ? { contrato: env.correiosContract } : {}),
      ...(env.correiosDr ? { dr: Number(env.correiosDr) } : {}),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Falha ao autenticar nos Correios", response.status, await response.text());
    throw new Error("Nao foi possivel autenticar o servico de frete");
  }

  const payload = await response.json() as Record<string, unknown>;
  if (typeof payload.token !== "string") throw new Error("Token invalido retornado pelos Correios");

  const parsedExpiration = typeof payload.expiraEm === "string" ? Date.parse(payload.expiraEm) : Number.NaN;
  cachedToken = {
    value: payload.token,
    expiresAt: Number.isFinite(parsedExpiration) ? parsedExpiration : Date.now() + 50 * 60_000,
  };
  return cachedToken.value;
}

function getApiHost() {
  return env.correiosSandbox ? "https://apihom.correios.com.br" : "https://api.correios.com.br";
}

function parseCorreiosMoney(value: unknown) {
  if (typeof value === "number") return value;
  if (typeof value !== "string") return Number.NaN;
  const normalized = value.includes(",")
    ? value.replace(/\./g, "").replace(",", ".")
    : value;
  return Number(normalized);
}
