import Link from "next/link";
import { redirect } from "next/navigation";

import SiteShell from "@/templates/layout/SiteShell";
import { readSessionFromCookies } from "@/server/auth/session";
import { env } from "@/server/config/env";
import { prisma } from "@/server/database/client";
import { getStripeReadiness } from "@/server/services/payment";
import { getEmailReadiness } from "@/server/services/email";
import { isMelhorEnvioConfigured } from "@/server/services/melhor-envio";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await readSessionFromCookies();

  if (!session || session.role !== "ADMIN") {
    redirect("/login");
  }

  const [users, products, orders, categories, coupons] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.category.count(),
    prisma.coupon.count(),
  ]);
  const payment = getStripeReadiness();
  const email = getEmailReadiness();
  const shippingReady = isMelhorEnvioConfigured();

  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto px-4 md:px-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
            Backoffice
          </p>
          <h1 className="mb-8 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Painel admin
          </h1>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {[
              { label: "Usuarios", value: users },
              { label: "Produtos", value: products },
              { label: "Pedidos", value: orders },
              { label: "Categorias", value: categories },
              { label: "Cupons", value: coupons },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-border bg-dark-blue p-6">
                <p className="text-sm uppercase tracking-wide text-silver">{item.label}</p>
                <p className="mt-3 font-montserrat text-4xl font-black text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            <div className={`rounded-lg border p-6 ${payment.ready ? "border-emerald-500/50 bg-emerald-500/10" : "border-amber-500/50 bg-amber-500/10"}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-white">Stripe</p>
                  <p className="mt-2 text-sm text-silver">{payment.ready ? `Configurado em modo ${env.stripeLiveMode ? "producao" : "teste"}.` : "Configuração pendente. O checkout permanece bloqueado."}</p>
                </div>
                <span className={`rounded px-3 py-2 text-xs font-bold uppercase ${payment.ready ? "bg-emerald-400 text-black" : "bg-amber-400 text-black"}`}>{payment.ready ? "Pronto" : "Pendente"}</span>
              </div>
              <p className="mt-3 break-all text-xs text-silver">Webhook: {env.appUrl}/api/payments/stripe/webhook</p>
            </div>
            <div className={`rounded-lg border p-6 ${shippingReady ? "border-emerald-500/50 bg-emerald-500/10" : "border-amber-500/50 bg-amber-500/10"}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-white">Melhor Envio</p>
                  <p className="mt-2 text-sm text-silver">{shippingReady ? `Configurado em modo ${env.melhorEnvioSandbox ? "sandbox" : "produção"}.` : "Token ou CEP de origem pendente."}</p>
                </div>
                <span className={`rounded px-3 py-2 text-xs font-bold uppercase ${shippingReady ? "bg-emerald-400 text-black" : "bg-amber-400 text-black"}`}>{shippingReady ? "Pronto" : "Pendente"}</span>
              </div>
            </div>
            <div className={`rounded-lg border p-6 ${email.ready ? "border-emerald-500/50 bg-emerald-500/10" : "border-amber-500/50 bg-amber-500/10"}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-white">E-mails</p>
                  <p className="mt-2 text-sm text-silver">{email.ready ? "Resend e remetente configurados." : `Pendente: ${email.missing.join(", ")}.`}</p>
                </div>
                <span className={`rounded px-3 py-2 text-xs font-bold uppercase ${email.ready ? "bg-emerald-400 text-black" : "bg-amber-400 text-black"}`}>{email.ready ? "Pronto" : "Pendente"}</span>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-7">
            <Link href="/admin/financeiro" className="rounded border border-neon-blue bg-neon-blue/10 p-5 text-white hover:bg-neon-blue hover:text-black">
              Pagamentos e Stripe
            </Link>
            <Link href="/admin/produtos" className="rounded border border-border bg-dark-blue p-5 text-white hover:border-neon-blue">
              Gerenciar produtos e categorias
            </Link>
            <Link href="/admin/pedidos" className="rounded border border-border bg-dark-blue p-5 text-white hover:border-neon-blue">
              Gerenciar pedidos e envios
            </Link>
            <Link href="/admin/cupons" className="rounded border border-border bg-dark-blue p-5 text-white hover:border-neon-blue">
              Gerenciar cupons e descontos
            </Link>
            <Link href="/admin/inventario" className="rounded border border-border bg-dark-blue p-5 text-white hover:border-neon-blue">
              Inventario, entradas, saidas e logs
            </Link>
            <Link href="/minha-conta" className="rounded border border-border bg-dark-blue p-5 text-white hover:border-neon-blue">
              Area do cliente
            </Link>
            <Link href="/admin/atendimento" className="rounded border border-border bg-dark-blue p-5 text-white hover:border-neon-blue">
              Contatos e newsletter
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
