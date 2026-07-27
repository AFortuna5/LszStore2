"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { formatCurrency, getProductPrice, type StorefrontProduct } from "@/shared/storefront";
import CouponBox, { type AppliedCoupon } from "@/templates/cart/CouponBox";

type CartItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [catalog, setCatalog] = useState<StorefrontProduct[]>([]);
  const [coupon, setCoupon] = useState<AppliedCoupon | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("lsz-cart");
    queueMicrotask(() => setItems(stored ? JSON.parse(stored) : []));
    fetch("/api/products?limit=100")
      .then((response) => response.json())
      .then((data) => setCatalog(Array.isArray(data) ? data : []))
      .catch(() => setCatalog([]));
  }, []);

  const cartProducts = useMemo(
    () =>
      items
        .map((item) => {
          const product = catalog.find((entry) => entry.id === item.productId);
          const variant = product?.variants.find((entry) => entry.id === item.variantId);
          return product ? { ...item, product, variant } : null;
        })
        .filter(Boolean) as Array<CartItem & { product: StorefrontProduct; variant?: StorefrontProduct["variants"][number] }>,
    [catalog, items]
  );

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + (item.variant?.price ?? getProductPrice(item.product)) * item.quantity,
    0
  );
  const couponItems = useMemo(() => cartProducts.map((item) => ({ productId: item.productId, variantId: item.variantId, quantity: item.quantity })), [cartProducts]);
  const discount = coupon?.discountAmount ?? 0;
  const total = Math.max(0, subtotal - discount);
  const hasStockIssues = cartProducts.some((item) => {
    const available = item.variant?.inventory ?? item.product.inventory;
    return available < item.quantity;
  });

  function persist(next: CartItem[]) {
    setItems(next);
    window.localStorage.setItem("lsz-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("lsz-cart-updated"));
  }

  function updateQuantity(productId: string, variantId: string | null | undefined, quantity: number) {
    if (quantity <= 0) {
      persist(items.filter((item) => !(item.productId === productId && (item.variantId ?? null) === (variantId ?? null))));
      return;
    }

    persist(
      items.map((item) =>
        item.productId === productId && (item.variantId ?? null) === (variantId ?? null) ? { ...item, quantity } : item
      )
    );
  }

  if (cartProducts.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-dark-blue p-10 text-center">
        <h2 className="font-montserrat text-2xl font-bold uppercase text-white">
          Seu carrinho esta vazio
        </h2>
        <p className="mx-auto mt-3 max-w-md text-silver">
          Escolha suas pecas favoritas e volte aqui para finalizar a compra.
        </p>
        <Link
          href="/produtos"
          className="mt-6 inline-flex rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white"
        >
          Ver produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-4">
        {cartProducts.map(({ product, variant, variantId, quantity }) => {
          const available = variant?.inventory ?? product.inventory;
          const hasStockIssue = available < quantity;
          return (
          <div
            key={`${product.id}:${variantId ?? "default"}`}
            className="grid gap-4 rounded-lg border border-border bg-dark-blue p-4 sm:grid-cols-[120px_1fr_auto]"
          >
            <Link
              href={`/produto/${product.slug}`}
              className="relative aspect-square overflow-hidden rounded bg-black"
            >
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="120px"
              />
            </Link>
            <div>
              <p className="text-xs uppercase tracking-wide text-silver">
                {product.brand}
              </p>
              <Link
                href={`/produto/${product.slug}`}
                className="font-poppins text-lg font-semibold text-white hover:text-neon-blue"
              >
                {product.name}
              </Link>
              <p className="mt-2 text-sm text-silver">{product.category}</p>
              {variant && <p className="mt-1 text-sm text-neon-blue">{variant.label}</p>}
              <p className="mt-3 font-montserrat text-xl font-bold text-white">
                {formatCurrency(variant?.price ?? getProductPrice(product))}
              </p>
              <p className={`mt-2 text-sm font-semibold ${hasStockIssue ? "text-red-400" : "text-emerald-400"}`}>
                {available === 0
                  ? "Produto esgotado — remova para continuar"
                  : hasStockIssue
                    ? `Somente ${available} unidade(s) disponivel(is)`
                    : `${available} unidade(s) disponivel(is)`}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:justify-between">
              <div className="flex h-10 items-center rounded border border-border bg-black">
                <button
                  type="button"
                onClick={() => updateQuantity(product.id, variantId, quantity - 1)}
                  className="grid h-10 w-10 place-items-center text-silver hover:text-white"
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= available}
                  onClick={() => updateQuantity(product.id, variantId, quantity + 1)}
                  className="grid h-10 w-10 place-items-center text-silver hover:text-white"
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, variantId, 0)}
                className="grid h-10 w-10 place-items-center rounded border border-border text-silver hover:border-neon-blue hover:text-neon-blue"
                aria-label="Remover item"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
          );
        })}
      </div>
      <aside className="h-fit rounded-lg border border-border bg-dark-blue p-6">
        <h2 className="font-montserrat text-xl font-bold uppercase text-white">
          Resumo
        </h2>
        <div className="mt-5"><CouponBox items={couponItems} onChange={setCoupon} /></div>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between text-silver">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {coupon && <div className="flex justify-between text-emerald-300"><span>Cupom {coupon.code}</span><span>-{formatCurrency(discount)}</span></div>}
          <div className="flex justify-between text-silver">
            <span>Frete</span>
            <span>Calculado no checkout</span>
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex justify-between font-montserrat text-2xl font-bold text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        {hasStockIssues ? (
          <p className="mt-6 rounded border border-red-500 bg-red-950/40 p-4 text-sm text-red-200">
            Remova os produtos esgotados ou reduza as quantidades para finalizar a compra.
          </p>
        ) : (
          <Link
            href="/checkout"
            className="mt-6 flex w-full justify-center rounded bg-neon-blue px-6 py-4 font-bold uppercase text-black hover:bg-white"
          >
            Finalizar compra
          </Link>
        )}
      </aside>
    </div>
  );
}
