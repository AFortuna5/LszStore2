import { NextResponse } from "next/server";

import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import {
  AUTH_COOKIE_NAME,
  authenticateUser,
  createSessionToken,
  publicUserSelect,
  registerUser,
  readSessionFromRequest,
} from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { getClientIp, rateLimit } from "@/server/security/rate-limit";

export async function GET(req: Request) {
  try {
    const session = readSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return jsonError("Nao autorizado", 401);
    }

    const users = await prisma.user.findMany({
      select: publicUserSelect,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar os usuarios", 500);
  }
}

export async function POST(req: Request) {
  try {
    if (!(await rateLimit(`register:${getClientIp(req)}`, 5, 15 * 60_000)).allowed) return jsonError("Muitas tentativas. Aguarde alguns minutos.", 429);
    const body = await readJson(req);

    if (!isRecord(body)) {
      return jsonError("JSON invalido");
    }

    const { name, email, password } = body;

    if (!isNonEmptyString(name)) return jsonError("Nome e obrigatorio");
    if (!isNonEmptyString(email)) return jsonError("Email e obrigatorio");
    if (!isNonEmptyString(password) || password.length < 8) {
      return jsonError("Senha deve ter pelo menos 8 caracteres");
    }

    const user = await registerUser({
      name: name.trim(),
      email: email.trim(),
      password,
    });

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      },
      { status: 201 }
    );

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
      return jsonError("Este email ja esta cadastrado", 409);
    }
    return jsonError("Erro ao criar o usuario", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    if (!(await rateLimit(`login:${getClientIp(req)}`, 8, 15 * 60_000)).allowed) return jsonError("Muitas tentativas de login. Aguarde alguns minutos.", 429);
    const body = await readJson(req);

    if (!isRecord(body)) {
      return jsonError("JSON invalido");
    }

    const { email, password } = body;

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
      return jsonError("Credenciais invalidas", 401);
    }

    const user = await authenticateUser(email.trim(), password);

    if (!user) {
      return jsonError("Email ou senha invalidos", 401);
    }

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

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
    return jsonError("Erro ao autenticar o usuario", 500);
  }
}

export async function DELETE(req: Request) {
  const user = readSessionFromRequest(req);

  const response = NextResponse.json({ ok: true });
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
  });

  if (user) {
    return response;
  }

  return response;
}
