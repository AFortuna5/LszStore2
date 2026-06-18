import SiteShell from "@/components/layout/SiteShell";

export default function ExchangesPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
            Suporte
          </p>
          <h1 className="font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Trocas e devolucoes
          </h1>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {["Solicite em ate 7 dias", "Produto sem sinais de uso", "Atendimento pelo WhatsApp"].map((item) => (
              <div key={item} className="rounded-lg border border-border bg-dark-blue p-5 text-silver">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
