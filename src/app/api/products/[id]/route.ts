import { NextResponse } from "next/server";

import {
  isNonEmptyString,
  isRecord,
  jsonError,
  normalizeImages,
  readJson,
  toNonNegativeNumber,
  toPositiveInt,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!product) return jsonError("Produto nao encontrado", 404);

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar o produto", 500);
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
      description?: string;
      price?: number;
      promoPrice?: number | null;
      brand?: string | null;
      inventory?: number;
      categoryId?: string;
      images?: string;
      isFeatured?: boolean;
      isPremium?: boolean;
    } = {};

    if ("name" in body) {
      if (!isNonEmptyString(body.name)) return jsonError("Nome invalido");
      data.name = body.name.trim();
    }

    if ("description" in body) {
      if (!isNonEmptyString(body.description)) {
        return jsonError("Descricao invalida");
      }
      data.description = body.description.trim();
    }

    if ("price" in body) {
      const price = toNonNegativeNumber(body.price);
      if (price === null) return jsonError("Preco invalido");
      data.price = price;
    }

    if ("promoPrice" in body) {
      if (body.promoPrice === null) {
        data.promoPrice = null;
      } else {
        const promoPrice = toNonNegativeNumber(body.promoPrice);
        if (promoPrice === null) return jsonError("Preco promocional invalido");
        data.promoPrice = promoPrice;
      }
    }

    if ("brand" in body) {
      data.brand = isNonEmptyString(body.brand) ? body.brand.trim() : null;
    }

    if ("inventory" in body) {
      const inventory = toPositiveInt(body.inventory, 0);
      if (inventory === undefined) return jsonError("Estoque invalido");
      data.inventory = inventory;
    }

    if ("categoryId" in body) {
      if (!isNonEmptyString(body.categoryId)) {
        return jsonError("Categoria invalida");
      }
      data.categoryId = body.categoryId.trim();
    }

    if ("images" in body) {
      const images = normalizeImages(body.images);
      if (!images) return jsonError("Imagem invalida");
      data.images = images;
    }

    if ("isFeatured" in body) data.isFeatured = Boolean(body.isFeatured);
    if ("isPremium" in body) data.isPremium = Boolean(body.isPremium);

    const product = await prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao atualizar o produto", 500);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.product.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao remover o produto", 500);
  }
}
