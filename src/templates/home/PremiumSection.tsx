"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function PremiumSection() {
  return (
    <section className="relative py-24 bg-dark-blue overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-neon-blue/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-silver/5 rounded-full blur-[100px]" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="md:w-1/3"
          >
            <h2 className="font-montserrat font-black text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-silver to-white uppercase tracking-tighter mb-4">
              Produtos Exclusivos
            </h2>
            <p className="font-poppins text-silver mb-8 leading-relaxed max-w-sm">
              Nossa curadoria premium traz o que há de mais sofisticado e inovador no mercado. Peças limitadas para quem exige o melhor.
            </p>
            <Link href="/exclusivos" className="inline-flex items-center gap-2 font-inter font-bold text-neon-blue uppercase tracking-widest hover:text-white hover:gap-4 transition-all">
              Ver Catálogo Premium <ArrowRight size={20} />
            </Link>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6"
          >
            {[
              { id: 101, name: "Relógio Chrono V2 Limited", price: 1290.00, img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=800&auto=format&fit=crop" },
              { id: 102, name: "Sneaker Off-White Supreme X", price: 2500.00, img: "https://images.unsplash.com/photo-1600181516264-3ea80de4dc52?q=80&w=800&auto=format&fit=crop", offset: true }
            ].map((prod) => (
              <div key={prod.id} className={`group relative rounded-xl overflow-hidden aspect-[4/5] ${prod.offset ? 'sm:mt-12' : ''}`}>
                <Image 
                  src={prod.img} 
                  alt={prod.name} 
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110 filter grayscale group-hover:grayscale-0"
                  sizes="(min-width: 768px) 33vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute inset-0 border border-silver/20 group-hover:border-neon-blue/50 rounded-xl transition-colors duration-500 m-4 pointer-events-none" />
                
                <div className="absolute bottom-0 left-0 p-8">
                  <span className="bg-white text-black text-xs font-bold px-2 py-1 uppercase tracking-widest mb-3 inline-block">Edição Limitada</span>
                  <h4 className="font-montserrat font-bold text-2xl text-white mb-1 group-hover:text-neon-blue transition-colors">
                    {prod.name}
                  </h4>
                  <span className="font-poppins text-silver">
                    R$ {prod.price.toFixed(2).replace(".", ",")}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
