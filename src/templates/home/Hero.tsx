import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full overflow-hidden bg-[#020a20]">
      <div className="relative h-[min(72svh,610px)] min-h-[500px] w-full md:hidden">
        <Image
          src="/landing/lsz-hero.png"
          alt="Sejam vindos à LSZ Store"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
      </div>
      <Image
        src="/landing/lsz-hero.png"
        alt="Sejam vindos à LSZ Store"
        width={1536}
        height={1024}
        priority
        className="hidden h-auto w-full md:block"
        sizes="100vw"
      />
    </section>
  );
}
