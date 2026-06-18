import SiteShell from "@/components/layout/SiteShell";

export default function PrivacyPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto max-w-4xl px-4 text-silver md:px-6">
          <h1 className="mb-6 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Politica de privacidade
          </h1>
          <p className="leading-relaxed">
            A LSZ Store utiliza dados de cadastro e entrega apenas para operar
            pedidos, atendimento e comunicacoes autorizadas. Esta pagina pode
            ser expandida com a politica juridica completa da marca.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
