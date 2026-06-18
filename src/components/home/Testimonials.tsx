"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import Image from "next/image";

const testimonials = [
  {
    id: 1,
    name: "Gabriel Silva",
    photo: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    text: "Atendimento impecável e produtos de extrema qualidade. A camiseta chegou em 2 dias e superou minhas expectativas.",
  },
  {
    id: 2,
    name: "Marina Costa",
    photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
    rating: 5,
    text: "Comprei o perfume Midnight e fixação é surreal. A embalagem premium já mostra a essência da marca.",
  },
  {
    id: 3,
    name: "Rafael Moraes",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
    rating: 4,
    text: "O tênis é muito confortável, o design streetwear realmente faz diferença no dia a dia. Já planejo a próxima compra.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-black relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16">
          <h3 className="font-montserrat font-bold text-3xl md:text-4xl text-white uppercase tracking-wider mb-2">
            O que dizem <br/> <span className="text-neon-blue">nossos clientes</span>
          </h3>
          <div className="w-24 h-1 bg-neon-blue mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test, i) => (
            <motion.div
              key={test.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.2 }}
              className="bg-dark-blue p-8 rounded-xl border border-border hover:border-silver transition-colors flex flex-col relative"
            >
              <div className="absolute top-8 right-8 text-neon-blue/20">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.017 18L14.017 10.609C14.017 4.905 17.748 1.039 23 0L23.995 2.151C21.563 3.068 20 5.789 20 8H24V18H14.017ZM0 18V10.609C0 4.905 3.748 1.038 9 0L9.996 2.151C7.563 3.068 6 5.789 6 8H9.983L9.983 18L0 18Z" />
                </svg>
              </div>
              
              <div className="flex items-center gap-1 mb-6">
                {[...Array(5)].map((_, index) => (
                  <Star
                    key={index}
                    size={16}
                    className={index < test.rating ? "fill-neon-blue text-neon-blue" : "text-border"}
                  />
                ))}
              </div>

              <p className="font-poppins text-silver mb-8 italic flex-grow">
                &quot;{test.text}&quot;
              </p>

              <div className="flex items-center gap-4">
                <Image
                  src={test.photo}
                  alt={test.name}
                  width={48}
                  height={48}
                  className="h-12 w-12 rounded-full object-cover grayscale"
                />
                <div>
                  <h5 className="font-inter font-bold text-white tracking-wide">{test.name}</h5>
                  <span className="text-xs text-silver">Cliente Verificado</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
