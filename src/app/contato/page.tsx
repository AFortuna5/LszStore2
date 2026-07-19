"use client";

import { Camera, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useState } from "react";

import { storeContact } from "@/shared/store-contact";
import SiteShell from "@/templates/layout/SiteShell";

export default function ContactPage() {
  const [status, setStatus] = useState("");
  async function sendContact(formData: FormData) {
    setStatus("Enviando...");
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData.entries())) });
    const result = await response.json();
    setStatus(response.ok ? "Mensagem enviada. Responderemos o mais breve possível." : result.error ?? "Nao foi possivel enviar");
  }
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
              <p className="flex gap-3"><Phone className="text-neon-blue" /> <a href={`https://wa.me/${storeContact.whatsapp}`} target="_blank" rel="noreferrer" className="hover:text-neon-blue">{storeContact.phone}</a></p>
              <p className="flex gap-3"><Mail className="text-neon-blue" /> <a href={`mailto:${storeContact.email}`} className="hover:text-neon-blue">{storeContact.email}</a></p>
              <p className="flex gap-3"><MapPin className="text-neon-blue" /> {storeContact.location}</p>
              <p className="flex gap-3"><Camera className="text-neon-blue" /> @lsz.storee</p>
            </div>
          </div>
          <form action={sendContact} className="rounded-lg border border-border bg-dark-blue p-6">
            <div className="grid gap-4 md:grid-cols-2">
              <input required name="name" className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="Nome" />
              <input required type="email" name="email" className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue" placeholder="E-mail" />
              <input required name="subject" className="rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue md:col-span-2" placeholder="Assunto" />
              <textarea required name="message" className="min-h-40 rounded border border-border bg-black px-4 py-3 outline-none focus:border-neon-blue md:col-span-2" placeholder="Mensagem" />
            </div>
            <button className="mt-5 inline-flex items-center gap-2 rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white">
              <MessageCircle size={18} />
              Enviar mensagem
            </button>
            {status && <p className="mt-4 text-sm text-neon-blue">{status}</p>}
          </form>
        </div>
      </section>
    </SiteShell>
  );
}
