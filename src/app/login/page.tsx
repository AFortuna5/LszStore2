"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

import SiteShell from "@/templates/layout/SiteShell";

type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

  async function handleLogin(formData: FormData) {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: formData.get("login-email"),
        password: formData.get("login-password"),
      }),
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Nao foi possivel entrar");
      return;
    }

    setUser(payload.user);
    router.push(payload.user.role === "ADMIN" ? "/admin" : "/minha-conta");
    router.refresh();
  }

  async function handleRegister(formData: FormData) {
    setLoading(true);
    setMessage("");

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("register-name"),
        email: formData.get("register-email"),
        password: formData.get("register-password"),
      }),
    });

    const payload = await response.json();
    setLoading(false);

    if (!response.ok) {
      setMessage(payload.error ?? "Nao foi possivel cadastrar");
      return;
    }

    setUser(payload.user);
    router.push("/minha-conta");
    router.refresh();
  }

  async function handleLogout() {
    await fetch("/api/users", { method: "DELETE" });
    setUser(null);
    setMessage("Sessao encerrada.");
    router.refresh();
  }

  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto grid gap-10 px-4 md:px-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
              Area do cliente
            </p>
            <h1 className="font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
              Entre na sua conta
            </h1>
            <p className="mt-4 max-w-lg text-silver">
              Acompanhe pedidos, salve enderecos e tenha acesso aos drops da LSZ Store.
            </p>
            {user && (
              <div className="mt-6 rounded border border-border bg-dark-blue p-4 text-sm text-silver">
                Logado como <span className="text-white">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="ml-4 text-neon-blue transition-colors hover:text-white"
                >
                  Sair
                </button>
              </div>
            )}
            {message && <p className="mt-4 text-sm text-neon-blue">{message}</p>}
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <form
              action={handleLogin}
              className="rounded-lg border border-border bg-dark-blue p-6"
            >
              <h2 className="mb-5 font-montserrat text-xl font-bold uppercase text-white">
                Login
              </h2>
              <input
                name="login-email"
                className="mb-3 w-full rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue"
                type="email"
                placeholder="voce@email.com"
              />
              <input
                name="login-password"
                className="mb-4 w-full rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue"
                type="password"
                placeholder="Sua senha"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white disabled:opacity-50"
              >
                Entrar
              </button>
              <Link href="/recuperar-senha" className="mt-4 block text-center text-sm text-silver hover:text-neon-blue">Esqueci minha senha</Link>
            </form>
            <form
              action={handleRegister}
              className="rounded-lg border border-border bg-black p-6"
            >
              <h2 className="mb-5 font-montserrat text-xl font-bold uppercase text-white">
                Criar conta
              </h2>
              <input
                name="register-name"
                className="mb-3 w-full rounded border border-border bg-dark-blue px-4 py-3 outline-none focus:border-neon-blue"
                placeholder="Nome completo"
              />
              <input
                name="register-email"
                className="mb-3 w-full rounded border border-border bg-dark-blue px-4 py-3 outline-none focus:border-neon-blue"
                type="email"
                placeholder="E-mail"
              />
              <input
                name="register-password"
                className="mb-5 w-full rounded border border-border bg-dark-blue px-4 py-3 outline-none focus:border-neon-blue"
                type="password"
                placeholder="Senha"
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded border border-silver px-6 py-3 font-bold uppercase text-white hover:border-neon-blue hover:text-neon-blue disabled:opacity-50"
              >
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
