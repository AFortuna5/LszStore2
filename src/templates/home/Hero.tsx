import Image from "next/image";

export default function Hero() {
  return (
    <section className="bg-[#020a20]">
      <Image
        src="/landing/lsz-hero.png"
        alt="Sejam vindos à LSZ Store"
        width={1536}
        height={1024}
        priority
        className="mx-auto h-auto w-full max-w-[1536px]"
        sizes="100vw"
      />
    </section>
  );
}
