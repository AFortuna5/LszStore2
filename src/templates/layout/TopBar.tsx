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
    <div className="bg-neon-blue text-black font-semibold text-xs md:text-sm py-2 overflow-hidden flex justify-center items-center h-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute"
        >
          {messages[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}