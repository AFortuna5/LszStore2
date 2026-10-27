import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
const { findUnique } = vi.hoisted(() => ({ findUnique: vi.fn() }));
vi.mock("../src/server/database/client", () => ({
  prisma: { product: { findUnique } },
}));

import { getStorefrontProductBySlug } from "../src/server/repositories/catalog";

const product = {
  id: "p1", slug: "Chinelo armani exchange", name: "CHINELO ARMANI EXCHANGE",
  description: "Chinelo", price: 100, promoPrice: null, brand: "Armani Exchange",
  collection: "Colecao", rating: 5, inventory: 2, images: "/chinelo.jpg",
  details: "", isFeatured: true, isPremium: false, isNew: true,
  weight: 0.3, width: 20, height: 10, length: 25,
  category: { name: "Chinelos", slug: "chinelos" }, variants: [],
};

describe("consulta de produtos por URL", () => {
  beforeEach(() => {
    findUnique.mockReset();
    findUnique.mockImplementation(async ({ where }: { where: { slug: string } }) =>
      where.slug === product.slug ? product : null
    );
  });

  it.each(["Chinelo armani exchange", "Chinelo%20armani%20exchange"])(
    "encontra o produto cadastrado pelo admin com o parametro %s",
    async (slug) => {
      const result = await getStorefrontProductBySlug(slug);
      expect(result?.id).toBe("p1");
      expect(result?.slug).toBe(product.slug);
    },
  );

  it("aceita acentos e caracteres reservados codificados na URL", async () => {
    const slug = "Edição #1? Azul/Branco 50%";
    findUnique.mockImplementation(async ({ where }: { where: { slug: string } }) =>
      where.slug === slug ? { ...product, slug } : null
    );
    expect((await getStorefrontProductBySlug(encodeURIComponent(slug)))?.slug).toBe(slug);
  });

  it("prioriza o slug literal quando ele ja contem uma sequencia de porcentagem", async () => {
    const slug = "Chinelo%20armani%20exchange";
    findUnique.mockImplementation(async ({ where }: { where: { slug: string } }) =>
      where.slug === slug ? { ...product, id: "literal", slug } : product
    );
    expect((await getStorefrontProductBySlug(slug))?.id).toBe("literal");
  });

  it.each(["produto-inexistente", "Produto%20inexistente", "Porcentagem%invalida"])(
    "retorna ausente sem erro para %s",
    async (slug) => {
      expect(await getStorefrontProductBySlug(slug)).toBeNull();
    },
  );
});
