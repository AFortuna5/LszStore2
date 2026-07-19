import Link from "next/link";
import Image from "next/image";
import { MessagesSquare, Phone, MapPin, Mail } from "lucide-react";

import { storeContact } from "@/shared/store-contact";

const InstagramIcon = ({ size = 24, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function Footer() {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM_URL ?? "https://instagram.com/lsz.storee";
  return (
    <footer className="bg-black pt-20 pb-10 border-t border-border">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Col */}
          <div>
            <Link href="/" className="relative mb-6 block h-20 w-52" aria-label="LSZ Store">
              <Image
                src="/logo-lsz-store-transparent.png"
                alt="LSZ Store"
                fill
                unoptimized
                className="object-contain object-left"
                sizes="208px"
              />
            </Link>
            <p className="font-inter text-silver text-sm mb-6 leading-relaxed">
              Exclusividade, sofisticação e estilo. Os melhores produtos selecionados para você, com foco em qualidade premium e experiência de compra impecável.
            </p>
            <div className="flex gap-4">
              <a href={instagram} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-dark-blue flex items-center justify-center text-silver hover:text-white hover:bg-neon-blue transition-all">
                <InstagramIcon size={18} />
              </a>
              <a href={`https://wa.me/${storeContact.whatsapp}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-dark-blue flex items-center justify-center text-silver hover:text-white hover:bg-neon-blue transition-all">
                <MessagesSquare size={18} /> {/* Represents TikTok / Social */}
              </a>
            </div>
          </div>

          {/* Links Rápidos */}
          <div>
            <h4 className="font-poppins font-bold text-white uppercase tracking-wider mb-6">Links Rápidos</h4>
            <ul className="flex flex-col gap-3 font-inter text-sm text-silver">
              <li><Link href="/produtos" className="hover:text-neon-blue transition-colors">Todos os Produtos</Link></li>
              <li><Link href="/lancamentos" className="hover:text-neon-blue transition-colors">Lançamentos</Link></li>
              <li><Link href="/exclusivos" className="hover:text-neon-blue transition-colors">Linha Premium</Link></li>
              <li><Link href="/sobre" className="hover:text-neon-blue transition-colors">Sobre Nós</Link></li>
              <li><Link href="/contato" className="hover:text-neon-blue transition-colors">Fale Conosco</Link></li>
            </ul>
          </div>

          {/* Ajuda e Suporte */}
          <div>
            <h4 className="font-poppins font-bold text-white uppercase tracking-wider mb-6">Suporte</h4>
            <ul className="flex flex-col gap-3 font-inter text-sm text-silver">
              <li><Link href="/rastreio" className="hover:text-neon-blue transition-colors">Rastrear Pedido</Link></li>
              <li><Link href="/trocas" className="hover:text-neon-blue transition-colors">Trocas e Devoluções</Link></li>
              <li><Link href="/faq" className="hover:text-neon-blue transition-colors">Dúvidas Frequentes (FAQ)</Link></li>
              <li><Link href="/termos" className="hover:text-neon-blue transition-colors">Termos de Serviço</Link></li>
              <li><Link href="/privacidade" className="hover:text-neon-blue transition-colors">Política de Privacidade</Link></li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="font-poppins font-bold text-white uppercase tracking-wider mb-6">Contato</h4>
            <ul className="flex flex-col gap-4 font-inter text-sm text-silver">
              <li className="flex items-start gap-3">
                <Phone size={18} className="text-neon-blue shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white mb-1">WhatsApp</span>
                  <a href={`https://wa.me/${storeContact.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-neon-blue transition-colors">{storeContact.phone}</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="text-neon-blue shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white mb-1">E-mail</span>
                  <a href={`mailto:${storeContact.email}`} className="hover:text-neon-blue transition-colors">{storeContact.email}</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-neon-blue shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white mb-1">Localização</span>
                  <span>{storeContact.location}</span>
                </div>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-inter text-xs text-silver text-center md:text-left">
            &copy; {new Date().getFullYear()} LSZ Store. Todos os direitos reservados.
          </p>
          <p className="text-xs font-bold uppercase tracking-wider text-silver">Pix · Cartao · Boleto via Stripe</p>
        </div>
      </div>
    </footer>
  );
}
