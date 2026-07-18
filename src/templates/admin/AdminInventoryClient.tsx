"use client";

import { ArrowDownToLine, ArrowLeft, ArrowUpFromLine, Boxes, ChevronLeft, ChevronRight, ClipboardList, PackageSearch, RefreshCw, TriangleAlert } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type StockItem = {
  productId: string; productName: string; variantId: string | null; variantName: string | null;
  sku: string | null; inventory: number; createdAt: string;
};
type Movement = {
  id: string; type: string; direction: "IN" | "OUT"; quantity: number;
  previousStock: number; newStock: number; productName: string; variantName: string | null;
  sku: string | null; actorName: string | null; actorEmail: string | null;
  customerName: string | null; customerEmail: string | null; orderId: string | null;
  reason: string | null; reference: string | null; createdAt: string;
};
type InventoryData = {
  stockItems: StockItem[];
  movements: Movement[];
  pagination: { page: number; pages: number; total: number; limit: number };
  summary: { items: number; totalUnits: number; lowStock: number; outOfStock: number; entriesToday: number; exitsToday: number };
};

const inputClass = "w-full rounded border border-border bg-black px-3 py-2.5 text-white outline-none focus:border-neon-blue";
const typeLabels: Record<string, string> = {
  INITIAL_STOCK: "Estoque inicial", INITIAL_IMPORT: "Importacao inicial", PRODUCT_EDIT: "Edicao de produto", PRODUCT_DELETED: "Produto excluido",
  SALE: "Venda", ORDER_CANCELLATION: "Cancelamento", REFUND: "Estorno", CHARGEBACK: "Chargeback",
  MANUAL_ENTRY: "Entrada manual", MANUAL_EXIT: "Saida manual",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "medium" }).format(new Date(value));
}

