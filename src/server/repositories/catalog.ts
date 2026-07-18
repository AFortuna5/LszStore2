import "server-only";

import { prisma } from "@/server/database/client";
import { toStorefrontCategory, toStorefrontProduct } from "@/shared/storefront";

const productInclude = {
  category: true,
  variants: { orderBy: { createdAt: "asc" as const } },
};

export async function getStorefrontProducts() {
  const products = await prisma.product.findMany({ include: productInclude, orderBy: { createdAt: "desc" } });
  return products.map(toStorefrontProduct);
}

export async function getStorefrontProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({ where: { slug }, include: productInclude });
  return product ? toStorefrontProduct(product) : null;
}

export async function getStorefrontCategories() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } }, orderBy: { name: "asc" },
  });
  return categories.map(toStorefrontCategory);
}

export async function getStorefrontCollections() {
  const products = await prisma.product.findMany({
    select: { collection: true }, distinct: ["collection"], orderBy: { collection: "asc" },
  });
  return products.map((entry) => entry.collection);
}

async function getProducts(where: { isFeatured?: boolean; isPremium?: boolean; isNew?: boolean }, limit: number, rating = false) {
  const products = await prisma.product.findMany({
    where, include: productInclude,
    orderBy: rating ? [{ rating: "desc" }, { createdAt: "desc" }] : [{ createdAt: "desc" }],
    take: limit,
  });
  return products.map(toStorefrontProduct);
}

export const getFeaturedStorefrontProducts = (limit = 4) => getProducts({ isFeatured: true }, limit);
export const getPremiumStorefrontProducts = (limit = 8) => getProducts({ isPremium: true }, limit);
export const getNewStorefrontProducts = (limit = 8) => getProducts({ isNew: true }, limit);
export const getBestSellerStorefrontProducts = (limit = 8) => getProducts({}, limit, true);
