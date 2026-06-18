import { NextResponse } from "next/server";

import { isNonEmptyString, isRecord, jsonError, readJson, slugify } from "@/lib/api";
import { prisma } from "@/lib/prisma";

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
    return NextResponse.json(categories);
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
    return NextResponse.json(
      { error: "Erro ao criar a categoria" },
      { status: 500 }
    );
  }
}
