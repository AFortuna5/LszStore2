import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full overflow-hidden bg-[#020716]">
      <Image
        src="/landing/lsz-hero.png"
        alt="Sejam vindos à LSZ Store"
        width={1580}
        height={450}
        priority
        className="hidden h-auto w-full md:block"
        sizes="100vw"
      />
      <Image
        src="/landing/lsz-hero-mobile.png"
        alt="Sejam vindos à LSZ Store"
        width={941}
        height={1672}
        priority
        className="h-auto w-full md:hidden"
        sizes="100vw"
      />
    </section>
  );
}
