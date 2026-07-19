import Image from "next/image";
import Link from "next/link";

const products = [
  { src: "/products/hero/armani-jacket.jpeg", alt: "Jaqueta Armani Exchange", className: "bottom-[-11%] left-[-7%] h-[54%] w-[34%] -rotate-[7deg] sm:left-[-2%]" },
  { src: "/products/hero/tommy-hoodie.jpeg", alt: "Moletom Tommy Hilfiger", className: "bottom-[-15%] left-[20%] h-[61%] w-[38%] rotate-[3deg]" },
  { src: "/products/hero/armani-hoodie.jpeg", alt: "Moletom Armani Exchange", className: "bottom-[-15%] right-[17%] h-[65%] w-[39%] -rotate-[3deg]" },
  { src: "/products/hero/armani-cap.jpeg", alt: "Boné Armani Exchange", className: "bottom-[6%] right-[-6%] h-[35%] w-[33%] rotate-[8deg] sm:right-[1%]" },
  { src: "/products/hero/tommy-cap.jpeg", alt: "Boné Tommy Hilfiger", className: "bottom-[17%] right-[15%] h-[23%] w-[24%] -rotate-[12deg]" },
];

export default function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#03070e] px-4 pb-8 pt-28 text-white sm:px-8 lg:min-h-[760px] lg:px-12 lg:pb-12 lg:pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-[8.7rem] h-1 bg-neon-blue shadow-[0_0_24px_6px_rgba(0,163,255,0.65)]" />
      <div className="pointer-events-none absolute inset-0 opacity-75 [background-image:radial-gradient(circle_at_50%_37%,rgba(0,163,255,0.55),transparent_28rem),radial-gradient(circle_at_19%_85%,rgba(0,74,177,0.48),transparent_25rem),linear-gradient(120deg,transparent_20%,rgba(0,163,255,0.16),transparent_70%)]" />
      <div className="pointer-events-none absolute left-[-12rem] top-[10rem] h-[38rem] w-[38rem] rounded-full border border-neon-blue/25" />
      <div className="pointer-events-none absolute right-[-15rem] top-[13rem] h-[42rem] w-[42rem] rounded-full border border-white/10" />
      <div className="pointer-events-none absolute inset-x-0 top-[10rem] h-[48rem] opacity-30 [background-image:linear-gradient(115deg,transparent_0%,rgba(255,255,255,0.35)_0.1%,transparent_0.45%,transparent_100%)]" />

      <div className="relative mx-auto flex max-w-[1300px] flex-col items-center">
        <div className="relative mt-4 w-full max-w-5xl pb-8 text-center sm:mt-8 lg:pb-12">
          <p className="relative z-20 mx-auto inline-flex rounded-md border border-white/30 bg-neon-blue px-4 py-2 text-[10px] font-black uppercase tracking-[0.08em] text-black shadow-[0_0_30px_rgba(0,163,255,0.7)] sm:text-sm">
            Trabalhamos apenas com produtos originais
          </p>
          <div className="relative mx-auto mt-5 max-w-[860px] border border-white/35 px-3 pb-10 pt-5 sm:mt-7 sm:px-6 sm:pb-16 sm:pt-8">
            <span className="pointer-events-none absolute -left-1 -top-1 h-5 w-5 border-l-2 border-t-2 border-neon-blue" />
            <span className="pointer-events-none absolute -bottom-1 -right-1 h-5 w-5 border-b-2 border-r-2 border-neon-blue" />
            <h1 className="text-[clamp(4.6rem,14vw,11.5rem)] font-black uppercase leading-[0.62] tracking-[-0.07em] text-neon-blue [text-shadow:0_0_32px_rgba(0,163,255,0.55)]" style={{ fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" }}>
              Sejam
            </h1>
            <div className="relative mt-3">
              <p className="text-[clamp(4.4rem,14vw,11.5rem)] font-black uppercase leading-[0.64] tracking-[-0.075em] text-white" style={{ fontFamily: "Impact, Haettenschweiler, 'Arial Narrow Bold', sans-serif" }}>
                Vindos
              </p>
              <p className="pointer-events-none absolute inset-x-0 top-1/2 -translate-y-1/2 rotate-[-7deg] text-[clamp(1.55rem,4.7vw,3.8rem)] font-medium italic tracking-[-0.08em] text-neon-blue drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]" style={{ fontFamily: "'Brush Script MT', 'Segoe Script', cursive" }}>
                na nossa loja
              </p>
            </div>
          </div>
          <p className="absolute -right-4 top-[52%] hidden -rotate-90 font-montserrat text-xs font-bold uppercase tracking-[0.35em] text-neon-blue lg:block">LSZ Store</p>
        </div>

        <div className="relative h-[260px] w-full max-w-6xl sm:h-[340px] lg:h-[350px]">
          {products.map((product) => (
            <div key={product.src} className={`absolute overflow-hidden ${product.className}`}>
              <Image src={product.src} alt={product.alt} fill className="object-contain mix-blend-multiply" sizes="(max-width: 640px) 40vw, 330px" priority />
            </div>
          ))}
          <Link href="/produtos" className="absolute bottom-3 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap border border-white/40 bg-black/70 px-5 py-3 text-[10px] font-black uppercase tracking-[0.17em] text-white backdrop-blur transition-colors hover:border-neon-blue hover:bg-neon-blue hover:text-black">
            Confira a coleção
          </Link>
        </div>
      </div>
    </section>
  );
}
