"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const messages = [
  "Frete para todo Brasil",
  "Produtos 100% Originais",
  "Pagamento Seguro",
  "Parcelamento Facilitado",
];

export default function TopBar() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-8 items-center justify-center overflow-hidden bg-black py-2 text-xs font-semibold uppercase tracking-[0.14em] text-white md:text-sm">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute flex items-center gap-2"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-neon-blue" />
          {messages[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
