import CartClient from "@/templates/cart/CartClient";
import SiteShell from "@/templates/layout/SiteShell";

export default function CartPage() {
  return (
    <SiteShell>
      <section className="bg-black py-14">
        <div className="container mx-auto px-4 md:px-6">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">
            Sacola
          </p>
          <h1 className="mb-8 font-montserrat text-4xl font-black uppercase text-white md:text-5xl">
            Carrinho
          </h1>
          <CartClient />
        </div>
      </section>
    </SiteShell>
  );
}
