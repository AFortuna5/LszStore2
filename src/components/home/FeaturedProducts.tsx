"use client";

import { motion } from "framer-motion";
import { Star, ShoppingCart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const products = [
  {
    id: 1,
    name: "Camiseta High Tech Street",
    brand: "LSZ Exclusive",
    rating: 5,
    price: 189.90,
    promoPrice: 149.90,
    discount: "21% OFF",
    image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Tênis Urban Walker Pro",
    brand: "Importado",
    rating: 4.8,
    price: 499.90,
    promoPrice: 399.90,
    discount: "20% OFF",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Moletom Dark Glow",
    brand: "LSZ Exclusive",
    rating: 5,
    price: 289.90,
    promoPrice: null,
    discount: null,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Headphone Studio Black",
    brand: "Tech Sound",
    rating: 4.9,
    price: 699.90,
    promoPrice: 549.90,
    discount: "21% OFF",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop",
  },
];

export default function FeaturedProducts() {
  return (
    <section className="py-20 bg-dark-blue">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h3 className="font-montserrat font-bold text-3xl md:text-4xl text-white uppercase tracking-wider mb-2">
              Lançamentos
            </h3>
            <div className="w-24 h-1 bg-neon-blue rounded-full" />
          </div>
          <Link href="/produtos" className="hidden md:inline-flex text-silver hover:text-neon-blue font-inter text-sm transition-colors uppercase tracking-wider font-semibold">
            Ver Todos →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-black border border-border rounded-lg overflow-hidden group hover:border-neon-blue/50 transition-colors duration-300"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden bg-black flex items-center justify-center p-4">
                {product.discount && (
                  <span className="absolute top-4 left-4 bg-neon-blue text-black font-bold text-xs px-2 py-1 rounded z-10 uppercase tracking-wider">
                    {product.discount}
                  </span>
                )}
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transform transition-transform duration-500 group-hover:scale-105"
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                
                {/* Quick Add Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <button className="bg-neon-blue text-black p-3 rounded-full hover:bg-white hover:scale-110 transition-all shadow-[0_0_15px_rgba(0,163,255,0.5)]">
                    <ShoppingCart size={20} />
                  </button>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 flex flex-col h-full">
                <span className="text-silver text-xs font-inter uppercase tracking-wider mb-1">
                  {product.brand}
                </span>
                <Link href={`/produto/${product.id}`} className="font-poppins font-semibold text-lg text-white mb-2 hover:text-neon-blue transition-colors line-clamp-1">
                  {product.name}
                </Link>
                
                {/* Rating */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, index) => (
                    <Star
                      key={index}
                      size={14}
                      className={index < Math.floor(product.rating) ? "fill-neon-blue text-neon-blue" : "text-border"}
                    />
                  ))}
                  <span className="text-silver text-xs ml-1">({product.rating})</span>
                </div>

                {/* Pricing & CTA */}
                <div className="mt-auto flex items-end justify-between">
                  <div className="flex flex-col">
                    {product.promoPrice ? (
                      <>
                        <span className="text-silver text-sm line-through">
                          R$ {product.price.toFixed(2).replace(".", ",")}
                        </span>
                        <span className="font-montserrat font-bold text-xl text-white">
                          R$ {product.promoPrice.toFixed(2).replace(".", ",")}
                        </span>
                      </>
                    ) : (
                      <span className="font-montserrat font-bold text-xl text-white mt-5">
                        R$ {product.price.toFixed(2).replace(".", ",")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-8 text-center md:hidden">
          <Link href="/produtos" className="inline-flex text-silver hover:text-neon-blue font-inter text-sm transition-colors uppercase tracking-wider font-semibold border border-silver px-6 py-3 rounded hover:border-neon-blue w-full justify-center">
            Ver Todos
          </Link>
        </div>
      </div>
    </section>
  );
}
