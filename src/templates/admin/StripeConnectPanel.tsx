"use client";

import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

type StripeStatus = { storeName: string; connected: boolean; chargesEnabled: boolean; payoutsEnabled: boolean; detailsSubmitted: boolean; onboardingCompleted: boolean; status: string; requirements: string[]; commissionPercentage: number };

export default function StripeConnectPanel() {
  const [data, setData] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    const response = await fetch("/api/stripe/connect/status", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) setError(payload.error ?? "Nao foi possivel consultar a Stripe"); else setData(payload);
    setLoading(false);
  }, []);
  useEffect(() => {
    let active = true;
    fetch("/api/stripe/connect/status", { cache: "no-store" })
      .then(async (response) => ({ ok: response.ok, payload: await response.json() }))
      .then(({ ok, payload }) => { if (active) { if (ok) setData(payload); else setError(payload.error ?? "Nao foi possivel consultar a Stripe"); } })
      .catch(() => { if (active) setError("Nao foi possivel consultar a Stripe"); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  async function connect() {
    setLoading(true); setError("");
    const response = await fetch("/api/stripe/connect/account", { method: "POST" });
    const payload = await response.json();
    if (response.ok && payload.url) window.location.assign(payload.url); else { setError(payload.error ?? "Nao foi possivel abrir a Stripe"); setLoading(false); }
  }
  const labels: Record<string, string> = { NOT_CONNECTED: "Nao conectado", ONBOARDING_INCOMPLETE: "Cadastro incompleto", PENDING_REVIEW: "Em analise", RESTRICTED: "Com pendencias", ACTIVE: "Ativo", SUSPENDED: "Suspenso" };
  return <section className="min-h-screen bg-black py-12"><div className="container mx-auto max-w-4xl px-4 md:px-6">
    <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-bold uppercase text-silver hover:text-neon-blue"><ArrowLeft size={17} /> Painel</Link>
    <p className="mt-8 text-sm font-bold uppercase text-neon-blue">Financeiro</p><h1 className="mt-2 font-montserrat text-4xl font-black uppercase text-white">Pagamentos e Stripe</h1>
    {error && <p className="mt-6 rounded border border-red-500/50 bg-red-500/10 p-4 text-red-200">{error}</p>}
    <div className="mt-8 rounded-lg border border-border bg-dark-blue p-6">
      {loading && !data ? <p className="text-silver">Consultando status seguro...</p> : data && <>
        <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-bold text-white">{data.storeName}</h2><p className="mt-2 text-silver">{labels[data.status] ?? data.status}</p></div><span className={`rounded px-3 py-2 text-xs font-bold uppercase ${data.status === "ACTIVE" ? "bg-emerald-400 text-black" : "bg-amber-400 text-black"}`}>{data.status === "ACTIVE" ? "Conta conectada" : labels[data.status] ?? data.status}</span></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">{[["Pagamentos", data.chargesEnabled], ["Repasses", data.payoutsEnabled], ["Dados enviados", data.detailsSubmitted]].map(([label, enabled]) => <div key={String(label)} className="rounded border border-border bg-black p-4"><p className="text-sm text-silver">{label}</p><p className={enabled ? "mt-2 font-bold text-emerald-300" : "mt-2 font-bold text-amber-300"}>{enabled ? "Habilitado" : "Pendente"}</p></div>)}</div>
        <p className="mt-6 text-sm text-silver">Comissao da plataforma: <strong className="text-white">{data.commissionPercentage}%</strong></p>
        {data.requirements.length > 0 && <p className="mt-4 rounded border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-100">A Stripe solicitou informacoes adicionais. Continue a configuracao para atualizar os dados.</p>}
        <div className="mt-6 flex flex-wrap gap-3"><button type="button" onClick={() => void connect()} disabled={loading} className="inline-flex items-center gap-2 rounded bg-neon-blue px-5 py-3 font-bold uppercase text-black hover:bg-white disabled:opacity-50"><ExternalLink size={17} />{data.connected ? "Atualizar dados na Stripe" : "Conectar Stripe"}</button><button type="button" onClick={() => void load()} disabled={loading} className="inline-flex items-center gap-2 rounded border border-border px-5 py-3 font-bold uppercase text-white hover:border-neon-blue disabled:opacity-50"><RefreshCw size={17} /> Atualizar status</button></div>
      </>}
    </div>
  </div></section>;
}
