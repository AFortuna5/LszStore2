import { NextResponse } from "next/server";

import { jsonError } from "@/server/http/api";
import { publicUserSelect, readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { serializeOrder } from "@/server/services/orders";

export async function GET(req: Request) {
  try {
    const session = readSessionFromRequest(req);
    if (!session) {
      return jsonError("Nao autenticado", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        ...publicUserSelect,
        orders: {
          orderBy: {
            createdAt: "desc",
          },
          include: {
            items: {
              include: {
                product: true,
                variant: true,
              },
            },
          },
        },
        addresses: {
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) {
      return jsonError("Usuario nao encontrado", 404);
    }

    return NextResponse.json({ user: { ...user, orders: user.orders.map(serializeOrder) } });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar sessao", 500);
  }
}
