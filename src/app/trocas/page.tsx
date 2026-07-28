import Link from "next/link";

import { storeContact } from "@/shared/store-contact";
import SiteShell from "@/templates/layout/SiteShell";

const steps = [
  ["1. Solicite", "Entre em contato informando número do pedido, produto e motivo da solicitação."],
  ["2. Aguarde as instruções", "Nossa equipe orientará sobre embalagem, documentos e forma de envio ou coleta."],
  ["3. Análise e solução", "Após o recebimento e a conferência, será aplicada a solução cabível: troca, crédito, reparo ou restituição."],
];

export default function ExchangesPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto max-w-4xl px-4 md:px-6">
          <p className="text-sm font-bold uppercase tracking-wide text-neon-blue">Suporte</p>
          <h1 className="mt-2 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Trocas e devoluções
          </h1>
          <div className="mt-8 space-y-7 text-silver">
            <section>
              <h2 className="font-montserrat text-xl font-bold uppercase text-white">Direito de arrependimento</h2>
              <p className="mt-2 leading-relaxed">
                Compras realizadas pela internet podem ser canceladas em até 7 dias corridos contados do recebimento. O produto deve ser devolvido com seus acessórios e, sempre que possível, na embalagem original. O exercício regular desse direito não gera custo de devolução ao consumidor.
              </p>
            </section>
            <section>
              <h2 className="font-montserrat text-xl font-bold uppercase text-white">Defeito, avaria ou item incorreto</h2>
              <p className="mt-2 leading-relaxed">
                Comunique o problema assim que identificá-lo e envie imagens quando solicitado. As garantias legais permanecem aplicáveis. Danos decorrentes de uso inadequado, desgaste natural ou alteração do produto serão avaliados individualmente.
              </p>
            </section>
            <section>
              <h2 className="font-montserrat text-xl font-bold uppercase text-white">Como solicitar</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {steps.map(([title, text]) => (
                  <div key={title} className="rounded-lg border border-border bg-dark-blue p-5">
                    <h3 className="font-bold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed">{text}</p>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="font-montserrat text-xl font-bold uppercase text-white">Atendimento</h2>
              <p className="mt-2 leading-relaxed">
                Solicite pelo <a className="text-neon-blue hover:text-white" href={`https://wa.me/${storeContact.whatsapp}`}>WhatsApp</a>, pelo e-mail <a className="text-neon-blue hover:text-white" href={`mailto:${storeContact.email}`}>{storeContact.email}</a> ou pela página de <Link className="text-neon-blue hover:text-white" href="/contato">contato</Link>.
              </p>
            </section>
          </div>
          <p className="mt-10 text-sm text-silver">Última atualização: 28 de julho de 2026.</p>
        </div>
      </section>
    </SiteShell>
  );
}
