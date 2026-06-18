import TopBar from "@/components/layout/TopBar";
import Header from "@/components/layout/Header";
import Hero from "@/components/home/Hero";
import Categories from "@/components/home/Categories";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestSellers from "@/components/home/BestSellers";
import PremiumSection from "@/components/home/PremiumSection";
import Testimonials from "@/components/home/Testimonials";
import InstagramSection from "@/components/home/Instagram";
import Newsletter from "@/components/home/Newsletter";
import Footer from "@/components/layout/Footer";

export default function Home() {
  return (
    <>
      <TopBar />
      <Header />
      <main className="flex-1">
        <Hero />
        <Categories />
        <FeaturedProducts />
        <PremiumSection />
        <BestSellers />
        <Testimonials />
        <InstagramSection />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
