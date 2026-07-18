"use client";

import { ShoppingCart } from "lucide-react";

import { getProductPrice, StorefrontProduct } from "@/shared/storefront";

type CartItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

export default function AddToCartButton({
  product,
  className = "",
}: {
  product: StorefrontProduct;
  className?: string;
}) {
  function addToCart() {
    const stored = window.localStorage.getItem("lsz-cart");
    const current: CartItem[] = stored ? JSON.parse(stored) : [];
    const variantId = product.variants.find((variant) => variant.isDefault)?.id ?? product.variants[0]?.id ?? null;
    const existing = current.find((item) => item.productId === product.id && (item.variantId ?? null) === variantId);

    const next = existing
      ? current.map((item) =>
          item.productId === product.id && (item.variantId ?? null) === variantId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      : [...current, { productId: product.id, variantId, quantity: 1 }];

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
