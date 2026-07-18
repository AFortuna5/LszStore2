"use client";

import { ArrowRight } from "lucide-react";
import { FormEvent, useState } from "react";

export default function Newsletter() {
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.get("email") }),
      });
      const result = await response.json();
      setStatus(response.ok ? "Cadastro realizado. Bem-vindo à LSZ!" : result.error ?? "Não foi possível cadastrar.");
      if (response.ok) form.reset();
    } catch {
      setStatus("Não foi possível cadastrar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="relative overflow-hidden bg-neon-blue px-4 py-16 text-black sm:px-6 md:py-24 lg:px-10">
      <div className="pointer-events-none absolute -right-16 -top-36 font-montserrat text-[18rem] font-black leading-none text-white/15">LSZ</div>
      <div className="relative mx-auto grid max-w-[1300px] items-end gap-10 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.25em]">Entre para a lista</p>
          <h2 className="max-w-3xl font-montserrat text-4xl font-black uppercase leading-[0.92] tracking-[-0.06em] sm:text-5xl md:text-6xl">Novidades primeiro. Direto no seu e-mail.</h2>
        </div>
        <div>
          <p className="mb-5 max-w-lg text-sm leading-6 text-black/70">Receba lançamentos, reposições e condições especiais da LSZ sem precisar procurar.</p>
          <form onSubmit={subscribe} className="flex border-b-2 border-black">
            <label htmlFor="newsletter-email" className="sr-only">Seu e-mail</label>
            <input id="newsletter-email" name="email" type="email" placeholder="SEU MELHOR E-MAIL" className="min-w-0 flex-1 bg-transparent px-0 py-4 text-sm font-semibold text-black outline-none placeholder:text-black/60" required />
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-2 text-xs font-black uppercase tracking-[0.14em] disabled:opacity-60">
              {loading ? "Enviando" : "Cadastrar"} <ArrowRight size={17} />
            </button>
          </form>
          <p className="mt-3 min-h-5 text-xs font-medium" aria-live="polite">{status}</p>
        </div>
      </div>
    </section>
  );
}
