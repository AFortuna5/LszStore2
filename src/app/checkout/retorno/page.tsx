import Link from "next/link";

import SiteShell from "@/templates/layout/SiteShell";
import { readSessionFromCookies } from "@/server/auth/session";
import { getStripeReadiness, syncStripeCheckoutSession } from "@/server/services/payment";

export const dynamic = "force-dynamic";

type ReturnParams = {
  session_id?: string;
};

export default async function PaymentReturnPage({ searchParams }: { searchParams: Promise<ReturnParams> }) {
  const params = await searchParams;
  const session = await readSessionFromCookies();
  let order = null;

  if (params.session_id && getStripeReadiness().ready) {
    try {
      order = await syncStripeCheckoutSession(params.session_id);
    } catch {
      // A confirmacao definitiva continuara sendo processada pelo webhook.
    }
  }

  if (order && (!session || (session.role !== "ADMIN" && order.userId !== session.id))) {
    order = null;
  }

  const state = order?.paymentStatus === "APPROVED" || order?.status === "PAID"
    ? "success"
    : order?.status === "CANCELLED" || ["FAILED", "EXPIRED", "REFUNDED", "DISPUTED"].includes(order?.paymentStatus ?? "")
      ? "failure"
      : "pending";
  const messages = {
    success: ["Pagamento confirmado", "A Stripe confirmou o pagamento e o pedido ja aparece como pago."],
    pending: ["Confirmacao em andamento", "Estamos consultando a Stripe. A situacao definitiva aparecera em sua conta."],
    failure: ["Pagamento nao concluido", "O pagamento nao foi aprovado. Consulte o pedido para tentar novamente."],
  } as const;
  const content = messages[state];

  return (
    <SiteShell>
      <section className="min-h-[60vh] bg-black py-20">
        <div className="container mx-auto max-w-xl px-4 text-center">
          <p className="text-sm font-bold uppercase text-neon-blue">Checkout verificado</p>
          <h1 className="mt-3 font-montserrat text-4xl font-black uppercase text-white">{content[0]}</h1>
          <p className="mt-5 text-silver">{content[1]}</p>
          <Link href="/minha-conta" className="mt-8 inline-flex rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white">Ver meus pedidos</Link>
        </div>
      </section>
    </SiteShell>
  );
}
