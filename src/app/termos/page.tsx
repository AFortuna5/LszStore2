import { storeContact } from "@/shared/store-contact";
import SiteShell from "@/templates/layout/SiteShell";

const sections = [
  ["Cadastro e conta", "O cliente deve fornecer informações verdadeiras, manter seus dados atualizados e proteger sua senha. Atividades realizadas com a conta autenticada são de responsabilidade do titular, ressalvadas falhas comprovadas do serviço."],
  ["Produtos e ofertas", "Características, imagens, preços, disponibilidade e condições são apresentados nas páginas dos produtos. O pedido depende de confirmação de estoque e pagamento. Erros evidentes de informação serão comunicados para correção, cancelamento ou escolha de alternativa."],
  ["Pedidos e pagamento", "O pedido é concluído somente após a confirmação do pagamento pela Stripe. O valor total, descontos e frete são apresentados antes do redirecionamento ao ambiente seguro de pagamento."],
  ["Entrega", "O prazo é calculado conforme CEP, produtos e serviço escolhido. A contagem começa após a confirmação do pagamento e pode variar por eventos externos da transportadora. O cliente deve informar endereço completo e acessível."],
  ["Cancelamento, trocas e devoluções", "O consumidor pode exercer os direitos previstos na legislação e na Política de Trocas e Devoluções. Solicitações devem ser feitas pelos canais oficiais com identificação do pedido."],
  ["Propriedade intelectual", "Textos, identidade visual e elementos próprios da loja não podem ser reproduzidos para fins comerciais sem autorização. Marcas de terceiros pertencem aos seus respectivos titulares."],
  ["Atendimento e alterações", "Dúvidas serão atendidas pelos canais oficiais. Estes termos podem ser atualizados para refletir mudanças operacionais ou legais, preservados os direitos relativos a compras já concluídas."],
];

export default function TermsPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto max-w-4xl px-4 text-silver md:px-6">
          <h1 className="font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Termos de serviço
          </h1>
          <p className="mt-4 leading-relaxed">
            Ao utilizar a loja ou concluir uma compra, você declara ter lido estes termos e as políticas relacionadas.
          </p>
          <div className="mt-8 space-y-7">
            {sections.map(([title, text]) => (
              <section key={title}>
                <h2 className="font-montserrat text-xl font-bold uppercase text-white">{title}</h2>
                <p className="mt-2 leading-relaxed">{text}</p>
              </section>
            ))}
            <section>
              <h2 className="font-montserrat text-xl font-bold uppercase text-white">Identificação e contato</h2>
              <p className="mt-2 leading-relaxed">
                LSZ Store, atendimento em {storeContact.location}, pelo e-mail <a className="text-neon-blue hover:text-white" href={`mailto:${storeContact.email}`}>{storeContact.email}</a> ou telefone {storeContact.phone}.
              </p>
            </section>
          </div>
          <p className="mt-10 text-sm">Última atualização: 28 de julho de 2026.</p>
        </div>
      </section>
    </SiteShell>
  );
}
