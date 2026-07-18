import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const heroImage = "https://images.unsplash.com/photo-1550246140-5119ae4790b8?auto=format&fit=crop&w=1800&q=88";

export default function Hero() {
  return (
    <section className="relative min-h-[690px] overflow-hidden bg-[#f4f4f1] pt-28 lg:min-h-[760px]">
      <div className="mx-auto grid min-h-[578px] max-w-[1600px] lg:grid-cols-[44%_56%] lg:min-h-[648px]">
        <div className="relative z-10 flex flex-col justify-center px-5 py-14 sm:px-10 lg:px-14 xl:px-20">
          <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[0.24em] text-neutral-600">
            <span className="h-px w-10 bg-neon-blue" /> Nova seleção LSZ
          </p>
          <h1 className="max-w-2xl font-montserrat text-[clamp(3.3rem,7vw,7.7rem)] font-black uppercase leading-[0.82] tracking-[-0.085em] text-black">
            Vista sua
            <span className="block text-neon-blue">atitude.</span>
          </h1>
          <p className="mt-7 max-w-md font-poppins text-sm leading-7 text-neutral-600 sm:text-base">
            Peças e produtos escolhidos para quem transforma estilo em identidade. Novidades, exclusividade e entrega para todo o Brasil.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-5">
            <Link href="/produtos" className="inline-flex items-center gap-3 bg-black px-6 py-4 text-xs font-bold uppercase tracking-[0.16em] text-white transition-colors hover:bg-neon-blue hover:text-black sm:px-7">
              Comprar agora <ArrowRight size={17} />
            </Link>
            <Link href="/novidades" className="border-b border-black pb-1 text-xs font-bold uppercase tracking-[0.16em] text-black transition-colors hover:border-neon-blue hover:text-neon-blue">
              Ver novidades
            </Link>
          </div>
        </div>

        <div className="relative min-h-[460px] overflow-hidden lg:min-h-full">
          <Image
            src={heroImage}
            alt="Moda urbana LSZ Store"
            fill
            priority
            className="object-cover object-center"
            sizes="(min-width: 1024px) 56vw, 100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#f4f4f1] via-transparent to-transparent opacity-20 lg:opacity-70" />
          <div className="absolute bottom-6 right-6 bg-white/95 px-5 py-4 text-black shadow-xl backdrop-blur sm:bottom-10 sm:right-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">LSZ Selection</p>
            <p className="mt-1 font-montserrat text-lg font-black uppercase">Estilo sem padrão</p>
          </div>
        </div>
      </div>
    </section>
  );
}
