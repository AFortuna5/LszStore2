import SiteShell from "@/templates/layout/SiteShell";

export default function TermsPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto max-w-4xl px-4 text-silver md:px-6">
          <h1 className="mb-6 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Termos de servico
          </h1>
          <p className="leading-relaxed">
            Ao comprar na LSZ Store, o cliente concorda com as condicoes de
            pagamento, envio, troca e atendimento apresentadas no site. Esta
            pagina serve como base visual e pode receber o texto juridico final
            da loja.
          </p>
        </div>
      </section>
    </SiteShell>
  );
}
