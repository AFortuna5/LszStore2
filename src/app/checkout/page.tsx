"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CreditCard, LockKeyhole, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import SiteShell from "@/templates/layout/SiteShell";
import { formatCurrency, getProductPrice, type StorefrontProduct } from "@/shared/storefront";

type CartItem = {
  productId: string;
  variantId?: string | null;
  quantity: number;
};

type SessionUser = {
  id: string;
  name: string;
  email: string;
};

type ShippingQuote = { id: string; name: string; company: string; price: number; deliveryDays: number };

export default function CheckoutPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [catalog, setCatalog] = useState<StorefrontProduct[]>([]);
  const [items, setItems] = useState<CartItem[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState<ShippingQuote[]>([]);
  const [selectedShipping, setSelectedShipping] = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setUser(payload?.user ?? null))
      .catch(() => setUser(null));

    fetch("/api/products?limit=100")
      .then((response) => response.json())
      .then((data) => setCatalog(Array.isArray(data) ? data : []))
      .catch(() => setCatalog([]));

    const stored = window.localStorage.getItem("lsz-cart");
    queueMicrotask(() => setItems(stored ? JSON.parse(stored) : []));
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
  const selectedQuote = quotes.find((quote) => quote.id === selectedShipping);
  const shipping = selectedQuote?.price ?? 0;
  const total = subtotal + shipping;

  async function handleSubmit(formData: FormData) {
    if (!user) {
      setStatus("Entre na sua conta antes de finalizar a compra.");
      return;
    }
    if (!selectedQuote) {
      setStatus("Calcule e selecione uma opcao de frete.");
      return;
    }

    setLoading(true);
    setStatus("");

    const response = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        items: cartProducts.map((item) => ({
          productId: item.product.id,
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        address: {
          fullName: formData.get("fullName"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          zipCode: formData.get("zipCode"),
          street: formData.get("street"),
          number: formData.get("number"),
          neighborhood: formData.get("neighborhood"),
          city: formData.get("city"),
          state: formData.get("state"),
          complement: formData.get("complement"),
        },
        paymentMethod: "MERCADO_PAGO",
        shippingServiceId: selectedQuote.id,
      }),
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setStatus(payload.error ?? "Nao foi possivel criar o pedido");
      return;
    }

    window.localStorage.removeItem("lsz-cart");
    window.dispatchEvent(new Event("lsz-cart-updated"));
    setStatus("Pedido criado com sucesso.");
    if (payload.paymentUrl) {
      window.location.assign(payload.paymentUrl);
      return;
    }
    router.push(`/minha-conta`);
    router.refresh();
  }

  async function calculateShipping(zipCode: string, form?: HTMLFormElement) {
    const zip = zipCode.replace(/\D/g, "");
    if (zip.length !== 8 || !items.length) return;
    setShippingLoading(true);
    setStatus("");
    if (form) {
      const cepResponse = await fetch(`/api/address/cep/${zip}`);
      if (cepResponse.ok) {
        const address = await cepResponse.json();
        for (const field of ["street", "neighborhood", "city", "state"] as const) {
          const input = form.elements.namedItem(field) as HTMLInputElement | null;
          if (input && address[field]) input.value = address[field];
        }
      }
    }
    const response = await fetch("/api/shipping/quote", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zipCode: zip, items }),
    });
    const payload = await response.json();
    setShippingLoading(false);
    if (!response.ok) { setStatus(payload.error ?? "Nao foi possivel calcular o frete"); return; }
    setQuotes(payload.quotes);
    setSelectedShipping(payload.quotes[0]?.id ?? "");
  }

  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto px-4 md:px-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
            Compra segura
          </p>
          <h1 className="mb-8 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Checkout
          </h1>
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <form action={handleSubmit} className="space-y-6 rounded-lg border border-border bg-dark-blue p-6">
              <div>
                <h2 className="mb-4 font-montserrat text-xl font-bold uppercase text-white">
                  Dados de entrega
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <input required name="fullName" defaultValue={user?.name} className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Nome completo" />
                  <input required name="phone" className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Telefone" />
                  <input required type="email" name="email" defaultValue={user?.email} className="md:col-span-2 rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="E-mail" />
                  <input required name="zipCode" onBlur={(event) => void calculateShipping(event.target.value, event.currentTarget.form ?? undefined)} className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="CEP" />
                  <input required name="city" className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Cidade" />
                  <input required maxLength={2} name="state" className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="UF" />
                  <input required name="street" className="md:col-span-2 rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Endereco" />
                  <input required name="number" className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Numero" />
                  <input required name="neighborhood" className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Bairro" />
                  <input name="complement" className="md:col-span-2 rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Complemento" />
                </div>
              </div>
              <div>
                <h2 className="mb-4 font-montserrat text-xl font-bold uppercase text-white">
                  Entrega
                </h2>
                <div className="grid gap-3">
                  {shippingLoading && <p className="text-sm text-silver">Calculando frete...</p>}
                  {quotes.map((quote) => (
                    <label
                      key={quote.id}
                      className="flex cursor-pointer items-center gap-3 rounded border border-border bg-black p-4 text-silver has-[:checked]:border-neon-blue has-[:checked]:text-white"
                    >
                      <input type="radio" name="shipping" value={quote.id} checked={selectedShipping === quote.id} onChange={() => setSelectedShipping(quote.id)} className="accent-neon-blue" />
                      <span className="flex-1">{quote.company} · {quote.name}<small className="block text-silver">Ate {quote.deliveryDays} dias uteis</small></span>
                      <strong>{quote.price === 0 ? "Gratis" : formatCurrency(quote.price)}</strong>
                    </label>
                  ))}
                </div>
              </div>
              <div className="rounded border border-border bg-black p-4 text-sm text-silver"><strong className="text-white">Pagamento seguro pelo Mercado Pago</strong><p className="mt-1">Pix, cartao e boleto sao escolhidos no ambiente protegido do provedor.</p></div>
              <button
                type="submit"
                disabled={loading || cartProducts.length === 0}
                className="w-full rounded bg-neon-blue px-6 py-4 font-bold uppercase text-black transition-colors hover:bg-white disabled:opacity-50"
              >
                Confirmar pedido
              </button>
              {status && <p className="text-sm text-neon-blue">{status}</p>}
            </form>
            <aside className="h-fit rounded-lg border border-border bg-dark-blue p-6">
              <h2 className="font-montserrat text-xl font-bold uppercase text-white">
                Resumo do pedido
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-silver">
                Precos e frete sao recalculados com seguranca no servidor antes da criacao do pedido.
              </p>
              <div className="mt-6 space-y-4">
                <div className="flex gap-3 text-silver">
                  <LockKeyhole className="text-neon-blue" size={20} />
                  Ambiente de compra seguro
                </div>
                <div className="flex gap-3 text-silver">
                  <Truck className="text-neon-blue" size={20} />
                  Frete para todo Brasil
                </div>
                <div className="flex gap-3 text-silver">
                  <CreditCard className="text-neon-blue" size={20} />
                  Pix, cartao ou boleto
                </div>
              </div>
              <div className="mt-6 space-y-3 text-sm text-silver">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete</span>
                  <span>{shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 font-bold text-white">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              <Link
                href="/carrinho"
                className="mt-6 inline-flex text-sm font-bold uppercase text-neon-blue hover:text-white"
              >
                Voltar ao carrinho
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
