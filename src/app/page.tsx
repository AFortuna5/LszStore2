import Categories from "@/templates/home/Categories";
import BrandsSection from "@/templates/home/BrandsSection";
import FeaturedProducts from "@/templates/home/FeaturedProducts";
import Hero from "@/templates/home/Hero";
import Newsletter from "@/templates/home/Newsletter";
import Footer from "@/templates/layout/Footer";
import Header from "@/templates/layout/Header";
import TopBar from "@/templates/layout/TopBar";
import { getStorefrontCategories, getStorefrontProducts } from "@/server/repositories/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [products, categories] = await Promise.all([
    getStorefrontProducts().catch(() => []),
    getStorefrontCategories().catch(() => []),
  ]);
  const featured = products.filter((product) => product.isFeatured);
  const newProducts = products.filter((product) => product.isNew);
  return (
    <>
      <TopBar />
      <Header />
      <main className="min-w-0 flex-1 overflow-x-hidden bg-black text-white">
        <Hero />
        <FeaturedProducts
          products={(featured.length > 0 ? featured : products).slice(0, 4)}
          eyebrow="Escolhas da loja"
          title="Destaques LSZ"
          description="Os produtos que estão no centro da nossa curadoria agora."
        />
        <Categories categories={categories} products={products} />
        <BrandsSection />
        <FeaturedProducts
          products={(newProducts.length > 0 ? newProducts : products).slice(0, 4)}
          eyebrow="Acabou de chegar"
          title="Novidades"
          description="Novos itens para atualizar o seu estilo e descobrir outras possibilidades."
          tone="soft"
        />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
