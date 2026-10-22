import Image from "next/image";

export default function Hero() {
  return (
    <section className="w-full overflow-hidden bg-[#020716]">
      <Image
        src="/landing/lsz-hero.png"
        alt="Sejam bem-vindos à LSZ Store"
        width={2168}
        height={725}
        priority
        className="h-auto w-full"
        sizes="100vw"
      />
    </section>
  );
}
