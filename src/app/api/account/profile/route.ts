import { NextResponse } from "next/server";

import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import { createSessionToken, AUTH_COOKIE_NAME, readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";

export async function PATCH(req: Request) {
  try {
    const session = readSessionFromRequest(req);
    if (!session) return jsonError("Nao autenticado", 401);

    const body = await readJson(req);
    if (!isRecord(body)) return jsonError("JSON invalido");
    if (!isNonEmptyString(body.name)) return jsonError("Nome e obrigatorio");
    if (!isNonEmptyString(body.email) || !body.email.includes("@")) {
      return jsonError("Email invalido");
    }

    const user = await prisma.user.update({
      where: { id: session.id },
      data: {
        name: body.name.trim(),
        email: body.email.trim().toLowerCase(),
      },
      select: { id: true, name: true, email: true, role: true },
    });

    const response = NextResponse.json({ user });
    response.cookies.set(AUTH_COOKIE_NAME, createSessionToken(user), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    console.error(error);
    if (String(error).includes("Unique constraint")) {
      return jsonError("Este email ja esta em uso", 409);
    }
    return jsonError("Erro ao atualizar o perfil", 500);
  }
}
