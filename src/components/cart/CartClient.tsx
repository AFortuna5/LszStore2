"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { formatCurrency, getProductPrice, products } from "@/lib/store-data";

type CartItem = {
  productId: number;
  quantity: number;
};

export default function CartClient() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const stored = window.localStorage.getItem("lsz-cart");
    setItems(stored ? JSON.parse(stored) : []);
  }, []);

  const cartProducts = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((entry) => entry.id === item.productId);
          return product ? { ...item, product } : null;
        })
        .filter(Boolean) as Array<CartItem & { product: (typeof products)[number] }>,
    [items]
  );

  const subtotal = cartProducts.reduce(
    (sum, item) => sum + getProductPrice(item.product) * item.quantity,
    0
  );
  const shipping = subtotal > 399 || subtotal === 0 ? 0 : 24.9;
  const total = subtotal + shipping;

  function persist(next: CartItem[]) {
    setItems(next);
    window.localStorage.setItem("lsz-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("lsz-cart-updated"));
  }

  function updateQuantity(productId: number, quantity: number) {
    if (quantity <= 0) {
      persist(items.filter((item) => item.productId !== productId));
      return;
    }

    persist(
      items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
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
        {cartProducts.map(({ product, quantity }) => (
          <div
            key={product.id}
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
              <p className="mt-3 font-montserrat text-xl font-bold text-white">
                {formatCurrency(getProductPrice(product))}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:justify-between">
              <div className="flex h-10 items-center rounded border border-border bg-black">
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity - 1)}
                  className="grid h-10 w-10 place-items-center text-silver hover:text-white"
                  aria-label="Diminuir quantidade"
                >
                  <Minus size={16} />
                </button>
                <span className="w-10 text-center font-bold">{quantity}</span>
                <button
                  type="button"
                  onClick={() => updateQuantity(product.id, quantity + 1)}
                  className="grid h-10 w-10 place-items-center text-silver hover:text-white"
                  aria-label="Aumentar quantidade"
                >
                  <Plus size={16} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => updateQuantity(product.id, 0)}
                className="grid h-10 w-10 place-items-center rounded border border-border text-silver hover:border-neon-blue hover:text-neon-blue"
                aria-label="Remover item"
              >
                <Trash2 size={17} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <aside className="h-fit rounded-lg border border-border bg-dark-blue p-6">
        <h2 className="font-montserrat text-xl font-bold uppercase text-white">
          Resumo
        </h2>
        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between text-silver">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-silver">
            <span>Frete</span>
            <span>{shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span>
          </div>
          <div className="border-t border-border pt-4">
            <div className="flex justify-between font-montserrat text-2xl font-bold text-white">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
        <Link
          href="/checkout"
          className="mt-6 flex w-full justify-center rounded bg-neon-blue px-6 py-4 font-bold uppercase text-black hover:bg-white"
        >
          Finalizar compra
        </Link>
      </aside>
    </div>
  );
}
