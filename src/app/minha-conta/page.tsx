"use client";

import { LogOut, MapPin, Package, Pencil, Plus, ShieldCheck, Trash2, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import SiteShell from "@/templates/layout/SiteShell";
import { formatCurrency } from "@/shared/storefront";

type Address = {
  id: string; fullName: string; phone: string; email: string; zipCode: string;
  street: string; number: string; neighborhood: string; city: string; state: string;
  complement: string | null;
};

type SessionData = {
  user: {
    id: string; name: string; email: string; role: string;
    orders: Array<{
      id: string; total: number; status: string; paymentStatus: string; createdAt: string;
      items: Array<{ quantity: number; price: number; product: { name: string } }>;
    }>;
    addresses: Address[];
  };
};

const inputClass = "w-full rounded border border-border bg-black px-4 py-3 text-white outline-none transition-colors focus:border-neon-blue";
const statusLabels: Record<string, string> = {
  PENDING: "Aguardando pagamento", PAID: "Pago", SHIPPED: "Enviado",
  DELIVERED: "Entregue", CANCELLED: "Cancelado",
};

export default function AccountPage() {
  const router = useRouter();
  const [data, setData] = useState<SessionData | null>(null);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");
  const [addressOpen, setAddressOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [payingOrder, setPayingOrder] = useState<string | null>(null);

  const loadAccount = useCallback(async () => {
    const response = await fetch("/api/auth/me", { cache: "no-store" });
    setData(response.ok ? await response.json() : null);
    setChecking(false);
  }, []);

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => setData(response.ok ? await response.json() : null))
      .catch(() => setData(null))
      .finally(() => setChecking(false));
  }, []);

  async function submitJson(url: string, method: string, body: unknown) {
    setMessage("");
    const response = await fetch(url, {
      method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
    });
    const payload = response.status === 204 ? null : await response.json();
    if (!response.ok) throw new Error(payload?.error ?? "Nao foi possivel concluir a operacao");
    return payload;
  }

  async function updateProfile(formData: FormData) {
    try {
      await submitJson("/api/account/profile", "PATCH", {
        name: formData.get("name"), email: formData.get("email"),
      });
      setMessage("Perfil atualizado com sucesso.");
      await loadAccount();
      router.refresh();
    } catch (error) { setMessage((error as Error).message); }
  }

  async function updatePassword(formData: FormData) {
    const newPassword = String(formData.get("newPassword") ?? "");
    if (newPassword !== formData.get("confirmPassword")) {
      setMessage("A confirmacao da nova senha nao confere.");
      return;
    }
    try {
      await submitJson("/api/account/password", "PATCH", {
        currentPassword: formData.get("currentPassword"), newPassword,
      });
      setMessage("Senha alterada com sucesso.");
    } catch (error) { setMessage((error as Error).message); }
  }

  async function saveAddress(formData: FormData) {
    const body = Object.fromEntries(formData.entries());
    try {
      await submitJson(
        editingAddress ? `/api/account/addresses/${editingAddress.id}` : "/api/account/addresses",
        editingAddress ? "PATCH" : "POST", body,
      );
      setMessage(editingAddress ? "Endereco atualizado." : "Endereco adicionado.");
      setAddressOpen(false);
      setEditingAddress(null);
      await loadAccount();
    } catch (error) { setMessage((error as Error).message); }
  }

  async function deleteAddress(id: string) {
    if (!window.confirm("Excluir este endereco?")) return;
    try {
      await submitJson(`/api/account/addresses/${id}`, "DELETE", null);
      setMessage("Endereco excluido.");
      await loadAccount();
    } catch (error) { setMessage((error as Error).message); }
  }

  async function logout() {
    await fetch("/api/users", { method: "DELETE" });
    window.dispatchEvent(new Event("lsz-auth-updated"));
    router.push("/login");
    router.refresh();
  }

  async function retryPayment(orderId: string) {
    setMessage("");
    setPayingOrder(orderId);
    try {
      const response = await fetch(`/api/orders/${orderId}/payment`, { method: "POST" });
      const payload = await response.json();
      if (!response.ok || !payload.paymentUrl) {
        throw new Error(payload.error ?? "Nao foi possivel iniciar o pagamento");
      }
      window.location.assign(payload.paymentUrl);
    } catch (error) {
      setMessage((error as Error).message);
      setPayingOrder(null);
    }
  }

  return (
    <SiteShell>
      <section className="min-h-[70vh] bg-black py-14">
        <div className="container mx-auto px-4 md:px-6">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">Minha LSZ</p>
              <h1 className="font-montserrat text-4xl font-black uppercase text-white md:text-5xl">Minha conta</h1>
            </div>
            {data && <div className="flex items-center gap-5">{data.user.role === "ADMIN" && <Link href="/admin" className="text-sm font-bold uppercase text-neon-blue hover:text-white">Painel admin</Link>}<button onClick={logout} className="flex items-center gap-2 text-sm font-bold uppercase text-silver hover:text-neon-blue"><LogOut size={18} /> Sair</button></div>}
          </div>

          {checking ? (
            <div className="rounded-lg border border-border bg-dark-blue p-6 text-silver">Carregando sua conta...</div>
          ) : !data ? (
            <div className="rounded-lg border border-border bg-dark-blue p-8 text-silver">
              Voce precisa <Link className="font-bold text-neon-blue" href="/login">entrar ou criar uma conta</Link> para acessar esta area.
            </div>
          ) : (
            <>
              {message && <div className="mb-6 rounded border border-neon-blue/40 bg-neon-blue/10 p-4 text-sm text-white">{message}</div>}
              <div className="grid gap-6 md:grid-cols-3">
                {[
                  { icon: User, title: "Perfil", text: data.user.name },
                  { icon: Package, title: "Pedidos", text: `${data.user.orders.length} pedido(s)` },
                  { icon: MapPin, title: "Enderecos", text: `${data.user.addresses.length} salvo(s)` },
                ].map((item) => (
                  <div key={item.title} className="rounded-lg border border-border bg-dark-blue p-6">
                    <item.icon className="mb-4 text-neon-blue" size={28} />
                    <h2 className="font-montserrat text-xl font-bold uppercase text-white">{item.title}</h2>
                    <p className="mt-2 text-silver">{item.text}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-6 xl:grid-cols-2">
                <form action={updateProfile} className="rounded-lg border border-border bg-dark-blue p-6">
                  <h2 className="mb-5 flex items-center gap-2 font-montserrat text-xl font-bold uppercase text-white"><User className="text-neon-blue" /> Dados pessoais</h2>
                  <div className="space-y-4">
                    <label className="block text-sm text-silver">Nome<input required name="name" defaultValue={data.user.name} className={`mt-2 ${inputClass}`} /></label>
                    <label className="block text-sm text-silver">E-mail<input required type="email" name="email" defaultValue={data.user.email} className={`mt-2 ${inputClass}`} /></label>
                    <button className="rounded bg-neon-blue px-5 py-3 font-bold uppercase text-black hover:bg-white">Salvar perfil</button>
                  </div>
                </form>

                <form action={updatePassword} className="rounded-lg border border-border bg-dark-blue p-6">
                  <h2 className="mb-5 flex items-center gap-2 font-montserrat text-xl font-bold uppercase text-white"><ShieldCheck className="text-neon-blue" /> Seguranca</h2>
                  <div className="space-y-4">
                    <input required type="password" name="currentPassword" placeholder="Senha atual" className={inputClass} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <input required minLength={8} type="password" name="newPassword" placeholder="Nova senha (8+ caracteres)" className={inputClass} />
                      <input required minLength={8} type="password" name="confirmPassword" placeholder="Confirmar nova senha" className={inputClass} />
                    </div>
                    <button className="rounded border border-neon-blue px-5 py-3 font-bold uppercase text-neon-blue hover:bg-neon-blue hover:text-black">Alterar senha</button>
                  </div>
                </form>
              </div>

              <div className="mt-8 rounded-lg border border-border bg-dark-blue p-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <h2 className="font-montserrat text-xl font-bold uppercase text-white">Meus enderecos</h2>
                  <button onClick={() => { setEditingAddress(null); setAddressOpen(true); }} className="flex items-center gap-2 rounded bg-neon-blue px-4 py-2 text-sm font-bold uppercase text-black hover:bg-white"><Plus size={18} /> Adicionar</button>
                </div>
                {data.user.addresses.length === 0 ? <p className="mt-5 text-silver">Nenhum endereco salvo.</p> : (
                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    {data.user.addresses.map((address) => (
                      <div key={address.id} className="rounded border border-border bg-black p-5 text-sm text-silver">
                        <p className="font-bold text-white">{address.fullName}</p>
                        <p className="mt-2">{address.street}, {address.number}{address.complement ? ` - ${address.complement}` : ""}</p>
                        <p>{address.neighborhood}, {address.city} - {address.state}</p><p>CEP {address.zipCode}</p>
                        <div className="mt-4 flex gap-4">
                          <button onClick={() => { setEditingAddress(address); setAddressOpen(true); }} className="flex items-center gap-1 text-neon-blue hover:text-white"><Pencil size={15} /> Editar</button>
                          <button onClick={() => deleteAddress(address.id)} className="flex items-center gap-1 text-red-400 hover:text-white"><Trash2 size={15} /> Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-8 rounded-lg border border-border bg-dark-blue p-6">
                <h2 className="font-montserrat text-xl font-bold uppercase text-white">Pedidos recentes</h2>
                {data.user.orders.length === 0 ? <p className="mt-5 text-silver">Nenhum pedido registrado.</p> : (
                  <div className="mt-5 space-y-4">
                    {data.user.orders.map((order) => (
                      <div key={order.id} className="grid gap-3 rounded border border-border bg-black p-5 sm:grid-cols-[1fr_auto]">
                        <div><p className="font-bold text-white">Pedido #{order.id.slice(-8).toUpperCase()}</p><p className="mt-1 text-sm text-silver">{new Date(order.createdAt).toLocaleDateString("pt-BR")} · {order.items.length} item(ns)</p></div>
                        <div className="sm:text-right"><p className="font-bold text-white">{formatCurrency(order.total)}</p><p className="mt-1 text-sm text-neon-blue">{statusLabels[order.status] ?? order.status}</p>{order.status === "PENDING" && order.paymentStatus !== "APPROVED" && <button type="button" disabled={payingOrder === order.id} onClick={() => void retryPayment(order.id)} className="mt-3 rounded bg-neon-blue px-4 py-2 text-xs font-bold uppercase text-black hover:bg-white disabled:opacity-50">{payingOrder === order.id ? "Abrindo..." : "Pagar agora"}</button>}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      {addressOpen && data && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setAddressOpen(false); }}>
          <form action={saveAddress} className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg border border-border bg-dark-blue p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="font-montserrat text-xl font-bold uppercase text-white">{editingAddress ? "Editar endereco" : "Novo endereco"}</h2><button type="button" onClick={() => setAddressOpen(false)} className="text-silver hover:text-white">Fechar</button></div>
            <div className="grid gap-4 md:grid-cols-2">
              <input required name="fullName" defaultValue={editingAddress?.fullName ?? data.user.name} placeholder="Nome completo" className={inputClass} />
              <input required name="phone" defaultValue={editingAddress?.phone} placeholder="Telefone" className={inputClass} />
              <input required type="email" name="email" defaultValue={editingAddress?.email ?? data.user.email} placeholder="E-mail" className={inputClass} />
              <input required name="zipCode" defaultValue={editingAddress?.zipCode} placeholder="CEP" className={inputClass} />
              <input required name="street" defaultValue={editingAddress?.street} placeholder="Rua / Avenida" className="md:col-span-2 w-full rounded border border-border bg-black px-4 py-3 text-white outline-none focus:border-neon-blue" />
              <input required name="number" defaultValue={editingAddress?.number} placeholder="Numero" className={inputClass} />
              <input name="complement" defaultValue={editingAddress?.complement ?? ""} placeholder="Complemento" className={inputClass} />
              <input required name="neighborhood" defaultValue={editingAddress?.neighborhood} placeholder="Bairro" className={inputClass} />
              <input required name="city" defaultValue={editingAddress?.city} placeholder="Cidade" className={inputClass} />
              <input required maxLength={2} name="state" defaultValue={editingAddress?.state} placeholder="UF" className={inputClass} />
            </div>
            <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setAddressOpen(false)} className="rounded border border-border px-5 py-3 font-bold uppercase text-white">Cancelar</button><button className="rounded bg-neon-blue px-5 py-3 font-bold uppercase text-black">Salvar endereco</button></div>
          </form>
        </div>
      )}
    </SiteShell>
  );
}
