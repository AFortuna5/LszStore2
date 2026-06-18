import { NextResponse } from "next/server";

import { isNonEmptyString, isRecord, jsonError, readJson, toPositiveInt } from "@/lib/api";
import { createOrderFromCart } from "@/lib/orders";

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

    const newOrder = await createOrderFromCart(
      userId.trim(),
      parsedItems as { productId: string; quantity: number }[]
    );

    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao registrar o pedido" },
      { status: 500 }
    );
  }
}
