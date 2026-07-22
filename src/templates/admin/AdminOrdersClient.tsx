"use client";

import { ArrowLeft, PackageCheck, RefreshCw, Search, Truck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatCurrency } from "@/shared/storefront";

type Order = {
  id: string; status: string; paymentStatus: string; paymentMethod: string; subtotal: number; discountAmount: number; couponCode: string | null; total: number;
  trackingCode: string | null; shippingService: string | null; shippingDeadline: number | null;
  customerName: string; customerEmail: string; customerPhone: string | null; createdAt: string;
  items: Array<{ id: string; productName: string; variantLabel: string | null; quantity: number; price: number }>;
};
const statuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const labels: Record<string, string> = { PENDING: "Pendente", PAID: "Pago", SHIPPED: "Enviado", DELIVERED: "Entregue", CANCELLED: "Cancelado" };

export default function AdminOrdersClient() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const response = await fetch(`/api/orders?limit=100${filter ? `&status=${filter}` : ""}`, { cache: "no-store" });
    const data = await response.json();
    setOrders(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filter]);
  useEffect(() => {
    fetch(`/api/orders?limit=100${filter ? `&status=${filter}` : ""}`, { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [filter]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? orders.filter((order) => [order.id, order.customerName, order.customerEmail, order.trackingCode ?? ""].some((value) => value.toLowerCase().includes(q))) : orders;
  }, [orders, query]);

  async function updateOrder(order: Order, status: string, trackingCode: string) {
    setMessage("");
    const response = await fetch(`/api/orders/${order.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status, trackingCode }),
    });
    const data = await response.json();
    if (!response.ok) { setMessage(data.error ?? "Nao foi possivel atualizar"); return; }
    setMessage("Pedido atualizado e cliente notificado.");
    await load();
  }

  return <section className="min-h-screen bg-black py-12"><div className="container mx-auto px-4 md:px-6">
    <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold uppercase text-silver hover:text-neon-blue"><ArrowLeft size={17} /> Painel</Link>
    <div className="mt-6 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold uppercase text-neon-blue">Operacao</p><h1 className="mt-2 font-montserrat text-4xl font-black uppercase text-white">Pedidos e envios</h1></div><button onClick={() => void load()} className="flex items-center gap-2 rounded border border-border px-4 py-2 text-white hover:border-neon-blue"><RefreshCw size={17} /> Atualizar</button></div>
    {message && <p className="mt-5 rounded border border-neon-blue/40 bg-neon-blue/10 p-4 text-sm text-white">{message}</p>}
    <div className="mt-7 grid gap-3 md:grid-cols-[1fr_220px]"><label className="flex items-center gap-2 rounded border border-border bg-dark-blue px-4"><Search size={18} className="text-silver" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Pedido, cliente, email ou rastreio" className="w-full bg-transparent py-3 outline-none" /></label><select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border border-border bg-dark-blue px-4 py-3"><option value="">Todos os status</option>{statuses.map((status) => <option key={status} value={status}>{labels[status]}</option>)}</select></div>
    <div className="mt-6 space-y-5">{loading ? <p className="text-silver">Carregando...</p> : visible.length === 0 ? <p className="rounded border border-border bg-dark-blue p-8 text-center text-silver">Nenhum pedido encontrado.</p> : visible.map((order) => <OrderCard key={order.id} order={order} onSave={updateOrder} />)}</div>
  </div></section>;
}

function OrderCard({ order, onSave }: { order: Order; onSave: (order: Order, status: string, tracking: string) => Promise<void> }) {
  const [status, setStatus] = useState(order.status);
  const [tracking, setTracking] = useState(order.trackingCode ?? "");
  return <article className="rounded-lg border border-border bg-dark-blue p-5"><div className="grid gap-5 lg:grid-cols-[1fr_320px]">
    <div><div className="flex flex-wrap items-center gap-3"><h2 className="font-bold text-white">#{order.id.slice(-8).toUpperCase()}</h2><span className="rounded border border-neon-blue px-2 py-1 text-xs text-neon-blue">{labels[order.status] ?? order.status}</span><span className="text-xs text-silver">Pagamento: {order.paymentStatus}</span></div><p className="mt-2 text-sm text-silver">{new Date(order.createdAt).toLocaleString("pt-BR")} · {order.customerName} · {order.customerEmail}</p><div className="mt-4 space-y-2">{order.items.map((item) => <div key={item.id} className="flex justify-between gap-4 text-sm"><span className="text-silver">{item.quantity}x {item.productName}{item.variantLabel ? ` (${item.variantLabel})` : ""}</span><span>{formatCurrency(item.price * item.quantity)}</span></div>)}</div>{order.couponCode && <p className="mt-3 text-sm text-emerald-300">Cupom {order.couponCode}: -{formatCurrency(order.discountAmount)}</p>}<p className="mt-4 border-t border-border pt-3 font-bold text-white">Total: {formatCurrency(order.total)}</p>{order.shippingService && <p className="mt-2 flex items-center gap-2 text-sm text-silver"><Truck size={16} /> {order.shippingService} · ate {order.shippingDeadline} dias uteis</p>}</div>
    <div className="space-y-3 rounded border border-border bg-black p-4"><select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded border border-border bg-dark-blue px-3 py-2.5">{statuses.map((value) => <option key={value} value={value}>{labels[value]}</option>)}</select><input value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Codigo de rastreio" className="w-full rounded border border-border bg-dark-blue px-3 py-2.5 outline-none focus:border-neon-blue" /><button onClick={() => onSave(order, status, tracking)} className="flex w-full items-center justify-center gap-2 rounded bg-neon-blue px-4 py-3 font-bold uppercase text-black hover:bg-white"><PackageCheck size={18} /> Salvar e notificar</button></div>
  </div></article>;
}
