import { NextResponse } from "next/server";

import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";

const requiredFields = [
  "fullName", "phone", "email", "zipCode", "street", "number",
  "neighborhood", "city", "state",
] as const;

export async function POST(req: Request) {
  try {
    const session = readSessionFromRequest(req);
    if (!session) return jsonError("Nao autenticado", 401);
    const body = await readJson(req);
    if (!isRecord(body)) return jsonError("JSON invalido");

    for (const field of requiredFields) {
      if (!isNonEmptyString(body[field])) return jsonError(`Campo ${field} e obrigatorio`);
    }

    const address = await prisma.address.create({
      data: {
        userId: session.id,
        fullName: String(body.fullName).trim(),
        phone: String(body.phone).trim(),
        email: String(body.email).trim().toLowerCase(),
        zipCode: String(body.zipCode).trim(),
        street: String(body.street).trim(),
        number: String(body.number).trim(),
        neighborhood: String(body.neighborhood).trim(),
        city: String(body.city).trim(),
        state: String(body.state).trim().toUpperCase(),
        complement: isNonEmptyString(body.complement) ? body.complement.trim() : null,
      },
    });
    return NextResponse.json(address, { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao salvar o endereco", 500);
  }
}
