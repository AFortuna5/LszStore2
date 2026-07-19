"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { StorefrontProduct } from "@/shared/storefront";
import BrandLogo from "@/templates/brand/BrandLogo";

const fallbackImage = "https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&w=1800&q=88";

type HeroSlide = {
  key: string;
  image: string;
  name: string;
  href: string;
};

export default function Hero({ products }: { products: StorefrontProduct[] }) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const slides = useMemo<HeroSlide[]>(() => {
    const seen = new Set<string>();
    const productSlides = products.flatMap((product) =>
      product.gallery.slice(0, 2).flatMap((image, imageIndex) => {
        if (!image || seen.has(image)) return [];
        seen.add(image);
        return [{
          key: `${product.id}-${imageIndex}`,
          image,
          name: product.name,
          href: `/produto/${product.slug}`,
        }];
      })
    );

    return productSlides.length > 0
      ? productSlides.slice(0, 10)
      : [{ key: "fallback", image: fallbackImage, name: "Moda urbana LSZ Store", href: "/produtos" }];
  }, [products]);

  useEffect(() => {
    if (slides.length < 2 || reduceMotion) return;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [reduceMotion, slides.length]);

  const activeIndex = index % slides.length;
  const currentSlide = slides[activeIndex];
  const previous = () => setIndex((current) => (current - 1 + slides.length) % slides.length);
  const next = () => setIndex((current) => (current + 1) % slides.length);

  return (
    <section className="relative min-h-[690px] overflow-hidden bg-[#f4f4f1] pt-28 lg:min-h-[760px]">
      <div className="mx-auto grid min-h-[578px] max-w-[1600px] lg:grid-cols-[44%_56%] lg:min-h-[648px]">
        <div className="relative z-10 flex flex-col justify-center px-5 py-14 sm:px-10 lg:px-14 xl:px-20">
          <h1 className="max-w-2xl uppercase text-black">
            <span className="block font-montserrat text-[clamp(2rem,3vw,3.3rem)] font-light leading-none tracking-[-0.055em] text-neutral-800">
              Seja muito
            </span>
            <span className="mt-1 block font-montserrat text-[clamp(3.5rem,4.7vw,5.4rem)] font-black italic leading-[0.82] tracking-[-0.085em]">
              Bem-vindo
            </span>
            <span className="mt-3 flex flex-wrap items-center gap-x-3 font-montserrat text-[clamp(2rem,3vw,3.2rem)] font-medium leading-none tracking-[-0.06em] text-neutral-800">
              à <BrandLogo className="h-14 w-32 sm:h-16 sm:w-40" priority sizes="(min-width: 640px) 160px, 128px" />
            </span>
          </h1>
          <p className="mt-7 max-w-lg font-poppins text-sm leading-7 text-neutral-600 sm:text-base">
            Trabalhamos com <strong className="block font-bold italic text-black sm:inline">produtos 100% originais</strong>{" "}
            <span className="block sm:inline">e uma <strong className="block font-bold italic text-black sm:inline">seleção feita especialmente para você.</strong></span>
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link href="/produtos" className="inline-flex items-center gap-3 bg-black px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neon-blue hover:text-black sm:px-7">
              Comprar agora <ArrowRight size={17} />
            </Link>
            <Link href="/novidades" className="border-b border-black pb-1 text-xs font-bold uppercase tracking-[0.16em] text-black transition-colors hover:border-neon-blue hover:text-neon-blue">
              Ver novidades
            </Link>
          </div>
        </div>

        <div className="relative min-h-[460px] overflow-hidden bg-[#e9e9e6] lg:min-h-full" role="region" aria-label="Produtos disponíveis na loja" aria-live="polite">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentSlide.key}
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: 0.65 }}
              className="absolute inset-0"
            >
              <Image src={currentSlide.image} alt="" fill loading="eager" className="scale-110 object-cover opacity-15 blur-2xl" sizes="(min-width: 1024px) 56vw, 100vw" />
              <Link href={currentSlide.href} aria-label={`Ver ${currentSlide.name}`} className="absolute inset-0">
                <Image
                  src={currentSlide.image}
                  alt={currentSlide.name}
                  fill
                  loading="eager"
                  className="object-contain p-6 sm:p-10 lg:p-12"
                  sizes="(min-width: 1024px) 56vw, 100vw"
                />
              </Link>
            </motion.div>
          </AnimatePresence>
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#f4f4f1]/60 via-transparent to-transparent lg:from-[#f4f4f1]/35" />

          {slides.length > 1 && (
            <div className="absolute inset-x-0 bottom-5 z-10 flex items-center justify-center gap-3 sm:bottom-8">
              <button type="button" onClick={previous} aria-label="Foto anterior" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow transition-colors hover:bg-neon-blue">
                <ArrowLeft size={16} />
              </button>
              <div className="flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-2 shadow">
                {slides.map((slide, slideIndex) => (
                  <button
                    key={slide.key}
                    type="button"
                    onClick={() => setIndex(slideIndex)}
                    aria-label={`Mostrar foto ${slideIndex + 1}: ${slide.name}`}
                    aria-current={slideIndex === activeIndex}
                    className={`h-1.5 rounded-full transition-all ${slideIndex === activeIndex ? "w-6 bg-neon-blue" : "w-1.5 bg-black/25 hover:bg-black/60"}`}
                  />
                ))}
              </div>
              <button type="button" onClick={next} aria-label="Próxima foto" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow transition-colors hover:bg-neon-blue">
                <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
