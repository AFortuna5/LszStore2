import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";

import AddToCartButton from "@/components/products/AddToCartButton";
import { formatCurrency, StoreProduct } from "@/lib/store-data";

export default function ProductCard({ product }: { product: StoreProduct }) {
  return (
    <article className="group overflow-hidden rounded-lg border border-border bg-black transition-colors hover:border-neon-blue/60">
      <Link
        href={`/produto/${product.slug}`}
        className="relative block aspect-square overflow-hidden bg-dark-blue"
      >
        {product.discount && (
          <span className="absolute left-4 top-4 z-10 rounded bg-neon-blue px-2 py-1 text-xs font-bold uppercase text-black">
            {product.discount}
          </span>
        )}
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
        />
      </Link>
      <div className="flex min-h-56 flex-col p-5">
        <span className="mb-1 text-xs uppercase tracking-wide text-silver">
          {product.brand}
        </span>
        <Link
          href={`/produto/${product.slug}`}
          className="mb-3 font-poppins text-lg font-semibold text-white transition-colors hover:text-neon-blue"
        >
          {product.name}
        </Link>
        <div className="mb-4 flex items-center gap-1">
          {[...Array(5)].map((_, index) => (
            <Star
              key={index}
              size={14}
              className={
                index < Math.floor(product.rating)
                  ? "fill-neon-blue text-neon-blue"
                  : "text-border"
              }
            />
          ))}
          <span className="ml-1 text-xs text-silver">({product.rating})</span>
        </div>
        <div className="mt-auto flex items-end justify-between gap-4">
          <div>
            {product.promoPrice && (
              <p className="text-sm text-silver line-through">
                {formatCurrency(product.price)}
              </p>
            )}
            <p className="font-montserrat text-xl font-bold text-white">
              {formatCurrency(product.promoPrice ?? product.price)}
            </p>
          </div>
          <AddToCartButton product={product} className="px-3 py-3" />
        </div>
      </div>
    </article>
  );
}
