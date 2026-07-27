import "server-only";

import { Prisma } from "@prisma/client";
import Stripe from "stripe";

import { env } from "@/server/config/env";
import { prisma } from "@/server/database/client";
import { moneyToCents, moneyToNumber } from "@/server/money";
import { changeInventory } from "@/server/services/inventory";

type SessionAction = "sync" | "completed" | "succeeded" | "failed" | "expired";

let stripeClient: Stripe | null = null;

function getStripe() {
  if (!env.stripeSecretKey) throw new Error("Stripe nao configurado");
  stripeClient ??= new Stripe(env.stripeSecretKey);
  return stripeClient;
}

export function getStripeReadiness() {
  const missing: string[] = [];
  if (env.paymentProvider !== "stripe") missing.push("PAYMENT_PROVIDER");
  if (!env.stripeSecretKey) missing.push("STRIPE_SECRET_KEY");
  if (!env.stripeWebhookSecret) missing.push("STRIPE_WEBHOOK_SECRET");
  if (env.stripeSecretKey) {
    const expectedPrefix = env.stripeLiveMode ? "sk_live_" : "sk_test_";
    if (!env.stripeSecretKey.startsWith(expectedPrefix)) missing.push("STRIPE_KEY_MODE");
  }
  if (env.stripeWebhookSecret && !env.stripeWebhookSecret.startsWith("whsec_")) {
    missing.push("STRIPE_WEBHOOK_SECRET_INVALID");
  }
  if (!env.appUrl) missing.push("APP_URL");
  if (process.env.NODE_ENV === "production" && !env.appUrl.startsWith("https://")) {
    missing.push("APP_URL_HTTPS");
  }
  return { ready: missing.length === 0, missing };
}

function paymentIntentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string"
    ? session.payment_intent
    : session.payment_intent?.id ?? null;
}

export async function createPaymentSession(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) throw new Error("Pedido nao encontrado");
  if (!getStripeReadiness().ready) throw new Error("Stripe nao configurado");
  if (order.status !== "PENDING" || order.paymentStatus === "APPROVED") {
    throw new Error("Pedido nao esta disponivel para pagamento");
  }

  const stripe = getStripe();
  if (order.paymentSessionId) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(order.paymentSessionId);
      if (existing.status === "open" && existing.url) {
        return { id: existing.id, url: existing.url };
      }
      if (existing.status === "complete") {
        await applyStripeSession(existing, "sync");
        throw new Error(existing.payment_status === "paid"
          ? "Pagamento ja confirmado"
          : "Pagamento em processamento");
      }
    } catch (error) {
      if (error instanceof Error && ["Pagamento ja confirmado", "Pagamento em processamento"].includes(error.message)) {
        throw error;
      }
      // Uma sessao removida ou expirada sera substituida abaixo.
    }
  }

  const idempotencyKey = order.paymentSessionId
    ? `${order.id}:after:${order.paymentSessionId}`
    : `${order.id}:checkout:v2`;
  const discountCents = moneyToCents(order.discountAmount);
  const stripeCoupon = discountCents > 0
    ? await stripe.coupons.create({
        amount_off: discountCents,
        currency: "brl",
        duration: "once",
        name: order.couponCode ? `Cupom ${order.couponCode}` : `Desconto do pedido ${order.id}`,
        metadata: { orderId: order.id, couponCode: order.couponCode ?? "" },
      }, { idempotencyKey: `${order.id}:discount:${discountCents}` })
    : null;
  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "pt-BR",
    payment_method_types: ["card"],
    client_reference_id: order.id,
    customer_email: order.customerEmail,
    success_url: `${env.appUrl}/checkout/retorno?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.appUrl}/minha-conta?checkout=cancelled`,
    line_items: [
      ...order.items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "brl",
          unit_amount: moneyToCents(item.price),
          product_data: {
            name: item.variantLabel
              ? `${item.productName} (${item.variantLabel})`
              : item.productName,
          },
        },
      })),
      ...(moneyToNumber(order.shippingCost) > 0 ? [{
        quantity: 1,
        price_data: {
          currency: "brl",
          unit_amount: moneyToCents(order.shippingCost),
          product_data: { name: "Frete" },
        },
      }] : []),
    ],
    discounts: stripeCoupon ? [{ coupon: stripeCoupon.id }] : undefined,
    metadata: { orderId: order.id, userId: order.userId },
    payment_intent_data: { metadata: { orderId: order.id, userId: order.userId } },
  }, { idempotencyKey });

  if (!checkout.url) throw new Error("Stripe nao retornou uma URL de pagamento");
  await prisma.order.update({
    where: { id: order.id },
    data: {
      paymentProvider: "STRIPE",
      paymentSessionId: checkout.id,
      paymentId: paymentIntentId(checkout),
      paymentUrl: checkout.url,
      paymentStatus: checkout.payment_status === "paid" ? "APPROVED" : "PENDING",
    },
  });
  return { id: checkout.id, url: checkout.url };
}

