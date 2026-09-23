"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { Category, Product, ProductCategory, ProductStatus, Supplier } from "@/types";
import { ProductInput } from "@/lib/products";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";
import { formatPrice } from "@/lib/utils";
import {
  ProductFormPresets,
  type PresetItem,
} from "./products/form/ProductFormPresets";
import { ProductImagesUploader } from "./products/form/ProductImagesUploader";
import { ProductLivePreview } from "./products/form/ProductLivePreview";

const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "available", label: "Disponible" },
  { value: "featured", label: "Destacado" },
  { value: "out_of_stock", label: "Agotado" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProductForm({
  product,
  categories,
  onSave,
  onClose,
  onCancel,
}: {
  product?: Product;
  categories: Category[];
  onSave: (data: ProductInput) => Promise<void>;
  onClose?: () => void;
  onCancel?: () => void;
}) {
  const handleClose = onClose || onCancel || (() => {});
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [longDescription, setLongDescription] = useState(
    product?.longDescription ?? ""
  );
  const [price, setPrice] = useState(product ? String(product.price) : "");
  const [costPrice, setCostPrice] = useState(
    product?.costPrice !== undefined ? String(product.costPrice) : ""
  );
  const [weight, setWeight] = useState(product?.weight ?? "");
  const [category, setCategory] = useState<ProductCategory>(
    product?.category ?? categories[0]?.slug ?? "mates"
  );
  const [status, setStatus] = useState<ProductStatus>(
    product?.status ?? "available"
  );
  const [stock, setStock] = useState(product ? String(product.stock) : "10");
  const [minStock, setMinStock] = useState(
    product?.minStock !== undefined ? String(product.minStock) : "5"
  );
  const [supplierId, setSupplierId] = useState(product?.supplierId ?? "");
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [images, setImages] = useState<string[]>(
    product?.images && product.images.length > 0 ? product.images : []
  );
  const [tagsInput, setTagsInput] = useState(product?.tags?.join(", ") ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "Poné La Pava");
  const [featured, setFeatured] = useState(product?.featured ?? false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/suppliers")
      .then((r) => (r.ok ? r.json() : []))
      .then(setSuppliers)
      .catch(() => {});
  }, []);

  const parsedTags = tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const numericPrice = parseFloat(price);
  const numericCost = parseFloat(costPrice);
  const numericStock = parseInt(stock, 10);
  const numericMinStock = parseInt(minStock, 10);

  const hasValidMargin =
    !isNaN(numericPrice) &&
    !isNaN(numericCost) &&
    numericPrice > 0 &&
    numericCost > 0;
  const marginPct = hasValidMargin
    ? (((numericPrice - numericCost) / numericPrice) * 100).toFixed(0)
    : null;
  const grossProfit = hasValidMargin ? numericPrice - numericCost : null;

  function handleApplyPreset(p: PresetItem) {
    setName(p.name);
    setSlug(slugify(p.name));
    setDescription(p.description);
    setLongDescription(p.longDescription);
    setPrice(p.price);
    setWeight(p.weight);
    setCategory(p.category);
    setBrand(p.brand);
    setStock(p.stock);
    setTagsInput(p.tags);
  }

  function handleToggleTag(tag: string) {
    const clean = tag.trim();
    const existing = parsedTags.map((t) => t.toLowerCase());
    if (existing.includes(clean.toLowerCase())) {
      setTagsInput(
        parsedTags.filter((t) => t.toLowerCase() !== clean.toLowerCase()).join(", ")
      );
    } else {
      setTagsInput(parsedTags.length > 0 ? `${tagsInput.trim()}, ${clean}` : clean);
    }
  }

  function handleStockChange(val: string) {
    setStock(val);
    const num = parseInt(val, 10);
    if (!isNaN(num)) {
      if (num === 0 && status !== "out_of_stock") {
        setStatus("out_of_stock");
      } else if (num > 0 && status === "out_of_stock") {
        setStatus("available");
      }
    }
  }

  function adjustPricePct(factor: number) {
    if (!isNaN(numericPrice) && numericPrice > 0) {
      setPrice(String(Math.round((numericPrice * factor) / 50) * 50));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return setError("El nombre es obligatorio");
    if (isNaN(numericPrice) || numericPrice <= 0)
      return setError("El precio debe ser mayor a 0");
    if (isNaN(numericStock) || numericStock < 0)
      return setError("El stock debe ser 0 o más");
    if (images.length === 0)
      return setError("Debes subir al menos una imagen del producto");

    setSaving(true);
    setError(null);

    const generatedSlug = slug.trim() ? slugify(slug) : slugify(name);

    try {
      await onSave({
        name: name.trim(),
        slug: generatedSlug,
        description: description.trim(),
        longDescription: longDescription.trim() || undefined,
        price: numericPrice,
        costPrice: !isNaN(numericCost) && numericCost >= 0 ? numericCost : undefined,
        minStock: !isNaN(numericMinStock) && numericMinStock >= 0 ? numericMinStock : 5,
        supplierId: supplierId.trim() || undefined,
        weight: weight.trim() || undefined,
        category,
        images,
        stock: numericStock,
        status,
        featured,
        tags: parsedTags,
        brand: brand.trim() || undefined,
      });
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
      setSaving(false);
    }
  }

  const categoryLabel = categories.find((c) => c.slug === category)?.name;

  return (
    <AdminModal
      title={product ? `Editar: ${product.name}` : "Nuevo Producto"}
      onClose={handleClose}
      maxWidth={1040}
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {error && (
              <span className="text-xs text-[var(--dash-danger)] font-medium">
                {error}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <AdminButton variant="secondary" onClick={handleClose} disabled={saving}>
              Cancelar
            </AdminButton>
            <AdminButton
              variant="primary"
              onClick={() => {
                const formEl = document.getElementById("admin-product-form") as HTMLFormElement;
                formEl?.requestSubmit();
              }}
              disabled={saving}
            >
              {saving ? "Guardando..." : product ? "Guardar Cambios" : "Crear Producto"}
            </AdminButton>
          </div>
        </div>
      }
    >
      <form
        id="admin-product-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8"
      >
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-7 space-y-5">
          {/* Quick Presets for New Products */}
          {!product && (
            <ProductFormPresets
              onApplyPreset={handleApplyPreset}
              onToggleTag={handleToggleTag}
              selectedTags={parsedTags}
            />
          )}

          {/* Name & Slug */}
          <div className="space-y-3">
            <AdminField label="Nombre del producto *">
              <input
                required
                placeholder="Ej: Mate Imperial de Calabaza"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!product) setSlug(slugify(e.target.value));
                }}
                className="admin-input"
              />
            </AdminField>

            <AdminField label="Slug URL (identificador)">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder={name ? slugify(name) : "mate-imperial-calabaza"}
                className="admin-input text-xs text-[var(--dash-muted)] font-mono"
              />
            </AdminField>
          </div>

          {/* Descriptions */}
          <div className="space-y-3">
            <AdminField label="Descripción corta *">
              <input
                required
                placeholder="Resumen atractivo en 1 o 2 líneas..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="admin-input text-sm"
              />
            </AdminField>

            <AdminField label="Descripción detallada (opcional)">
              <textarea
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                rows={3}
                placeholder="Materiales, cuidados de curado, dimensiones y recomendaciones..."
                className="admin-input text-xs"
              />
            </AdminField>
          </div>

          {/* Price, Cost & Margin Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
                  Precio de venta (ARS) *
                </span>
                {!isNaN(numericPrice) && numericPrice > 0 && (
                  <span className="text-xs font-bold text-[var(--dash-accent)] font-serif">
                    {formatPrice(numericPrice)}
                  </span>
                )}
              </div>
              <input
                required
                type="number"
                min={0}
                step={100}
                placeholder="45000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="admin-input"
              />
              {numericPrice > 0 && (
                <div className="flex gap-1.5 mt-1.5">
                  <button
                    type="button"
                    onClick={() => adjustPricePct(1.1)}
                    className="px-2 py-0.5 rounded text-xs bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                  >
                    +10%
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPricePct(1.2)}
                    className="px-2 py-0.5 rounded text-xs bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                  >
                    +20%
                  </button>
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
                  Costo unitario (ARS)
                </span>
                {hasValidMargin && marginPct && (
                  <span className="text-xs font-bold text-[var(--dash-success)]">
                    Margen: +{marginPct}% (+{formatPrice(grossProfit!)})
                  </span>
                )}
              </div>
              <input
                type="number"
                min={0}
                step={100}
                placeholder="Ej: 22000"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="admin-input"
              />
              <span className="block text-[11px] text-[var(--dash-muted)] mt-1">
                Utilizado para calcular márgenes brutos y reposición.
              </span>
            </div>
          </div>

          {/* Category & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Categoría *">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="admin-input"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.name}
                  </option>
                ))}
              </select>
            </AdminField>

            <AdminField label="Estado en tienda">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProductStatus)}
                className="admin-input"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>

          {/* Stock, Min Stock & Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <AdminField label="Stock actual *">
              <input
                required
                type="number"
                min={0}
                step={1}
                value={stock}
                onChange={(e) => handleStockChange(e.target.value)}
                className="admin-input"
              />
            </AdminField>

            <AdminField label="Stock mín. (alerta)">
              <input
                type="number"
                min={0}
                step={1}
                placeholder="5"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="admin-input"
              />
            </AdminField>

            <AdminField label="Proveedor">
              <select
                value={supplierId}
                onChange={(e) => setSupplierId(e.target.value)}
                className="admin-input text-xs"
              >
                <option value="">Sin proveedor asignado</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </AdminField>
          </div>

          {/* Weight & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <AdminField label="Peso / Medida (opcional)">
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ej: 350g, 1L, 500g"
                className="admin-input"
              />
            </AdminField>

            <AdminField label="Marca / Taller">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Poné La Pava"
                className="admin-input"
              />
            </AdminField>
          </div>

          {/* Tags */}
          <AdminField label="Etiquetas (separadas por coma)">
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Calabaza, Cuero Vacuno, Alpaca, Artesanal..."
              className="admin-input text-xs"
            />
          </AdminField>

          {/* Images Upload Section */}
          <div className="space-y-2 pt-2 border-t border-[var(--dash-border)]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
              Fotos del Producto *
            </label>
            <ProductImagesUploader images={images} onChange={setImages} />
          </div>
        </div>

        {/* Right Column: Sticky Live Preview */}
        <div className="lg:col-span-5">
          <ProductLivePreview
            name={name}
            description={description}
            price={numericPrice || 0}
            stock={numericStock || 0}
            status={status}
            categoryLabel={categoryLabel}
            images={images}
            tags={parsedTags}
            featured={status === "featured"}
          />
        </div>
      </form>
    </AdminModal>
  );
}

export default ProductForm;
