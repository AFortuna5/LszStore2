import type { MetadataRoute } from "next";
import { env } from "@/server/config/env";
import { getStorefrontCategories, getStorefrontProducts } from "@/server/repositories/catalog";
import { storeBrands } from "@/shared/brands";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, categories] = await Promise.all([getStorefrontProducts(), getStorefrontCategories()]);
  const staticPages = ["", "/produtos", "/colecoes", "/novidades", "/promocoes", "/sobre", "/contato", "/faq", "/trocas", "/privacidade", "/termos"];
  return [
    ...staticPages.map((path) => ({ url: `${env.appUrl}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "daily" as const : "weekly" as const })),
    ...products.map((product) => ({ url: `${env.appUrl}/produto/${product.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const })),
    ...categories.map((category) => ({ url: `${env.appUrl}/categoria/${category.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const })),
    ...storeBrands.map((brand) => ({ url: `${env.appUrl}/marca/${brand.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const })),
  ];
}
