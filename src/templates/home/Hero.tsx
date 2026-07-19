import { ArrowUpRight, BadgeCheck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import type { StorefrontProduct } from "@/shared/storefront";

const fallbackProducts = [
  {
    id: "fallback-shirt",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=85",
    name: "Seleção LSZ",
    slug: "produtos",
  },
  {
    id: "fallback-shoe",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=85",
    name: "Sneakers selecionados",
    slug: "produtos",
  },
  {
    id: "fallback-jacket",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=85",
    name: "Peças premium",
    slug: "produtos",
  },
  {
    id: "fallback-perfume",
    image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=900&q=85",
    name: "Novidades LSZ",
    slug: "produtos",
  },
];

export default function Hero({ products }: { products: StorefrontProduct[] }) {
  const heroProducts = products.slice(0, 4).map((product) => ({
    id: product.id,
    image: product.image,
    name: product.name,
    slug: product.slug,
  }));
  const productTiles = [...heroProducts, ...fallbackProducts].slice(0, 4);

  return (
    <section className="relative isolate overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_72%_23%,rgba(0,163,255,0.32),transparent_24rem),radial-gradient(circle_at_15%_88%,rgba(24,68,128,0.45),transparent_25rem)]" />
      <div className="pointer-events-none absolute -right-24 top-8 h-[35rem] w-[35rem] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -right-8 top-24 h-[28rem] w-[28rem] rounded-full border border-neon-blue/20" />

      <div className="relative mx-auto grid min-h-[720px] max-w-[1500px] items-center gap-8 px-5 pb-14 pt-32 sm:px-10 lg:min-h-[740px] lg:grid-cols-[0.88fr_1.12fr] lg:gap-3 lg:px-14 lg:pb-20 lg:pt-28 xl:px-20">
        <div className="relative z-10 max-w-2xl lg:py-12">
          <p className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-neon-blue sm:text-xs">
            <BadgeCheck size={17} strokeWidth={2.4} /> Produtos 100% originais
          </p>
          <h1 className="font-montserrat text-[clamp(3.2rem,7.1vw,7rem)] font-black uppercase leading-[0.8] tracking-[-0.09em]">
            Seu estilo
            <span className="block text-neon-blue">vira</span>
            <span className="block pl-[0.08em] text-white">destaque.</span>
          </h1>
          <p className="mt-7 max-w-md font-poppins text-sm leading-7 text-white/65 sm:text-base">
            Marcas desejadas, peças selecionadas e uma curadoria para quem não passa despercebido.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/produtos" className="inline-flex items-center gap-3 bg-neon-blue px-6 py-4 text-xs font-black uppercase tracking-[0.15em] text-black transition-transform hover:-translate-y-1 hover:bg-white">
              Ver coleção <ArrowUpRight size={18} strokeWidth={2.5} />
            </Link>
            <Link href="/novidades" className="border-b border-white/50 pb-1 text-xs font-bold uppercase tracking-[0.13em] text-white transition-colors hover:border-neon-blue hover:text-neon-blue">
              Lançamentos
            </Link>
          </div>
          <div className="mt-12 flex items-center gap-5 border-l border-neon-blue pl-4 sm:mt-16">
            <span className="font-montserrat text-3xl font-black tracking-[-0.07em]">LSZ</span>
            <p className="max-w-48 text-xs leading-5 text-white/55">Seu próximo item favorito está aqui.</p>
          </div>
        </div>

        <div className="relative mx-auto h-[420px] w-full max-w-[680px] sm:h-[500px] lg:h-[610px]">
          <p className="absolute right-0 top-1 z-10 font-montserrat text-[10px] font-bold uppercase tracking-[0.24em] text-white/45 sm:right-7">Curadoria LSZ / 2026</p>
          <div className="absolute left-[12%] top-[11%] h-[67%] w-[70%] -rotate-[7deg] border border-white/15 bg-white/[0.035]" />
          <div className="absolute left-[19%] top-[5%] h-[75%] w-[68%] rotate-[5deg] border border-neon-blue/35 bg-neon-blue/[0.04]" />

          {productTiles.map((product, index) => {
            const positions = [
              "left-[2%] top-[19%] h-[43%] w-[35%] -rotate-[10deg]",
              "right-[1%] top-[11%] h-[46%] w-[39%] rotate-[8deg]",
              "bottom-[1%] left-[17%] h-[49%] w-[40%] -rotate-[3deg]",
              "bottom-[4%] right-[3%] h-[35%] w-[31%] rotate-[10deg]",
            ];

            return (
              <Link
                key={product.id}
                href={product.slug === "produtos" ? "/produtos" : `/produto/${product.slug}`}
                aria-label={`Ver ${product.name}`}
                className={`group absolute overflow-hidden border border-white/20 bg-[#e8e8e8] shadow-2xl transition duration-500 hover:z-50 hover:scale-105 hover:rotate-0 ${positions[index]}`}
                style={{ zIndex: index + 10 }}
              >
                <Image src={product.image} alt={product.name} fill className="object-cover transition duration-700 group-hover:scale-110" sizes="(max-width: 640px) 42vw, (max-width: 1024px) 28vw, 260px" />
                <span className="absolute inset-x-0 bottom-0 bg-black/75 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-white opacity-0 transition-opacity group-hover:opacity-100">{product.name}</span>
              </Link>
            );
          })}
          <div className="absolute bottom-[10%] left-[3%] z-40 flex h-14 w-14 items-center justify-center rounded-full bg-neon-blue text-center text-[9px] font-black uppercase leading-3 tracking-[0.08em] text-black shadow-[0_0_45px_rgba(0,163,255,0.75)] sm:h-16 sm:w-16">Só<br />original</div>
        </div>
      </div>
    </section>
  );
}
