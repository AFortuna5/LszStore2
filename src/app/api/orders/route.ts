import { NextResponse } from "next/server";

import {
  isNonEmptyString,
  isRecord,
  jsonError,
  readJson,
  toPositiveInt,
} from "@/lib/api";
import { createOrderFromCart, orderInclude } from "@/lib/orders";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId")?.trim();
    const status = searchParams.get("status")?.trim();
    const limit = Math.min(
      toPositiveInt(searchParams.get("limit"), 25) ?? 25,
      100
    );
    const page = toPositiveInt(searchParams.get("page"), 1) ?? 1;

    const orders = await prisma.order.findMany({
      where: {
        ...(userId ? { userId } : {}),
        ...(status ? { status } : {}),
      },
      include: orderInclude,
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar os pedidos", 500);
  }
}

export async function POST(req: Request) {
  try {
    const body = await readJson(req);

    if (!isRecord(body)) {
      return jsonError("JSON invalido");
    }

    const { userId, items } = body;

    if (!isNonEmptyString(userId)) {
      return jsonError("Usuario e obrigatorio");
    }

    if (!Array.isArray(items)) {
      return jsonError("Itens do pedido sao obrigatorios");
    }

    const parsedItems = items.map((item) => {
      if (!isRecord(item) || !isNonEmptyString(item.productId)) return null;
      const quantity = toPositiveInt(item.quantity);
      if (!quantity) return null;
      return {
        productId: item.productId.trim(),
        quantity,
      };
    });

    if (parsedItems.some((item) => item === null)) {
      return jsonError("Itens do pedido invalidos");
    }

    const order = await createOrderFromCart(
      userId.trim(),
      parsedItems as { productId: string; quantity: number }[]
    );

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao criar o pedido", 500);
  }
}
