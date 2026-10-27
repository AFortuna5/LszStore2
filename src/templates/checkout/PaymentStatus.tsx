"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buildWhatsAppPickupUrl, WHATSAPP_SHIPPING_ID } from "@/shared/checkout-whatsapp";

type State = "pending" | "success" | "failure";

type PaymentOrder = {
  id: string;
  status: string;
  paymentStatus: string;
  shippingServiceId: string | null;
  customerName: string;
  zipCode: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  complement: string | null;
  items: { productName: string; variantLabel: string | null; quantity: number }[];
};

export default function PaymentStatus({ sessionId }: { sessionId: string }) {
  const [state, setState] = useState<State>("pending");
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    let attempts = 0;
    const check = async () => {
      const response = await fetch(`/api/orders/payment-status?session_id=${encodeURIComponent(sessionId)}`, { cache: "no-store" });
      if (!active || !response.ok) return;
      const payload = await response.json() as PaymentOrder;
      if (payload.status === "PAID" && payload.paymentStatus === "APPROVED") {
        setOrder(payload);
        setState("success");
      }
      else if (payload.status === "CANCELLED" || ["FAILED", "EXPIRED", "REFUNDED", "DISPUTED"].includes(payload.paymentStatus)) setState("failure");
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
  const whatsappUrl = state === "success" && order?.shippingServiceId === WHATSAPP_SHIPPING_ID
    ? buildWhatsAppPickupUrl({
        code: order.id.slice(-8).toUpperCase(),
        customerName: order.customerName,
        address: {
          zipCode: order.zipCode,
          street: order.street,
          number: order.number,
          neighborhood: order.neighborhood,
          city: order.city,
          state: order.state,
          complement: order.complement,
        },
        items: order.items.map((item) => ({ name: item.productName, variantLabel: item.variantLabel, quantity: item.quantity })),
      })
    : null;
  return <section className="min-h-[60vh] bg-black py-20"><div className="container mx-auto max-w-xl px-4 text-center">
    <p className="text-sm font-bold uppercase text-neon-blue">Checkout seguro</p>
    <h1 className="mt-3 font-montserrat text-4xl font-black uppercase text-white">{messages[state][0]}</h1>
    <p className="mt-5 text-silver">{messages[state][1]}</p>
    {whatsappUrl && (
      <div className="mt-8 rounded border border-emerald-400/40 bg-emerald-400/5 p-5">
        <p className="text-sm text-silver">Entrega combinada por Uber: fale com a loja para alinhar local e horario de retirada.</p>
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex w-full items-center justify-center rounded bg-emerald-400 px-6 py-3 font-bold uppercase text-black hover:bg-emerald-300">
          Combinar retirada pelo WhatsApp
        </a>
      </div>
    )}
    <Link href="/minha-conta" className="mt-8 inline-flex rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white">Ver meus pedidos</Link>
  </div></section>;
}
