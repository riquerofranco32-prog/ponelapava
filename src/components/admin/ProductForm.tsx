"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Loader2,
  X,
  Sparkles,
  Link as LinkIcon,
  Star,
  ArrowLeft,
  ArrowRight,
  Upload,
  Clipboard,
  Plus,
} from "lucide-react";
import { Category, Product, ProductCategory, ProductStatus } from "@/types";
import { ProductInput } from "@/lib/products";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { formatPrice } from "@/lib/utils";

const STATUSES: { value: ProductStatus; label: string }[] = [
  { value: "available", label: "Disponible" },
  { value: "featured", label: "Destacado" },
  { value: "out_of_stock", label: "Agotado" },
];

const QUICK_TAGS = [
  "Calabaza",
  "Cuero Vacuno",
  "Alpaca",
  "Cincelado",
  "Acero Inox",
  "Térmico",
  "Pico de Loro",
  "Estacionamiento Natural",
  "Sin Polvo",
  "Orgánica",
  "Premium",
  "Artesanal",
  "Ideal Regalo",
  "Edición Especial",
];

const PRESETS = [
  {
    icon: "🧉",
    label: "Mate Imperial",
    category: "mates",
    name: "Mate Imperial de Calabaza con Virola Cincelada",
    description: "Mate de calabaza seleccionada forrado en cuero vacuno con virola de alpaca cincelada a mano.",
    longDescription: "Pieza artesanal única fabricada con calabaza gruesa de máxima calidad y durabilidad. Forrado en cuero legítimo con costuras reforzadas y virola de alpaca cincelada con motivos tradicionales.",
    tags: "Calabaza, Cuero Vacuno, Alpaca, Cincelado, Artesanal, Premium",
    price: "45000",
    weight: "350g",
    brand: "Poné La Pava",
    stock: "8",
  },
  {
    icon: "🧉",
    label: "Mate Camionero",
    category: "mates",
    name: "Mate Camionero Cuero y Alpaca",
    description: "Mate camionero de boca ancha forrado en cuero vacuno de primera selección.",
    longDescription: "El clásico de todos los días. Boca ancha ideal para una cebada cómoda y rendidora. Base firme de 4 patas reforzadas.",
    tags: "Calabaza, Cuero Vacuno, Boca Ancha, Artesanal",
    price: "38000",
    weight: "320g",
    brand: "Poné La Pava",
    stock: "10",
  },
  {
    icon: "🥄",
    label: "Bombilla Pico de Loro",
    category: "bombillas",
    name: "Bombilla Pico de Loro de Alpaca Maciza",
    description: "Bombilla curva pico de loro de alpaca maciza con filtro de pala ranurada.",
    longDescription: "Excelente flujo de infusión y filtrado superior. No se tapa ni calienta los labios gracias a su aleación de alpaca premium.",
    tags: "Alpaca, Pico de Loro, Filtro Pala, Premium",
    price: "18500",
    weight: "60g",
    brand: "Poné La Pava",
    stock: "15",
  },
  {
    icon: "🥤",
    label: "Termo de Acero",
    category: "termos",
    name: "Termo de Acero Inoxidable 1L Doble Capa",
    description: "Termo térmico de 1 litro con tecnología de aislamiento al vacío por 24hs.",
    longDescription: "Fabricado en acero inoxidable 18/8 libre de BPA. Mantiene agua caliente por más de 24 horas. Pico matero cebador de precisión antiderrame.",
    tags: "Acero Inox, Térmico, Pico Cebador, 1 Litro",
    price: "55000",
    weight: "800g",
    brand: "Poné La Pava",
    stock: "6",
  },
  {
    icon: "🌿",
    label: "Yerba Mate Especial",
    category: "yerbas",
    name: "Yerba Mate Selección Especial 500g",
    description: "Yerba mate con 24 meses de estacionamiento natural y molienda equilibrada.",
    longDescription: "Sabor suave y duradero con bajo contenido de polvo. No produce acidez y rinde hasta el último mate.",
    tags: "Estacionamiento Natural, Sin Polvo, Suave, 500g",
    price: "4200",
    weight: "500g",
    brand: "Selección Especial",
    stock: "25",
  },
  {
    icon: "🎒",
    label: "Matera / Bolso",
    category: "accesorios",
    name: "Matera de Cuero Genuino Reforzada",
    description: "Matera de cuero vacuno con divisiones internas para termo, mate y yerbera.",
    longDescription: "Estructura rígida y cómoda correa regulable. Diseñada para llevar el equipo matero completo a todos lados con estilo y seguridad.",
    tags: "Cuero Vacuno, Matera, Viaje, Reforzada",
    price: "68000",
    weight: "750g",
    brand: "Poné La Pava",
    stock: "4",
  },
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
  const isEditing = Boolean(product);
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
  const [stock, setStock] = useState(
    product?.stock !== undefined ? String(product.stock) : "5",
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [tags, setTags] = useState(product?.tags?.join(", ") ?? "");
  const [weight, setWeight] = useState(product?.weight ?? "");
  const [brand, setBrand] = useState(product?.brand ?? "Poné La Pava");
  const [featured, setFeatured] = useState(product?.featured ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stock and availability link
  function handleStockChange(value: string) {
    setStock(value);
    const qty = Number(value);
    if (qty <= 0 && status !== "out_of_stock") {
      setStatus("out_of_stock");
    } else if (qty > 0 && status === "out_of_stock") {
      setStatus("available");
    }
  }

  function handleApplyPreset(preset: (typeof PRESETS)[0]) {
    setName(preset.name);
    setSlug(slugify(preset.name));
    setDescription(preset.description);
    setLongDescription(preset.longDescription);
    setPrice(preset.price);
    setWeight(preset.weight);
    setBrand(preset.brand);
    setStock(preset.stock);
    setTags(preset.tags);

    // Find category matching slug or fallback
    const matchedCategory = categories.find((c) => c.slug.includes(preset.category) || preset.category.includes(c.slug));
    if (matchedCategory) {
      setCategory(matchedCategory.slug);
    }
  }

  function handleAddTag(tag: string) {
    const currentTags = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (!currentTags.includes(tag)) {
      setTags([...currentTags, tag].join(", "));
    }
  }

  function handleAutoSuggestDescription() {
    if (!name.trim()) return;
    const catLabel = categories.find((c) => c.slug === category)?.name || "producto";
    const suggested = `${name.trim()} de primera calidad artesanal. Ideal para disfrutar los mejores momentos materos con estilo y durabilidad.`;
    setDescription(suggested);
    if (!longDescription) {
      setLongDescription(
        `Fabricado cuidando cada detalle con materiales nobles seleccionados. Producto destacado de la categoría ${catLabel}. Excelente terminación y gran durabilidad para el uso diario o para regalar.`
      );
    }
  }

  function adjustPricePct(multiplier: number) {
    const current = Number(price);
    if (!current || isNaN(current)) return;
    const next = Math.round((current * multiplier) / 100) * 100;
    setPrice(String(next));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (images.length === 0) {
      setError("Agregá al menos una foto del producto.");
      return;
    }
    if (!price || Number(price) <= 0) {
      setError("Ingresá un precio válido mayor a 0.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        name: name.trim(),
        slug: slug.trim() || slugify(name),
        description: description.trim(),
        longDescription: longDescription.trim() || undefined,
        price: Number(price),
        category,
        status,
        stock: Number(stock) || 0,
        images,
        tags: tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        weight: weight.trim() || undefined,
        brand: brand.trim() || undefined,
        featured,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  const numericPrice = Number(price);

  return (
    <AdminModal
      title={isEditing ? "Editar producto" : "Nuevo producto"}
      onClose={onCancel}
      maxWidth={680}
      footer={
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
          }}
        >
          <span style={{ fontSize: 12, color: "var(--dash-muted)" }}>
            * Campos obligatorios
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <AdminButton variant="secondary" onClick={onCancel} disabled={saving}>
              Cancelar
            </AdminButton>
            <AdminButton type="submit" form={FORM_ID} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 size={15} className="animate-spin" /> Guardando...
                </>
              ) : isEditing ? (
                "Guardar cambios"
              ) : (
                "Crear producto"
              )}
            </AdminButton>
          </div>
        </div>
      }
    >
      {/* Quick Fill Presets Bar (for fast product creation) */}
      {!isEditing && (
        <div
          style={{
            padding: "12px 14px",
            marginBottom: 16,
            borderRadius: 10,
            background: "var(--dash-surface-2)",
            border: "1px solid var(--dash-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 700,
              color: "var(--dash-accent)",
              marginBottom: 8,
            }}
          >
            <Sparkles size={14} />
            <span>Carga Rápida con Plantillas:</span>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "4px 10px",
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 600,
                  background: "var(--dash-surface-3)",
                  border: "1px solid var(--dash-border)",
                  color: "var(--dash-text)",
                  cursor: "pointer",
                  transition: "background-color 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--dash-accent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--dash-border)";
                }}
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {/* Photos section */}
        <AdminField label="Fotos del producto *">
          <EnhancedImagePicker images={images} onChange={setImages} />
        </AdminField>

        {/* Name & Slug */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
          <AdminField label="Nombre del producto *">
            <input
              required
              placeholder="Ej: Mate Imperial de Calabaza Cincelado"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slug || slug === slugify(name)) {
                  setSlug(slugify(e.target.value));
                }
              }}
              className="admin-input"
            />
          </AdminField>

          <AdminField label="Slug URL (identificador)">
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={name ? slugify(name) : "mate-imperial-cincelado"}
              className="admin-input"
              style={{ fontSize: 13, color: "var(--dash-muted)" }}
            />
          </AdminField>
        </div>

        {/* Short & Long Description */}
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text)" }}>
              Descripción corta *
            </span>
            {name.trim().length > 0 && (
              <button
                type="button"
                onClick={handleAutoSuggestDescription}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--dash-accent)",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "2px 6px",
                  borderRadius: 4,
                }}
              >
                <Sparkles size={12} /> Sugerir texto
              </button>
            )}
          </div>
          <input
            required
            placeholder="Resumen atractivo en 1 o 2 líneas..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="admin-input"
          />
        </div>

        <AdminField label="Descripción detallada (opcional)">
          <textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            rows={3}
            placeholder="Detalles sobre materiales, cuidados de curado, dimensiones y recomendaciones..."
            className="admin-input"
            style={{ resize: "vertical", minHeight: 70 }}
          />
        </AdminField>

        {/* Price & Weight Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 items-start">
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 600, color: "var(--dash-text)" }}>
                Precio (ARS) *
              </span>
              {!isNaN(numericPrice) && numericPrice > 0 && (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: "var(--dash-accent)",
                  }}
                >
                  {formatPrice(numericPrice)}
                </span>
              )}
            </div>
            <input
              required
              type="number"
              min={0}
              step={100}
              placeholder="35000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="admin-input"
            />
            {numericPrice > 0 && (
              <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ display: "flex", gap: 4 }}>
                  <button
                    type="button"
                    onClick={() => adjustPricePct(1.1)}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "var(--dash-surface-2)",
                      border: "1px solid var(--dash-border)",
                      color: "var(--dash-muted)",
                      cursor: "pointer",
                    }}
                    title="Aumentar 10%"
                  >
                    +10%
                  </button>
                  <button
                    type="button"
                    onClick={() => adjustPricePct(1.2)}
                    style={{
                      fontSize: 10,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: 4,
                      background: "var(--dash-surface-2)",
                      border: "1px solid var(--dash-border)",
                      color: "var(--dash-muted)",
                      cursor: "pointer",
                    }}
                    title="Aumentar 20%"
                  >
                    +20%
                  </button>
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "var(--dash-muted)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                    padding: "4px 6px",
                    borderRadius: 4,
                    background: "var(--dash-surface-2)",
                  }}
                >
                  <span style={{ color: "#10b981", fontWeight: 600 }}>
                    ⚡ 10% OFF Transf: ${Math.round(numericPrice * 0.9).toLocaleString("es-AR")}
                  </span>
                  <span>
                    💳 3 cuotas de ${Math.round(numericPrice / 3).toLocaleString("es-AR")}
                  </span>
                </div>
              </div>
            )}
          </div>

          <AdminField label="Peso / Medida (opcional)">
            <input
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ej: 350g, 1L, 500g"
              className="admin-input"
            />
          </AdminField>
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

        {/* Stock & Brand */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <AdminField label="Stock disponible (unidades) *">
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

          <AdminField label="Marca / Taller">
            <input
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Poné La Pava"
              className="admin-input"
            />
          </AdminField>
        </div>

        {/* Tags and Tag Suggestions */}
        <div>
          <AdminField label="Etiquetas / Tags (búsqueda y filtros)">
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="Ej: Calabaza, Cuero, Alpaca, Cincelado"
              className="admin-input"
            />
          </AdminField>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: 6 }}>
            {QUICK_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleAddTag(tag)}
                style={{
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 999,
                  background: "var(--dash-surface-2)",
                  border: "1px solid var(--dash-border)",
                  color: "var(--dash-muted)",
                  cursor: "pointer",
                }}
              >
                + {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Featured switch */}
        <div
          style={{
            padding: "12px 14px",
            borderRadius: 10,
            background: "var(--dash-surface-2)",
            border: "1px solid var(--dash-border)",
          }}
        >
          <AdminToggle
            checked={featured}
            onChange={setFeatured}
            label="⭐ Destacar en la página principal (Home)"
          />
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: "var(--dash-danger-bg)",
              border: "1px solid var(--dash-danger-border)",
              color: "var(--dash-danger)",
              fontSize: 13,
            }}
          >
            {error}
          </div>
        )}
      </form>
    </AdminModal>
  );
}

