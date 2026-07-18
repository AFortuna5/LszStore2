import { NextResponse } from "next/server";

import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { orderInclude, serializeOrder } from "@/server/services/orders";
import { prisma } from "@/server/database/client";
import { escapeHtml, sendEmail } from "@/server/services/email";
import { changeInventory } from "@/server/services/inventory";

const ORDER_STATUSES = [
  "PENDING",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = readSessionFromRequest(_req);
    if (!session) {
      return jsonError("Nao autorizado", 401);
    }

    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    if (!order) return jsonError("Pedido nao encontrado", 404);

    if (session.role !== "ADMIN" && order.userId !== session.id) {
      return jsonError("Nao autorizado", 401);
    }

    return NextResponse.json(serializeOrder(order));
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar o pedido", 500);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = readSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return jsonError("Nao autorizado", 401);
    }

    const { id } = await context.params;
    const body = await readJson(req);

    if (!isRecord(body)) {
      return jsonError("JSON invalido");
    }

    const status = isNonEmptyString(body.status) ? body.status.trim().toUpperCase() : undefined;

    if (status && !ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
      return jsonError("Status invalido");
    }

    const trackingCode = isNonEmptyString(body.trackingCode) ? body.trackingCode.trim() : undefined;
    if (!status && !trackingCode) return jsonError("Informe o status ou codigo de rastreio");

    const order = await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!current) throw new Error("ORDER_NOT_FOUND");
      if (status === "CANCELLED" && current.status !== "CANCELLED") {
        for (const item of current.items) {
          await changeInventory(tx, { productId: item.productId, variantId: item.variantId }, item.quantity, {
            type: "ORDER_CANCELLATION",
            actorUserId: session.id,
            actorName: session.name,
            actorEmail: session.email,
            orderId: current.id,
            customerName: current.customerName,
            customerEmail: current.customerEmail,
            reason: "Pedido cancelado pelo administrador",
            reference: `Pedido #${current.id.slice(-8).toUpperCase()}`,
          });
        }
      }
      return tx.order.update({
        where: { id },
        data: { ...(status ? { status } : {}), ...(status === "PAID" ? { paymentStatus: "APPROVED" } : {}), ...(trackingCode ? { trackingCode } : {}) },
        include: orderInclude,
      });
    });

    void sendEmail({
      to: order.customerEmail,
      subject: `Atualizacao do pedido #${order.id.slice(-8).toUpperCase()}`,
      idempotencyKey: `order-update-${order.id}-${order.updatedAt.getTime()}`,
      html: `<h1>Pedido atualizado</h1><p>Ola, ${escapeHtml(order.customerName)}.</p><p>Status: <strong>${escapeHtml(order.status)}</strong>.</p>${order.trackingCode ? `<p>Rastreio: <strong>${escapeHtml(order.trackingCode)}</strong></p>` : ""}`,
    }).catch(console.error);

    return NextResponse.json(serializeOrder(order));
  } catch (error) {
    console.error(error);
    if (String(error).includes("ORDER_NOT_FOUND")) return jsonError("Pedido nao encontrado", 404);
    return jsonError("Erro ao atualizar o pedido", 500);
  }
}
