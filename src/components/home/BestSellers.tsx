"use client";

import React, { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const products = [
  { id: 10, name: "Perfume Midnight Code 100ml", price: 349.90, image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=600&auto=format&fit=crop" },
  { id: 11, name: "Jaqueta Corta Vento Reflex", price: 299.90, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=600&auto=format&fit=crop" },
  { id: 12, name: "Boné Snapback Classic M", price: 89.90, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=600&auto=format&fit=crop" },
  { id: 13, name: "Óculos de Sol Aviator Neo", price: 159.90, image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=600&auto=format&fit=crop" },
  { id: 14, name: "Relógio Smart LSZ", price: 899.90, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop" },
  { id: 15, name: "Shoulder Bag Urban", price: 129.90, image: "https://images.unsplash.com/photo-1548863227-3af567fc3b27?q=80&w=600&auto=format&fit=crop" },
];

export default function BestSellers() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "start" });
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => emblaApi && emblaApi.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi && emblaApi.scrollNext(), [emblaApi]);

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

  return (
    <section className="py-20 bg-black overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="font-montserrat font-bold text-3xl md:text-3xl text-white uppercase tracking-wider mb-2">
              Mais Vendidos
            </h3>
            <div className="w-24 h-1 bg-neon-blue rounded-full" />
          </div>
          
          <div className="hidden md:flex gap-2">
            <button
              onClick={scrollPrev}
              disabled={!prevBtnEnabled}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-white hover:border-neon-blue hover:text-neon-blue transition-colors disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={scrollNext}
              disabled={!nextBtnEnabled}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-white hover:border-neon-blue hover:text-neon-blue transition-colors disabled:opacity-50"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="embla" ref={emblaRef}>
          <div className="embla__container flex">
            {products.map((product) => (
              <div key={product.id} className="embla__slide flex-[0_0_80%] sm:flex-[0_0_40%] md:flex-[0_0_30%] lg:flex-[0_0_20%] min-w-0 pr-4">
                <Link href={`/produto/${product.id}`} className="block group">
                  <div className="bg-dark-blue rounded-lg border border-border p-4 h-full flex flex-col hover:border-silver transition-colors">
                    <div className="aspect-square bg-black rounded relative mb-4 overflow-hidden">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover mix-blend-lighten transform transition-transform group-hover:scale-105"
                        sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, (min-width: 640px) 40vw, 80vw"
                      />
                    </div>
                    <h4 className="font-poppins text-sm text-silver group-hover:text-white transition-colors line-clamp-2 mb-2">
                      {product.name}
                    </h4>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-montserrat font-bold text-white">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </span>
                      <button className="text-neon-blue hover:text-white transition-colors">
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
