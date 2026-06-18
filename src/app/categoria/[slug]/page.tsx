import { notFound } from "next/navigation";

import SiteShell from "@/components/layout/SiteShell";
import ProductGrid from "@/components/products/ProductGrid";
import { categories, products } from "@/lib/store-data";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = categories.find((entry) => entry.slug === slug);
  if (!category) notFound();

  const categoryProducts = products.filter(
    (product) => product.categorySlug === category.slug
  );

  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto px-4 md:px-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
            Categoria
          </p>
          <h1 className="mb-8 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            {category.name}
          </h1>
          <ProductGrid products={categoryProducts} />
        </div>
      </section>
    </SiteShell>
  );
}
