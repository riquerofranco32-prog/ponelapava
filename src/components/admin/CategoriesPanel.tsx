"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Category, Product } from "@/types";
import { CategoryInput } from "@/lib/categories";
import { assertOk } from "@/lib/admin-fetch";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { EmptyState } from "@/components/admin/EmptyState";
import { ProductThumb } from "@/components/admin/products/ProductThumb";
import { IconButton } from "@/components/admin/products/IconButton";
import CategoryForm from "@/components/admin/CategoryForm";
import { Tag } from "lucide-react";

interface CategoriesPanelProps {
  categories: Category[];
  products: Product[];
  onChange: () => void;
}

export default function CategoriesPanel({
  categories,
  products,
  onChange,
}: CategoriesPanelProps) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);

  function productCount(slug: string): number {
    return products.filter((p) => p.category === slug).length;
  }

  async function handleCreate(input: CategoryInput) {
    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    assertOk(res, "No se pudo crear la categoría");
    setCreating(false);
    onChange();
  }

  async function handleUpdate(id: string, input: CategoryInput) {
    const res = await fetch(`/api/admin/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    assertOk(res, "No se pudo actualizar la categoría");
    setEditing(null);
    onChange();
  }

  async function handleDelete(category: Category) {
    const res = await fetch(`/api/admin/categories/${category.id}`, {
      method: "DELETE",
    });
    assertOk(res, "No se pudo eliminar la categoría");
    setDeleting(null);
    onChange();
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: 20,
        }}
      >
        <AdminButton onClick={() => setCreating(true)}>
          <Plus size={15} />
          Nueva categoría
        </AdminButton>
      </div>

      {categories.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="Todavía no hay categorías"
          description="Creá la primera para poder asignarla a tus productos."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 14,
          }}
        >
          {categories.map((category) => {
            const count = productCount(category.slug);
            return (
              <AdminCard key={category.id}>
                <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                  <ProductThumb src={category.image} size={48} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--dash-text)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {category.icon} {category.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--dash-muted)" }}>
                      /{category.slug} · {count}{" "}
                      {count === 1 ? "producto" : "productos"}
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--dash-muted)",
                    marginBottom: 14,
                    minHeight: 34,
                  }}
                >
                  {category.description}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    justifyContent: "flex-end",
                  }}
                >
                  <IconButton
                    title="Editar"
                    icon={Pencil}
                    onClick={() => setEditing(category)}
                  />
                  <IconButton
                    title="Eliminar"
                    icon={Trash2}
                    danger
                    onClick={() => setDeleting(category)}
                  />
                </div>
              </AdminCard>
            );
          })}
        </div>
      )}

      {creating && (
        <CategoryForm
          onSave={handleCreate}
          onCancel={() => setCreating(false)}
        />
      )}
      {editing && (
        <CategoryForm
          category={editing}
          onSave={(input) => handleUpdate(editing.id, input)}
          onCancel={() => setEditing(null)}
        />
      )}
      {deleting && (
        <ConfirmDialog
          title="Eliminar categoría"
          message={
            productCount(deleting.slug) > 0
              ? `"${deleting.name}" tiene ${productCount(deleting.slug)} producto${
                  productCount(deleting.slug) === 1 ? "" : "s"
                } asignado${
                  productCount(deleting.slug) === 1 ? "" : "s"
                }. Si la eliminás, esos productos quedan con una categoría que ya no existe. ¿Eliminar de todos modos?`
              : `¿Eliminar "${deleting.name}"? Esta acción no se puede deshacer.`
          }
          onConfirm={() => handleDelete(deleting)}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
