import Link from "next/link";
import { Package, User, MapPin } from "lucide-react";

import SiteShell from "@/components/layout/SiteShell";

export default function AccountPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto px-4 md:px-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
            Minha LSZ
          </p>
          <h1 className="mb-8 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Minha conta
          </h1>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { icon: User, title: "Perfil", text: "Dados pessoais e acesso." },
              { icon: Package, title: "Pedidos", text: "Historico e andamento." },
              { icon: MapPin, title: "Enderecos", text: "Locais de entrega salvos." },
            ].map((item) => (
              <div key={item.title} className="rounded-lg border border-border bg-dark-blue p-6">
                <item.icon className="mb-4 text-neon-blue" size={28} />
                <h2 className="font-montserrat text-xl font-bold uppercase text-white">
                  {item.title}
                </h2>
                <p className="mt-2 text-silver">{item.text}</p>
              </div>
            ))}
          </div>
          <Link
            href="/produtos"
            className="mt-8 inline-flex rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white"
          >
            Continuar comprando
          </Link>
        </div>
      </section>
    </SiteShell>
  );
}
