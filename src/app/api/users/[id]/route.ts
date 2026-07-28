import { randomBytes, scryptSync } from "crypto";
import { NextResponse } from "next/server";

import { isNonEmptyString, isRecord, jsonError, readJson } from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = readSessionFromRequest(_req);
    if (!session || session.role !== "ADMIN") {
      return jsonError("Nao autorizado", 401);
    }

    const { id } = await context.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        ...publicUserSelect,
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!user) return jsonError("Usuario nao encontrado", 404);

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar o usuario", 500);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const session = readSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return jsonError("Nao autorizado", 401);
    }

    const { id } = await context.params;
    const body = await readJson(req);

    if (!isRecord(body)) {
      return jsonError("JSON invalido");
    }

    const data: {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    } = {};

    if ("name" in body) {
      if (!isNonEmptyString(body.name)) return jsonError("Nome invalido");
      data.name = body.name.trim();
    }

    if ("email" in body) {
      if (!isNonEmptyString(body.email)) return jsonError("Email invalido");
      data.email = body.email.trim().toLowerCase();
    }

    if ("password" in body) {
      if (!isNonEmptyString(body.password) || body.password.length < 8) {
        return jsonError("Senha deve ter pelo menos 8 caracteres");
      }
      data.password = hashPassword(body.password);
    }

    if ("role" in body) {
      if (!isNonEmptyString(body.role)) return jsonError("Perfil invalido");
      data.role = body.role.trim().toUpperCase();
    }

    const user = await prisma.user.update({
      where: { id },
      data,
      select: publicUserSelect,
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao atualizar o usuario", 500);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = readSessionFromRequest(_req);
    if (!session || session.role !== "ADMIN") {
      return jsonError("Nao autorizado", 401);
    }

    const { id } = await context.params;

    await prisma.user.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao remover o usuario", 500);
  }
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
