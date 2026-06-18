"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const updateCartCount = () => {
      const stored = window.localStorage.getItem("lsz-cart");
      const items = stored ? JSON.parse(stored) : [];
      setCartCount(
        items.reduce(
          (sum: number, item: { quantity?: number }) => sum + (item.quantity ?? 0),
          0
        )
      );
    };

    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("lsz-cart-updated", updateCartCount);

    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("lsz-cart-updated", updateCartCount);
    };
  }, []);

  const menuItems = [
    { label: "Início", href: "/" },
    { label: "Produtos", href: "/produtos" },
    { label: "Coleções", href: "/colecoes" },
    { label: "Novidades", href: "/novidades" },
    { label: "Promoções", href: "/promocoes" },
    { label: "Contato", href: "/contato" },
  ];

  return (
    <header
      className={`fixed top-8 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-dark-blue/90 backdrop-blur-md border-b border-border shadow-[0_0_15px_rgba(0,163,255,0.1)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden text-white hover:text-neon-blue transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <Link href="/" className="relative block h-14 w-36 flex-shrink-0 md:h-16 md:w-44" aria-label="LSZ Store">
            <Image
              src="/logo-lsz-store.png"
              alt="LSZ Store"
              fill
              unoptimized
              priority
              className="object-contain"
              sizes="(min-width: 768px) 176px, 144px"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-poppins text-sm text-silver hover:text-neon-blue hover:drop-shadow-[0_0_8px_rgba(0,163,255,0.8)] transition-all"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Icons */}
          <div className="flex items-center gap-4 md:gap-6">
            <button className="text-white hover:text-neon-blue transition-colors" aria-label="Buscar">
              <Search size={20} />
            </button>
            <Link href="/carrinho" className="text-white hover:text-neon-blue transition-colors relative" aria-label="Carrinho">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-neon-blue text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
            <Link href="/login" className="hidden md:block text-white hover:text-neon-blue transition-colors" aria-label="Minha conta">
              <User size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-dark-blue border-b border-border"
          >
            <nav className="flex flex-col container mx-auto px-4 py-4 gap-4">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="font-poppins text-lg text-white hover:text-neon-blue"
                >
                  {item.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2" />
              <Link href="/minha-conta" className="flex items-center gap-2 text-white hover:text-neon-blue">
                <User size={20} />
                <span className="font-poppins">Minha Conta</span>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
