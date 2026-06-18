import Link from "next/link";
import { CreditCard, LockKeyhole, Truck } from "lucide-react";

import SiteShell from "@/components/layout/SiteShell";

export default function CheckoutPage() {
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
            <form className="space-y-6 rounded-lg border border-border bg-dark-blue p-6">
              <div>
                <h2 className="mb-4 font-montserrat text-xl font-bold uppercase text-white">
                  Dados de entrega
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <input className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Nome completo" />
                  <input className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Telefone" />
                  <input className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue md:col-span-2" placeholder="E-mail" />
                  <input className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="CEP" />
                  <input className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Cidade/UF" />
                  <input className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue md:col-span-2" placeholder="Endereco" />
                </div>
              </div>
              <div>
                <h2 className="mb-4 font-montserrat text-xl font-bold uppercase text-white">
                  Pagamento
                </h2>
                <div className="grid gap-3 md:grid-cols-3">
                  {["Pix", "Cartao", "Boleto"].map((method) => (
                    <label
                      key={method}
                      className="flex cursor-pointer items-center gap-3 rounded border border-border bg-black p-4 text-silver has-[:checked]:border-neon-blue has-[:checked]:text-white"
                    >
                      <input type="radio" name="payment" className="accent-neon-blue" />
                      {method}
                    </label>
                  ))}
                </div>
              </div>
              <button
                type="button"
                className="w-full rounded bg-neon-blue px-6 py-4 font-bold uppercase text-black transition-colors hover:bg-white"
              >
                Confirmar pedido
              </button>
            </form>
            <aside className="h-fit rounded-lg border border-border bg-dark-blue p-6">
              <h2 className="font-montserrat text-xl font-bold uppercase text-white">
                Proximo passo
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-silver">
                Esta tela ja esta pronta visualmente. A integracao final pode
                enviar os dados para `/api/checkout` quando o carrinho estiver
                conectado ao usuario.
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
