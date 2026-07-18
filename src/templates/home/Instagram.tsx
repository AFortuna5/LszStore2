"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const igPosts = [
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1523398002811-999aa8d9512e?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618354691456-cc556c5443ca?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1618331835717-801e976710b2?q=80&w=400&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1550246140-5119ae4790b8?q=80&w=400&auto=format&fit=crop"
];

export default function InstagramSection() {
  return (
    <section className="py-20 bg-dark-blue">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-12 flex flex-col items-center">
          <InstagramIcon size={40} className="text-neon-blue mb-4" />
          <h3 className="font-montserrat font-bold text-3xl text-white uppercase tracking-wider mb-2">
            Siga no Instagram
          </h3>
          <Link 
            href="https://www.instagram.com/lsz.storee/" 
            target="_blank" 
            className="text-silver hover:text-white transition-colors font-inter text-lg block mb-4"
          >
            @lsz.storee
          </Link>
          <div className="w-24 h-1 bg-neon-blue rounded-full" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {igPosts.map((post, i) => (
            <motion.a
              href="https://www.instagram.com/lsz.storee/"
              target="_blank"
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative aspect-square overflow-hidden group block bg-black"
            >
              <Image 
                src={post} 
                alt="Instagram post" 
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110" 
                sizes="(min-width: 1024px) 16vw, (min-width: 768px) 33vw, 50vw"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                <InstagramIcon size={32} className="text-white" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
