import SiteShell from "@/templates/layout/SiteShell";
import ProductGrid from "@/templates/products/ProductGrid";
import { getPremiumStorefrontProducts } from "@/server/repositories/catalog";

export const dynamic = "force-dynamic";

export default async function PremiumPage() {
  const products = await getPremiumStorefrontProducts();

  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto px-4 md:px-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
            Curadoria premium
          </p>
          <h1 className="mb-8 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Linha Premium
          </h1>
          <ProductGrid products={products} />
        </div>
      </section>
    </SiteShell>
  );
}
