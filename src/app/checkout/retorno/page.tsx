import Link from "next/link";
import SiteShell from "@/templates/layout/SiteShell";

export default async function PaymentReturnPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const messages = {
    success: ["Pagamento recebido", "Seu pagamento foi processado. A confirmacao final aparecera na sua conta."],
    pending: ["Pagamento em analise", "O pedido foi criado e estamos aguardando a confirmacao do pagamento."],
    failure: ["Pagamento nao concluido", "Nao houve cobranca. Consulte o pedido e tente novamente."],
  } as const;
  const content = messages[status as keyof typeof messages] ?? messages.pending;
  return <SiteShell><section className="min-h-[60vh] bg-black py-20"><div className="container mx-auto max-w-xl px-4 text-center"><p className="text-sm font-bold uppercase text-neon-blue">Checkout</p><h1 className="mt-3 font-montserrat text-4xl font-black uppercase text-white">{content[0]}</h1><p className="mt-5 text-silver">{content[1]}</p><Link href="/minha-conta" className="mt-8 inline-flex rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white">Ver meus pedidos</Link></div></section></SiteShell>;
}
