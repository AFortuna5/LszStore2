import SiteShell from "@/templates/layout/SiteShell";

const faqs = [
  ["Qual o prazo de envio?", "O prazo depende do CEP e aparece no checkout."],
  ["Os produtos sao originais?", "Sim, todos os itens passam por curadoria da loja."],
  ["Tem frete gratis?", "Pedidos acima de R$ 399 contam com frete gratis."],
];

export default function FaqPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <h1 className="mb-8 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Duvidas frequentes
          </h1>
          <div className="space-y-4">
            {faqs.map(([question, answer]) => (
              <div key={question} className="rounded-lg border border-border bg-dark-blue p-5">
                <h2 className="font-bold text-white">{question}</h2>
                <p className="mt-2 text-silver">{answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
