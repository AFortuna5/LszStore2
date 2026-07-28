import { NextResponse } from "next/server";

import {
  isNonEmptyString,
  isRecord,
  jsonError,
  normalizeImages,
  readJson,
  toNonNegativeNumber,
  toPositiveInt,
} from "@/server/http/api";
import { readSessionFromRequest } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { recordInventorySnapshot } from "@/server/services/inventory";
import { toStorefrontProduct } from "@/shared/storefront";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_req: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      include: {
        category: true,
        variants: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!product) return jsonError("Produto nao encontrado", 404);

    return NextResponse.json(toStorefrontProduct(product));
  } catch (error) {
    console.error(error);
    return jsonError("Erro ao buscar o produto", 500);
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
      slug?: string;
      description?: string;
      price?: number;
      promoPrice?: number | null;
      brand?: string | null;
      inventory?: number;
      categoryId?: string;
      images?: string;
      collection?: string;
      rating?: number;
      isFeatured?: boolean;
      isPremium?: boolean;
      isNew?: boolean;
      details?: string;
      weight?: number;
      width?: number;
      height?: number;
      length?: number;
    } = {};

    if ("name" in body) {
      if (!isNonEmptyString(body.name)) return jsonError("Nome invalido");
      data.name = body.name.trim();
    }

    if ("slug" in body) {
      if (!isNonEmptyString(body.slug)) return jsonError("Slug invalido");
      data.slug = body.slug.trim();
    }

    if ("description" in body) {
      if (body.description !== undefined && body.description !== null && typeof body.description !== "string") {
        return jsonError("Descricao invalida");
      }
      data.description = isNonEmptyString(body.description) ? body.description.trim() : "";
    }

    if ("price" in body) {
      const price = toNonNegativeNumber(body.price);
      if (price === null || price <= 0) return jsonError("Preco invalido");
      data.price = price;
    }

    if ("promoPrice" in body) {
      if (body.promoPrice === null) {
        data.promoPrice = null;
      } else {
        const promoPrice = toNonNegativeNumber(body.promoPrice);
        if (promoPrice === null || promoPrice <= 0) return jsonError("Preco promocional invalido");
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

    if ("collection" in body) {
      if (!isNonEmptyString(body.collection)) {
        return jsonError("Colecao invalida");
      }
      data.collection = body.collection.trim();
    }

    if ("rating" in body) {
      const rating = toNonNegativeNumber(body.rating);
      if (rating === null) return jsonError("Avaliacao invalida");
      data.rating = rating;
    }

    if ("isFeatured" in body) data.isFeatured = Boolean(body.isFeatured);
    if ("isPremium" in body) data.isPremium = Boolean(body.isPremium);
    if ("isNew" in body) data.isNew = Boolean(body.isNew);

    for (const field of ["weight", "width", "height", "length"] as const) {
      if (field in body) {
        const value = toNonNegativeNumber(body[field]);
        if (value === null || value <= 0) return jsonError(`${field} invalido`);
        data[field] = value;
      }
    }

    if ("details" in body) {
      if (!Array.isArray(body.details)) return jsonError("Detalhes invalidos");
      data.details = body.details
        .filter(isNonEmptyString)
        .map((detail) => detail.trim())
        .join("|");
    }

    const existing = await prisma.product.findFirst({
      where: { OR: [{ slug: id }, { id }] },
      include: { variants: true },
    });
    if (!existing) return jsonError("Produto nao encontrado", 404);
    const effectivePrice = data.price ?? Number(existing.price);
    const effectivePromoPrice = data.promoPrice === undefined
      ? existing.promoPrice === null ? null : Number(existing.promoPrice)
      : data.promoPrice;
    if (effectivePromoPrice !== null && effectivePromoPrice >= effectivePrice) {
      return jsonError("Preco promocional deve ser menor que o preco normal");
    }

    if ("variants" in body && !Array.isArray(body.variants)) {
      return jsonError("Variacoes invalidas");
    }

    const variants = Array.isArray(body.variants)
      ? body.variants.filter(isRecord).map((variant, index) => {
          const inventory = toPositiveInt(variant.inventory, 0);
          const priceOverride = variant.priceOverride === null || variant.priceOverride === ""
            ? null
            : toNonNegativeNumber(variant.priceOverride);
          if (!isNonEmptyString(variant.sku) || !isNonEmptyString(variant.label)) {
            throw new Error(`VARIANT_INVALID:${index}`);
          }
          if (
            inventory === undefined
            || priceOverride !== null && priceOverride <= 0
            || priceOverride === null && variant.priceOverride !== null && variant.priceOverride !== "" && variant.priceOverride !== undefined
          ) {
            throw new Error(`VARIANT_INVALID:${index}`);
          }
          return {
            sku: variant.sku.trim(),
            label: variant.label.trim(),
            size: isNonEmptyString(variant.size) ? variant.size.trim() : null,
            color: isNonEmptyString(variant.color) ? variant.color.trim() : null,
            inventory: inventory ?? 0,
            image: isNonEmptyString(variant.image) ? variant.image.trim() : null,
            priceOverride,
            isDefault: Boolean(variant.isDefault),
          };
        })
      : null;

    const product = await prisma.$transaction(async (tx) => {
      await tx.product.update({ where: { id: existing.id }, data });
      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: existing.id } });
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((variant) => ({ ...variant, productId: existing.id })),
          });
        }
      }
      const updated = await tx.product.findUniqueOrThrow({
        where: { id: existing.id },
        include: { category: true, variants: { orderBy: { createdAt: "asc" } } },
      });
      const movementContext = {
        type: "PRODUCT_EDIT",
        actorUserId: session.id,
        actorName: session.name,
        actorEmail: session.email,
        reason: "Estoque alterado no editor de produtos",
      };
      await recordInventorySnapshot(tx, {
        productId: updated.id,
        productName: updated.name,
        previousStock: existing.inventory,
        newStock: updated.inventory,
      }, movementContext);
      if (variants) {
        const oldBySku = new Map(existing.variants.map((variant) => [variant.sku, variant]));
        const newBySku = new Map(updated.variants.map((variant) => [variant.sku, variant]));
        for (const variant of updated.variants) {
          const previous = oldBySku.get(variant.sku);
          await recordInventorySnapshot(tx, {
            productId: updated.id,
            variantId: variant.id,
            productName: updated.name,
            variantName: variant.label,
            sku: variant.sku,
            previousStock: previous?.inventory ?? 0,
            newStock: variant.inventory,
          }, movementContext);
        }
        for (const variant of existing.variants) {
          if (newBySku.has(variant.sku)) continue;
          await recordInventorySnapshot(tx, {
            productId: updated.id,
            productName: updated.name,
            variantName: variant.label,
            sku: variant.sku,
            previousStock: variant.inventory,
            newStock: 0,
          }, { ...movementContext, reason: "Variacao removida no editor de produtos" });
        }
      }
      return updated;
    });

    return NextResponse.json(toStorefrontProduct(product));
  } catch (error) {
    console.error(error);
    if (String(error).includes("VARIANT_INVALID")) {
      return jsonError("Preencha SKU, nome e estoque de todas as variacoes");
    }
    if (String(error).includes("Unique constraint")) {
      return jsonError("Slug ou SKU ja esta em uso", 409);
    }
    return jsonError("Erro ao atualizar o produto", 500);
  }
}

