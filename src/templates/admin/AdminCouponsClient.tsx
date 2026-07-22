"use client";

import { ArrowLeft, CalendarClock, Pencil, Plus, Tag, Trash2, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type Category = { id: string; name: string; slug: string };
type Coupon = {
  id: string;
  code: string;
  discountPercent: number;
  startsAt: string;
  endsAt: string;
  active: boolean;
  usageCount: number;
  categoryId: string | null;
  category: Category | null;
};
type CouponDraft = {
  code: string;
  discountPercent: string;
  startsAt: string;
  endsAt: string;
  categoryId: string;
  active: boolean;
};

const inputClass = "w-full rounded border border-border bg-black px-3 py-2.5 text-white outline-none focus:border-neon-blue";

function toLocalInput(value: Date | string) {
  const date = new Date(value);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function newDraft(): CouponDraft {
  const startsAt = new Date();
  const endsAt = new Date(startsAt.getTime() + 30 * 24 * 60 * 60_000);
  return { code: "", discountPercent: "10", startsAt: toLocalInput(startsAt), endsAt: toLocalInput(endsAt), categoryId: "", active: true };
}

function statusOf(coupon: Coupon) {
  const now = Date.now();
  if (!coupon.active) return { label: "Desativado", className: "border-silver/40 text-silver" };
  if (new Date(coupon.startsAt).getTime() > now) return { label: "Agendado", className: "border-amber-400/60 text-amber-300" };
  if (new Date(coupon.endsAt).getTime() < now) return { label: "Expirado", className: "border-red-400/60 text-red-300" };
  return { label: "Ativo", className: "border-emerald-400/60 text-emerald-300" };
}

export default function AdminCouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [draft, setDraft] = useState<CouponDraft>(newDraft);
  const [editing, setEditing] = useState<Coupon | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    const [couponResponse, categoryResponse] = await Promise.all([
      fetch("/api/admin/coupons", { cache: "no-store" }),
      fetch("/api/categories", { cache: "no-store" }),
    ]);
    const [couponData, categoryData] = await Promise.all([couponResponse.json(), categoryResponse.json()]);
    setCoupons(Array.isArray(couponData) ? couponData : []);
    setCategories(Array.isArray(categoryData) ? categoryData : []);
    setLoading(false);
  }, []);

  useEffect(() => { queueMicrotask(() => { void load(); }); }, [load]);

  const activeCount = useMemo(() => coupons.filter((coupon) => statusOf(coupon).label === "Ativo").length, [coupons]);

  function openNew() {
    setEditing(null);
    setDraft(newDraft());
    setEditorOpen(true);
    setMessage("");
  }

  function openEdit(coupon: Coupon) {
    setEditing(coupon);
    setDraft({
      code: coupon.code,
      discountPercent: String(coupon.discountPercent),
      startsAt: toLocalInput(coupon.startsAt),
      endsAt: toLocalInput(coupon.endsAt),
      categoryId: coupon.categoryId ?? "",
      active: coupon.active,
    });
    setEditorOpen(true);
    setMessage("");
  }

  async function saveCoupon(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const response = await fetch(editing ? `/api/admin/coupons/${editing.id}` : "/api/admin/coupons", {
      method: editing ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...draft,
        code: draft.code.trim().toUpperCase(),
        discountPercent: Number(draft.discountPercent),
        startsAt: new Date(draft.startsAt).toISOString(),
        endsAt: new Date(draft.endsAt).toISOString(),
        categoryId: draft.categoryId || null,
      }),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { setMessage(result.error ?? "Nao foi possivel salvar o cupom"); return; }
    setEditorOpen(false);
    setMessage(editing ? "Cupom atualizado." : "Cupom criado.");
    await load();
  }

  async function deleteCoupon(coupon: Coupon) {
    if (!window.confirm(`Excluir o cupom ${coupon.code}?`)) return;
    const response = await fetch(`/api/admin/coupons/${coupon.id}`, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Nao foi possivel excluir o cupom"); return; }
    setMessage("Cupom excluido.");
    await load();
  }

  return (
    <section className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 md:px-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold uppercase text-silver hover:text-neon-blue"><ArrowLeft size={17} /> Painel</Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-5">
          <div><p className="text-sm font-bold uppercase tracking-wide text-neon-blue">Promocoes</p><h1 className="mt-2 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">Cupons</h1><p className="mt-3 text-silver">Defina periodo, desconto e categoria de cada cupom.</p></div>
          <button onClick={openNew} className="flex items-center gap-2 rounded bg-neon-blue px-5 py-3 font-bold uppercase text-black hover:bg-white"><Plus size={19} /> Novo cupom</button>
        </div>
        {message && <p className="mt-6 rounded border border-neon-blue/40 bg-neon-blue/10 p-4 text-sm text-white">{message}</p>}

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded border border-border bg-dark-blue p-5"><p className="text-xs uppercase text-silver">Cadastrados</p><p className="mt-2 text-3xl font-black text-white">{coupons.length}</p></div>
          <div className="rounded border border-border bg-dark-blue p-5"><p className="text-xs uppercase text-silver">Ativos agora</p><p className="mt-2 text-3xl font-black text-emerald-300">{activeCount}</p></div>
          <div className="rounded border border-border bg-dark-blue p-5"><p className="text-xs uppercase text-silver">Utilizacoes</p><p className="mt-2 text-3xl font-black text-neon-blue">{coupons.reduce((sum, coupon) => sum + coupon.usageCount, 0)}</p></div>
        </div>

        <div className="mt-7 space-y-4">
          {loading ? <p className="text-silver">Carregando cupons...</p> : coupons.length === 0 ? <div className="rounded border border-dashed border-border bg-dark-blue p-10 text-center text-silver">Nenhum cupom cadastrado.</div> : coupons.map((coupon) => {
            const status = statusOf(coupon);
            return <article key={coupon.id} className="grid gap-5 rounded-lg border border-border bg-dark-blue p-5 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <div className="flex flex-wrap items-center gap-3"><span className="flex items-center gap-2 font-montserrat text-xl font-black text-white"><Tag size={19} className="text-neon-blue" /> {coupon.code}</span><span className={`rounded border px-2 py-1 text-[11px] font-bold uppercase ${status.className}`}>{status.label}</span></div>
                <p className="mt-3 text-sm text-silver"><strong className="text-white">{coupon.discountPercent}% OFF</strong> · {coupon.category?.name ?? "Todas as categorias"}</p>
                <p className="mt-2 flex items-center gap-2 text-xs text-silver"><CalendarClock size={15} /> {new Date(coupon.startsAt).toLocaleString("pt-BR")} ate {new Date(coupon.endsAt).toLocaleString("pt-BR")} · {coupon.usageCount} uso(s)</p>
              </div>
              <div className="flex gap-2"><button onClick={() => openEdit(coupon)} className="flex items-center gap-2 rounded border border-border px-4 py-2 text-sm text-white hover:border-neon-blue hover:text-neon-blue"><Pencil size={16} /> Editar</button><button onClick={() => void deleteCoupon(coupon)} className="rounded border border-border p-2 text-red-400 hover:border-red-400" aria-label={`Excluir ${coupon.code}`}><Trash2 size={18} /></button></div>
            </article>;
          })}
        </div>
      </div>

      {editorOpen && <div className="fixed inset-0 z-[100] grid place-items-center overflow-y-auto bg-black/85 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditorOpen(false); }}>
        <form onSubmit={saveCoupon} className="w-full max-w-2xl rounded-xl border border-border bg-dark-blue p-6 md:p-8">
          <div className="flex items-start justify-between"><div><p className="text-xs font-bold uppercase text-neon-blue">Editor de promocao</p><h2 className="mt-1 font-montserrat text-2xl font-black uppercase text-white">{editing ? "Editar cupom" : "Criar cupom"}</h2></div><button type="button" onClick={() => setEditorOpen(false)} className="rounded p-2 text-silver hover:bg-black hover:text-white"><X /></button></div>
          {message && <p className="mt-5 rounded border border-red-400/40 bg-red-400/10 p-3 text-sm text-white">{message}</p>}
          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <label className="text-sm text-silver">Codigo *<input required minLength={3} maxLength={40} value={draft.code} onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value.toUpperCase().replace(/\s/g, "") }))} placeholder="EXEMPLO10" className={`mt-2 uppercase ${inputClass}`} /></label>
            <label className="text-sm text-silver">Desconto (%) *<input required type="number" min="1" max="100" value={draft.discountPercent} onChange={(event) => setDraft((current) => ({ ...current, discountPercent: event.target.value }))} className={`mt-2 ${inputClass}`} /></label>
            <label className="text-sm text-silver">Inicio *<input required type="datetime-local" value={draft.startsAt} onChange={(event) => setDraft((current) => ({ ...current, startsAt: event.target.value }))} className={`mt-2 ${inputClass}`} /></label>
            <label className="text-sm text-silver">Fim *<input required type="datetime-local" value={draft.endsAt} onChange={(event) => setDraft((current) => ({ ...current, endsAt: event.target.value }))} className={`mt-2 ${inputClass}`} /></label>
            <label className="text-sm text-silver md:col-span-2">Categoria aplicavel<select value={draft.categoryId} onChange={(event) => setDraft((current) => ({ ...current, categoryId: event.target.value }))} className={`mt-2 ${inputClass}`}><option value="">Todas as categorias</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
            <label className="flex items-center gap-3 text-sm text-white md:col-span-2"><input type="checkbox" checked={draft.active} onChange={(event) => setDraft((current) => ({ ...current, active: event.target.checked }))} className="h-4 w-4 accent-neon-blue" /> Cupom ativo</label>
          </div>
          <div className="mt-8 flex justify-end gap-3 border-t border-border pt-5"><button type="button" onClick={() => setEditorOpen(false)} className="rounded border border-border px-5 py-3 font-bold uppercase text-white hover:border-white">Cancelar</button><button disabled={saving} className="rounded bg-neon-blue px-5 py-3 font-bold uppercase text-black hover:bg-white disabled:opacity-50">{saving ? "Salvando..." : "Salvar cupom"}</button></div>
        </form>
      </div>}
    </section>
  );
}
