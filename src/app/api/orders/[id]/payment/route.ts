import { NextResponse } from "next/server";

import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { jsonError } from "@/server/http/api";
import { createPaymentPreference, getMercadoPagoReadiness } from "@/server/services/payment";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = readSessionFromRequest(req);
    if (!session) return jsonError("Nao autorizado", 401);

    const { id } = await context.params;
    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) return jsonError("Pedido nao encontrado", 404);
    if (session.role !== "ADMIN" && order.userId !== session.id) {
      return jsonError("Nao autorizado", 403);
    }
    if (order.status !== "PENDING" || order.paymentStatus === "APPROVED") {
      return jsonError("Este pedido nao esta disponivel para pagamento", 409);
    }
    if (!getMercadoPagoReadiness().ready) {
      return jsonError("Pagamento temporariamente indisponivel", 503);
    }

    const payment = await createPaymentPreference(order.id);
    return NextResponse.json({ paymentUrl: payment.url });
  } catch (error) {
    console.error(error);
    return jsonError("Nao foi possivel iniciar o pagamento", 502);
  }
}
