import "server-only";

import Stripe from "stripe";

import { env } from "@/server/config/env";

let client: Stripe | null = null;

export function stripeClient() {
  if (!env.stripeSecretKey) throw new Error("Stripe nao configurado");
  client ??= new Stripe(env.stripeSecretKey);
  return client;
}

export function stripeRequestOptions(accountId?: string | null, idempotencyKey?: string): Stripe.RequestOptions {
  return {
    ...(accountId ? { stripeAccount: accountId } : {}),
    ...(idempotencyKey ? { idempotencyKey } : {}),
  };
}
