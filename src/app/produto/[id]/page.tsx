import Image from "next/image";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Truck } from "lucide-react";

import SiteShell from "@/templates/layout/SiteShell";
import ProductPurchasePanel from "@/templates/products/ProductPurchasePanel";
import ProductGrid from "@/templates/products/ProductGrid";
import { getStorefrontProductBySlug, getStorefrontProducts } from "@/server/repositories/catalog";
import type { Metadata } from "next";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getStorefrontProductBySlug((await params).id);
  if (!product) return { title: "Produto nao encontrado" };
  return {
    title: `${product.name} | LSZ Store`,
    description: product.description.slice(0, 160),
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: { title: product.name, description: product.description, images: product.gallery },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getStorefrontProductBySlug(id);

  if (!product) notFound();

  const related = (await getStorefrontProducts())
    .filter(
      (entry) =>
        entry.id !== product.id && entry.categorySlug === product.categorySlug
    )
    .slice(0, 4);

  return (
    <SiteShell>
      <section className="bg-black py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="grid gap-4 md:grid-cols-[110px_1fr]">
              <div className="order-2 grid grid-cols-2 gap-3 md:order-1 md:grid-cols-1">
                {product.gallery.map((image) => (
                  <div
                    key={image}
                    className="relative aspect-square overflow-hidden rounded border border-border bg-dark-blue"
                  >
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="110px"
                    />
                  </div>
                ))}
              </div>
              <div className="relative order-1 aspect-square overflow-hidden rounded-lg border border-border bg-dark-blue md:order-2">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  priority
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
            </div>

            <div>
              <p className="text-sm font-bold uppercase tracking-wide text-neon-blue">
                {product.brand}
              </p>
              <h1 className="mt-3 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
                {product.name}
              </h1>
              <div className="mt-4 flex items-center gap-2">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={18}
                    className={
                      index < Math.floor(product.rating)
                        ? "fill-neon-blue text-neon-blue"
                        : "text-border"
                    }
                  />
                ))}
                <span className="text-sm text-silver">({product.rating})</span>
              </div>
              <p className="mt-6 text-lg leading-relaxed text-silver">
                {product.description}
              </p>
              <ProductPurchasePanel product={product} />
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded border border-border bg-dark-blue p-4">
                  <Truck className="mb-3 text-neon-blue" size={22} />
                  <p className="font-bold text-white">Envio para todo Brasil</p>
                  <p className="mt-1 text-sm text-silver">
                    Frete gratis acima de R$ 399.
                  </p>
                </div>
                <div className="rounded border border-border bg-dark-blue p-4">
                  <ShieldCheck className="mb-3 text-neon-blue" size={22} />
                  <p className="font-bold text-white">Compra segura</p>
                  <p className="mt-1 text-sm text-silver">
                    Produtos selecionados e suporte no pedido.
                  </p>
                </div>
              </div>
              <ul className="mt-8 space-y-2 text-silver">
                {product.details.map((detail) => (
                  <li key={detail} className="border-b border-border pb-2">
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {related.length > 0 && (
            <div className="mt-16">
              <h2 className="mb-6 font-montserrat text-2xl font-bold uppercase text-white">
                Combine com
              </h2>
              <ProductGrid products={related} />
            </div>
          )}
        </div>
      </section>
    </SiteShell>
  );
}