export async function DELETE(_req: Request, context: RouteContext) {
  try {
    const session = readSessionFromRequest(_req);
    if (!session || session.role !== "ADMIN") {
      return jsonError("Nao autorizado", 401);
    }

    const { id } = await context.params;

    const product = await prisma.product.findFirst({ where: { OR: [{ slug: id }, { id }] }, include: { variants: true } });
    if (!product) return jsonError("Produto nao encontrado", 404);
    await prisma.$transaction(async (tx) => {
      const context = {
        type: "PRODUCT_DELETED",
        actorUserId: session.id,
        actorName: session.name,
        actorEmail: session.email,
        reason: "Produto excluido do catalogo",
      };
      await recordInventorySnapshot(tx, {
        productId: product.id,
        productName: product.name,
        previousStock: product.inventory,
        newStock: 0,
      }, context);
      for (const variant of product.variants) {
        await recordInventorySnapshot(tx, {
          productId: product.id,
          variantId: variant.id,
          productName: product.name,
          variantName: variant.label,
          sku: variant.sku,
          previousStock: variant.inventory,
          newStock: 0,
        }, context);
      }
      await tx.product.delete({ where: { id: product.id } });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(error);
    if (String(error).includes("Foreign key constraint")) {
      return jsonError("Este produto pertence a um pedido e nao pode ser excluido", 409);
    }
    return jsonError("Erro ao remover o produto", 500);
  }
}
