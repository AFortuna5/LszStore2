/* eslint-disable @typescript-eslint/no-require-imports */
require("dotenv/config");
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const crypto = require("crypto");

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/lszstore",
});
const prisma = new PrismaClient({ adapter });

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  await prisma.inventoryMovement.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.newsletterSubscriber.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.address.deleteMany();
  await prisma.category.deleteMany();
  await prisma.storeMember.deleteMany();
  await prisma.store.deleteMany();
  await prisma.user.deleteMany();

  const admin = await prisma.user.create({
    data: {
      name: "Administrador LSZ",
      email: "admin@lszstore.com.br",
      password: hashPassword("admin123"),
      role: "ADMIN",
    },
  });

  const store = await prisma.store.create({
    data: { name: "LSZ Store", slug: "lsz-store", ownerId: admin.id },
  });

  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Camisetas", slug: "camisetas" } }),
    prisma.category.create({ data: { name: "Moletons", slug: "moletons" } }),
    prisma.category.create({ data: { name: "Tenis", slug: "tenis" } }),
    prisma.category.create({ data: { name: "Perfumes", slug: "perfumes" } }),
    prisma.category.create({ data: { name: "Acessorios", slug: "acessorios" } }),
    prisma.category.create({ data: { name: "Eletronicos", slug: "eletronicos" } }),
  ]);

  const categoryBySlug = Object.fromEntries(categories.map((category) => [category.slug, category]));

  const products = [
    {
      slug: "camiseta-high-tech-street",
      name: "Camiseta High Tech Street",
      description: "Camiseta premium com toque macio e caimento urbano.",
      price: 189.9,
      promoPrice: 149.9,
      brand: "LSZ Exclusive",
      collection: "Urban Core",
      rating: 5,
      inventory: 35,
      images: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1200&auto=format&fit=crop,https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop",
      details: "Malha penteada|Modelagem regular|Estampa resistente",
      isFeatured: true,
      isNew: true,
      categorySlug: "camisetas",
      variants: [
        { sku: "CTS-P", label: "Preta P", size: "P", color: "Preto", inventory: 12, isDefault: true },
        { sku: "CTS-M", label: "Preta M", size: "M", color: "Preto", inventory: 10 },
        { sku: "CTS-G", label: "Preta G", size: "G", color: "Preto", inventory: 13 },
      ],
    },
    {
      slug: "tenis-urban-walker-pro",
      name: "Tenis Urban Walker Pro",
      description: "Sneaker leve para rotina com visual esportivo.",
      price: 499.9,
      promoPrice: 399.9,
      brand: "Importado",
      collection: "Street Motion",
      rating: 4.8,
      inventory: 18,
      images: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop,https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=1200&auto=format&fit=crop",
      details: "Solado emborrachado|Palmilha macia|Cabedal respiravel",
      isFeatured: true,
      isNew: true,
      categorySlug: "tenis",
      variants: [
        { sku: "TUP-42", label: "42", size: "42", color: null, inventory: 6, isDefault: true },
        { sku: "TUP-43", label: "43", size: "43", color: null, inventory: 6 },
        { sku: "TUP-44", label: "44", size: "44", color: null, inventory: 6 },
      ],
    },
    {
      slug: "moletom-dark-glow",
      name: "Moletom Dark Glow",
      description: "Moletom encorpado com acabamento premium.",
      price: 289.9,
      promoPrice: null,
      brand: "LSZ Exclusive",
      collection: "Urban Core",
      rating: 5,
      inventory: 22,
      images: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=1200&auto=format&fit=crop,https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?q=80&w=1200&auto=format&fit=crop",
      details: "Felpa interna|Punhos reforcados|Capuz estruturado",
      isFeatured: true,
      isNew: false,
      categorySlug: "moletons",
      variants: [
        { sku: "MDG-P", label: "Preto P", size: "P", color: "Preto", inventory: 8, isDefault: true },
        { sku: "MDG-M", label: "Preto M", size: "M", color: "Preto", inventory: 8 },
        { sku: "MDG-G", label: "Preto G", size: "G", color: "Preto", inventory: 6 },
      ],
    },
    {
      slug: "perfume-midnight-code",
      name: "Perfume Midnight Code 100ml",
      description: "Fragrancia marcante com saida fresca e corpo amadeirado.",
      price: 349.9,
      promoPrice: 299.9,
      brand: "LSZ Fragrance",
      collection: "Night Select",
      rating: 4.9,
      inventory: 30,
      images: "https://images.unsplash.com/photo-1594035910387-fea47794261f?q=80&w=1200&auto=format&fit=crop,https://images.unsplash.com/photo-1541643600914-78b084683601?q=80&w=1200&auto=format&fit=crop",
      details: "100ml|Familia amadeirada|Alta fixacao",
      isFeatured: true,
      isNew: false,
      categorySlug: "perfumes",
      variants: [{ sku: "PMC-100", label: "100ml", size: null, color: null, inventory: 30, isDefault: true }],
    },
  ];

  for (const productInput of products) {
    const category = categoryBySlug[productInput.categorySlug];

    const product = await prisma.product.create({
      data: {
        slug: productInput.slug,
        name: productInput.name,
        description: productInput.description,
        price: productInput.price,
        promoPrice: productInput.promoPrice,
        brand: productInput.brand,
        collection: productInput.collection,
        rating: productInput.rating,
        inventory: productInput.inventory,
        images: productInput.images,
        details: productInput.details,
        isFeatured: productInput.isFeatured,
        isNew: productInput.isNew,
        isPremium: productInput.collection === "Night Select",
        categoryId: category.id,
        storeId: store.id,
      },
    });

    for (const variant of productInput.variants) {
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variant.sku,
          label: variant.label,
          size: variant.size,
          color: variant.color,
          inventory: variant.inventory,
          isDefault: Boolean(variant.isDefault),
        },
      });
    }
  }

  console.log(`Seed concluido. Admin: ${admin.email}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
