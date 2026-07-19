import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { StorefrontCategory, StorefrontProduct } from "@/shared/storefront";

const categoryImages: Record<string, string> = {
  camisetas: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=82",
  moletons: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=82",
  perfumes: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=82",
  acessorios: "https://images.unsplash.com/photo-1622434641406-a158123450f9?auto=format&fit=crop&w=900&q=82",
  eletronicos: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=82",
  tenis: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=82",
};

function normalize(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export default function Categories({ categories, products }: { categories: StorefrontCategory[]; products: StorefrontProduct[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="bg-[#f4f4f1] py-16 md:py-24">
      <div className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-10">
        <div className="mb-10 text-center md:mb-14">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-neon-blue">Encontre seu estilo</p>
          <h2 className="font-montserrat text-2xl font-black uppercase tracking-[-0.05em] text-black sm:text-3xl md:text-5xl">Compre por categoria</h2>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-5">
          {categories.slice(0, 5).map((category) => {
            const productImage = products.find((product) => product.categorySlug === category.slug)?.image;
            const image = productImage ?? categoryImages[normalize(category.name)] ?? categoryImages.camisetas;
            return (
              <Link key={category.id} href={`/categoria/${category.slug}`} className="group relative aspect-[4/5] overflow-hidden bg-neutral-200">
                <Image src={image} alt={category.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(min-width: 1024px) 20vw, (min-width: 768px) 33vw, 50vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 text-white sm:p-5">
                  <div>
                    <h3 className="font-montserrat text-sm font-black uppercase sm:text-lg">{category.name}</h3>
                    <p className="mt-1 text-[10px] uppercase tracking-wider text-white/70">{category.productCount} {category.productCount === 1 ? "produto" : "produtos"}</p>
                  </div>
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-black transition-colors group-hover:bg-neon-blue"><ArrowUpRight size={16} /></span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