// ── Supercharged ImagePicker with Drag & Drop, Multi-upload, Paste & URL support ──
function EnhancedImagePicker({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Paste image directly from clipboard (Ctrl+V)
  useEffect(() => {
    async function handlePaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith("image/")) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        uploadMultipleFiles(imageFiles);
      }
    }

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images]);

  async function uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/products/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Error al subir foto");
    return data.url;
  }

  async function uploadMultipleFiles(files: File[]) {
    if (files.length === 0) return;
    setUploading(true);
    setUploadError(null);
    try {
      const uploadedUrls = await Promise.all(files.map(uploadFile));
      onChange([...images, ...uploadedUrls]);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Error al subir imágenes",
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    e.target.value = "";
    uploadMultipleFiles(files);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragOver(false);
    const fileList = e.dataTransfer.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    if (files.length === 0) {
      setUploadError("Solamente podés soltar archivos de imagen (JPG, PNG, WebP).");
      return;
    }
    uploadMultipleFiles(files);
  }

  function handleAddUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://") && !trimmed.startsWith("/")) {
      setUploadError("Ingresá un enlace web válido (https://...)");
      return;
    }
    onChange([...images, trimmed]);
    setUrlInput("");
    setShowUrlInput(false);
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function makeCover(index: number) {
    if (index === 0) return;
    const next = [...images];
    const [selected] = next.splice(index, 1);
    next.unshift(selected);
    onChange(next);
  }

  function moveImage(from: number, to: number) {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  }

  return (
    <div>
      {/* Thumbnails grid */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
        {images.map((src, i) => (
          <div
            key={src + i}
            style={{
              position: "relative",
              width: 88,
              height: 88,
              borderRadius: 10,
              overflow: "hidden",
              background: "var(--dash-surface-2)",
              border: i === 0 ? "2px solid var(--dash-accent)" : "1px solid var(--dash-border)",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              flexShrink: 0,
            }}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes="88px"
              style={{ objectFit: "cover" }}
            />

            {/* Cover badge */}
            {i === 0 ? (
              <span
                style={{
                  position: "absolute",
                  bottom: 3,
                  left: 3,
                  right: 3,
                  fontSize: 9,
                  fontWeight: 800,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  textAlign: "center",
                  background: "var(--dash-accent)",
                  color: "#182b1d",
                  borderRadius: 4,
                  padding: "1px 0",
                }}
              >
                Portada
              </span>
            ) : (
              <button
                type="button"
                onClick={() => makeCover(i)}
                title="Convertir en foto de portada"
                style={{
                  position: "absolute",
                  bottom: 3,
                  left: 3,
                  right: 3,
                  fontSize: 9,
                  fontWeight: 700,
                  textAlign: "center",
                  background: "rgba(0,0,0,0.7)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  padding: "2px 0",
                  cursor: "pointer",
                }}
              >
                Hacer Portada
              </button>
            )}

            {/* Remove button */}
            <button
              type="button"
              onClick={() => removeImage(i)}
              aria-label="Quitar foto"
              title="Eliminar foto"
              style={{
                position: "absolute",
                top: 4,
                right: 4,
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              <X size={12} />
            </button>

            {/* Move Left / Right buttons */}
            {images.length > 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  left: 4,
                  display: "flex",
                  gap: 2,
                }}
              >
                {i > 0 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i - 1)}
                    title="Mover a la izquierda"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: "rgba(0,0,0,0.65)",
                      color: "#fff",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <ArrowLeft size={10} />
                  </button>
                )}
                {i < images.length - 1 && (
                  <button
                    type="button"
                    onClick={() => moveImage(i, i + 1)}
                    title="Mover a la derecha"
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 4,
                      background: "rgba(0,0,0,0.65)",
                      color: "#fff",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    <ArrowRight size={10} />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Drag & Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: "20px 16px",
          borderRadius: 10,
          border: isDragOver
            ? "2px dashed var(--dash-accent)"
            : "1px dashed var(--dash-border)",
          background: isDragOver
            ? "rgba(199, 166, 122, 0.1)"
            : "var(--dash-surface-2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          cursor: uploading ? "wait" : "pointer",
          transition: "all 0.2s ease",
        }}
      >
        {uploading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--dash-accent)" }}>
            <Loader2 size={20} className="animate-spin" />
            <span style={{ fontSize: 13, fontWeight: 600 }}>Subiendo imágenes...</span>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--dash-accent)" }}>
              <Upload size={18} />
              <span style={{ fontSize: 13, fontWeight: 600 }}>
                Hacé clic para subir fotos o arrastralas acá
              </span>
            </div>
            <span style={{ fontSize: 11, color: "var(--dash-muted)" }}>
              Podés seleccionar varias fotos a la vez o pegar con <strong>Ctrl + V</strong> (JPG, PNG, WebP)
            </span>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileInputChange}
        style={{ display: "none" }}
      />

      {/* Alternative URL Link option */}
      <div style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{
            background: "none",
            border: "none",
            fontSize: 11,
            color: "var(--dash-muted)",
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          <LinkIcon size={12} /> {showUrlInput ? "Ocultar opción URL" : "O agregar imagen por enlace URL"}
        </button>

        {images.length > 0 && (
          <span style={{ fontSize: 11, color: "var(--dash-muted)" }}>
            {images.length} foto{images.length !== 1 ? "s" : ""} cargada{images.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {showUrlInput && (
        <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
          <input
            type="url"
            placeholder="https://ejemplo.com/foto-mate.jpg"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="admin-input"
            style={{ fontSize: 12, padding: "6px 10px" }}
          />
          <AdminButton variant="secondary" onClick={handleAddUrl} type="button">
            Agregar
          </AdminButton>
        </div>
      )}

      {uploadError && (
        <p style={{ fontSize: 12, color: "var(--dash-danger)", marginTop: 6 }}>
          {uploadError}
        </p>
      )}
    </div>
  );
}
