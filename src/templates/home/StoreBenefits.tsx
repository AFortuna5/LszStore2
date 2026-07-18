import { Headphones, PackageCheck, ShieldCheck, Truck } from "lucide-react";

const benefits = [
  { icon: PackageCheck, title: "Seleção original", text: "Produtos escolhidos pela LSZ" },
  { icon: Truck, title: "Envio nacional", text: "Entregamos para todo o Brasil" },
  { icon: ShieldCheck, title: "Compra protegida", text: "Ambiente seguro do início ao fim" },
  { icon: Headphones, title: "Atendimento", text: "Suporte antes e depois da compra" },
];

export default function StoreBenefits() {
  return (
    <section className="border-y border-black/10 bg-white text-black">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-10">
        {benefits.map(({ icon: Icon, title, text }, index) => (
          <div key={title} className={`flex min-w-0 items-center gap-4 px-2 py-5 sm:min-h-32 sm:px-5 sm:py-6 ${index > 0 ? "border-t border-black/10 sm:border-t-0" : ""} ${index % 2 ? "sm:border-l sm:border-black/10" : ""} ${index > 1 ? "sm:border-t sm:border-black/10 lg:border-t-0" : ""} ${index > 0 ? "lg:border-l lg:border-black/10" : ""}`}>
            <Icon size={27} strokeWidth={1.5} className="shrink-0 text-neon-blue" />
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.12em]">{title}</p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
