export type StoreProduct = {
  id: number;
  slug: string;
  name: string;
  brand: string;
  category: string;
  categorySlug: string;
  collection: string;
  rating: number;
  price: number;
  promoPrice?: number;
  discount?: string;
  image: string;
  gallery: string[];
  description: string;
  details: string[];
  isNew?: boolean;
  isPremium?: boolean;
};

export const categories = [
  { name: "Camisetas", slug: "camisetas" },
  { name: "Moletons", slug: "moletons" },
  { name: "Tenis", slug: "tenis" },
  { name: "Perfumes", slug: "perfumes" },
  { name: "Acessorios", slug: "acessorios" },
  { name: "Eletronicos", slug: "eletronicos" },
];

export const products: StoreProduct[] = [
  {
    id: 1,
    slug: "camiseta-high-tech-street",
    name: "Camiseta High Tech Street",
    brand: "LSZ Exclusive",
    category: "Camisetas",
    categorySlug: "camisetas",
    collection: "Urban Core",
    rating: 5,
    price: 189.9,
    promoPrice: 149.9,
    discount: "21% OFF",
    image:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Camiseta premium com toque macio, caimento urbano e acabamento reforcado para uso diario.",
    details: ["Malha penteada", "Modelagem regular", "Estampa resistente"],
    isNew: true,
  },
  {
    id: 2,
    slug: "tenis-urban-walker-pro",
    name: "Tenis Urban Walker Pro",
    brand: "Importado",
    category: "Tenis",
    categorySlug: "tenis",
    collection: "Street Motion",
    rating: 4.8,
    price: 499.9,
    promoPrice: 399.9,
    discount: "20% OFF",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Sneaker leve para rotina, com visual esportivo e estrutura confortavel para longos periodos.",
    details: ["Solado emborrachado", "Palmilha macia", "Cabedal respiravel"],
    isNew: true,
  },
  {
    id: 3,
    slug: "moletom-dark-glow",
    name: "Moletom Dark Glow",
    brand: "LSZ Exclusive",
    category: "Moletons",
    categorySlug: "moletons",
    collection: "Urban Core",
    rating: 5,
    price: 289.9,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Moletom encorpado com acabamento premium, criado para compor looks streetwear sem esforco.",
    details: ["Felpa interna", "Punhos reforcados", "Capuz estruturado"],
  },
  {
    id: 4,
    slug: "headphone-studio-black",
    name: "Headphone Studio Black",
    brand: "Tech Sound",
    category: "Eletronicos",
    categorySlug: "eletronicos",
    collection: "Tech Drop",
    rating: 4.9,
    price: 699.9,
    promoPrice: 549.9,
    discount: "21% OFF",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Headphone com isolamento confortavel, graves definidos e visual minimalista para setup ou rua.",
    details: ["Bluetooth", "Bateria de longa duracao", "Almofadas macias"],
    isPremium: true,
  },
  {
    id: 5,
    slug: "perfume-midnight-code",
    name: "Perfume Midnight Code 100ml",
    brand: "LSZ Fragrance",
    category: "Perfumes",
    categorySlug: "perfumes",
    collection: "Night Select",
    rating: 4.9,
    price: 349.9,
    image:
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Fragrancia marcante com saida fresca, corpo amadeirado e fixacao intensa para noite.",
    details: ["100ml", "Familia amadeirada", "Alta fixacao"],
    isPremium: true,
  },
  {
    id: 6,
    slug: "jaqueta-corta-vento-reflex",
    name: "Jaqueta Corta Vento Reflex",
    brand: "LSZ Active",
    category: "Moletons",
    categorySlug: "moletons",
    collection: "Street Motion",
    rating: 4.7,
    price: 299.9,
    promoPrice: 249.9,
    discount: "17% OFF",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1523398002811-999aa8d9512e?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Jaqueta leve com proposta esportiva, ideal para meia estacao e composicoes de rua.",
    details: ["Tecido leve", "Bolsos laterais", "Secagem rapida"],
  },
  {
    id: 7,
    slug: "bone-snapback-classic",
    name: "Bone Snapback Classic M",
    brand: "LSZ Caps",
    category: "Acessorios",
    categorySlug: "acessorios",
    collection: "Urban Core",
    rating: 4.8,
    price: 89.9,
    image:
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1521369909029-2afed882baee?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Bone snapback com estrutura firme, aba reta e ajuste traseiro para encaixe preciso.",
    details: ["Aba reta", "Fecho ajustavel", "Logo bordado"],
  },
  {
    id: 8,
    slug: "oculos-de-sol-aviator-neo",
    name: "Oculos de Sol Aviator Neo",
    brand: "Neo Vision",
    category: "Acessorios",
    categorySlug: "acessorios",
    collection: "Night Select",
    rating: 4.6,
    price: 159.9,
    image:
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Oculos com lente escura e formato classico atualizado para um visual mais afiado.",
    details: ["Protecao UV", "Armacoes leves", "Estojo incluso"],
  },
  {
    id: 9,
    slug: "relogio-smart-lsz",
    name: "Relogio Smart LSZ",
    brand: "LSZ Tech",
    category: "Eletronicos",
    categorySlug: "eletronicos",
    collection: "Tech Drop",
    rating: 4.9,
    price: 899.9,
    promoPrice: 799.9,
    discount: "11% OFF",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Smartwatch com monitoramento diario, tela nitida e design versatil para treino e rotina.",
    details: ["Monitor cardiaco", "Resistente a respingos", "Pulseira ajustavel"],
    isPremium: true,
  },
  {
    id: 10,
    slug: "shoulder-bag-urban",
    name: "Shoulder Bag Urban",
    brand: "LSZ Bags",
    category: "Acessorios",
    categorySlug: "acessorios",
    collection: "Urban Core",
    rating: 4.7,
    price: 129.9,
    image:
      "https://images.unsplash.com/photo-1548863227-3af567fc3b27?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1548863227-3af567fc3b27?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1200&auto=format&fit=crop",
    ],
    description:
      "Bolsa compacta para celular, carteira e itens essenciais, com acesso rapido e visual urbano.",
    details: ["Alca regulavel", "Bolso frontal", "Nylon resistente"],
  },
];

export const collections = Array.from(
  new Set(products.map((product) => product.collection))
);

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function getProductBySlugOrId(value: string) {
  return products.find(
    (product) => product.slug === value || product.id.toString() === value
  );
}

export function getProductPrice(product: StoreProduct) {
  return product.promoPrice ?? product.price;
}
