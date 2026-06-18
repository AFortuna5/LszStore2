import { NextResponse } from "next/server";

import { isNonEmptyString, isRecord, jsonError, readJson, slugify } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!category) return jsonError("Categoria nao encontrada", 404);

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar a categoria", 500);
  }
}

export async function PATCH(req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await readJson(req);

    if (!isRecord(body)) {
      return jsonError("JSON invalido");
    }

    const data: {
      name?: string;
      slug?: string;
    } = {};

    if ("name" in body) {
      if (!isNonEmptyString(body.name)) return jsonError("Nome invalido");
      data.name = body.name.trim();
    }

    if ("slug" in body) {
      if (!isNonEmptyString(body.slug)) return jsonError("Slug invalido");
      const normalizedSlug = slugify(body.slug);
      if (!normalizedSlug) return jsonError("Slug invalido");
      data.slug = normalizedSlug;
    }

    const category = await prisma.category.update({
      where: { id },
      data,
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao atualizar a categoria", 500);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.category.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao remover a categoria", 500);
  }
}
