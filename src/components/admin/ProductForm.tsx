"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Product, ProductCategory, ProductStatus } from "@/types";
import { ProductInput } from "@/lib/products";
import { getCategoryLabel } from "@/lib/utils";

const CATEGORIES: ProductCategory[] = [
  "yerbas",
  "mates",
  "bombillas",
  "termos",
  "accesorios",
  "combos",
];

const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "available", label: "Disponible" },
  { value: "featured", label: "Destacado" },
  { value: "out_of_stock", label: "Agotado" },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface ProductFormProps {
  product?: Product;
  onSave: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  onSave,
  onCancel,
}: ProductFormProps) {
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [description, setDescription] = useState(product?.description ?? "");
  const [longDescription, setLongDescription] = useState(
    product?.longDescription ?? "",
  );
  const [price, setPrice] = useState(String(product?.price ?? ""));
  const [category, setCategory] = useState<ProductCategory>(
    product?.category ?? "yerbas",
  );
  const [status, setStatus] = useState<ProductStatus>(
    product?.status ?? "available",
  );
  const [images, setImages] = useState(product?.images.join(", ") ?? "");
  const [tags, setTags] = useState(product?.tags?.join(", ") ?? "");
  const [weight, setWeight] = useState(product?.weight ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave({
        name,
        slug: slug.trim() || slugify(name),
        description,
        longDescription: longDescription || undefined,
        price: Number(price),
        category,
        status,
        images: images
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        tags: tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        weight: weight || undefined,
        brand: brand || undefined,
        featured,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pava-brown/50 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto bg-white p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-pava-brown">
            {product ? "Editar producto" : "Nuevo producto"}
          </h2>
          <button
            onClick={onCancel}
            className="text-pava-brown/40 hover:text-pava-brown"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nombre">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Slug (opcional — se genera del nombre)">
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={name ? slugify(name) : ""}
              className="admin-input"
            />
          </Field>

          <Field label="Descripción corta">
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Descripción larga (opcional)">
            <textarea
              value={longDescription}
              onChange={(e) => setLongDescription(e.target.value)}
              rows={3}
              className="admin-input resize-none"
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio (ARS)">
              <input
                required
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="admin-input"
              />
            </Field>
            <Field label="Peso (opcional)">
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="500g"
                className="admin-input"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Categoría">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="admin-input"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {getCategoryLabel(c)}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Estado">
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
            </Field>
          </div>

          <Field label="Marca (opcional)">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="admin-input"
            />
          </Field>

          <Field label="Imágenes (rutas separadas por coma)">
            <input
              required
              value={images}
              onChange={(e) => setImages(e.target.value)}
              placeholder="/product_foo.png"
              className="admin-input"
            />
          </Field>

          <Field label="Tags (separados por coma, opcional)">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="admin-input"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-pava-brown">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
            />
            Mostrar en destacados de la home
          </label>

          {error && <p className="text-sm text-pava-terracotta">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm text-pava-brown/60 hover:text-pava-brown"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-pava-green px-5 py-2 text-sm font-medium text-pava-cream hover:bg-pava-green-light disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-pava-brown/60 uppercase tracking-wide">
        {label}
      </span>
      {children}
    </label>
  );
}
