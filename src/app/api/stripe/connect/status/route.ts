import { NextResponse } from "next/server";

import { readSessionFromRequest } from "@/server/auth/session";
import { jsonError } from "@/server/http/api";
import { commissionPercentage, findManagedStore, syncStoreStripeAccount } from "@/server/services/stores";
import { stripeClient } from "@/server/stripe/client";

export async function GET(req: Request) {
  try {
    const session = readSessionFromRequest(req);
    if (!session) return jsonError("Nao autorizado", 401);
    const store = await findManagedStore(session, new URL(req.url).searchParams.get("storeId") ?? undefined);
    if (!store) return jsonError("Loja nao encontrada", 404);
    let current = store;
    if (store.stripeAccountId) current = await syncStoreStripeAccount(store.id, await stripeClient().accounts.retrieve(store.stripeAccountId));
    return NextResponse.json({
      storeId: current.id, storeName: current.name, connected: Boolean(current.stripeAccountId),
      chargesEnabled: current.stripeChargesEnabled, payoutsEnabled: current.stripePayoutsEnabled,
      detailsSubmitted: current.stripeDetailsSubmitted, onboardingCompleted: current.stripeOnboardingCompleted,
      status: current.stripeAccountStatus, requirements: current.stripeRequirements.map(() => "Informacao adicional solicitada pela Stripe"),
      commissionPercentage: commissionPercentage(current),
    });
  } catch (error) {
    console.error("Falha ao consultar conta Stripe", error instanceof Error ? error.message : "erro");
    return jsonError("Nao foi possivel consultar a conta Stripe", 502);
  }
}
