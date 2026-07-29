import { NextResponse } from "next/server";

import { readSessionFromRequest } from "@/server/auth/session";
import { env } from "@/server/config/env";
import { prisma } from "@/server/database/client";
import { jsonError } from "@/server/http/api";
import { findManagedStore } from "@/server/services/stores";
import { stripeClient } from "@/server/stripe/client";

export async function POST(req: Request) {
  try {
    const session = readSessionFromRequest(req);
    if (!session) return jsonError("Nao autorizado", 401);
    const storeId = new URL(req.url).searchParams.get("storeId") ?? undefined;
    const store = await findManagedStore(session, storeId);
    if (!store || !store.ownerId) return jsonError("Loja nao encontrada ou sem proprietario", 404);
    const stripe = stripeClient();
    let accountId = store.stripeAccountId;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express", country: "BR", email: session.email,
        capabilities: { card_payments: { requested: true }, transfers: { requested: true } },
        business_type: "individual", metadata: { storeId: store.id, ownerId: store.ownerId },
      }, { idempotencyKey: `connect_account_${store.id}` });
      accountId = account.id;
      await prisma.store.update({ where: { id: store.id }, data: { stripeAccountId: accountId, stripeAccountStatus: "ONBOARDING_INCOMPLETE", stripeConnectedAt: new Date() } });
    }
    try {
      await stripe.accounts.update(accountId, {
        capabilities: { pix_payments: { requested: true } },
      });
    } catch (error) {
      console.warn("Capacidade Pix ainda indisponivel para a conta conectada", error instanceof Error ? error.message : "erro");
    }
    const link = await stripe.accountLinks.create({
      account: accountId, type: "account_onboarding",
      refresh_url: `${env.appUrl}/admin/financeiro?refresh=true`, return_url: `${env.appUrl}/admin/financeiro?success=true`,
    });
    return NextResponse.json({ url: link.url });
  } catch (error) {
    console.error("Falha ao iniciar onboarding Stripe", error instanceof Error ? error.message : "erro");
    return jsonError("Nao foi possivel iniciar a conexao com a Stripe", 502);
  }
}
