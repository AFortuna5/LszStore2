import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { formatCurrency, getProductPrice, type StorefrontProduct } from "@/shared/storefront";

export default function ProductCard({ product }: { product: StorefrontProduct }) {
  const price = getProductPrice(product);

  return (
    <article className="group flex min-w-0 flex-col">
      <Link
        href={`/produto/${product.slug}`}
        className="relative mb-4 aspect-[4/5] overflow-hidden bg-[#07162d]"
      >
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          sizes="(min-width: 1280px) 22vw, (min-width: 768px) 33vw, 50vw"
        />
        {product.discount && (
          <span className="absolute left-3 top-3 bg-black px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {product.discount}
          </span>
        )}
        {product.isNew && (
          <span className="absolute right-3 top-3 bg-neon-blue px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-black">
            Novo
          </span>
        )}
        <span className="absolute bottom-3 left-3 right-3 flex translate-y-3 items-center justify-center gap-2 bg-neon-blue px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-black opacity-0 shadow-lg transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Ver produto <ArrowUpRight size={15} />
        </span>
      </Link>

      <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-silver">
        {product.brand}
      </p>
      <Link href={`/produto/${product.slug}`} className="line-clamp-2 min-h-11 font-poppins text-sm font-medium text-white hover:text-neon-blue hover:underline">
        {product.name}
      </Link>
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2">
        <span className="font-montserrat text-base font-bold text-white">{formatCurrency(price)}</span>
        {product.promoPrice && product.promoPrice < product.price && (
          <span className="text-xs text-silver line-through">{formatCurrency(product.price)}</span>
        )}
      </div>
      <p className="mt-1 text-xs text-silver">ou 3x de {formatCurrency(price / 3)} sem juros</p>
    </article>
  );
}
