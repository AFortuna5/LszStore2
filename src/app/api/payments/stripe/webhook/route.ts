import Stripe from "stripe";

import { env } from "@/server/config/env";
import { constructStripeEvent, processStripeEvent } from "@/server/services/payment";

export async function POST(req: Request) {
  if (!env.stripeWebhookSecret || !env.stripeSecretKey) {
    return Response.json({ error: "Webhook nao configurado" }, { status: 503 });
  }
  const signature = req.headers.get("stripe-signature");
  if (!signature) return Response.json({ error: "Assinatura ausente" }, { status: 400 });

  try {
    const payload = await req.text();
    const event = constructStripeEvent(payload, signature);
    await processStripeEvent(event);
    return Response.json({ received: true });
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      return Response.json({ error: "Assinatura invalida" }, { status: 400 });
    }
    console.error(error);
    return Response.json({ error: "Falha ao processar notificacao" }, { status: 500 });
  }
}
