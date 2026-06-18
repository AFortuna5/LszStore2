"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

const categories = [
  { name: "Camisetas", href: "/categoria/camisetas", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800&auto=format&fit=crop" },
  { name: "Moletons", href: "/categoria/moletons", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop", span: "col-span-1 md:col-span-2" },
  { name: "Perfumes", href: "/categoria/perfumes", image: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=800&auto=format&fit=crop" },
  { name: "Acessórios", href: "/categoria/acessorios", image: "https://images.unsplash.com/photo-1622434641406-a158123450f9?q=80&w=800&auto=format&fit=crop" },
  { name: "Eletrônicos", href: "/categoria/eletronicos", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop", span: "col-span-1 md:col-span-2" },
];

export default function Categories() {
  return (
    <section className="py-20 bg-black">
      <div className="container mx-auto px-4 md:px-6">
        <div className="mb-12 text-center">
          <h3 className="font-montserrat font-bold text-3xl md:text-4xl text-white uppercase tracking-wider mb-2">
            Nossas <span className="text-neon-blue">Categorias</span>
          </h3>
          <div className="w-24 h-1 bg-neon-blue mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 auto-rows-[250px] md:auto-rows-[300px]">
          {categories.map((cat, i) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`relative overflow-hidden group rounded-lg ${cat.span || ""}`}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="w-full h-full relative"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
                
                {/* Text Content */}
                <div className="absolute bottom-0 left-0 p-6 w-full transform transition-transform duration-500 translate-y-2 group-hover:translate-y-0">
                  <h4 className="font-poppins font-bold text-2xl text-white tracking-wide">
                    {cat.name}
                  </h4>
                  <div className="h-0.5 w-0 bg-neon-blue mt-2 transition-all duration-500 group-hover:w-16" />
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
