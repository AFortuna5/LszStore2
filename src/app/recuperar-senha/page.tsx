"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";
import SiteShell from "@/templates/layout/SiteShell";

export default function PasswordRecoveryPage() { return <Suspense fallback={<SiteShell><div className="min-h-[60vh] bg-black p-10 text-center text-silver">Carregando...</div></SiteShell>}><PasswordRecovery /></Suspense>; }
function PasswordRecovery() {
  const token = useSearchParams().get("token");
  const [message, setMessage] = useState("");
  async function submit(formData: FormData) {
    const password = String(formData.get("password") ?? "");
    const confirmation = String(formData.get("confirmation") ?? "");
    if (token && password !== confirmation) { setMessage("As senhas nao conferem."); return; }
    const response = await fetch(token ? "/api/auth/password/reset" : "/api/auth/password/forgot", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(token ? { token, password } : { email: formData.get("email") }) });
    const result = await response.json();
    setMessage(response.ok ? (token ? "Senha alterada. Voce ja pode entrar." : "Se o email estiver cadastrado, enviaremos as instrucoes.") : result.error);
  }
  return <SiteShell><section className="min-h-[65vh] bg-black py-16"><div className="container mx-auto max-w-md px-4"><h1 className="font-montserrat text-4xl font-black uppercase text-white">{token ? "Nova senha" : "Recuperar senha"}</h1><form action={submit} className="mt-7 space-y-4 rounded border border-border bg-dark-blue p-6">{token ? <><input required minLength={8} type="password" name="password" placeholder="Nova senha (8+ caracteres)" className="w-full rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" /><input required minLength={8} type="password" name="confirmation" placeholder="Confirmar senha" className="w-full rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" /></> : <input required type="email" name="email" placeholder="Seu email" className="w-full rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" />}<button className="w-full rounded bg-neon-blue px-5 py-3 font-bold uppercase text-black">Continuar</button>{message && <p className="text-sm text-neon-blue">{message}</p>}<Link href="/login" className="block text-center text-sm text-silver hover:text-white">Voltar ao login</Link></form></div></section></SiteShell>;
}
