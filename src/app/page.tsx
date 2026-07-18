import TopBar from "@/templates/layout/TopBar";
import Header from "@/templates/layout/Header";
import Hero from "@/templates/home/Hero";
import Categories from "@/templates/home/Categories";
import FeaturedProducts from "@/templates/home/FeaturedProducts";
import BestSellers from "@/templates/home/BestSellers";
import PremiumSection from "@/templates/home/PremiumSection";
import Testimonials from "@/templates/home/Testimonials";
import InstagramSection from "@/templates/home/Instagram";
import Newsletter from "@/templates/home/Newsletter";
import Footer from "@/templates/layout/Footer";

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
