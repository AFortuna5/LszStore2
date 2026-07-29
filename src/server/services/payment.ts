import "server-only";

import { Prisma } from "@prisma/client";
import Stripe from "stripe";

import { env } from "@/server/config/env";
import { prisma } from "@/server/database/client";
import { moneyToCents, moneyToNumber } from "@/server/money";
import { changeInventory } from "@/server/services/inventory";
import { commissionPercentage, platformFee, syncStoreStripeAccount } from "@/server/services/stores";
import { stripeClient, stripeRequestOptions } from "@/server/stripe/client";

export function getStripeReadiness() {
  const missing: string[] = [];
  if (env.paymentProvider !== "stripe") missing.push("PAYMENT_PROVIDER");
  if (!env.stripeSecretKey) missing.push("STRIPE_SECRET_KEY");
  if (!env.stripeWebhookSecret) missing.push("STRIPE_WEBHOOK_SECRET");
  if (env.stripeSecretKey && !env.stripeSecretKey.startsWith(env.stripeLiveMode ? "sk_live_" : "sk_test_")) missing.push("STRIPE_KEY_MODE");
  if (env.stripeWebhookSecret && !env.stripeWebhookSecret.startsWith("whsec_")) missing.push("STRIPE_WEBHOOK_SECRET_INVALID");
  if (!Number.isFinite(env.stripeDefaultCommissionPercentage) || env.stripeDefaultCommissionPercentage < 0 || env.stripeDefaultCommissionPercentage > 100) missing.push("STRIPE_DEFAULT_COMMISSION_PERCENTAGE");
  if (process.env.NODE_ENV === "production" && !env.appUrl.startsWith("https://")) missing.push("APP_URL_HTTPS");
  return { ready: missing.length === 0, missing };
}

function intentId(session: Stripe.Checkout.Session) {
  return typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
}

function chargeIntentId(value: Stripe.Charge | Stripe.Dispute) {
  return typeof value.payment_intent === "string" ? value.payment_intent : value.payment_intent?.id ?? null;
}

export async function createPaymentSession(orderId: string) {
  if (!getStripeReadiness().ready) throw new Error("Stripe nao configurado");
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true, store: true } });
  if (!order) throw new Error("Pedido nao encontrado");
  if (order.status !== "PENDING" || order.paymentStatus === "APPROVED") throw new Error("Pedido nao esta disponivel para pagamento");
  const accountId = order.store.stripeAccountId
    && order.store.stripeChargesEnabled
    && order.store.stripeAccountStatus === "ACTIVE"
    ? order.store.stripeAccountId
    : null;

  const stripe = stripeClient();
  if (order.stripeCheckoutSessionId) {
    try {
      const existing = await stripe.checkout.sessions.retrieve(order.stripeCheckoutSessionId, {}, stripeRequestOptions(accountId));
      if (existing.status === "open" && existing.url) return { id: existing.id, url: existing.url };
      if (existing.status === "complete") throw new Error("Pagamento em processamento");
    } catch (error) {
      if (error instanceof Error && error.message === "Pagamento em processamento") throw error;
    }
  }

  const totalCents = moneyToCents(order.total);
  const percentage = commissionPercentage(order.store);
  const fee = accountId ? platformFee(totalCents, percentage) : 0;
  const idempotencyKey = order.stripeCheckoutSessionId
    ? `checkout_${order.id}_after_${order.stripeCheckoutSessionId}`
    : `checkout_${order.id}`;
  const discountCents = moneyToCents(order.discountAmount);
  const coupon = discountCents > 0 ? await stripe.coupons.create({
    amount_off: discountCents, currency: "brl", duration: "once", name: order.couponCode ? `Cupom ${order.couponCode}` : `Desconto ${order.id}`,
    metadata: { orderId: order.id },
  }, stripeRequestOptions(accountId, `coupon_${order.id}_${discountCents}`)) : null;

  const checkout = await stripe.checkout.sessions.create({
    mode: "payment",
    locale: "pt-BR",
    client_reference_id: order.id,
    customer_email: order.customerEmail,
    success_url: `${env.appUrl}/checkout/retorno?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${env.appUrl}/carrinho`,
    line_items: [
      ...order.items.map((item) => ({ quantity: item.quantity, price_data: { currency: "brl", unit_amount: moneyToCents(item.price), product_data: { name: item.variantLabel ? `${item.productName} (${item.variantLabel})` : item.productName } } })),
      ...(moneyToNumber(order.shippingCost) > 0 ? [{ quantity: 1, price_data: { currency: "brl", unit_amount: moneyToCents(order.shippingCost), product_data: { name: "Frete" } } }] : []),
    ],
    discounts: coupon ? [{ coupon: coupon.id }] : undefined,
    metadata: { orderId: order.id, storeId: order.storeId },
    payment_intent_data: accountId
      ? { application_fee_amount: fee, metadata: { orderId: order.id, storeId: order.storeId } }
      : { metadata: { orderId: order.id, storeId: order.storeId } },
  }, stripeRequestOptions(accountId, idempotencyKey));
  if (!checkout.url) throw new Error("Stripe nao retornou URL de pagamento");

  await prisma.order.update({ where: { id: order.id }, data: {
    paymentProvider: "STRIPE", paymentSessionId: checkout.id, stripeCheckoutSessionId: checkout.id,
    paymentId: intentId(checkout), stripePaymentIntentId: intentId(checkout), stripeConnectedAccountId: accountId,
    platformFeeAmount: fee, currency: "brl", paymentUrl: checkout.url, paymentStatus: "PENDING",
  } });
  return { id: checkout.id, url: checkout.url };
}

