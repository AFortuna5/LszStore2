import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getStoreBrand, matchesStoreBrand } from "@/shared/brands";
import { getStorefrontProducts } from "@/server/repositories/catalog";
import SiteShell from "@/templates/layout/SiteShell";
import ProductGrid from "@/templates/products/ProductGrid";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getStoreBrand(slug);
  return brand
    ? { title: `${brand.name} | LSZ Store`, description: `Confira os produtos ${brand.name} disponíveis na LSZ Store.` }
    : {};
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = getStoreBrand(slug);
  if (!brand) notFound();

  const products = (await getStorefrontProducts()).filter((product) => matchesStoreBrand(product.brand, brand));

  return (
    <SiteShell>
      <section className="min-h-[65vh] bg-black py-14">
        <div className="container mx-auto px-4 md:px-6">
          <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-neon-blue">Compre por marca</p>
          <div className="mb-10 flex min-h-28 max-w-md items-center rounded bg-white px-8 py-6">
            <div className="relative h-14 w-full">
              <Image src={brand.logo} alt={brand.name} fill unoptimized className="object-contain object-left" sizes="384px" priority />
            </div>
          </div>
          <h1 className="sr-only">Produtos {brand.name}</h1>
          <ProductGrid products={products} emptyMessage={`Ainda não há produtos ${brand.name} cadastrados. Volte em breve para conferir as novidades.`} />
        </div>
      </section>
    </SiteShell>
  );
}
