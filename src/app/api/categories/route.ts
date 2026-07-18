import { NextResponse } from "next/server";

import { isNonEmptyString, isRecord, jsonError, readJson, slugify } from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { toStorefrontCategory } from "@/shared/storefront";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });
    return NextResponse.json(categories.map(toStorefrontCategory));
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar as categorias" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = readSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return jsonError("Nao autorizado", 401);
    }

    const body = await readJson(req);

    if (!isRecord(body)) {
      return jsonError("JSON invalido");
    }

    const { name, slug } = body;

    if (!isNonEmptyString(name)) {
      return jsonError("Nome e obrigatorio");
    }

    const normalizedSlug = isNonEmptyString(slug)
      ? slugify(slug)
      : slugify(name);

    if (!normalizedSlug) {
      return jsonError("Slug invalido");
    }

    const newCategory = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: normalizedSlug,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error(error);
    if (String(error).includes("Unique constraint")) {
      return jsonError("Ja existe uma categoria com este nome ou endereco", 409);
    }
    return NextResponse.json(
      { error: "Erro ao criar a categoria" },
      { status: 500 }
    );
  }
}
