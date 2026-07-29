"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type State = "pending" | "success" | "failure";

export default function PaymentStatus({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<State>("pending");
  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    let attempts = 0;
    const check = async () => {
      const response = await fetch(`/api/orders/payment-status?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
      if (!active || !response.ok) return;
      const order = await response.json() as { status: string; paymentStatus: string };
      if (order.status === "PAID" && order.paymentStatus === "APPROVED") setState("success");
      else if (order.status === "CANCELLED" || ["FAILED", "EXPIRED", "REFUNDED", "DISPUTED"].includes(order.paymentStatus)) setState("failure");
      else if (++attempts < 10) window.setTimeout(() => void check(), 2000);
    };
    void check();
    return () => { active = false; };
  }, [sessionId]);
  const messages = {
    success: ["Pagamento confirmado", "O webhook da Stripe confirmou o pagamento."],
    pending: ["Pagamento em processamento", "Aguardando a confirmacao segura da Stripe."],
    failure: ["Pagamento nao concluido", "Consulte o pedido para verificar os detalhes ou tentar novamente."],
  } as const;
  return <section className="min-h-[60vh] bg-black py-20"><div className="container mx-auto max-w-xl px-4 text-center">
    <p className="text-sm font-bold uppercase text-neon-blue">Checkout seguro</p>
    <h1 className="mt-3 font-montserrat text-4xl font-black uppercase text-white">{messages[state][0]}</h1>
    <p className="mt-5 text-silver">{messages[state][1]}</p>
    <Link href="/minha-conta" className="mt-8 inline-flex rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white">Ver meus pedidos</Link>
  </div></section>;
}
