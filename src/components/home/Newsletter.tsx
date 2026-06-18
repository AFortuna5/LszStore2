"use client";

import { motion } from "framer-motion";
import { Mail } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="py-24 bg-black border-b border-t border-border relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-neon-blue/5 rounded-[100%] blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <Mail size={48} className="text-neon-blue mx-auto mb-6 opacity-80" />
          <h2 className="font-montserrat font-black text-3xl md:text-5xl text-white uppercase tracking-tighter mb-4">
            Receba Nossos <span className="text-neon-blue text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-white drop-shadow-[0_0_8px_rgba(0,163,255,0.5)]">Lançamentos</span>
          </h2>
          <p className="font-poppins text-silver mb-10 text-lg">
            Cadastre-se para receber acesso antecipado a coleções exclusivas e promoções secretas diretas no seu email.
          </p>
          
          <form className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input 
              type="email" 
              placeholder="Seu melhor e-mail" 
              className="flex-grow bg-dark-blue border border-border focus:border-neon-blue rounded px-6 py-4 text-white font-inter outline-none transition-colors"
              required
            />
            <button 
              type="submit"
              className="bg-neon-blue text-black font-bold font-inter px-8 py-4 rounded hover:bg-white transition-all uppercase tracking-wider whitespace-nowrap"
            >
              Cadastrar
            </button>
          </form>
        </motion.div>
      </div>
    </section>
  );
}