"use client";

import { useState } from "react";
import { Product, ProductCategory, ProductStatus } from "@/types";
import { ProductInput } from "@/lib/products";
import { getCategoryLabel } from "@/lib/utils";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";

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

const FORM_ID = "product-form";

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
    <AdminModal
      title={product ? "Editar producto" : "Nuevo producto"}
      onClose={onCancel}
      footer={
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <AdminButton variant="secondary" onClick={onCancel}>
            Cancelar
          </AdminButton>
          <AdminButton type="submit" form={FORM_ID} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </AdminButton>
        </div>
      }
    >
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        <AdminField label="Nombre">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="admin-input"
          />
        </AdminField>

        <AdminField label="Slug (opcional — se genera del nombre)">
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder={name ? slugify(name) : ""}
            className="admin-input"
          />
        </AdminField>

        <AdminField label="Descripción corta">
          <input
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="admin-input"
          />
        </AdminField>

        <AdminField label="Descripción larga (opcional)">
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            rows={3}
            className="admin-input"
            style={{ resize: "none" }}
          />
        </AdminField>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <AdminField label="Precio (ARS)">
            <input
              required
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="admin-input"
            />
          </AdminField>
          <AdminField label="Peso (opcional)">
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="500g"
              className="admin-input"
            />
          </AdminField>
        </div>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <AdminField label="Categoría">
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
          </AdminField>
          <AdminField label="Estado">
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

        <AdminField label="Marca (opcional)">
          <input
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="admin-input"
          />
        </AdminField>

        <AdminField label="Imágenes (rutas separadas por coma)">
          <input
            required
            value={images}
            onChange={(e) => setImages(e.target.value)}
            placeholder="/product_foo.png"
            className="admin-input"
          />
        </AdminField>

        <AdminField label="Tags (separados por coma, opcional)">
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="admin-input"
          />
        </AdminField>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: "var(--dash-text)",
          }}
        >
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
          />
          Mostrar en destacados de la home
        </label>

        {error && (
          <p style={{ fontSize: 13, color: "var(--dash-danger)" }}>{error}</p>
        )}
      </form>
    </AdminModal>
  );
}
