export type StoreBrand = {
  name: string;
  slug: string;
  logo: string;
  aliases: string[];
};

export const storeBrands: StoreBrand[] = [
  {
    name: "Armani",
    slug: "armani",
    logo: "/brands/armani.svg",
    aliases: ["armani", "giorgio armani", "emporio armani", "armani exchange", "ea7"],
  },
  {
    name: "Lacoste",
    slug: "lacoste",
    logo: "/brands/lacoste.svg",
    aliases: ["lacoste"],
  },
  {
    name: "Tommy Hilfiger",
    slug: "tommy-hilfiger",
    logo: "/brands/tommy-hilfiger.svg",
    aliases: ["tommy hilfiger", "tommy", "tommy jeans"],
  },
];

export function normalizeBrand(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

export function getStoreBrand(slug: string) {
  return storeBrands.find((brand) => brand.slug === slug);
}

export function matchesStoreBrand(productBrand: string, brand: StoreBrand) {
  const normalized = normalizeBrand(productBrand);
  return brand.aliases.some((alias) => normalized === alias || normalized.includes(alias));
}
