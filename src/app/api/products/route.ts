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
} from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { recordInventorySnapshot } from "@/server/services/inventory";
import { toStorefrontProduct } from "@/shared/storefront";

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
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json(products.map(toStorefrontProduct));
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
    const session = readSessionFromRequest(req);
    if (!session || session.role !== "ADMIN") {
      return jsonError("Nao autorizado", 401);
    }

    const body = await readJson(req);

    if (!isRecord(body)) {
      return jsonError("JSON invalido");
    }

    const {
      name,
      slug,
      description,
      price,
      promoPrice,
      brand,
      inventory,
      categoryId,
      collection,
      rating,
      images,
      details,
      isFeatured,
      isPremium,
      isNew,
      variants,
      weight,
      width,
      height,
      length,
    } = body;

    const normalizedPrice = toNonNegativeNumber(price);
    const normalizedPromoPrice =
      promoPrice === undefined || promoPrice === null
        ? null
        : toNonNegativeNumber(promoPrice);
    const normalizedImages = normalizeImages(images);
    const normalizedInventory = toPositiveInt(inventory, 0) ?? 0;

    if (!isNonEmptyString(name)) return jsonError("Nome e obrigatorio");
    if (description !== undefined && description !== null && typeof description !== "string") {
      return jsonError("Descricao invalida");
    }
    const normalizedSlug = isNonEmptyString(slug) ? slug.trim() : undefined;
    if (normalizedPrice === null || normalizedPrice <= 0) return jsonError("Preco invalido");
    if (
      (normalizedPromoPrice === null && promoPrice !== undefined && promoPrice !== null)
      || (normalizedPromoPrice !== null && (normalizedPromoPrice <= 0 || normalizedPromoPrice >= normalizedPrice))
    ) {
      return jsonError("Preco promocional invalido");
    }
    if (!isNonEmptyString(categoryId)) {
      return jsonError("Categoria e obrigatoria");
    }
    if (!normalizedImages) return jsonError("Imagem e obrigatoria");

    const store = await prisma.store.findFirst({
      where: { OR: [{ ownerId: session.id }, { members: { some: { userId: session.id, role: { in: ["OWNER", "ADMIN"] } } } }] },
      orderBy: { createdAt: "asc" },
    }) ?? await prisma.store.findFirst({ orderBy: { createdAt: "asc" } });
    if (!store) return jsonError("Cadastre uma loja antes de criar produtos", 409);

    const newProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
        storeId: store.id,
        name: name.trim(),
        slug: normalizedSlug ?? name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""),
        description: isNonEmptyString(description) ? description.trim() : "",
        price: normalizedPrice,
        promoPrice: normalizedPromoPrice,
        brand: isNonEmptyString(brand) ? brand.trim() : null,
        inventory: normalizedInventory,
        categoryId: categoryId.trim(),
        images: normalizedImages,
        collection: isNonEmptyString(collection) ? collection.trim() : "Colecao Principal",
        rating: toNonNegativeNumber(rating) ?? 5,
        details: Array.isArray(details)
          ? details.filter(isNonEmptyString).map((detail) => detail.trim()).join("|")
          : "",
        isFeatured: Boolean(isFeatured),
        isPremium: Boolean(isPremium),
        isNew: Boolean(isNew),
        weight: toNonNegativeNumber(weight) ?? 0.3,
        width: toNonNegativeNumber(width) ?? 20,
        height: toNonNegativeNumber(height) ?? 10,
        length: toNonNegativeNumber(length) ?? 25,
        variants: Array.isArray(variants)
          ? {
              create: variants
                .filter(isRecord)
                .map((variant) => ({
                  sku: isNonEmptyString(variant.sku)
                    ? variant.sku.trim()
                    : `${name.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-")}-DEFAULT`,
                  label: isNonEmptyString(variant.label) ? variant.label.trim() : "Padrao",
                  size: isNonEmptyString(variant.size) ? variant.size.trim() : null,
                  color: isNonEmptyString(variant.color) ? variant.color.trim() : null,
                  inventory: toPositiveInt(variant.inventory, normalizedInventory) ?? normalizedInventory,
                  image: isNonEmptyString(variant.image) ? variant.image.trim() : null,
                  priceOverride:
                    variant.priceOverride === undefined || variant.priceOverride === null
                      ? null
                      : toNonNegativeNumber(variant.priceOverride),
                  isDefault: Boolean(variant.isDefault),
                })),
            }
          : undefined,
      },
        include: {
          category: true,
          variants: true,
        },
      });

      const context = {
        type: "INITIAL_STOCK",
        actorUserId: session.id,
        actorName: session.name,
        actorEmail: session.email,
        reason: "Estoque informado no cadastro do produto",
      };
      await recordInventorySnapshot(tx, {
        productId: product.id,
        productName: product.name,
        previousStock: 0,
        newStock: product.inventory,
      }, context);
      for (const variant of product.variants) {
        await recordInventorySnapshot(tx, {
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          variantName: variant.label,
          sku: variant.sku,
          previousStock: 0,
          newStock: variant.inventory,
        }, context);
      }
      return product;
    });

    return NextResponse.json(toStorefrontProduct(newProduct), { status: 201 });
  } catch (error) {
    console.error(error);
    if (String(error).includes("Unique constraint")) {
      return jsonError("Slug ou SKU ja esta em uso", 409);
    }
    return NextResponse.json(
      { error: "Erro ao criar o produto" },
      { status: 500 }
    );
  }
}
