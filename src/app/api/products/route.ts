import { NextResponse } from "next/server";

import {
  isNonEmptyString,
  isRecord,
  jsonError,
  normalizeImages,
  readJson,
  toBooleanParam,
  toNonNegativeNumber,
  toPositiveInt,
} from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(
      toPositiveInt(searchParams.get("limit"), 24) ?? 24,
      100
    );
    const page = toPositiveInt(searchParams.get("page"), 1) ?? 1;
    const query = searchParams.get("q")?.trim();
    const categoryId = searchParams.get("categoryId")?.trim();
    const categorySlug = searchParams.get("category")?.trim();
    const featured = toBooleanParam(searchParams.get("featured"));
    const premium = toBooleanParam(searchParams.get("premium"));

    const products = await prisma.product.findMany({
      where: {
        ...(query
          ? {
              OR: [
                { name: { contains: query } },
                { description: { contains: query } },
                { brand: { contains: query } },
              ],
            }
          : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(categorySlug ? { category: { slug: categorySlug } } : {}),
        ...(featured === undefined ? {} : { isFeatured: featured }),
        ...(premium === undefined ? {} : { isPremium: premium }),
      },
      include: {
        category: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao buscar os produtos" },
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

    const {
      name,
      description,
      price,
      promoPrice,
      brand,
      inventory,
      categoryId,
      images,
      isFeatured,
      isPremium,
    } = body;

    const normalizedPrice = toNonNegativeNumber(price);
    const normalizedPromoPrice =
      promoPrice === undefined || promoPrice === null
        ? null
        : toNonNegativeNumber(promoPrice);
    const normalizedImages = normalizeImages(images);
    const normalizedInventory = toPositiveInt(inventory, 0) ?? 0;

    if (!isNonEmptyString(name)) return jsonError("Nome e obrigatorio");
    if (!isNonEmptyString(description)) {
      return jsonError("Descricao e obrigatoria");
    }
    if (normalizedPrice === null) return jsonError("Preco invalido");
    if (normalizedPromoPrice === null && promoPrice !== undefined) {
      return jsonError("Preco promocional invalido");
    }
    if (!isNonEmptyString(categoryId)) {
      return jsonError("Categoria e obrigatoria");
    }
    if (!normalizedImages) return jsonError("Imagem e obrigatoria");

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        description: description.trim(),
        price: normalizedPrice,
        promoPrice: normalizedPromoPrice,
        brand: isNonEmptyString(brand) ? brand.trim() : null,
        inventory: normalizedInventory,
        categoryId: categoryId.trim(),
        images: normalizedImages,
        isFeatured: Boolean(isFeatured),
        isPremium: Boolean(isPremium),
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Erro ao criar o produto" },
      { status: 500 }
    );
  }
}
