import { NextResponse } from "next/server";

import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";

export async function GET(req: Request) {
  const session = readSessionFromRequest(req);
  if (!session) return jsonError("Nao autorizado", 401);
  const stores = await prisma.store.findMany({
    where: session.role === "ADMIN" ? {} : { OR: [{ ownerId: session.id }, { members: { some: { userId: session.id } } }] },
    select: { id: true, name: true, slug: true, stripeAccountStatus: true, stripeChargesEnabled: true },
  });
  return NextResponse.json(stores);
}

export async function POST(req: Request) {
  const session = readSessionFromRequest(req);
  if (!session) return jsonError("Nao autorizado", 401);
  const body = await readJson(req);
  if (!isRecord(body) || !isNonEmptyString(body.name)) return jsonError("Nome da loja e obrigatorio");
  const name = body.name.trim();
  const slug = isNonEmptyString(body.slug) ? body.slug.trim().toLowerCase() : name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return jsonError("Slug invalido");
  try {
    const store = await prisma.$transaction(async (tx) => {
      const created = await tx.store.create({ data: { name, slug, ownerId: session.id } });
      if (session.role === "USER") await tx.user.update({ where: { id: session.id }, data: { role: "MERCHANT" } });
      return created;
    });
    return NextResponse.json({ id: store.id, name: store.name, slug: store.slug }, { status: 201 });
  } catch (error) {
    if (String(error).includes("P2002")) return jsonError("Este slug ja esta em uso", 409);
    throw error;
  }
}