async function restoreInventory(tx: Prisma.TransactionClient, order: Prisma.OrderGetPayload<{ include: { items: true } }>, type: string, reference: string) {
  if (order.status === "CANCELLED") return;
  for (const item of order.items) await changeInventory(tx, { productId: item.productId, variantId: item.variantId }, item.quantity, {
    type, actorName: "Stripe", orderId: order.id, customerName: order.customerName, customerEmail: order.customerEmail,
    reason: type === "REFUND" ? "Pagamento reembolsado" : type === "CHARGEBACK" ? "Pagamento contestado" : "Pagamento nao concluido", reference,
  });
}

async function applySession(session: Stripe.Checkout.Session, accountId: string | null, action: "completed" | "succeeded" | "failed" | "expired") {
  const orderId = session.client_reference_id ?? session.metadata?.orderId;
  if (!orderId) throw new Error("Pedido nao informado na sessao Stripe");
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new Error("Pedido nao encontrado");
    if (order.storeId !== session.metadata?.storeId || order.stripeConnectedAccountId !== accountId) throw new Error("Conta conectada nao corresponde ao pedido");
    const paymentIntent = intentId(session);
    const valid = session.amount_total === moneyToCents(order.total) && session.currency?.toLowerCase() === order.currency && session.livemode === env.stripeLiveMode;
    if (!valid) return tx.order.update({ where: { id: order.id }, data: { paymentStatus: "REVIEW_REQUIRED" } });
    const paid = session.payment_status === "paid" || session.payment_status === "no_payment_required";
    if (paid && ["completed", "succeeded"].includes(action)) return tx.order.update({ where: { id: order.id }, data: {
      status: "PAID", paymentStatus: "APPROVED", paidAt: order.paidAt ?? new Date(), paymentUrl: null,
      paymentId: paymentIntent, stripePaymentIntentId: paymentIntent, stripeCheckoutSessionId: session.id,
    } });
    if (["failed", "expired"].includes(action) && order.status === "PENDING") {
      await restoreInventory(tx, order, action === "expired" ? "PAYMENT_EXPIRED" : "PAYMENT_FAILED", `Sessao Stripe ${session.id}`);
      return tx.order.update({ where: { id: order.id }, data: { status: "CANCELLED", paymentStatus: action === "expired" ? "EXPIRED" : "FAILED", paymentUrl: null } });
    }
    return tx.order.update({ where: { id: order.id }, data: { paymentStatus: "PROCESSING" } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

async function applyIntent(intent: Stripe.PaymentIntent, accountId: string | null, succeeded: boolean) {
  const order = await prisma.order.findFirst({ where: { OR: [{ stripePaymentIntentId: intent.id }, { id: intent.metadata.orderId }] } });
  if (!order || order.stripeConnectedAccountId !== accountId || order.storeId !== intent.metadata.storeId) throw new Error("PaymentIntent nao corresponde ao pedido");
  if (!succeeded) return prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } });
  if (intent.amount !== moneyToCents(order.total) || intent.currency !== order.currency) return prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "REVIEW_REQUIRED" } });
  return prisma.order.update({ where: { id: order.id }, data: { status: "PAID", paymentStatus: "APPROVED", paidAt: order.paidAt ?? new Date(), paymentUrl: null, stripePaymentIntentId: intent.id, paymentId: intent.id } });
}

