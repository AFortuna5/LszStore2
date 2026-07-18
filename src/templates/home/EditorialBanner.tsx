import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const editorialImage = "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1800&q=86";

export default function EditorialBanner() {
  return (
    <section className="bg-white px-4 py-8 sm:px-6 md:py-14 lg:px-10">
      <div className="mx-auto grid max-w-[1500px] overflow-hidden bg-black lg:grid-cols-[58%_42%]">
        <div className="relative min-h-[330px] lg:min-h-[520px]">
          <Image src={editorialImage} alt="Curadoria de moda LSZ Store" fill className="object-cover" sizes="(min-width: 1024px) 58vw, 100vw" />
        </div>
        <div className="flex flex-col justify-center px-7 py-12 text-white sm:px-12 lg:px-16">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em] text-neon-blue">Identidade LSZ</p>
          <h2 className="font-montserrat text-4xl font-black uppercase leading-[0.95] tracking-[-0.06em] sm:text-5xl xl:text-6xl">Sua presença começa no detalhe.</h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/65">Explore a coleção completa e encontre produtos que combinam com o seu ritmo, sua rotina e sua personalidade.</p>
          <Link href="/colecoes" className="mt-9 inline-flex w-fit items-center gap-3 border-b border-white pb-2 text-xs font-bold uppercase tracking-[0.16em] transition-colors hover:border-neon-blue hover:text-neon-blue">
            Explorar coleções <ArrowRight size={16} />
          </Link>
          <div className="relative mt-10 h-24 w-52 -rotate-2 overflow-hidden border border-neon-blue/30 bg-dark-blue shadow-2xl">
            <Image src="/logo-lsz-store.png" alt="LSZ Store" fill unoptimized className="object-cover" sizes="208px" />
          </div>
        </div>
      </div>
    </section>
  );
}
