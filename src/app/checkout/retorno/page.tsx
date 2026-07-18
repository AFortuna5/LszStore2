import Link from "next/link";

import SiteShell from "@/templates/layout/SiteShell";
import { readSessionFromCookies } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { getMercadoPagoReadiness, syncMercadoPagoPayment } from "@/server/services/payment";

export const dynamic = "force-dynamic";

type ReturnParams = {
  payment_id?: string;
  external_reference?: string;
};

export default async function PaymentReturnPage({ searchParams }: { searchParams: Promise<ReturnParams> }) {
  const params = await searchParams;
  const session = await readSessionFromCookies();
  let order = null;

  if (params.payment_id && getMercadoPagoReadiness().ready) {
    try {
      order = await syncMercadoPagoPayment(params.payment_id);
    } catch {
      // A confirmacao definitiva continuara sendo processada pelo webhook.
    }
  }

  if (!order && params.external_reference) {
    order = await prisma.order.findUnique({ where: { id: params.external_reference } });
  }

  if (order && (!session || (session.role !== "ADMIN" && order.userId !== session.id))) {
    order = null;
  }

  const state = order?.paymentStatus === "APPROVED" || order?.status === "PAID"
    ? "success"
    : order?.status === "CANCELLED" || ["REJECTED", "REFUNDED", "CHARGED_BACK"].includes(order?.paymentStatus ?? "")
      ? "failure"
      : "pending";
  const messages = {
    success: ["Pagamento confirmado", "O Mercado Pago confirmou o pagamento e o pedido ja aparece como pago."],
    pending: ["Confirmacao em andamento", "Estamos consultando o Mercado Pago. A situacao definitiva aparecera em sua conta."],
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
