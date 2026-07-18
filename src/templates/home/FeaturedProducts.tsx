"use client";

import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { StorefrontProduct } from "@/shared/storefront";

export default function FeaturedProducts() {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);

  useEffect(() => {
    fetch("/api/products?featured=true&limit=4")
      .then((response) => response.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <section className="bg-dark-blue py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 flex items-end justify-between">
          <div>
            <h3 className="mb-2 font-montserrat text-3xl font-bold uppercase tracking-wider text-white md:text-4xl">
              Lançamentos
            </h3>
            <div className="h-1 w-24 rounded-full bg-neon-blue" />
          </div>
          <Link
            href="/produtos"
            className="hidden font-inter text-sm font-semibold uppercase tracking-wider text-silver transition-colors hover:text-neon-blue md:inline-flex"
          >
            Ver Todos →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group overflow-hidden rounded-lg border border-border bg-black transition-colors duration-300 hover:border-neon-blue/50"
            >
              <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-black p-4">
                {product.discount && (
                  <span className="absolute left-4 top-4 z-10 rounded bg-neon-blue px-2 py-1 text-xs font-bold uppercase tracking-wider text-black">
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <button className="rounded-full bg-neon-blue p-3 text-black transition-all hover:scale-110 hover:bg-white">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>

              <div className="flex h-full flex-col p-5">
                <span className="mb-1 text-xs uppercase tracking-wider text-silver">
                  {product.brand}
                </span>
                <Link
                  href={`/produto/${product.slug}`}
                  className="mb-2 line-clamp-1 font-poppins text-lg font-semibold text-white transition-colors hover:text-neon-blue"
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
                <div className="mt-auto flex items-end justify-between">
                  <div className="flex flex-col">
                    {product.promoPrice ? (
                      <>
                        <span className="text-sm text-silver line-through">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="font-montserrat text-xl font-bold text-white">
                          R$ {product.promoPrice.toFixed(2).replace(".", ",")}
                        </span>
                      </>
                    ) : (
                      <span className="mt-5 font-montserrat text-xl font-bold text-white">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Link
            href="/produtos"
            className="inline-flex w-full justify-center rounded border border-silver px-6 py-3 font-inter text-sm font-semibold uppercase tracking-wider text-silver transition-colors hover:border-neon-blue hover:text-neon-blue"
          >
            Ver Todos
          </Link>
        </div>
      </div>
    </section>
  );
}
