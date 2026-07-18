"use client";

import { useState } from "react";
import SiteShell from "@/templates/layout/SiteShell";

type TrackedOrder = { id: string; status: string; trackingCode: string | null; shippingService: string | null; shippingDeadline: number | null; createdAt: string; updatedAt: string };
const labels: Record<string, string> = { PENDING: "Aguardando pagamento", PAID: "Pagamento confirmado", SHIPPED: "Pedido enviado", DELIVERED: "Pedido entregue", CANCELLED: "Pedido cancelado" };

export default function TrackingPage() {
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [message, setMessage] = useState("");
  async function track(formData: FormData) {
    setMessage("Consultando..."); setOrder(null);
    const response = await fetch("/api/tracking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: formData.get("code"), email: formData.get("email") }) });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Pedido nao encontrado"); return; }
    setOrder(result.order); setMessage("");
  }
  return <SiteShell><section className="min-h-[65vh] bg-black py-14"><div className="container mx-auto max-w-2xl px-4 md:px-6"><p className="mb-2 text-sm font-bold uppercase text-neon-blue">Pedido</p><h1 className="mb-6 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">Rastrear pedido</h1><form action={track} className="rounded-lg border border-border bg-dark-blue p-6"><input required name="code" className="mb-4 w-full rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Codigo de rastreio ou numero do pedido" /><input required type="email" name="email" className="mb-4 w-full rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="E-mail usado na compra" /><button className="w-full rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white">Consultar</button>{message && <p className="mt-4 text-sm text-neon-blue">{message}</p>}</form>{order && <div className="mt-6 rounded-lg border border-neon-blue/40 bg-dark-blue p-6"><p className="text-sm text-silver">Pedido #{order.id.slice(-8).toUpperCase()}</p><h2 className="mt-2 text-2xl font-bold text-white">{labels[order.status] ?? order.status}</h2>{order.shippingService && <p className="mt-3 text-silver">Entrega: {order.shippingService}</p>}{order.trackingCode && <p className="mt-2 text-neon-blue">Codigo: {order.trackingCode}</p>}<p className="mt-3 text-xs text-silver">Atualizado em {new Date(order.updatedAt).toLocaleString("pt-BR")}</p></div>}</div></section></SiteShell>;
}
