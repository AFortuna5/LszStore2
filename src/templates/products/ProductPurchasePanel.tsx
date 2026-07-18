"use client";

import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { formatCurrency, getProductPrice, type StorefrontProduct } from "@/shared/storefront";

type CartItem = { productId: string; variantId?: string | null; quantity: number };
export default function ProductPurchasePanel({ product }: { product: StorefrontProduct }) {
  const router = useRouter();
  const initial = product.variants.find((variant) => variant.isDefault && variant.inventory > 0) ?? product.variants.find((variant) => variant.inventory > 0);
  const [variantId, setVariantId] = useState(initial?.id ?? "");
  const selected = useMemo(() => product.variants.find((variant) => variant.id === variantId), [product.variants, variantId]);
  const available = selected ? selected.inventory > 0 : product.inventory > 0;
  const price = selected?.price ?? getProductPrice(product);
  function add(goToCheckout = false) {
    if (!available) return;
    const stored = window.localStorage.getItem("lsz-cart");
    const current: CartItem[] = stored ? JSON.parse(stored) : [];
    const targetVariant = selected?.id ?? null;
    const existingIndex = current.findIndex((item) => item.productId === product.id && (item.variantId ?? null) === targetVariant);
    const next = existingIndex >= 0 ? current.map((item, index) => index === existingIndex ? { ...item, quantity: item.quantity + 1 } : item) : [...current, { productId: product.id, variantId: targetVariant, quantity: 1 }];
    window.localStorage.setItem("lsz-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("lsz-cart-updated"));
    if (goToCheckout) router.push("/checkout");
  }
  return <div className="mt-6"><div className="flex items-end gap-3">{product.promoPrice && <span className="text-lg text-silver line-through">{formatCurrency(product.price)}</span>}<span className="font-montserrat text-4xl font-black text-white">{formatCurrency(price)}</span></div>{product.variants.length > 0 && <div className="mt-6"><p className="mb-3 text-sm font-bold uppercase text-white">Escolha a variacao</p><div className="flex flex-wrap gap-2">{product.variants.map((variant) => <button key={variant.id} type="button" disabled={variant.inventory <= 0} onClick={() => setVariantId(variant.id)} className={`rounded border px-4 py-2 text-sm ${variant.id === variantId ? "border-neon-blue bg-neon-blue text-black" : "border-border text-silver"} disabled:cursor-not-allowed disabled:opacity-40`}>{variant.label}</button>)}</div></div>}<p className={`mt-4 text-sm ${available ? "text-emerald-400" : "text-red-400"}`}>{available ? `${selected?.inventory ?? product.inventory} unidade(s) disponivel(is)` : "Produto indisponivel"}</p><div className="mt-6 flex flex-col gap-3 sm:flex-row"><button type="button" disabled={!available} onClick={() => add(false)} className="inline-flex items-center justify-center gap-2 rounded bg-neon-blue px-5 py-4 font-bold uppercase text-black hover:bg-white disabled:opacity-50 sm:flex-1"><ShoppingCart size={18} /> Adicionar</button><button type="button" disabled={!available} onClick={() => add(true)} className="rounded border border-silver px-6 py-4 font-bold uppercase text-white hover:border-neon-blue hover:text-neon-blue disabled:opacity-50 sm:flex-1">Comprar agora</button></div></div>;
}
