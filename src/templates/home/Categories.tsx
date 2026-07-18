"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { StorefrontCategory } from "@/shared/storefront";

const categoryImages: Record<string, string> = {
  Camisetas: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop",
  Moletons: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
  Perfumes: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop",
  Acessorios: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=800&auto=format&fit=crop",
  Eletronicos: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
};

export default function Categories() {
  const [categories, setCategories] = useState<StorefrontCategory[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((response) => response.json())
      .then((data) => setCategories(Array.isArray(data) ? data : []))
      .catch(() => setCategories([]));
  }, []);

  return (
    <section className="bg-black py-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h3 className="mb-2 font-montserrat text-3xl font-bold uppercase tracking-wider text-white md:text-4xl">
            Nossas <span className="text-neon-blue">Categorias</span>
          </h3>
          <div className="mx-auto h-1 w-24 rounded-full bg-neon-blue" />
        </div>

        <div className="grid auto-rows-[250px] grid-cols-1 gap-4 md:auto-rows-[300px] md:grid-cols-3 md:gap-6">
          {categories.map((category, i) => (
            <Link
              key={category.slug}
              href={`/categoria/${category.slug}`}
              className="group relative overflow-hidden rounded-lg"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative h-full w-full"
              >
                <Image
                  src={categoryImages[category.name] ?? categoryImages.Camisetas}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                <div className="absolute bottom-0 left-0 w-full translate-y-2 p-6 transition-transform duration-500 group-hover:translate-y-0">
                  <h4 className="font-poppins text-2xl font-bold tracking-wide text-white">
                    {category.name}
                  </h4>
                  <p className="mt-2 text-sm uppercase tracking-wider text-neon-blue">
                    {category.productCount} pecas
                  </p>
                  <div className="mt-2 h-0.5 w-0 bg-neon-blue transition-all duration-500 group-hover:w-16" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
