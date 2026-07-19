import ProductCard from "@/templates/products/ProductCard";
import { StorefrontProduct } from "@/shared/storefront";

export default function ProductGrid({ products, emptyMessage = "Nenhum produto encontrado nesta selecao." }: { products: StorefrontProduct[]; emptyMessage?: string }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-dark-blue p-8 text-center text-silver">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
