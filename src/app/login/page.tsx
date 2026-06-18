import Link from "next/link";
import { Mail, LockKeyhole, UserPlus } from "lucide-react";

import SiteShell from "@/components/layout/SiteShell";

export default function LoginPage() {
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
              Acompanhe pedidos, salve enderecos e tenha acesso antecipado aos
              drops da LSZ Store.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <form className="rounded-lg border border-border bg-dark-blue p-6">
              <h2 className="mb-5 font-montserrat text-xl font-bold uppercase text-white">
                Login
              </h2>
              <label className="mb-4 block">
                <span className="mb-2 block text-sm text-silver">E-mail</span>
                <div className="flex items-center gap-3 rounded border border-border bg-black px-4 py-3 focus-within:border-neon-blue">
                  <Mail size={18} className="text-neon-blue" />
                  <input className="w-full bg-transparent outline-none" type="email" placeholder="voce@email.com" />
                </div>
              </label>
              <label className="mb-6 block">
                <span className="mb-2 block text-sm text-silver">Senha</span>
                <div className="flex items-center gap-3 rounded border border-border bg-black px-4 py-3 focus-within:border-neon-blue">
                  <LockKeyhole size={18} className="text-neon-blue" />
                  <input className="w-full bg-transparent outline-none" type="password" placeholder="Sua senha" />
                </div>
              </label>
              <Link
                href="/minha-conta"
                className="flex w-full justify-center rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white"
              >
                Entrar
              </Link>
            </form>
            <form className="rounded-lg border border-border bg-black p-6">
              <h2 className="mb-5 font-montserrat text-xl font-bold uppercase text-white">
                Criar conta
              </h2>
              <input className="mb-3 w-full rounded border border-border bg-dark-blue px-4 py-3 outline-none focus:border-neon-blue" placeholder="Nome completo" />
              <input className="mb-3 w-full rounded border border-border bg-dark-blue px-4 py-3 outline-none focus:border-neon-blue" type="email" placeholder="E-mail" />
              <input className="mb-5 w-full rounded border border-border bg-dark-blue px-4 py-3 outline-none focus:border-neon-blue" type="password" placeholder="Senha" />
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded border border-silver px-6 py-3 font-bold uppercase text-white hover:border-neon-blue hover:text-neon-blue"
              >
                <UserPlus size={18} />
                Cadastrar
              </button>
            </form>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
