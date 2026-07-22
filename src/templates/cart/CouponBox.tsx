"use client";

import { Check, TicketPercent, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { formatCurrency } from "@/shared/storefront";

export type AppliedCoupon = {
  code: string;
  discountPercent: number;
  discountAmount: number;
  eligibleSubtotal: number;
  category: { id: string; name: string; slug: string } | null;
};

type CouponItem = { productId: string; variantId?: string | null; quantity: number };

export default function CouponBox({ items, onChange }: { items: CouponItem[]; onChange: (coupon: AppliedCoupon | null) => void }) {
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<AppliedCoupon | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = useCallback(async (requestedCode: string, silent = false) => {
    const normalized = requestedCode.trim().toUpperCase();
    if (!normalized || items.length === 0) return;
    setLoading(true);
    if (!silent) setMessage("");
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: normalized, items }),
      });
      const result = await response.json();
      if (!response.ok) {
        setApplied(null);
        onChange(null);
        window.localStorage.removeItem("lsz-coupon");
        setMessage(result.error ?? "Cupom invalido");
        return;
      }
      const coupon = result as AppliedCoupon;
      setCode(coupon.code);
      setApplied(coupon);
      onChange(coupon);
      window.localStorage.setItem("lsz-coupon", coupon.code);
      setMessage("");
    } catch {
      if (!silent) setMessage("Nao foi possivel validar o cupom");
    } finally {
      setLoading(false);
    }
  }, [items, onChange]);

  useEffect(() => {
    const storedCode = window.localStorage.getItem("lsz-coupon");
    if (storedCode) queueMicrotask(() => { void validate(storedCode, true); });
  }, [validate]);

  function removeCoupon() {
    setApplied(null);
    setCode("");
    setMessage("");
    onChange(null);
    window.localStorage.removeItem("lsz-coupon");
  }

  return (
    <div className="rounded border border-border bg-black p-4">
      <p className="flex items-center gap-2 text-sm font-bold uppercase text-white"><TicketPercent size={18} className="text-neon-blue" /> Cupom de desconto</p>
      {applied ? (
        <div className="mt-3 flex items-center justify-between gap-3 rounded border border-emerald-400/50 bg-emerald-400/10 p-3">
          <div><p className="flex items-center gap-2 font-bold text-white"><Check size={16} className="text-emerald-300" /> {applied.code}</p><p className="mt-1 text-xs text-silver">{applied.discountPercent}% OFF{applied.category ? ` em ${applied.category.name}` : ""} · -{formatCurrency(applied.discountAmount)}</p></div>
          <button type="button" onClick={removeCoupon} className="rounded p-1.5 text-silver hover:bg-black hover:text-white" aria-label="Remover cupom"><X size={17} /></button>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/\s/g, ""))} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void validate(code); } }} placeholder="DIGITE O CUPOM" className="min-w-0 flex-1 rounded border border-border bg-dark-blue px-3 py-2.5 text-sm uppercase text-white outline-none focus:border-neon-blue" />
          <button type="button" disabled={loading || !code.trim()} onClick={() => void validate(code)} className="rounded bg-neon-blue px-4 text-xs font-bold uppercase text-black hover:bg-white disabled:opacity-50">{loading ? "..." : "Aplicar"}</button>
        </div>
      )}
      {message && <p className="mt-2 text-xs text-red-300">{message}</p>}
    </div>
  );
}
