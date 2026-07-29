import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { isRecord, jsonError, readJson } from "@/server/http/api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = readSessionFromRequest(req);
  if (!session || session.role !== "ADMIN") return jsonError("Nao autorizado", 403);
  const body = await readJson(req);
  if (!isRecord(body)) return jsonError("JSON invalido");
  const percentage = Number(body.percentage);
  if (!Number.isFinite(percentage) || percentage < 0 || percentage > 100) return jsonError("Percentual deve estar entre 0 e 100");
  const { id } = await params;
  const store = await prisma.store.update({ where: { id }, data: { commissionPercentage: new Prisma.Decimal(percentage.toFixed(2)) } });
  return NextResponse.json({ storeId: store.id, commissionPercentage: Number(store.commissionPercentage) });
}
