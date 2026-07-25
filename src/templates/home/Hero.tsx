"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

const slides = [
  {
    id: "welcome",
    alt: "Sejam bem-vindos à LSZ Store",
  },
  {
    id: "coupon",
    alt: "Cupom de 10% de desconto na primeira compra: BEMVINDO10",
  },
] as const;

export default function Hero() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.scrollTo(index),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const updateSelectedIndex = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    updateSelectedIndex();
    emblaApi.on("select", updateSelectedIndex);
    emblaApi.on("reInit", updateSelectedIndex);

    return () => {
      emblaApi.off("select", updateSelectedIndex);
      emblaApi.off("reInit", updateSelectedIndex);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const interval = window.setInterval(() => emblaApi.scrollNext(), 6500);
    return () => window.clearInterval(interval);
  }, [emblaApi]);

  return (
    <section
      className="relative w-full overflow-hidden bg-[#020716]"
      aria-label="Destaques da LSZ Store"
      aria-roledescription="carrossel"
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex touch-pan-y">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="relative min-w-0 flex-[0_0_100%]"
              role="group"
              aria-roledescription="slide"
              aria-label={`${slide.id === "welcome" ? 1 : 2} de ${slides.length}`}
            >
              <div className="relative aspect-[971/1619] w-full md:aspect-[2168/725]">
                {slide.id === "welcome" ? (
                  <>
                    <Image
                      src="/landing/lsz-hero.png"
                      alt={slide.alt}
                      fill
                      priority
                      className="hidden object-cover md:block"
                      sizes="100vw"
                    />
                    <Image
                      src="/landing/lsz-hero-mobile.png"
                      alt={slide.alt}
                      fill
                      priority
                      className="object-cover md:hidden"
                      sizes="100vw"
                    />
                  </>
                ) : (
                  <>
                    <Image
                      src="/landing/cupom-boas-vindas.png"
                      alt=""
                      fill
                      className="scale-110 object-cover opacity-45 blur-2xl"
                      sizes="100vw"
                      aria-hidden="true"
                    />
                    <div className="absolute inset-0 bg-[#01030c]/55" />
                    <Image
                      src="/landing/cupom-boas-vindas.png"
                      alt={slide.alt}
                      fill
                      className="object-contain"
                      sizes="(min-width: 768px) 34vw, 77vw"
                    />
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:border-neon-blue hover:bg-neon-blue hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-blue md:left-6 md:size-12"
        aria-label="Ver destaque anterior"
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={scrollNext}
        className="absolute right-2 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-black/55 text-white shadow-lg backdrop-blur-sm transition hover:border-neon-blue hover:bg-neon-blue hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-blue md:right-6 md:size-12"
        aria-label="Ver próximo destaque"
      >
        <ChevronRight aria-hidden="true" />
      </button>

      <div
        className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 gap-2 rounded-full bg-black/55 px-3 py-2 backdrop-blur-sm md:bottom-5"
        role="tablist"
        aria-label="Selecionar destaque"
      >
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => scrollTo(index)}
            className={`h-2 rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neon-blue ${
              selectedIndex === index
                ? "w-7 bg-neon-blue"
                : "w-2 bg-white/65 hover:bg-white"
            }`}
            aria-label={`Ir para o destaque ${index + 1}`}
            aria-selected={selectedIndex === index}
            role="tab"
          />
        ))}
      </div>
    </section>
  );
}
