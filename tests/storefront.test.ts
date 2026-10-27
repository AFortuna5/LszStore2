import { describe, expect, it } from "vitest";
import { getProductPath, getProductPrice, parseImageList, parseTextList, toStorefrontProduct } from "../src/shared/storefront";

describe("storefront", () => {
  it.each(["Chinelo armani exchange", "Edição #1? Azul/Branco 50%", "camiseta-armani-exchange"])(
    "preserva o slug %s em um unico segmento da URL",
    (slug) => {
      const url = new URL(getProductPath(slug), "https://lszstore.example");
      expect(url.search).toBe("");
      expect(url.hash).toBe("");
      expect(url.pathname.split("/")).toHaveLength(3);
      expect(decodeURIComponent(url.pathname.split("/")[2])).toBe(slug);
    },
  );

  it("normaliza listas de imagens e detalhes", () => {
    expect(parseImageList("/a.jpg, /b.jpg|https://cdn.example.com/c.jpg")).toEqual([
      "/a.jpg",
      "/b.jpg",
      "https://cdn.example.com/c.jpg",
    ]);
    expect(parseTextList("Algodao | Modelagem ampla")).toEqual(["Algodao", "Modelagem ampla"]);
  });

  it("aplica promocao e calcula o desconto", () => {
    const product = toStorefrontProduct({
      id: "p1", slug: "produto", name: "Produto", description: "Descricao", price: 200,
      promoPrice: 150, brand: null, collection: "Colecao", rating: 5, inventory: 4,
      images: "/one.jpg,/two.jpg", details: "Detalhe", isFeatured: true, isPremium: false,
      isNew: true, weight: 0.3, width: 20, height: 10, length: 25,
      category: { name: "Categoria", slug: "categoria" }, variants: [],
    });
    expect(product.discount).toBe("25% OFF");
    expect(product.gallery).toHaveLength(2);
    expect(product.brand).toBe("Categoria");
    expect(getProductPrice(product)).toBe(150);
  });
});
