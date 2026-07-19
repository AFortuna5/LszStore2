import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { storeBrands } from "@/shared/brands";

export default function BrandsSection() {
  return (
    <section id="marcas" className="scroll-mt-28 border-y border-neon-blue/20 bg-black py-16 text-white md:py-20">
      <div className="mx-auto max-w-[1300px] px-4 sm:px-6 lg:px-10">
        <div className="mb-10 text-center">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.24em] text-neon-blue">Selecione sua favorita</p>
            <h2 className="font-montserrat text-3xl font-medium tracking-[-0.05em] md:text-5xl">Compre por marcas</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 sm:gap-5">
          {storeBrands.map((brand) => (
            <Link
              key={brand.slug}
              href={`/marca/${brand.slug}`}
              className="group relative flex min-h-36 items-center justify-center overflow-hidden border border-neon-blue/25 bg-dark-blue px-8 py-10 transition-all hover:-translate-y-1 hover:border-neon-blue hover:bg-[#061d3b] hover:shadow-[0_0_24px_rgba(0,163,255,0.18)]"
              aria-label={`Ver produtos ${brand.name}`}
            >
              <div className="relative h-14 w-full max-w-56">
                <Image src={brand.logo} alt={brand.name} fill unoptimized className="object-contain transition-transform duration-300 group-hover:scale-105" sizes="224px" />
              </div>
              <span className="absolute bottom-3 right-3 flex h-8 w-8 translate-y-2 items-center justify-center rounded-full bg-black text-white opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowUpRight size={15} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
