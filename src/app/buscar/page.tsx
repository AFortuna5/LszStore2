import SiteShell from "@/templates/layout/SiteShell";
import ProductGrid from "@/templates/products/ProductGrid";
import { getStorefrontProducts } from "@/server/repositories/catalog";

export const dynamic = "force-dynamic";
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const query = (await searchParams).q?.trim() ?? "";
  const products = await getStorefrontProducts();
  const normalized = query.toLowerCase();
  const results = normalized ? products.filter((product) => [product.name, product.brand, product.category, product.collection, product.description].some((value) => value.toLowerCase().includes(normalized))) : [];
  return <SiteShell><section className="min-h-[65vh] bg-black py-14"><div className="container mx-auto px-4 md:px-6"><p className="text-sm font-bold uppercase text-neon-blue">Pesquisa</p><h1 className="mt-2 font-montserrat text-4xl font-black uppercase text-white">Buscar produtos</h1><form className="mt-7 flex max-w-2xl gap-3"><input autoFocus name="q" defaultValue={query} placeholder="Nome, marca, categoria ou colecao" className="min-w-0 flex-1 rounded border border-border bg-dark-blue px-4 py-3 outline-none focus:border-neon-blue" /><button className="rounded bg-neon-blue px-6 font-bold uppercase text-black">Buscar</button></form>{query && <p className="my-7 text-silver">{results.length} resultado(s) para “{query}”</p>}{results.length > 0 && <ProductGrid products={results} />}</div></section></SiteShell>;
}
