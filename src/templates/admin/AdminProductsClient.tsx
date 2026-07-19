"use client";

import { ArrowLeft, Boxes, ClipboardList, Pencil, Plus, Search, Tags, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { storeBrands } from "@/shared/brands";
import { formatCurrency, type StorefrontProduct, type StorefrontVariant } from "@/shared/storefront";

type Category = { id: string; name: string; slug: string; productCount: number };
type VariantDraft = Omit<StorefrontVariant, "id" | "price">;
type ProductDraft = {
  name: string; slug: string; description: string; price: string; promoPrice: string;
  brand: string; inventory: string; categoryId: string; collection: string; rating: string;
  images: string; details: string; isFeatured: boolean; isPremium: boolean; isNew: boolean;
  weight: string; width: string; height: string; length: string;
  variants: VariantDraft[];
};

const emptyDraft: ProductDraft = {
  name: "", slug: "", description: "", price: "", promoPrice: "", brand: "",
  inventory: "0", categoryId: "", collection: "Colecao Principal", rating: "5",
  images: "", details: "", isFeatured: false, isPremium: false, isNew: true, variants: [],
  weight: "0.3", width: "20", height: "10", length: "25",
};
const inputClass = "w-full rounded border border-border bg-black px-3 py-2.5 text-white outline-none focus:border-neon-blue";

function productToDraft(product: StorefrontProduct, categories: Category[]): ProductDraft {
  return {
    name: product.name, slug: product.slug, description: product.description,
    price: String(product.price), promoPrice: product.promoPrice === null ? "" : String(product.promoPrice),
    brand: product.brand, inventory: String(product.inventory),
    categoryId: categories.find((category) => category.slug === product.categorySlug)?.id ?? "",
    collection: product.collection, rating: String(product.rating), images: product.gallery.join("\n"),
    details: product.details.join("\n"), isFeatured: product.isFeatured,
    weight: String(product.weight), width: String(product.width), height: String(product.height), length: String(product.length),
    isPremium: product.isPremium, isNew: product.isNew,
    variants: product.variants.map((variant) => ({
      sku: variant.sku, label: variant.label, size: variant.size, color: variant.color,
      inventory: variant.inventory, image: variant.image, priceOverride: variant.priceOverride,
      isDefault: variant.isDefault,
    })),
  };
}

export default function AdminProductsClient() {
  const [products, setProducts] = useState<StorefrontProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<StorefrontProduct | null>(null);
  const [draft, setDraft] = useState<ProductDraft>(emptyDraft);
  const [uploading, setUploading] = useState(false);

  const loadData = useCallback(async () => {
    const [productsResponse, categoriesResponse] = await Promise.all([
      fetch("/api/products?limit=100", { cache: "no-store" }),
      fetch("/api/categories", { cache: "no-store" }),
    ]);
    const [productsData, categoriesData] = await Promise.all([productsResponse.json(), categoriesResponse.json()]);
    setProducts(Array.isArray(productsData) ? productsData : []);
    setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    setLoading(false);
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/products?limit=100", { cache: "no-store" }).then((response) => response.json()),
      fetch("/api/categories", { cache: "no-store" }).then((response) => response.json()),
    ]).then(([productsData, categoriesData]) => {
      setProducts(Array.isArray(productsData) ? productsData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return products;
    return products.filter((product) => [product.name, product.brand, product.category, product.slug].some((value) => value.toLowerCase().includes(normalized)));
  }, [products, query]);

  function openNew() {
    setEditing(null);
    setDraft({ ...emptyDraft, categoryId: categories[0]?.id ?? "", variants: [] });
    setEditorOpen(true);
    setMessage("");
  }

  function openEdit(product: StorefrontProduct) {
    setEditing(product);
    setDraft(productToDraft(product, categories));
    setEditorOpen(true);
    setMessage("");
  }

  function updateDraft<K extends keyof ProductDraft>(key: K, value: ProductDraft[K]) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function updateVariant(index: number, key: keyof VariantDraft, value: string | number | boolean | null) {
    setDraft((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => variantIndex === index ? { ...variant, [key]: value } : variant),
    }));
  }

  async function saveProduct(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const payload = {
      ...draft,
      price: Number(draft.price), promoPrice: draft.promoPrice === "" ? null : Number(draft.promoPrice),
      inventory: Number(draft.inventory), rating: Number(draft.rating),
      weight: Number(draft.weight), width: Number(draft.width), height: Number(draft.height), length: Number(draft.length),
      images: draft.images.split(/\n|,/).map((item) => item.trim()).filter(Boolean),
      details: draft.details.split("\n").map((item) => item.trim()).filter(Boolean),
      variants: draft.variants.map((variant) => ({
        ...variant,
        inventory: Number(variant.inventory),
        priceOverride: variant.priceOverride == null ? null : Number(variant.priceOverride),
      })),
    };
    const response = await fetch(editing ? `/api/products/${editing.id}` : "/api/products", {
      method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const result = await response.json();
    setSaving(false);
    if (!response.ok) { setMessage(result.error ?? "Nao foi possivel salvar o produto"); return; }
    setEditorOpen(false);
    setMessage(editing ? "Produto atualizado com sucesso." : "Produto adicionado com sucesso.");
    await loadData();
  }

  async function uploadImages(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    setMessage("");

    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const form = new FormData();
        form.set("file", file);
        const response = await fetch("/api/uploads", { method: "POST", body: form });
        const result = await response.json();
        if (!response.ok || typeof result.url !== "string") {
          throw new Error(result.error ?? "Falha no upload");
        }
        uploadedUrls.push(result.url);
      }

      setDraft((current) => ({
        ...current,
        images: [current.images.trim(), ...uploadedUrls].filter(Boolean).join("\n"),
      }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Falha no upload");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(imageToRemove: string) {
    setDraft((current) => ({
      ...current,
      images: current.images
        .split(/\n|,/)
        .map((image) => image.trim())
        .filter((image) => image && image !== imageToRemove)
        .join("\n"),
    }));
  }

  async function deleteProduct(product: StorefrontProduct) {
    if (!window.confirm(`Excluir "${product.name}" permanentemente?`)) return;
    const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (!response.ok) {
      const result = await response.json();
      setMessage(result.error ?? "Nao foi possivel excluir o produto");
      return;
    }
    setMessage("Produto excluido.");
    await loadData();
  }

  async function createCategory(formData: FormData) {
    const response = await fetch("/api/categories", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: formData.get("categoryName") }),
    });
    const result = await response.json();
    if (!response.ok) { setMessage(result.error ?? "Nao foi possivel criar a categoria"); return; }
    setMessage("Categoria criada.");
    await loadData();
  }

  async function deleteCategory(category: Category) {
    if (category.productCount > 0) { setMessage("Mova ou exclua os produtos desta categoria primeiro."); return; }
    if (!window.confirm(`Excluir a categoria "${category.name}"?`)) return;
    const response = await fetch(`/api/categories/${category.id}`, { method: "DELETE" });
    if (!response.ok) { const result = await response.json(); setMessage(result.error ?? "Nao foi possivel excluir a categoria"); return; }
    setMessage("Categoria excluida.");
    await loadData();
  }

  return (
    <section className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4 md:px-6">
        <Link href="/admin" className="mb-6 inline-flex items-center gap-2 text-sm font-bold uppercase text-silver hover:text-neon-blue"><ArrowLeft size={17} /> Voltar ao painel</Link>
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div><p className="mb-2 text-sm font-bold uppercase tracking-wide text-neon-blue">Catalogo</p><h1 className="font-montserrat text-4xl font-black uppercase text-white md:text-5xl">Produtos da loja</h1><p className="mt-3 text-silver">Adicione, edite, personalize estoque, imagens, precos e variacoes.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/admin/inventario" className="flex items-center gap-2 rounded border border-border px-5 py-3 font-bold uppercase text-white hover:border-neon-blue hover:text-neon-blue"><ClipboardList size={20} /> Inventario e logs</Link><button onClick={openNew} className="flex items-center gap-2 rounded bg-neon-blue px-5 py-3 font-bold uppercase text-black hover:bg-white"><Plus size={20} /> Novo produto</button></div>
        </div>
        {message && <div className="mt-6 rounded border border-neon-blue/40 bg-neon-blue/10 p-4 text-sm text-white">{message}</div>}

        <div className="mt-8 grid gap-8 xl:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-5 flex items-center gap-3 rounded border border-border bg-dark-blue px-4"><Search className="text-silver" size={20} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, marca ou categoria" className="w-full bg-transparent py-3 text-white outline-none" /></div>
            {loading ? <p className="text-silver">Carregando catalogo...</p> : filtered.length === 0 ? <div className="rounded border border-border bg-dark-blue p-8 text-center text-silver">Nenhum produto encontrado.</div> : (
              <div className="space-y-4">
                {filtered.map((product) => (
                  <article key={product.id} className="grid gap-4 rounded-lg border border-border bg-dark-blue p-4 sm:grid-cols-[88px_1fr_auto] sm:items-center">
                    <div className="h-[88px] rounded bg-black bg-cover bg-center" style={{ backgroundImage: `url("${product.image.replace(/"/g, "%22")}")` }} />
                    <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="truncate font-bold text-white">{product.name}</h2>{product.isNew && <span className="rounded bg-neon-blue px-2 py-0.5 text-[10px] font-bold uppercase text-black">Novo</span>}{product.isFeatured && <span className="rounded border border-neon-blue px-2 py-0.5 text-[10px] uppercase text-neon-blue">Destaque</span>}</div><p className="mt-1 text-sm text-silver">{product.category} · {product.collection}</p><p className="mt-2 font-bold text-white">{formatCurrency(product.promoPrice ?? product.price)} <span className={`ml-2 text-sm ${product.inventory > 0 ? "text-emerald-400" : "text-red-400"}`}>{product.inventory} em estoque</span></p></div>
                    <div className="flex gap-2 sm:flex-col"><button onClick={() => openEdit(product)} className="flex items-center justify-center gap-2 rounded border border-border px-3 py-2 text-sm text-white hover:border-neon-blue hover:text-neon-blue"><Pencil size={16} /> Editar</button><button onClick={() => deleteProduct(product)} className="flex items-center justify-center gap-2 rounded border border-border px-3 py-2 text-sm text-red-400 hover:border-red-400"><Trash2 size={16} /> Excluir</button></div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="h-fit rounded-lg border border-border bg-dark-blue p-5">
            <h2 className="flex items-center gap-2 font-montserrat text-lg font-bold uppercase text-white"><Tags className="text-neon-blue" /> Categorias</h2>
            <form action={createCategory} className="mt-4 flex gap-2"><input required name="categoryName" placeholder="Nova categoria" className={inputClass} /><button title="Adicionar categoria" className="rounded bg-neon-blue px-3 text-black hover:bg-white"><Plus /></button></form>
            <div className="mt-5 space-y-2">{categories.map((category) => <div key={category.id} className="flex items-center justify-between rounded border border-border bg-black p-3 text-sm"><div><p className="text-white">{category.name}</p><p className="text-xs text-silver">{category.productCount} produto(s)</p></div><button onClick={() => deleteCategory(category)} title="Excluir categoria" className="text-silver hover:text-red-400"><Trash2 size={16} /></button></div>)}</div>
          </aside>
        </div>
      </div>

      {editorOpen && (
        <div className="fixed inset-0 z-[100] bg-black/85 p-3 md:p-8" onMouseDown={(event) => { if (event.target === event.currentTarget) setEditorOpen(false); }}>
          <form onSubmit={saveProduct} className="mx-auto max-h-full w-full max-w-5xl overflow-y-auto rounded-xl border border-border bg-dark-blue p-5 md:p-8">
            <div className="mb-6 flex items-center justify-between"><div><p className="text-xs font-bold uppercase text-neon-blue">Editor de catalogo</p><h2 className="font-montserrat text-2xl font-black uppercase text-white">{editing ? "Editar produto" : "Adicionar produto"}</h2></div><button type="button" onClick={() => setEditorOpen(false)} className="rounded p-2 text-silver hover:bg-black hover:text-white"><X /></button></div>
            {message && <p className="mb-5 rounded border border-red-400/40 bg-red-400/10 p-3 text-sm text-white">{message}</p>}
            <div className="grid gap-5 md:grid-cols-2">
              <label className="text-sm text-silver">Nome *<input required value={draft.name} onChange={(e) => updateDraft("name", e.target.value)} className={`mt-2 ${inputClass}`} /></label>
              <label className="text-sm text-silver">Slug (URL)<input value={draft.slug} onChange={(e) => updateDraft("slug", e.target.value)} placeholder="gerado pelo nome se vazio" className={`mt-2 ${inputClass}`} /></label>
              <label className="text-sm text-silver">Marca<input list="store-brands" value={draft.brand} onChange={(e) => updateDraft("brand", e.target.value)} placeholder="Selecione ou digite a marca" className={`mt-2 ${inputClass}`} /><datalist id="store-brands">{storeBrands.map((brand) => <option key={brand.slug} value={brand.name} />)}</datalist></label>
              <label className="text-sm text-silver">Categoria *<select required value={draft.categoryId} onChange={(e) => updateDraft("categoryId", e.target.value)} className={`mt-2 ${inputClass}`}><option value="">Selecione</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <label className="text-sm text-silver">Colecao<input required value={draft.collection} onChange={(e) => updateDraft("collection", e.target.value)} className={`mt-2 ${inputClass}`} /></label>
              <label className="text-sm text-silver">Avaliacao (0 a 5)<input type="number" min="0" max="5" step="0.1" value={draft.rating} onChange={(e) => updateDraft("rating", e.target.value)} className={`mt-2 ${inputClass}`} /></label>
              <label className="text-sm text-silver">Preco *<input required type="number" min="0" step="0.01" value={draft.price} onChange={(e) => updateDraft("price", e.target.value)} className={`mt-2 ${inputClass}`} /></label>
              <label className="text-sm text-silver">Preco promocional (opcional)<input type="number" min="0" step="0.01" value={draft.promoPrice} onChange={(e) => updateDraft("promoPrice", e.target.value)} className={`mt-2 ${inputClass}`} /></label>
              <label className="text-sm text-silver">Estoque geral *<input required type="number" min="0" value={draft.inventory} onChange={(e) => updateDraft("inventory", e.target.value)} className={`mt-2 ${inputClass}`} /></label>
              <div className="flex flex-wrap items-end gap-5 pb-3">{[["isNew", "Novidade"], ["isFeatured", "Destaque"], ["isPremium", "Premium"]].map(([key, label]) => <label key={key} className="flex items-center gap-2 text-sm text-white"><input type="checkbox" checked={draft[key as "isNew" | "isFeatured" | "isPremium"]} onChange={(e) => updateDraft(key as "isNew" | "isFeatured" | "isPremium", e.target.checked)} className="accent-neon-blue" /> {label}</label>)}</div>
              <label className="text-sm text-silver md:col-span-2">Descricao (opcional)<textarea rows={4} value={draft.description} onChange={(e) => updateDraft("description", e.target.value)} className={`mt-2 ${inputClass}`} /></label>
              <div className="grid grid-cols-4 gap-3 md:col-span-2"><label className="text-sm text-silver">Peso (kg)<input required type="number" min="0.01" step="0.01" value={draft.weight} onChange={(e) => updateDraft("weight", e.target.value)} className={`mt-2 ${inputClass}`} /></label><label className="text-sm text-silver">Largura (cm)<input required type="number" min="1" value={draft.width} onChange={(e) => updateDraft("width", e.target.value)} className={`mt-2 ${inputClass}`} /></label><label className="text-sm text-silver">Altura (cm)<input required type="number" min="1" value={draft.height} onChange={(e) => updateDraft("height", e.target.value)} className={`mt-2 ${inputClass}`} /></label><label className="text-sm text-silver">Comprimento (cm)<input required type="number" min="1" value={draft.length} onChange={(e) => updateDraft("length", e.target.value)} className={`mt-2 ${inputClass}`} /></label></div>
              <div className="text-sm text-silver">
                <p>Imagens *</p>
                <label className={`mt-2 flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded border border-dashed px-4 py-5 text-center transition-colors ${uploading ? "cursor-wait border-border opacity-60" : "border-neon-blue/60 hover:border-neon-blue hover:bg-neon-blue/5"}`}>
                  <Upload className="text-neon-blue" size={24} />
                  <span className="font-bold text-white">{uploading ? "Enviando imagem..." : "Fazer upload de uma imagem"}</span>
                  <span className="text-xs">PNG, JPG ou WEBP de ate 4 MB</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={uploading}
                    className="sr-only"
                    onChange={(event) => {
                      const input = event.currentTarget;
                      void uploadImages(Array.from(input.files ?? [])).finally(() => { input.value = ""; });
                    }}
                  />
                </label>
                {draft.images.trim() && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {draft.images.split(/\n|,/).map((image) => image.trim()).filter(Boolean).map((image) => (
                      <div key={image} className="group relative aspect-square overflow-hidden rounded border border-border bg-black">
                        <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url("${image.replace(/"/g, "%22")}")` }} />
                        <button type="button" onClick={() => removeImage(image)} aria-label="Remover imagem" className="absolute right-1.5 top-1.5 rounded bg-black/80 p-1.5 text-white transition-colors hover:bg-red-500">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <label className="text-sm text-silver">Detalhes (um por linha)<textarea rows={5} value={draft.details} onChange={(e) => updateDraft("details", e.target.value)} placeholder="Material\nModelagem\nCuidados" className={`mt-2 ${inputClass}`} /></label>
            </div>

            <div className="mt-8 border-t border-border pt-6">
              <div className="flex items-center justify-between"><div><h3 className="flex items-center gap-2 font-montserrat text-lg font-bold uppercase text-white"><Boxes className="text-neon-blue" /> Variacoes</h3><p className="mt-1 text-xs text-silver">Tamanhos, cores, SKUs e estoque individual.</p></div><button type="button" onClick={() => updateDraft("variants", [...draft.variants, { sku: "", label: "", size: null, color: null, inventory: 0, image: null, priceOverride: null, isDefault: draft.variants.length === 0 }])} className="flex items-center gap-1 text-sm font-bold uppercase text-neon-blue hover:text-white"><Plus size={17} /> Adicionar</button></div>
              <div className="mt-4 space-y-3">{draft.variants.length === 0 ? <p className="rounded border border-dashed border-border p-5 text-center text-sm text-silver">Produto sem variacoes.</p> : draft.variants.map((variant, index) => <div key={index} className="grid gap-2 rounded border border-border bg-black p-3 md:grid-cols-[1.1fr_1.2fr_.7fr_.8fr_.7fr_.8fr_auto]">
                <input required value={variant.sku} onChange={(e) => updateVariant(index, "sku", e.target.value)} placeholder="SKU *" className={inputClass} />
                <input required value={variant.label} onChange={(e) => updateVariant(index, "label", e.target.value)} placeholder="Nome *" className={inputClass} />
                <input value={variant.size ?? ""} onChange={(e) => updateVariant(index, "size", e.target.value || null)} placeholder="Tam." className={inputClass} />
                <input value={variant.color ?? ""} onChange={(e) => updateVariant(index, "color", e.target.value || null)} placeholder="Cor" className={inputClass} />
                <input required type="number" min="0" value={variant.inventory} onChange={(e) => updateVariant(index, "inventory", Number(e.target.value))} title="Estoque" placeholder="Estoque" className={inputClass} />
                <input type="number" min="0" step="0.01" value={variant.priceOverride ?? ""} onChange={(e) => updateVariant(index, "priceOverride", e.target.value === "" ? null : Number(e.target.value))} title="Preco especifico" placeholder="Preco" className={inputClass} />
                <button type="button" onClick={() => updateDraft("variants", draft.variants.filter((_, itemIndex) => itemIndex !== index))} className="p-2 text-red-400 hover:text-white"><Trash2 size={18} /></button>
                <label className="flex items-center gap-2 text-xs text-silver md:col-span-full"><input type="radio" name="defaultVariant" checked={variant.isDefault} onChange={() => updateDraft("variants", draft.variants.map((item, itemIndex) => ({ ...item, isDefault: itemIndex === index })))} className="accent-neon-blue" /> Variacao padrao</label>
              </div>)}</div>
            </div>
            <div className="sticky bottom-0 mt-8 flex justify-end gap-3 border-t border-border bg-dark-blue pt-5"><button type="button" onClick={() => setEditorOpen(false)} className="rounded border border-border px-6 py-3 font-bold uppercase text-white hover:border-white">Cancelar</button><button disabled={saving || uploading} className="rounded bg-neon-blue px-6 py-3 font-bold uppercase text-black hover:bg-white disabled:opacity-50">{uploading ? "Enviando imagem..." : saving ? "Salvando..." : "Salvar produto"}</button></div>
          </form>
        </div>
      )}
    </section>
  );
}