async function restoreInventory(
  tx: Prisma.TransactionClient,
  order: Prisma.OrderGetPayload<{ include: { items: true } }>,
  type: string,
  reason: string,
  reference: string,
) {
  if (order.status === "CANCELLED") return;
  for (const item of order.items) {
    await changeInventory(tx, { productId: item.productId, variantId: item.variantId }, item.quantity, {
      type,
      actorName: "Stripe",
      orderId: order.id,
      customerName: order.customerName,
      customerEmail: order.customerEmail,
      reason,
      reference,
    });
  }
}

async function applyStripeSession(session: Stripe.Checkout.Session, action: SessionAction) {
  const orderId = session.client_reference_id ?? session.metadata?.orderId;
  if (!orderId) throw new Error("Pedido da sessao Stripe nao informado");

  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new Error("Pedido da sessao Stripe nao encontrado");

    const intentId = paymentIntentId(session);
    const amountMatches = session.amount_total === moneyToCents(order.total);
    const modeMatches = session.livemode === env.stripeLiveMode;
    const currencyMatches = session.currency?.toLowerCase() === "brl";
    if (!amountMatches || !modeMatches || !currencyMatches) {
      return tx.order.update({
        where: { id: order.id },
        data: {
          paymentProvider: "STRIPE",
          paymentSessionId: session.id,
          paymentId: intentId,
          paymentStatus: "REVIEW_REQUIRED",
        },
      });
    }

    const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    if (paid && ["sync", "completed", "succeeded"].includes(action)) {
      if (order.status === "CANCELLED" || (order.paymentStatus === "APPROVED" && order.paymentId && intentId && order.paymentId !== intentId)) {
        return tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "REVIEW_REQUIRED", paymentId: intentId, paymentSessionId: session.id },
        });
      }
      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "PAID",
          paymentProvider: "STRIPE",
          paymentSessionId: session.id,
          paymentId: intentId,
          paymentStatus: "APPROVED",
          paymentUrl: null,
        },
      });
    }

    const finalFailure = action === "failed" || action === "expired";
    if (finalFailure && order.paymentSessionId === session.id && order.status === "PENDING") {
      await restoreInventory(
        tx,
        order,
        action === "expired" ? "PAYMENT_EXPIRED" : "PAYMENT_FAILED",
        action === "expired" ? "Sessao de pagamento expirada" : "Pagamento nao concluido",
        `Sessao Stripe ${session.id}`,
      );
      return tx.order.update({
        where: { id: order.id },
        data: {
          status: "CANCELLED",
          paymentStatus: action === "expired" ? "EXPIRED" : "FAILED",
          paymentUrl: null,
        },
      });
    }

    if (session.status === "complete" && order.status === "PENDING") {
      return tx.order.update({
        where: { id: order.id },
        data: {
          paymentProvider: "STRIPE",
          paymentSessionId: session.id,
          paymentId: intentId,
          paymentStatus: "PROCESSING",
        },
      });
    }
    return order;
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function syncStripeCheckoutSession(sessionId: string) {
  if (!/^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(sessionId)) {
    throw new Error("Sessao Stripe invalida");
  }
  const session = await getStripe().checkout.sessions.retrieve(sessionId, {
    expand: ["payment_intent"],
  });
  return applyStripeSession(session, "sync");
}

async function applyStripeReversal(
  paymentIntent: string,
  amount: number,
  type: "REFUND" | "DISPUTE",
  reference: string,
) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({ where: { paymentId: paymentIntent }, include: { items: true } });
    if (!order) return null;
    if (amount !== moneyToCents(order.total)) {
      return tx.order.update({ where: { id: order.id }, data: { paymentStatus: "REVIEW_REQUIRED" } });
    }
    await restoreInventory(
      tx,
      order,
      type === "REFUND" ? "REFUND" : "CHARGEBACK",
      type === "REFUND" ? "Pagamento estornado pela Stripe" : "Pagamento contestado na Stripe",
      reference,
    );
    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        paymentStatus: type === "REFUND" ? "REFUNDED" : "DISPUTED",
      },
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export function constructStripeEvent(payload: string, signature: string) {
  if (!env.stripeWebhookSecret) throw new Error("Webhook Stripe nao configurado");
  return getStripe().webhooks.constructEvent(payload, signature, env.stripeWebhookSecret, 300);
}

export async function processStripeEvent(event: Stripe.Event) {
  switch (event.type) {
    case "checkout.session.completed":
      return applyStripeSession(event.data.object as Stripe.Checkout.Session, "completed");
    case "checkout.session.async_payment_succeeded":
      return applyStripeSession(event.data.object as Stripe.Checkout.Session, "succeeded");
    case "checkout.session.async_payment_failed":
      return applyStripeSession(event.data.object as Stripe.Checkout.Session, "failed");
    case "checkout.session.expired":
      return applyStripeSession(event.data.object as Stripe.Checkout.Session, "expired");
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      const intent = typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id;
      if (!intent || charge.amount_refunded <= 0) return null;
      return applyStripeReversal(intent, charge.amount_refunded, "REFUND", `Charge Stripe ${charge.id}`);
    }
    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute;
      const intent = typeof dispute.payment_intent === "string" ? dispute.payment_intent : dispute.payment_intent?.id;
      if (!intent) return null;
      return applyStripeReversal(intent, dispute.amount, "DISPUTE", `Disputa Stripe ${dispute.id}`);
    }
    default:
      return null;
  }
}
