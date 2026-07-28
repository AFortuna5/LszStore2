export type StorefrontVariant = {
  id: string;
  sku: string;
  label: string;
  size: string | null;
  color: string | null;
  inventory: number;
  image: string | null;
  price: number;
  priceOverride: number | null;
  isDefault: boolean;
};

export type StorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  collection: string;
  rating: number;
  price: number;
  promoPrice: number | null;
  discount: string | null;
  image: string;
  gallery: string[];
  description: string;
  details: string[];
  isNew: boolean;
  isPremium: boolean;
  isFeatured: boolean;
  inventory: number;
  weight: number;
  width: number;
  height: number;
  length: number;
  variants: StorefrontVariant[];
};

export type StorefrontCategory = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

type NumericValue = number | string | { toString(): string };

type ProductPayload = {
  id: string; slug: string; name: string; description: string; price: NumericValue;
  promoPrice: NumericValue | null; brand: string | null; collection: string; rating: number;
  inventory: number; images: string; details: string; isFeatured: boolean;
  isPremium: boolean; isNew: boolean; weight: number; width: number; height: number; length: number;
  category: { name: string; slug: string };
  variants: Array<{
    id: string; sku: string; label: string; size: string | null; color: string | null;
    inventory: number; image: string | null; priceOverride: NumericValue | null; isDefault: boolean;
  }>;
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function parseImageList(value: string) {
  return value
    .split(/[,|]/g)
    .map((image) => image.trim())
    .filter((image) => image.startsWith("/") || /^https:\/\//i.test(image));
}

export function parseTextList(value: string) {
  return value
    .split("|")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

export function toStorefrontProduct(product: ProductPayload): StorefrontProduct {
  const images = parseImageList(product.images);
  const price = Number(product.price);
  const rawPromoPrice = product.promoPrice === null ? null : Number(product.promoPrice);
  const promoPrice = rawPromoPrice !== null && rawPromoPrice > 0 && rawPromoPrice < price
    ? rawPromoPrice
    : null;
  const discount =
    promoPrice && promoPrice < price
      ? `${Math.round(100 - (promoPrice / price) * 100)}% OFF`
      : null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand ?? product.category.name,
    category: product.category.name,
    categorySlug: product.category.slug,
    collection: product.collection,
    rating: product.rating,
    price,
    promoPrice,
    discount,
    image: images[0] ?? "/placeholder-product.svg",
    gallery: images.length > 0 ? images : ["/placeholder-product.svg"],
    description: product.description,
    details: parseTextList(product.details),
    isNew: product.isNew,
    isPremium: product.isPremium,
    isFeatured: product.isFeatured,
    inventory: product.inventory,
    weight: product.weight,
    width: product.width,
    height: product.height,
    length: product.length,
    variants: product.variants.map((variant) => {
      const rawOverride = variant.priceOverride === null ? null : Number(variant.priceOverride);
      const priceOverride = rawOverride !== null && rawOverride > 0 ? rawOverride : null;
      return {
        id: variant.id,
        sku: variant.sku,
        label: variant.label,
        size: variant.size,
        color: variant.color,
        inventory: variant.inventory,
        image: variant.image,
        price: priceOverride ?? promoPrice ?? price,
        priceOverride,
        isDefault: variant.isDefault,
      };
    }),
  };
}

export function toStorefrontCategory(category: {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}): StorefrontCategory {
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    productCount: category._count?.products ?? 0,
  };
}

export function getProductPrice(product: StorefrontProduct) {
  return product.promoPrice ?? product.price;
}
