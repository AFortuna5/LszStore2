import { redirect } from "next/navigation";

import { readSessionFromCookies } from "@/server/auth/session";
import { prisma } from "@/server/database/client";
import { moneyToNumber } from "@/server/money";
import SiteShell from "@/templates/layout/SiteShell";
import StripeConnectPanel from "@/templates/admin/StripeConnectPanel";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const session = await readSessionFromCookies();
  if (!session) redirect("/login");
  const managedStore = session.role === "ADMIN" ? true : Boolean(await prisma.store.findFirst({ where: { OR: [{ ownerId: session.id }, { members: { some: { userId: session.id, role: { in: ["OWNER", "ADMIN"] } } } }] }, select: { id: true } }));
  if (!managedStore) redirect("/minha-conta");
  const storeWhere = session.role === "ADMIN" ? {} : { OR: [{ ownerId: session.id }, { members: { some: { userId: session.id } } }] };
  const [stores, paid, failed, refunded, disputed] = await Promise.all([
    prisma.store.findMany({ where: storeWhere, include: { _count: { select: { orders: true } }, orders: { where: { paymentStatus: "APPROVED" }, select: { total: true, platformFeeAmount: true } } }, orderBy: { createdAt: "asc" } }),
    prisma.order.count({ where: { paymentStatus: "APPROVED", store: storeWhere } }),
    prisma.order.count({ where: { paymentStatus: { in: ["FAILED", "EXPIRED", "ERROR"] }, store: storeWhere } }),
    prisma.order.count({ where: { paymentStatus: "REFUNDED", store: storeWhere } }),
    prisma.order.count({ where: { paymentStatus: { in: ["DISPUTED", "DISPUTE_LOST", "DISPUTE_WON"] }, store: storeWhere } }),
  ]);
  const totalSold = stores.flatMap((store) => store.orders).reduce((sum, order) => sum + moneyToNumber(order.total), 0);
  const totalFees = stores.flatMap((store) => store.orders).reduce((sum, order) => sum + order.platformFeeAmount, 0);
  return <SiteShell><StripeConnectPanel /><section className="bg-black pb-16"><div className="container mx-auto max-w-4xl px-4 md:px-6">
    <h2 className="font-montserrat text-2xl font-black uppercase text-white">Visao da plataforma</h2>
    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Vendido", `R$ ${totalSold.toFixed(2)}`], ["Comissoes", `R$ ${(totalFees / 100).toFixed(2)}`], ["Pedidos pagos", paid], ["Falhos / expirados", failed], ["Reembolsos", refunded], ["Disputas", disputed]].map(([label, value]) => <div key={String(label)} className="rounded border border-border bg-dark-blue p-4"><p className="text-xs uppercase text-silver">{label}</p><p className="mt-2 text-xl font-bold text-white">{value}</p></div>)}</div>
    <div className="mt-8 overflow-x-auto"><table className="w-full text-left text-sm"><thead className="text-silver"><tr><th className="p-3">Loja</th><th>Status</th><th>Pagamentos</th><th>Repasses</th><th>Pedidos</th></tr></thead><tbody>{stores.map((store) => <tr key={store.id} className="border-t border-border"><td className="p-3 text-white">{store.name}</td><td>{store.stripeAccountStatus}</td><td>{store.stripeChargesEnabled ? "Ativo" : "Bloqueado"}</td><td>{store.stripePayoutsEnabled ? "Ativo" : "Pendente"}</td><td>{store._count.orders}</td></tr>)}</tbody></table></div>
  </div></section></SiteShell>;
}
