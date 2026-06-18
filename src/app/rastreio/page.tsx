import SiteShell from "@/components/layout/SiteShell";

export default function TrackingPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto max-w-2xl px-4 md:px-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
            Pedido
          </p>
          <h1 className="mb-6 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Rastrear pedido
          </h1>
          <div className="rounded-lg border border-border bg-dark-blue p-6">
            <input className="mb-4 w-full rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Codigo de rastreio ou numero do pedido" />
            <button className="w-full rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white">
              Consultar
            </button>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