export default function AdminInventoryClient() {
  const [data, setData] = useState<InventoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [direction, setDirection] = useState("");
  const [type, setType] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [stockQuery, setStockQuery] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (query.trim()) params.set("q", query.trim());
    if (direction) params.set("direction", direction);
    if (type) params.set("type", type);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    const response = await fetch(`/api/admin/inventory?${params}`, { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) setMessage(payload.error ?? "Nao foi possivel carregar o inventario");
    else setData(payload);
    setLoading(false);
  }, [direction, endDate, page, query, startDate, type]);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ page: String(page), limit: "50" });
    if (query.trim()) params.set("q", query.trim());
    if (direction) params.set("direction", direction);
    if (type) params.set("type", type);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    fetch(`/api/admin/inventory?${params}`, { cache: "no-store" })
      .then(async (response) => ({ response, payload: await response.json() }))
      .then(({ response, payload }) => {
        if (!active) return;
        if (!response.ok) setMessage(payload.error ?? "Nao foi possivel carregar o inventario");
        else setData(payload);
      })
      .catch(() => { if (active) setMessage("Nao foi possivel carregar o inventario"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [direction, endDate, page, query, startDate, type]);

  const filteredStock = useMemo(() => {
    const normalized = stockQuery.trim().toLowerCase();
    if (!normalized) return data?.stockItems ?? [];
    return (data?.stockItems ?? []).filter((item) => [item.productName, item.variantName, item.sku]
      .some((value) => value?.toLowerCase().includes(normalized)));
  }, [data?.stockItems, stockQuery]);

  async function submitAdjustment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const [productId, variantId = ""] = String(form.get("item") ?? "").split("::");
    setSaving(true); setMessage("");
    const response = await fetch("/api/admin/inventory", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId, variantId: variantId || null, direction: form.get("direction"),
        quantity: Number(form.get("quantity")), reason: form.get("reason"),
      }),
    });
    const payload = await response.json();
    setSaving(false);
    if (!response.ok) { setMessage(payload.error ?? "Nao foi possivel registrar o movimento"); return; }
    event.currentTarget.reset();
    setMessage("Movimento registrado com sucesso.");
    setPage(1);
    await loadData();
  }

  const summaryCards = data ? [
    { label: "Unidades em estoque", value: data.summary.totalUnits, icon: Boxes, color: "text-neon-blue" },
    { label: "Itens controlados", value: data.summary.items, icon: PackageSearch, color: "text-white" },
    { label: "Estoque baixo", value: data.summary.lowStock, icon: TriangleAlert, color: "text-amber-400" },
    { label: "Sem estoque", value: data.summary.outOfStock, icon: TriangleAlert, color: "text-red-400" },
    { label: "Entradas hoje", value: data.summary.entriesToday, icon: ArrowDownToLine, color: "text-emerald-400" },
    { label: "Saidas hoje", value: data.summary.exitsToday, icon: ArrowUpFromLine, color: "text-red-400" },
  ] : [];

  return (
    <section className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 md:px-6">
        <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase text-silver hover:text-neon-blue"><ArrowLeft size={17} /> Voltar ao painel</Link>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">Operacao</p><h1 className="font-montserrat text-4xl font-black uppercase text-white md:text-5xl">Inventario e logs</h1><p className="mt-3 max-w-3xl text-silver">Entradas, saidas, vendas, devolucoes e ajustes com data, hora, responsavel, cliente e saldo.</p></div>
          <div className="flex gap-3"><Link href="/admin/produtos" className="rounded border border-border px-4 py-3 text-sm font-bold uppercase text-white hover:border-neon-blue">Produtos</Link><button onClick={() => void loadData()} className="flex items-center gap-2 rounded border border-border px-4 py-3 text-sm font-bold uppercase text-white hover:border-neon-blue"><RefreshCw size={17} /> Atualizar</button></div>
        </div>
        {message && <div className="mt-6 rounded border border-neon-blue/40 bg-neon-blue/10 p-4 text-sm text-white">{message}</div>}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">{summaryCards.map((card) => <div key={card.label} className="rounded-lg border border-border bg-dark-blue p-5"><card.icon className={card.color} size={23} /><p className="mt-4 text-xs uppercase tracking-wide text-silver">{card.label}</p><p className="mt-1 font-montserrat text-3xl font-black text-white">{card.value}</p></div>)}</div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[380px_1fr]">
          <form onSubmit={submitAdjustment} className="h-fit rounded-lg border border-border bg-dark-blue p-6">
            <h2 className="flex items-center gap-2 font-montserrat text-xl font-bold uppercase text-white"><ClipboardList className="text-neon-blue" /> Registrar movimento</h2>
            <p className="mt-2 text-sm text-silver">Use para compras de fornecedor, perdas, avarias e correcoes manuais.</p>
            <div className="mt-5 space-y-4">
              <label className="block text-sm text-silver">Produto / SKU<select required name="item" defaultValue="" className={`mt-2 ${inputClass}`}><option value="" disabled>Selecione</option>{data?.stockItems.map((item) => <option key={`${item.productId}-${item.variantId}`} value={`${item.productId}::${item.variantId ?? ""}`}>{item.productName}{item.variantName ? ` - ${item.variantName}` : ""} ({item.inventory})</option>)}</select></label>
              <label className="block text-sm text-silver">Operacao<select required name="direction" className={`mt-2 ${inputClass}`}><option value="IN">Entrada</option><option value="OUT">Saida</option></select></label>
              <label className="block text-sm text-silver">Quantidade<input required min="1" type="number" name="quantity" className={`mt-2 ${inputClass}`} /></label>
              <label className="block text-sm text-silver">Motivo / observacao<textarea required maxLength={500} rows={3} name="reason" placeholder="Ex.: compra do fornecedor, avaria..." className={`mt-2 ${inputClass}`} /></label>
              <button disabled={saving} className="w-full rounded bg-neon-blue px-5 py-3 font-bold uppercase text-black hover:bg-white disabled:opacity-50">{saving ? "Registrando..." : "Registrar no inventario"}</button>
            </div>
          </form>

          <div className="min-w-0 rounded-lg border border-border bg-dark-blue p-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-montserrat text-xl font-bold uppercase text-white">Posicao atual</h2><input value={stockQuery} onChange={(event) => setStockQuery(event.target.value)} placeholder="Buscar produto ou SKU" className="rounded border border-border bg-black px-3 py-2 text-sm text-white outline-none focus:border-neon-blue" /></div>
            <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead className="border-b border-border text-xs uppercase text-silver"><tr><th className="pb-3">Produto</th><th className="pb-3">SKU</th><th className="pb-3">Cadastro</th><th className="pb-3 text-right">Saldo atual</th><th className="pb-3 text-right">Situacao</th></tr></thead><tbody>{filteredStock.map((item) => <tr key={`${item.productId}-${item.variantId}`} className="border-b border-border/60"><td className="py-3 pr-4"><strong className="text-white">{item.productName}</strong>{item.variantName && <span className="block text-xs text-silver">{item.variantName}</span>}</td><td className="py-3 text-silver">{item.sku ?? "—"}</td><td className="py-3 text-silver">{formatDate(item.createdAt)}</td><td className="py-3 text-right font-bold text-white">{item.inventory}</td><td className={`py-3 text-right text-xs font-bold uppercase ${item.inventory === 0 ? "text-red-400" : item.inventory <= 5 ? "text-amber-400" : "text-emerald-400"}`}>{item.inventory === 0 ? "Esgotado" : item.inventory <= 5 ? "Baixo" : "Disponivel"}</td></tr>)}</tbody></table></div>
          </div>
        </div>

        <div className="mt-8 rounded-lg border border-border bg-dark-blue p-6">
          <h2 className="font-montserrat text-xl font-bold uppercase text-white">Historico de movimentacoes</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-6"><input value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }} placeholder="Produto, SKU, cliente ou pedido" className={`xl:col-span-2 ${inputClass}`} /><select value={direction} onChange={(e) => { setDirection(e.target.value); setPage(1); }} className={inputClass}><option value="">Entradas e saidas</option><option value="IN">Entradas</option><option value="OUT">Saidas</option></select><select value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} className={inputClass}><option value="">Todos os tipos</option>{Object.entries(typeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className={inputClass} title="Data inicial" /><input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className={inputClass} title="Data final" /></div>
          <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[1200px] text-left text-sm"><thead className="border-b border-border text-xs uppercase text-silver"><tr><th className="pb-3">Data e hora</th><th className="pb-3">Movimento</th><th className="pb-3">Produto / SKU</th><th className="pb-3">Quantidade</th><th className="pb-3">Saldo</th><th className="pb-3">Cliente / destino</th><th className="pb-3">Responsavel</th><th className="pb-3">Motivo / referencia</th></tr></thead><tbody>{data?.movements.map((movement) => <tr key={movement.id} className="border-b border-border/60 align-top"><td className="whitespace-nowrap py-4 pr-4 text-silver">{formatDate(movement.createdAt)}</td><td className="py-4 pr-4"><span className={`rounded px-2 py-1 text-xs font-bold ${movement.direction === "IN" ? "bg-emerald-400/15 text-emerald-400" : "bg-red-400/15 text-red-400"}`}>{movement.direction === "IN" ? "ENTRADA" : "SAIDA"}</span><span className="mt-2 block text-xs text-silver">{typeLabels[movement.type] ?? movement.type}</span></td><td className="py-4 pr-4"><strong className="text-white">{movement.productName}</strong>{movement.variantName && <span className="block text-xs text-silver">{movement.variantName}</span>}<span className="block text-xs text-silver">{movement.sku ?? "Sem SKU"}</span></td><td className={`py-4 pr-4 font-bold ${movement.direction === "IN" ? "text-emerald-400" : "text-red-400"}`}>{movement.direction === "IN" ? "+" : "−"}{movement.quantity}</td><td className="whitespace-nowrap py-4 pr-4 text-white">{movement.previousStock} → {movement.newStock}</td><td className="py-4 pr-4 text-silver">{movement.customerName ?? "—"}{movement.customerEmail && <span className="block text-xs">{movement.customerEmail}</span>}</td><td className="py-4 pr-4 text-silver">{movement.actorName ?? "Sistema"}{movement.actorEmail && <span className="block text-xs">{movement.actorEmail}</span>}</td><td className="max-w-xs py-4 text-silver">{movement.reason ?? "—"}{movement.reference && <span className="mt-1 block text-xs text-neon-blue">{movement.reference}</span>}</td></tr>)}</tbody></table>{!loading && data?.movements.length === 0 && <p className="py-10 text-center text-silver">Nenhum movimento encontrado.</p>}{loading && <p className="py-10 text-center text-silver">Carregando registros...</p>}</div>
          {data && <div className="mt-5 flex items-center justify-between text-sm text-silver"><span>{data.pagination.total} registro(s)</span><div className="flex items-center gap-3"><button disabled={page <= 1} onClick={() => setPage((current) => current - 1)} className="rounded border border-border p-2 text-white disabled:opacity-30"><ChevronLeft size={18} /></button><span>Pagina {data.pagination.page} de {data.pagination.pages}</span><button disabled={page >= data.pagination.pages} onClick={() => setPage((current) => current + 1)} className="rounded border border-border p-2 text-white disabled:opacity-30"><ChevronRight size={18} /></button></div></div>}
        </div>
      </div>
    </section>
  );
}
