import Image from "next/image";

export default function WelcomeSection() {
  return (
    <section className="relative w-full max-w-[100vw] overflow-hidden bg-white px-4 py-16 text-black sm:px-6 md:py-24 lg:px-10">
      <div className="relative mx-auto min-w-0 max-w-[1500px]">
        <div className="relative z-10 min-w-0 max-w-[calc(100vw-2rem)] sm:max-w-6xl">
          <p className="font-montserrat text-[clamp(2.2rem,5vw,5.4rem)] font-light uppercase leading-none tracking-[-0.055em] text-neutral-800">
            Seja muito
          </p>
          <h2 className="font-montserrat text-[clamp(3.7rem,9vw,9.5rem)] font-black italic uppercase leading-[0.8] tracking-[-0.085em] text-black">
            Bem-vindo
          </h2>
          <p className="mt-2 font-montserrat text-[clamp(2.1rem,5.7vw,6.2rem)] font-medium uppercase leading-[0.88] tracking-[-0.07em] text-neutral-800">
            à <strong className="font-black italic">LSZ Store</strong>
          </p>
          <p className="mt-8 w-full max-w-4xl break-words font-poppins text-lg leading-8 text-neutral-700 sm:text-2xl sm:leading-10">
            Trabalhamos com <strong className="block font-bold italic text-black sm:inline">produtos 100% originais</strong>{" "}
            <span className="block sm:inline">e uma <strong className="block font-bold italic text-black sm:inline">seleção feita especialmente para você.</strong></span>
          </p>
        </div>

        <div className="absolute -right-10 -top-7 hidden h-44 w-72 rotate-3 overflow-hidden border-4 border-white bg-dark-blue shadow-2xl xl:block">
          <Image src="/logo-lsz-store.png" alt="" fill unoptimized className="object-cover" sizes="288px" />
        </div>
        <div className="mt-10 h-1 w-28 bg-neon-blue" />
        <div className="relative ml-6 mt-9 h-24 w-44 rotate-2 overflow-hidden border-4 border-white bg-dark-blue shadow-xl sm:ml-auto sm:mr-4 xl:hidden">
          <Image src="/logo-lsz-store.png" alt="LSZ Store" fill unoptimized className="object-cover" sizes="176px" />
        </div>
      </div>
    </section>
  );
}
