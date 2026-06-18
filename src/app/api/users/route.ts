import { randomBytes, scryptSync } from "crypto";
import { NextResponse } from "next/server";

import { isNonEmptyString, isRecord, jsonError, readJson } from "@/lib/api";
import { prisma } from "@/lib/prisma";

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
};

export async function GET() {
  try {
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
    const body = await readJson(req);

    if (!isRecord(body)) {
      return jsonError("JSON invalido");
    }

    const { name, email, password } = body;

    if (!isNonEmptyString(name)) return jsonError("Nome e obrigatorio");
    if (!isNonEmptyString(email)) return jsonError("Email e obrigatorio");
    if (!isNonEmptyString(password) || password.length < 6) {
      return jsonError("Senha deve ter pelo menos 6 caracteres");
    }

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashPassword(password),
      },
      select: publicUserSelect,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao criar o usuario", 500);
  }
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
