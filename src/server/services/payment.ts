import "server-only";

import { env } from "@/server/config/env";
import { prisma } from "@/server/database/client";
import { changeInventory } from "@/server/services/inventory";

export function getMercadoPagoReadiness() {
  const missing: string[] = [];
  if (env.paymentProvider !== "mercadopago") missing.push("PAYMENT_PROVIDER");
  if (!env.mercadoPagoToken) missing.push("MERCADO_PAGO_ACCESS_TOKEN");
  if (!env.mercadoPagoWebhookSecret) missing.push("MERCADO_PAGO_WEBHOOK_SECRET");
  if (!env.appUrl) missing.push("APP_URL");
  if (process.env.NODE_ENV === "production" && !env.appUrl.startsWith("https://")) {
    missing.push("APP_URL_HTTPS");
  }
  return { ready: missing.length === 0, missing };
}

export async function createPaymentPreference(orderId: string) {
  const order = await prisma.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw new Error("Pedido nao encontrado");
  const readiness = getMercadoPagoReadiness();
  if (!readiness.ready || !env.mercadoPagoToken) throw new Error("Mercado Pago nao configurado");
  if (order.status !== "PENDING" || order.paymentStatus === "APPROVED") {
    throw new Error("Pedido nao esta disponivel para pagamento");
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.mercadoPagoToken}`, "Content-Type": "application/json", "X-Idempotency-Key": order.id },
    body: JSON.stringify({
      items: [
        ...order.items.map((item) => ({ id: item.productId, title: item.productName, quantity: item.quantity, currency_id: "BRL", unit_price: item.price })),
        ...(order.shippingCost > 0 ? [{ id: "shipping", title: "Frete", quantity: 1, currency_id: "BRL", unit_price: order.shippingCost }] : []),
      ],
      payer: { name: order.customerName, email: order.customerEmail },
      external_reference: order.id,
      back_urls: {
        success: `${env.appUrl}/checkout/retorno?status=success`,
        pending: `${env.appUrl}/checkout/retorno?status=pending`,
        failure: `${env.appUrl}/checkout/retorno?status=failure`,
      },
      auto_return: "approved",
      notification_url: `${env.appUrl}/api/payments/mercadopago/webhook`,
    }),
  });
  if (!response.ok) throw new Error("Nao foi possivel iniciar o pagamento");
  const preference = await response.json() as { id: string; init_point?: string; sandbox_init_point?: string };
  const paymentUrl = env.mercadoPagoSandbox ? preference.sandbox_init_point ?? preference.init_point : preference.init_point;
  if (!paymentUrl) throw new Error("Mercado Pago nao retornou uma URL de pagamento");
  await prisma.order.update({ where: { id: order.id }, data: { paymentProvider: "MERCADO_PAGO", paymentPreferenceId: preference.id, paymentUrl, paymentStatus: "PENDING" } });
  return { id: preference.id, url: paymentUrl };
}

export async function syncMercadoPagoPayment(paymentId: string) {
  if (!env.mercadoPagoToken) throw new Error("Mercado Pago nao configurado");
  const response = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, {
    headers: { Authorization: `Bearer ${env.mercadoPagoToken}` }, cache: "no-store",
  });
  if (!response.ok) throw new Error("Pagamento nao encontrado");
  const payment = await response.json() as { id: number; status: string; external_reference?: string; transaction_amount?: number; currency_id?: string; live_mode?: boolean };
  if (!payment.external_reference) return null;
  const orderId = payment.external_reference;
  const paymentStatus = payment.status.toUpperCase();
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
    if (!order) throw new Error("Pedido do pagamento nao encontrado");
    const amountMatches = typeof payment.transaction_amount === "number" && Math.abs(payment.transaction_amount - order.total) < 0.01;
    const modeMatches = env.mercadoPagoSandbox ? payment.live_mode === false : payment.live_mode === true;
    if (!amountMatches || payment.currency_id !== "BRL" || !modeMatches) {
      return tx.order.update({ where: { id: order.id }, data: { paymentId: String(payment.id), paymentStatus: "REVIEW_REQUIRED" } });
    }
    const mustCancel = ["refunded", "charged_back"].includes(payment.status);
    if (mustCancel && order.status !== "CANCELLED") {
      for (const item of order.items) {
        await changeInventory(tx, { productId: item.productId, variantId: item.variantId }, item.quantity, {
          type: payment.status === "refunded" ? "REFUND" : "CHARGEBACK",
          actorName: "Mercado Pago",
          orderId: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          reason: payment.status === "refunded" ? "Pagamento estornado" : "Pagamento contestado (chargeback)",
          reference: `Pagamento ${payment.id}`,
        });
      }
    }
    return tx.order.update({
      where: { id: order.id },
      data: {
        paymentId: String(payment.id), paymentStatus,
        ...(payment.status === "approved" && order.status !== "CANCELLED" ? { status: "PAID" } : {}),
        ...(mustCancel ? { status: "CANCELLED" } : {}),
      },
    });
  });
}
