import type { Metadata } from "next";
import { Inter, Poppins, Montserrat } from "next/font/google";
import "./globals.css";
import { env } from "@/server/config/env";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(env.appUrl),
  title: "LSZ Store | Produtos Premium e Exclusivos",
  description: "Conheça a LSZ Store. Produtos exclusivos, roupas, acessórios, perfumes e eletrônicos com envio para todo Brasil.",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "LSZ Store",
    title: "LSZ Store | Produtos Premium e Exclusivos",
    description: "Produtos selecionados com entrega para todo o Brasil.",
    images: ["/logo-lsz-store.png"],
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${poppins.variable} ${montserrat.variable} dark`}>
      <body className="font-inter antialiased bg-black text-white min-h-screen flex flex-col">
        {children}
      </body>
    </html>
  );
}
