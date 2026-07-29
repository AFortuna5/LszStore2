import "server-only";

import { storeContact } from "@/shared/store-contact";

function parseCorreiosServices(value: string | undefined) {
  const services = (value ?? "03298:PAC,03220:SEDEX")
    .split(",")
    .map((entry) => {
      const [code, ...nameParts] = entry.split(":");
      return { code: code?.trim(), name: nameParts.join(":").trim() };
    })
    .filter((service) => /^\d+$/.test(service.code) && service.name);
  return services.length ? services : [{ code: "03298", name: "PAC" }, { code: "03220", name: "SEDEX" }];
}

export const env = {
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  storeName: process.env.STORE_NAME ?? "LSZ Store",
  supportEmail: process.env.SUPPORT_EMAIL ?? storeContact.email,
  originZip: (process.env.SHIPPING_ORIGIN_ZIP ?? "01001000").replace(/\D/g, ""),
  freeShippingFrom: Number(process.env.FREE_SHIPPING_FROM ?? 399),
  fallbackShippingPrice: Number(process.env.FALLBACK_SHIPPING_PRICE ?? 24.9),
  fallbackShippingDays: Number(process.env.FALLBACK_SHIPPING_DAYS ?? 7),
  correiosId: process.env.CORREIOS_ID,
  correiosApiCode: process.env.CORREIOS_API_CODE,
  correiosPostingCard: process.env.CORREIOS_POSTING_CARD,
  correiosContract: process.env.CORREIOS_CONTRACT,
  correiosDr: process.env.CORREIOS_DR,
  correiosServices: parseCorreiosServices(process.env.CORREIOS_SERVICES),
  correiosSandbox: process.env.CORREIOS_SANDBOX === "true",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  stripeDefaultCommissionPercentage: Number(process.env.STRIPE_DEFAULT_COMMISSION_PERCENTAGE ?? 5),
  stripeLiveMode: process.env.STRIPE_LIVE_MODE === "true",
  paymentProvider: process.env.PAYMENT_PROVIDER ?? "manual",
  resendKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM ?? "LSZ Store <onboarding@resend.dev>",
  cloudinaryName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryKey: process.env.CLOUDINARY_API_KEY,
  cloudinarySecret: process.env.CLOUDINARY_API_SECRET,
};

export function assertProductionConfig() {
  if (process.env.NODE_ENV !== "production") return;
  const missing: string[] = [];
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) missing.push("AUTH_SECRET");
  if (!process.env.APP_URL) missing.push("APP_URL");
  if (!process.env.DATABASE_URL) missing.push("DATABASE_URL");
  if (process.env.PAYMENT_PROVIDER === "stripe") {
    if (!process.env.STRIPE_SECRET_KEY) missing.push("STRIPE_SECRET_KEY");
    if (!process.env.STRIPE_WEBHOOK_SECRET) missing.push("STRIPE_WEBHOOK_SECRET");
    if (!Number.isFinite(env.stripeDefaultCommissionPercentage) || env.stripeDefaultCommissionPercentage < 0 || env.stripeDefaultCommissionPercentage > 100) missing.push("STRIPE_DEFAULT_COMMISSION_PERCENTAGE");
    if (!process.env.APP_URL?.startsWith("https://")) missing.push("APP_URL com HTTPS");
  }
  if (missing.length) throw new Error(`Configuracao de producao ausente: ${missing.join(", ")}`);
}
