import SiteShell from "@/components/layout/SiteShell";

export default function AboutPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
            Sobre nos
          </p>
          <h1 className="font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            LSZ Store
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-silver">
            A LSZ Store nasceu para reunir produtos com presenca: pecas de
            streetwear, acessorios, perfumes e tecnologia com curadoria
            premium. Cada item entra no catalogo por estilo, qualidade e uso
            real no dia a dia.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
