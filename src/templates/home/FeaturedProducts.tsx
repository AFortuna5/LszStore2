import { ArrowRight } from "lucide-react";
import Link from "next/link";

import type { StorefrontProduct } from "@/shared/storefront";
import ProductCard from "@/templates/home/ProductCard";

type FeaturedProductsProps = {
  products: StorefrontProduct[];
  eyebrow?: string;
  title?: string;
  description?: string;
  tone?: "white" | "soft";
};

export default function FeaturedProducts({
  products,
  eyebrow = "Escolhas da loja",
  title = "Destaques LSZ",
  description = "Uma curadoria com os produtos que representam o momento da LSZ.",
  tone = "white",
}: FeaturedProductsProps) {
  return (
    <section className={`py-16 md:py-24 ${tone === "white" ? "bg-white" : "bg-[#f4f4f1]"}`}>
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="mb-10 flex items-end justify-between gap-6 md:mb-14">
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-neon-blue">{eyebrow}</p>
            <h2 className="font-montserrat text-3xl font-black uppercase tracking-[-0.05em] text-black md:text-5xl">{title}</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-neutral-600">{description}</p>
          </div>
          <Link href="/produtos" className="hidden items-center gap-2 border-b border-black pb-1 text-xs font-bold uppercase tracking-[0.14em] text-black transition-colors hover:border-neon-blue hover:text-neon-blue sm:flex">
            Ver todos <ArrowRight size={15} />
          </Link>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 xl:gap-x-7">
            {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        ) : (
          <div className="border border-dashed border-neutral-300 bg-white px-6 py-16 text-center text-sm text-neutral-600">
            Novos produtos serão publicados aqui em breve.
          </div>
        )}

        <Link href="/produtos" className="mt-10 flex w-full items-center justify-center gap-2 border border-black px-6 py-4 text-xs font-bold uppercase tracking-[0.14em] text-black sm:hidden">
          Ver todos <ArrowRight size={15} />
        </Link>
      </div>
    </section>
  );
}
