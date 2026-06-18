import { NextResponse } from "next/server";

import { isNonEmptyString, isRecord, jsonError, readJson } from "@/lib/api";
import { orderInclude } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

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
    const { id } = await context.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    if (!order) return jsonError("Pedido nao encontrado", 404);

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar o pedido", 500);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await readJson(req);

    if (!isRecord(body)) {
      return jsonError("JSON invalido");
    }

    if (!isNonEmptyString(body.status)) {
      return jsonError("Status e obrigatorio");
    }

    const status = body.status.trim().toUpperCase();

    if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
      return jsonError("Status invalido");
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: orderInclude,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao atualizar o pedido", 500);
  }
}
