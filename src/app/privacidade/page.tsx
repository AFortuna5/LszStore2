import { storeContact } from "@/shared/store-contact";
import SiteShell from "@/templates/layout/SiteShell";

const sections = [
  {
    title: "Dados tratados",
    text: "Podemos tratar dados de cadastro, contato, entrega, pedidos, atendimento, navegação e informações técnicas necessárias para operar e proteger a loja. Os dados completos do cartão não são armazenados pela LSZ Store.",
  },
  {
    title: "Finalidades",
    text: "Usamos os dados para criar e administrar contas, processar pedidos e pagamentos, calcular frete, entregar produtos, prevenir fraudes, prestar atendimento, cumprir obrigações legais e enviar comunicações autorizadas.",
  },
  {
    title: "Compartilhamento",
    text: "Os dados estritamente necessários podem ser compartilhados com provedores de pagamento, transportadoras, hospedagem, banco de dados, envio de e-mails e autoridades quando houver obrigação legal. Esses fornecedores tratam dados conforme suas próprias políticas e contratos.",
  },
  {
    title: "Conservação e segurança",
    text: "Mantemos os dados pelo período necessário para executar os serviços, cumprir obrigações legais e exercer direitos. Aplicamos controles técnicos e administrativos razoáveis, mas nenhum ambiente digital é totalmente livre de riscos.",
  },
  {
    title: "Direitos do titular",
    text: "Você pode solicitar confirmação de tratamento, acesso, correção, portabilidade quando aplicável, informação sobre compartilhamentos, revisão, anonimização, bloqueio ou exclusão nos limites da legislação, além de revogar consentimentos.",
  },
  {
    title: "Cookies e armazenamento local",
    text: "A loja utiliza cookies essenciais de sessão e armazenamento local para autenticação, segurança e funcionamento do carrinho. Ferramentas adicionais de medição ou publicidade deverão ser informadas caso sejam ativadas.",
  },
];

export default function PrivacyPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto max-w-4xl px-4 text-silver md:px-6">
          <h1 className="font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Política de privacidade
          </h1>
          <p className="mt-4 leading-relaxed">
            Esta política explica como a LSZ Store trata dados pessoais em conformidade com a Lei Geral de Proteção de Dados.
          </p>
          <div className="mt-8 space-y-7">
            {sections.map((section) => (
              <section key={section.title}>
                <h2 className="font-montserrat text-xl font-bold uppercase text-white">{section.title}</h2>
                <p className="mt-2 leading-relaxed">{section.text}</p>
              </section>
            ))}
            <section>
              <h2 className="font-montserrat text-xl font-bold uppercase text-white">Contato sobre privacidade</h2>
              <p className="mt-2 leading-relaxed">
                Solicitações podem ser enviadas para <a className="text-neon-blue hover:text-white" href={`mailto:${storeContact.email}`}>{storeContact.email}</a>. Atendimento em {storeContact.location}.
              </p>
            </section>
          </div>
          <p className="mt-10 text-sm">Última atualização: 28 de julho de 2026.</p>
        </div>
      </section>
    </SiteShell>
  );
}
