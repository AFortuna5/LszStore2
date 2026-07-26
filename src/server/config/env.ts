import "server-only";

import { storeContact } from "@/shared/store-contact";

export const env = {
  appUrl: process.env.APP_URL ?? "http://localhost:3000",
  storeName: process.env.STORE_NAME ?? "LSZ Store",
  supportEmail: process.env.SUPPORT_EMAIL ?? storeContact.email,
  originZip: (process.env.SHIPPING_ORIGIN_ZIP ?? "01001000").replace(/\D/g, ""),
  freeShippingFrom: Number(process.env.FREE_SHIPPING_FROM ?? 399),
  fallbackShippingPrice: Number(process.env.FALLBACK_SHIPPING_PRICE ?? 24.9),
  fallbackShippingDays: Number(process.env.FALLBACK_SHIPPING_DAYS ?? 7),
  melhorEnvioToken: process.env.MELHOR_ENVIO_TOKEN,
  melhorEnvioSandbox: process.env.MELHOR_ENVIO_SANDBOX === "true",
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
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
    if (!process.env.APP_URL?.startsWith("https://")) missing.push("APP_URL com HTTPS");
  }
  if (missing.length) throw new Error(`Configuracao de producao ausente: ${missing.join(", ")}`);
}