async function applyReversal(paymentIntentId: string, amount: number, accountId: string | null, type: "REFUND" | "DISPUTE", reference: string, chargeId?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({ where: { stripePaymentIntentId: paymentIntentId }, include: { items: true } });
    if (!order || order.stripeConnectedAccountId !== accountId) throw new Error("Reversao nao corresponde ao pedido");
    if (amount !== moneyToCents(order.total)) return tx.order.update({ where: { id: order.id }, data: { paymentStatus: "REVIEW_REQUIRED" } });
    await restoreInventory(tx, order, type === "REFUND" ? "REFUND" : "CHARGEBACK", reference);
    return tx.order.update({ where: { id: order.id }, data: {
      status: "CANCELLED", paymentStatus: type === "REFUND" ? "REFUNDED" : "DISPUTED",
      stripeChargeId: chargeId, ...(type === "REFUND" ? { refundedAt: new Date() } : { disputedAt: new Date() }),
    } });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export function constructStripeEvent(payload: string | Buffer, signature: string) {
  if (!env.stripeWebhookSecret) throw new Error("Webhook Stripe nao configurado");
  return stripeClient().webhooks.constructEvent(payload, signature, env.stripeWebhookSecret, 300);
}

async function handleStripeEvent(event: Stripe.Event) {
  const accountId = typeof event.account === "string" ? event.account : null;
  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    const store = await prisma.store.findUnique({ where: { stripeAccountId: account.id } });
    return store ? syncStoreStripeAccount(store.id, account) : null;
  }
  switch (event.type) {
    case "checkout.session.completed": return applySession(event.data.object as Stripe.Checkout.Session, accountId, "completed");
    case "checkout.session.async_payment_succeeded": return applySession(event.data.object as Stripe.Checkout.Session, accountId, "succeeded");
    case "checkout.session.async_payment_failed": return applySession(event.data.object as Stripe.Checkout.Session, accountId, "failed");
    case "checkout.session.expired": return applySession(event.data.object as Stripe.Checkout.Session, accountId, "expired");
    case "payment_intent.succeeded": return applyIntent(event.data.object as Stripe.PaymentIntent, accountId, true);
    case "payment_intent.payment_failed": return applyIntent(event.data.object as Stripe.PaymentIntent, accountId, false);
    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge; const id = chargeIntentId(charge);
      return id && charge.amount_refunded > 0 ? applyReversal(id, charge.amount_refunded, accountId, "REFUND", `Charge Stripe ${charge.id}`, charge.id) : null;
    }
    case "charge.dispute.created": {
      const dispute = event.data.object as Stripe.Dispute; const id = chargeIntentId(dispute);
      return id ? applyReversal(id, dispute.amount, accountId, "DISPUTE", `Disputa Stripe ${dispute.id}`) : null;
    }
    case "charge.dispute.closed": {
      const dispute = event.data.object as Stripe.Dispute; const id = chargeIntentId(dispute);
      if (!id) return null;
      const order = await prisma.order.findFirst({ where: { stripePaymentIntentId: id, stripeConnectedAccountId: accountId } });
      return order ? prisma.order.update({ where: { id: order.id }, data: { paymentStatus: dispute.status === "won" ? "DISPUTE_WON" : "DISPUTE_LOST" } }) : null;
    }
    default: return null;
  }
}

export async function processStripeEvent(event: Stripe.Event) {
  const accountId = typeof event.account === "string" ? event.account : null;
  try {
    await prisma.stripeWebhookEvent.create({ data: { stripeEventId: event.id, type: event.type, connectedAccountId: accountId } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return { duplicate: true };
    throw error;
  }
  try {
    const result = await handleStripeEvent(event);
    await prisma.stripeWebhookEvent.update({ where: { stripeEventId: event.id }, data: { status: "PROCESSED", processedAt: new Date() } });
    return result;
  } catch (error) {
    await prisma.stripeWebhookEvent.update({ where: { stripeEventId: event.id }, data: { status: "FAILED", errorMessage: error instanceof Error ? error.message.slice(0, 500) : "Erro desconhecido", processedAt: new Date() } });
    throw error;
  }
}

export async function refundOrder(orderId: string, refundApplicationFee = false) {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order?.stripePaymentIntentId || !order.stripeConnectedAccountId || order.refundedAt) throw new Error("Pedido nao elegivel para reembolso");
  return stripeClient().refunds.create({ payment_intent: order.stripePaymentIntentId, refund_application_fee: refundApplicationFee }, stripeRequestOptions(order.stripeConnectedAccountId, `refund_${order.id}`));
}
