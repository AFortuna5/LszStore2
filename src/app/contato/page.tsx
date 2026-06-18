import { Instagram, Mail, MessageCircle, Phone } from "lucide-react";

import SiteShell from "@/components/layout/SiteShell";

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto grid gap-10 px-4 md:px-6 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
              Atendimento
            </p>
            <h1 className="font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
              Fale conosco
            </h1>
            <div className="mt-8 space-y-4 text-silver">
              <p className="flex gap-3"><Phone className="text-neon-blue" /> (11) 99999-9999</p>
              <p className="flex gap-3"><Mail className="text-neon-blue" /> contato@lszstore.com.br</p>
              <p className="flex gap-3"><Instagram className="text-neon-blue" /> @lsz.storee</p>
            </div>
          </div>
          <form className="rounded-lg border border-border bg-dark-blue p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <input className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Nome" />
              <input className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="E-mail" />
              <input className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue md:col-span-2" placeholder="Assunto" />
              <textarea className="min-h-40 rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue md:col-span-2" placeholder="Mensagem" />
            </div>
            <button type="button" className="mt-5 inline-flex items-center gap-2 rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white">
              <MessageCircle size={18} />
              Enviar mensagem
            </button>
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
