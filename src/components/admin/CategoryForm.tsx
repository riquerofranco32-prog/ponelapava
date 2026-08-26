"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, ImageOff, Loader2 } from "lucide-react";
import { Category } from "@/types";
import { CategoryInput } from "@/lib/categories";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const FORM_ID = "category-form";

interface CategoryFormProps {
  category?: Category;
  onSave: (input: CategoryInput) => Promise<void>;
  onCancel: () => void;
}

export default function CategoryForm({
  category,
  onSave,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [icon, setIcon] = useState(category?.icon ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al subir imagen");
      setImage(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await onSave({
        name,
        slug: slug.trim() || slugify(name),
        description,
        image,
        icon,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminModal
      title={category ? "Editar categoría" : "Nueva categoría"}
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
        <AdminField label="Imagen">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                position: "relative",
                width: 72,
                height: 72,
                borderRadius: 8,
                overflow: "hidden",
                background: "var(--dash-surface-2)",
                border: "1px solid var(--dash-border)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {image ? (
                <Image
                  src={image}
                  alt=""
                  fill
                  sizes="72px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <ImageOff size={26} color="var(--dash-muted)" />
              )}
            </div>
            <AdminButton
              type="button"
              variant="secondary"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Camera size={14} />
              )}
              {uploading ? "Subiendo..." : "Cambiar foto"}
            </AdminButton>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              style={{ display: "none" }}
            />
          </div>
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

        <AdminField label="Descripción">
          <textarea
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="admin-input"
            style={{ resize: "none" }}
          />
        </AdminField>

        <AdminField label="Ícono / Emoji identificador">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["🧉", "🌿", "🪵", "👜", "🫖", "⚡", "⭐", "🎁", "🔥", "✨", "🍵", "🏔️"].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  style={{
                    fontSize: 16,
                    padding: "4px 8px",
                    borderRadius: 6,
                    border: icon === emoji ? "1.5px solid var(--dash-accent)" : "1px solid var(--dash-border)",
                    background: icon === emoji ? "var(--dash-accent-subtle)" : "var(--dash-surface-2)",
                    cursor: "pointer",
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="O escribí un emoji: 🧉"
              className="admin-input"
              style={{ maxWidth: 200 }}
            />
          </div>
        </AdminField>

        {error && (
          <p style={{ fontSize: 13, color: "var(--dash-danger)" }}>{error}</p>
        )}
      </form>
    </AdminModal>
  );
}
