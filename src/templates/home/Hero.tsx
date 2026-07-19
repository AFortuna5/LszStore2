import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full overflow-hidden bg-[#020716]">
      <div className="relative hidden h-[calc(100svh-7rem)] min-h-[520px] w-full overflow-hidden md:block">
        <Image
          src="/landing/lsz-hero.png"
          alt="Sejam vindos à LSZ Store"
          fill
          priority
          className="scale-110 object-cover object-center opacity-45 blur-2xl"
          sizes="100vw"
        />
        <Image
          src="/landing/lsz-hero.png"
          alt="Sejam vindos à LSZ Store"
          fill
          priority
          className="object-contain object-center"
          sizes="100vw"
        />
      </div>
      <div className="relative h-[calc(100svh-7rem)] min-h-[560px] w-full overflow-hidden md:hidden">
        <Image
          src="/landing/lsz-hero-mobile.png"
          alt="Sejam vindos à LSZ Store"
          fill
          priority
          className="scale-110 object-cover object-center opacity-45 blur-2xl"
          sizes="100vw"
        />
        <Image
          src="/landing/lsz-hero-mobile.png"
          alt="Sejam vindos à LSZ Store"
          fill
          priority
          className="object-contain object-center"
          sizes="100vw"
        />
      </div>
    </section>
  );
}
