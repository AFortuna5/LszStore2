import ProductGrid from "@/components/products/ProductGrid";
import SiteShell from "@/components/layout/SiteShell";
import { categories, products } from "@/lib/store-data";
import Link from "next/link";

export default function ProductsPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
                Catalogo
              </p>
              <h1 className="font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
                Todas as pecas
              </h1>
              <p className="mt-3 max-w-2xl text-silver">
                Roupas, acessorios, fragrancias e tecnologia selecionados para
                compor o visual LSZ.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/categoria/${category.slug}`}
                  className="rounded border border-border px-4 py-2 text-sm text-silver transition-colors hover:border-neon-blue hover:text-neon-blue"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
          <ProductGrid products={products} />
        </div>
      </section>
    </SiteShell>
  );
}
