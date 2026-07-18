import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";

import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { isNonEmptyString, isRecord, jsonError, readJson, toPositiveInt } from "@/server/http/api";
import { changeInventory, ensureInventoryBaselines } from "@/server/services/inventory";

export async function GET(req: Request) {
  try {
    const session = readSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") return jsonError("Nao autorizado", 401);
    await prisma.$transaction((tx) => ensureInventoryBaselines(tx));

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q")?.trim();
    const direction = searchParams.get("direction")?.trim().toUpperCase();
    const type = searchParams.get("type")?.trim().toUpperCase();
    const page = toPositiveInt(searchParams.get("page"), 1) ?? 1;
    const limit = Math.min(toPositiveInt(searchParams.get("limit"), 50) ?? 50, 200);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const createdAt = {
      ...(startDate ? { gte: new Date(`${startDate}T00:00:00`) } : {}),
      ...(endDate ? { lte: new Date(`${endDate}T23:59:59.999`) } : {}),
    };
    const where: Prisma.InventoryMovementWhereInput = {
      ...(direction === "IN" || direction === "OUT" ? { direction } : {}),
      ...(type ? { type } : {}),
      ...(Object.keys(createdAt).length ? { createdAt } : {}),
      ...(query ? {
        OR: [
          { productName: { contains: query } },
          { variantName: { contains: query } },
          { sku: { contains: query } },
          { customerName: { contains: query } },
          { customerEmail: { contains: query } },
          { reference: { contains: query } },
        ],
      } : {}),
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [products, movements, movementCount, entriesToday, exitsToday] = await Promise.all([
      prisma.product.findMany({
        select: {
          id: true, name: true, inventory: true, createdAt: true,
          variants: { select: { id: true, label: true, sku: true, inventory: true, createdAt: true }, orderBy: { label: "asc" } },
        },
        orderBy: { name: "asc" },
      }),
      prisma.inventoryMovement.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.inventoryMovement.count({ where }),
      prisma.inventoryMovement.aggregate({ where: { direction: "IN", createdAt: { gte: today } }, _sum: { quantity: true } }),
      prisma.inventoryMovement.aggregate({ where: { direction: "OUT", createdAt: { gte: today } }, _sum: { quantity: true } }),
    ]);

    type StockItem = {
      productId: string; productName: string; variantId: string | null; variantName: string | null;
      sku: string | null; inventory: number; createdAt: Date;
    };
    const stockItems = products.flatMap<StockItem>((product): StockItem[] => product.variants.length
      ? product.variants.map((variant) => ({
          productId: product.id,
          productName: product.name,
          variantId: variant.id,
          variantName: variant.label,
          sku: variant.sku,
          inventory: variant.inventory,
          createdAt: variant.createdAt,
        }))
      : [{
          productId: product.id,
          productName: product.name,
          variantId: null,
          variantName: null,
          sku: null,
          inventory: product.inventory,
          createdAt: product.createdAt,
        }]);

    return NextResponse.json({
      stockItems,
      movements,
      pagination: { page, limit, total: movementCount, pages: Math.max(1, Math.ceil(movementCount / limit)) },
      summary: {
        items: stockItems.length,
        totalUnits: stockItems.reduce((sum, item) => sum + item.inventory, 0),
        lowStock: stockItems.filter((item) => item.inventory > 0 && item.inventory <= 5).length,
        outOfStock: stockItems.filter((item) => item.inventory === 0).length,
        entriesToday: entriesToday._sum.quantity ?? 0,
        exitsToday: exitsToday._sum.quantity ?? 0,
      },
    });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao carregar o inventario", 500);
  }
}

export async function POST(req: Request) {
  try {
    const session = readSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") return jsonError("Nao autorizado", 401);
    const body = await readJson(req);
    if (!isRecord(body)) return jsonError("JSON invalido");

    const productId = isNonEmptyString(body.productId) ? body.productId.trim() : "";
    const variantId = isNonEmptyString(body.variantId) ? body.variantId.trim() : null;
    const direction = isNonEmptyString(body.direction) ? body.direction.trim().toUpperCase() : "";
    const quantity = toPositiveInt(body.quantity);
    const reason = isNonEmptyString(body.reason) ? body.reason.trim() : "";
    if (!productId || !quantity || !["IN", "OUT"].includes(direction) || !reason) {
      return jsonError("Produto, operacao, quantidade e motivo sao obrigatorios");
    }

    const movement = await prisma.$transaction((tx) => changeInventory(
      tx,
      { productId, variantId },
      direction === "IN" ? quantity : -quantity,
      {
        type: direction === "IN" ? "MANUAL_ENTRY" : "MANUAL_EXIT",
        actorUserId: session.id,
        actorName: session.name,
        actorEmail: session.email,
        reason,
        reference: "Ajuste manual pelo painel administrativo",
      },
    ));
    return NextResponse.json(movement, { status: 201 });
  } catch (error) {
    console.error(error);
    if (String(error).includes("INVENTORY_INSUFFICIENT")) return jsonError("Estoque insuficiente para esta saida", 409);
    if (String(error).includes("INVENTORY_PRODUCT_NOT_FOUND") || String(error).includes("INVENTORY_VARIANT_NOT_FOUND")) {
      return jsonError("Produto ou variacao nao encontrado", 404);
    }
    return jsonError("Nao foi possivel registrar o movimento", 500);
  }
}
