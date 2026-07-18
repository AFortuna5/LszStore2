import Link from "next/link";

import SiteShell from "@/templates/layout/SiteShell";
import { getStorefrontCollections, getStorefrontProducts } from "@/server/repositories/catalog";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const [collections, products] = await Promise.all([
    getStorefrontCollections(),
    getStorefrontProducts(),
  ]);

  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto px-4 md:px-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
            Drops
          </p>
          <h1 className="mb-8 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Colecoes
          </h1>
          <div className="grid gap-6 md:grid-cols-3">
            {collections.map((collection) => {
              const count = products.filter((product) => product.collection === collection).length;
              return (
                <Link
                  href="/produtos"
                  key={collection}
                  className="rounded-lg border border-border bg-dark-blue p-8 transition-colors hover:border-neon-blue"
                >
                  <span className="text-sm uppercase tracking-wide text-neon-blue">
                    {count} pecas
                  </span>
                  <h2 className="mt-3 font-montserrat text-2xl font-bold uppercase text-white">
                    {collection}
                  </h2>
                  <p className="mt-3 text-silver">
                    Curadoria LSZ com produtos que conversam entre si.
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
