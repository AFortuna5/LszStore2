"use client";

import { ShoppingCart } from "lucide-react";

import { getProductPrice, StoreProduct } from "@/lib/store-data";

type CartItem = {
  productId: number;
  quantity: number;
};

export default function AddToCartButton({
  product,
  className = "",
}: {
  product: StoreProduct;
  className?: string;
}) {
  function addToCart() {
    const stored = window.localStorage.getItem("lsz-cart");
    const current: CartItem[] = stored ? JSON.parse(stored) : [];
    const existing = current.find((item) => item.productId === product.id);

    const next = existing
      ? current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...current, { productId: product.id, quantity: 1 }];

    window.localStorage.setItem("lsz-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("lsz-cart-updated"));
  }

  return (
    <button
      type="button"
      onClick={addToCart}
      className={`inline-flex items-center justify-center gap-2 rounded bg-neon-blue px-5 py-3 font-inter text-sm font-bold uppercase tracking-wide text-black transition-colors hover:bg-white ${className}`}
      aria-label={`Adicionar ${product.name} ao carrinho por ${getProductPrice(product)}`}
    >
      <ShoppingCart size={18} />
      Adicionar
    </button>
  );
}
