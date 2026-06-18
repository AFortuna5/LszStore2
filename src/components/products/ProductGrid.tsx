import ProductCard from "@/components/products/ProductCard";
import { StoreProduct } from "@/lib/store-data";

export default function ProductGrid({ products }: { products: StoreProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-dark-blue p-8 text-center text-silver">
        Nenhum produto encontrado nesta selecao.
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
