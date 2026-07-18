"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, ShieldCheck, ShoppingCart, User, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

async function getSessionUser() {
  const response = await fetch("/api/auth/me", {
    cache: "no-store",
    credentials: "same-origin",
  });
  const payload = response.ok ? await response.json() : null;
  return (payload?.user ?? null) as SessionUser | null;
}

export default function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    let active = true;
    getSessionUser()
      .then((user) => {
        if (active) setSessionUser(user);
      })
      .catch(() => {
        if (active) setSessionUser(null);
      });
    return () => {
      active = false;
    };
  }, [pathname]);

  useEffect(() => {
    const handleAuthUpdate = () => {
      getSessionUser()
        .then(setSessionUser)
        .catch(() => setSessionUser(null));
    };
    window.addEventListener("lsz-auth-updated", handleAuthUpdate);
    return () => window.removeEventListener("lsz-auth-updated", handleAuthUpdate);
  }, []);

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
        isHome
          ? "border-b border-black/10 bg-white/95 text-black shadow-sm backdrop-blur-md"
          : isScrolled
          ? "bg-dark-blue/90 backdrop-blur-md border-b border-border shadow-[0_0_15px_rgba(0,163,255,0.1)]"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="relative flex h-20 items-center justify-between">
          {/* Mobile Menu Toggle */}
          <button
            className={`transition-colors lg:hidden ${isHome ? "text-black hover:text-neon-blue" : "text-white hover:text-neon-blue"}`}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          {isHome ? (
            <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-montserrat text-xl font-black tracking-[-0.08em] text-black lg:static lg:translate-x-0 lg:text-2xl" aria-label="LSZ Store">
              LSZ <span className="text-neon-blue">STORE.</span>
            </Link>
          ) : (
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
          )}

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-5 lg:flex xl:gap-8">
            {menuItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`font-poppins text-sm transition-colors hover:text-neon-blue ${
                  isHome ? "text-neutral-700" : "text-silver"
                }`}
              >
                {item.label}
              </Link>
            ))}
            {sessionUser?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="flex items-center gap-2 rounded border border-neon-blue/60 px-3 py-2 font-poppins text-sm font-bold text-neon-blue transition-colors hover:bg-neon-blue hover:text-black"
              >
                <ShieldCheck size={17} />
                Administração
              </Link>
            )}
          </nav>

          {/* Icons */}
          <div className={`flex items-center gap-4 md:gap-6 ${isHome ? "absolute right-0 lg:static" : ""}`}>
            <Link href="/buscar" className={`transition-colors hover:text-neon-blue ${isHome ? "hidden text-black sm:block" : "text-white"}`} aria-label="Buscar">
              <Search size={20} />
            </Link>
            <Link href="/carrinho" className={`relative transition-colors hover:text-neon-blue ${isHome ? "text-black" : "text-white"}`} aria-label="Carrinho">
              <ShoppingCart size={20} />
              <span className="absolute -top-2 -right-2 bg-neon-blue text-black text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
            <Link href={sessionUser ? "/minha-conta" : "/login"} className={`hidden transition-colors hover:text-neon-blue md:block ${isHome ? "text-black" : "text-white"}`} aria-label={sessionUser ? `Minha conta: ${sessionUser.name}` : "Entrar"}>
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
            className={`border-b lg:hidden ${isHome ? "border-black/10 bg-white" : "border-border bg-dark-blue"}`}
          >
            <nav className="flex flex-col container mx-auto px-4 py-4 gap-4">
              {menuItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`font-poppins text-lg hover:text-neon-blue ${isHome ? "text-black" : "text-white"}`}
                >
                  {item.label}
                </Link>
              ))}
              <div className={`my-2 h-px ${isHome ? "bg-black/10" : "bg-border"}`} />
              <Link href={sessionUser ? "/minha-conta" : "/login"} className={`flex items-center gap-2 hover:text-neon-blue ${isHome ? "text-black" : "text-white"}`}>
                <User size={20} />
                <span className="font-poppins">Minha Conta</span>
              </Link>
              {sessionUser?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 font-bold text-neon-blue hover:text-white"
                >
                  <ShieldCheck size={20} />
                  <span className="font-poppins">Administração</span>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
