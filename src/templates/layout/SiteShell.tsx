import Footer from "@/templates/layout/Footer";
import Header from "@/templates/layout/Header";
import TopBar from "@/templates/layout/TopBar";

export default function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <Header />
      <main className="flex-1 pt-28">{children}</main>
      <Footer />
    </>
  );
}
