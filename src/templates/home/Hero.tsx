import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full overflow-hidden bg-[#020716]">
      <Image
        src="/landing/lsz-hero.png"
        alt="Sejam vindos à LSZ Store"
        width={1536}
        height={1024}
        priority
        className="mx-auto hidden h-auto w-full max-w-[996px] md:block"
        sizes="(min-width: 996px) 996px, 100vw"
      />
      <Image
        src="/landing/lsz-hero-mobile.png"
        alt="Sejam vindos à LSZ Store"
        width={868}
        height={1811}
        priority
        className="h-auto w-full md:hidden"
        sizes="100vw"
      />
    </section>
  );
}
