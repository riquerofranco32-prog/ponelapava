"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Loader2, X } from "lucide-react";
import { Category, Product, ProductCategory, ProductStatus } from "@/types";
import { ProductInput } from "@/lib/products";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";

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
  categories: Category[];
  onSave: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
}

export default function ProductForm({
  product,
  categories,
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
    product?.category ?? categories[0]?.slug ?? "",
  );
  const [status, setStatus] = useState<ProductStatus>(
    product?.status ?? "available",
  );
  const [stock, setStock] = useState(String(product?.stock ?? 0));
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [tags, setTags] = useState(product?.tags?.join(", ") ?? "");
  const [weight, setWeight] = useState(product?.weight ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stock and availability are linked: hitting 0 auto-marks the product
  // out of stock, and restocking auto-clears it — the owner can still
  // override "Estado" by hand for anything the number alone can't capture
  // (e.g. discontinuing a product that still has units on the shelf).
  function handleStockChange(value: string) {
    setStock(value);
    const qty = Number(value);
    if (qty <= 0 && status !== "out_of_stock") {
      setStatus("out_of_stock");
    } else if (qty > 0 && status === "out_of_stock") {
      setStatus("available");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (images.length === 0) {
      setError("Agregá al menos una foto del producto.");
      return;
    }
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
        stock: Number(stock) || 0,
        images,
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
        <AdminField label="Fotos">
          <ImagePicker images={images} onChange={setImages} />
        </AdminField>

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
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.name}
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

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <AdminField label="Stock (unidades)">
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
          <AdminField label="Marca (opcional)">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="admin-input"
            />
          </AdminField>
        </div>

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

function ImagePicker({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir imagen");
      onChange([...images, data.url]);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Error al subir imagen",
      );
    } finally {
      setUploading(false);
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        {images.map((src, i) => (
          <div
            key={src + i}
            style={{
              position: "relative",
              width: 72,
              height: 72,
              borderRadius: 8,
              overflow: "hidden",
              background: "var(--dash-surface-2)",
              border: "1px solid var(--dash-border)",
              flexShrink: 0,
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="72px"
              style={{ objectFit: "cover" }}
            />
            <button
              type="button"
              onClick={() => removeImage(i)}
              aria-label="Quitar foto"
              style={{
                position: "absolute",
                top: 3,
                right: 3,
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.6)",
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <X size={11} />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            width: 72,
            height: 72,
            borderRadius: 8,
            border: "1px dashed var(--dash-border)",
            background: "var(--dash-surface-2)",
            color: "var(--dash-muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: uploading ? "default" : "pointer",
            flexShrink: 0,
          }}
        >
          {uploading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Camera size={18} />
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: "none" }}
        />
      </div>
      {uploadError && (
        <p style={{ fontSize: 12, color: "var(--dash-danger)", marginTop: 8 }}>
          {uploadError}
        </p>
      )}
    </div>
  );
}
