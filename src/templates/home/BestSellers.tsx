"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import type { StorefrontProduct } from "@/shared/storefront";

export default function BestSellers() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);
  const [products, setProducts] = useState<StorefrontProduct[]>([]);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    const frameId = requestAnimationFrame(onSelect);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      cancelAnimationFrame(frameId);
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  useEffect(() => {
    fetch("/api/products?limit=8")
      .then((response) => response.json())
      .then((data) => setProducts(Array.isArray(data) ? data : []))
      .catch(() => setProducts([]));
  }, []);

  return (
    <section className="relative overflow-hidden bg-black py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-10 flex items-center justify-between">
          <div>
            <h3 className="mb-2 font-montserrat text-3xl font-bold uppercase tracking-wider text-white md:text-3xl">
              Mais Vendidos
            </h3>
            <div className="h-1 w-24 rounded-full bg-neon-blue" />
          </div>

          <div className="hidden gap-2 md:flex">
            <button
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-white transition-colors hover:border-neon-blue hover:text-neon-blue disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-white transition-colors hover:border-neon-blue hover:text-neon-blue disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex">
            {products.map((product) => (
              <div
                key={product.id}
                className="embla__slide min-w-0 flex-[0_0_80%] pr-4 sm:flex-[0_0_40%] md:flex-[0_0_30%] lg:flex-[0_0_20%]"
              >
                <Link href={`/produto/${product.slug}`} className="group block">
                  <div className="flex h-full flex-col rounded-lg border border-border bg-dark-blue p-4 transition-colors hover:border-silver">
                    <div className="relative mb-4 aspect-square overflow-hidden rounded bg-black">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, (min-width: 640px) 40vw, 80vw"
                      />
                    </div>
                    <h4 className="mb-2 line-clamp-2 font-poppins text-sm text-silver transition-colors group-hover:text-white">
                      {product.name}
                    </h4>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-montserrat font-bold text-white">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </span>
                      <button className="text-neon-blue transition-colors hover:text-white">
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
