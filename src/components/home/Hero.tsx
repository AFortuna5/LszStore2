"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image / Overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-black/70 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
      </div>

      {/* Content */}
      <div className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-6 relative"
        >
          {/* Subtle neon glow behind the title */}
          <div className="absolute -inset-4 bg-neon-blue/20 blur-3xl rounded-full" />
          <h2 className="font-montserrat font-black text-6xl md:text-8xl lg:text-9xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-silver drop-shadow-[0_0_15px_rgba(0,163,255,0.3)]">
            LSZ STORE
          </h2>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-poppins text-lg md:text-2xl text-silver mb-10 max-w-2xl"
        >
          Os melhores produtos selecionados para você. Exclusividade, tecnologia e atitude.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/produtos"
            className="group relative px-8 py-4 bg-neon-blue text-black font-bold font-inter rounded hover:bg-white transition-all duration-300 overflow-hidden"
          >
            <span className="relative z-10 uppercase tracking-wider">Comprar Agora</span>
            <div className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out z-0" />
          </Link>
          <Link
            href="/colecoes"
            className="px-8 py-4 bg-transparent border border-silver text-white font-bold font-inter rounded hover:border-neon-blue hover:text-neon-blue hover:shadow-[0_0_15px_rgba(0,163,255,0.3)] transition-all duration-300 uppercase tracking-wider"
          >
            Ver Coleção
          </Link>
        </motion.div>
      </div>
    </section>
  );
}