"use client";

import { useState } from "react";
import { Plus, ChevronDown, ChevronUp, Tag, PackageSearch } from "lucide-react";
import { Category, Product } from "@/types";
import { ProductDesktopRow } from "./ProductDesktopRow";
import { ProductMobileCard } from "./ProductMobileCard";
import { Button } from "../ui/Button";

interface ProductsCategorySectionsProps {
  categories: Category[];
  products: Product[];
  onEdit: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onStockChange: (product: Product, next: number) => Promise<void>;
  onCategoryChange: (product: Product, nextCategory: string) => Promise<void>;
  onAdjustStock?: (product: Product) => void;
  onViewHistory?: (product: Product) => void;
  onAddProductToCategory: (categorySlug: string) => void;
}

export function ProductsCategorySections({
  categories,
  products,
  onEdit,
  onDuplicate,
  onDelete,
  onStockChange,
  onCategoryChange,
  onAdjustStock,
  onViewHistory,
  onAddProductToCategory,
}: ProductsCategorySectionsProps) {
  // Collapsed sections tracking
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggleCollapse = (slug: string) => {
    setCollapsed((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  // Group products by category
  const knownSlugs = new Set(categories.map((c) => c.slug));
  const uncategorizedProducts = products.filter((p) => !knownSlugs.has(p.category));

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const catProducts = products.filter((p) => p.category === category.slug);
        const isCollapsed = Boolean(collapsed[category.slug]);

        return (
          <div
            key={category.id}
            id={`section-${category.slug}`}
            className="rounded-2xl border border-[var(--dash-border)] bg-[var(--dash-surface)] overflow-hidden shadow-xs transition-all"
          >
            {/* Section Header */}
            <div className="p-4 sm:px-5 flex items-center justify-between gap-3 bg-[var(--dash-surface-2)]/60 border-b border-[var(--dash-border)]">
              <div
                className="flex items-center gap-3 cursor-pointer select-none min-w-0"
                onClick={() => toggleCollapse(category.slug)}
              >
                <button
                  type="button"
                  className="p-1 rounded-md text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
                  aria-label={isCollapsed ? "Expandir sección" : "Colapsar sección"}
                >
                  {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{category.icon || "🏷️"}</span>
                    <h2 className="text-sm font-bold text-[var(--dash-text)] truncate">
                      {category.name}
                    </h2>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--dash-surface-3)] text-[var(--dash-text)]">
                      {catProducts.length}
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-xs text-[var(--dash-muted)] truncate max-w-md mt-0.5">
                      {category.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Action */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onAddProductToCategory(category.slug)}
                  icon={<Plus size={13} className="text-[var(--dash-accent)]" />}
                >
                  <span className="hidden sm:inline">Agregar a {category.name}</span>
                  <span className="sm:hidden">Agregar</span>
                </Button>
              </div>
            </div>

            {/* Section Body */}
            {!isCollapsed && (
              <div>
                {catProducts.length === 0 ? (
                  <div className="p-8 text-center flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-muted)] mb-2">
                      <Tag size={18} />
                    </div>
                    <p className="text-xs font-medium text-[var(--dash-muted)] mb-3">
                      No hay productos en esta categoría todavía.
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onAddProductToCategory(category.slug)}
                      icon={<Plus size={13} />}
                    >
                      Crear primer producto
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="admin-desktop-only overflow-x-auto">
                      <table className="admin-table w-full text-xs border-collapse">
                        <thead>
                          <tr className="bg-[var(--dash-surface-2)]/30 text-[var(--dash-muted)] font-semibold border-b border-[var(--dash-border)]">
                            <th className="text-left px-3.5 py-2.5">Producto</th>
                            <th className="text-left px-3.5 py-2.5">Categoría</th>
                            <th className="text-left px-3.5 py-2.5">Precio</th>
                            <th className="text-left px-3.5 py-2.5">Stock</th>
                            <th className="text-left px-3.5 py-2.5">Estado</th>
                            <th className="text-right px-3.5 py-2.5">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catProducts.map((product, idx) => (
                            <ProductDesktopRow
                              key={product.id}
                              product={product}
                              categories={categories}
                              index={idx}
                              onEdit={onEdit}
                              onDuplicate={onDuplicate}
                              onDelete={onDelete}
                              onStockChange={onStockChange}
                              onCategoryChange={onCategoryChange}
                              onAdjustStock={onAdjustStock}
                              onViewHistory={onViewHistory}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="admin-mobile-only p-3 flex flex-col gap-2.5">
                      {catProducts.map((product, idx) => (
                        <ProductMobileCard
                          key={product.id}
                          product={product}
                          categories={categories}
                          index={idx}
                          onEdit={onEdit}
                          onDuplicate={onDuplicate}
                          onDelete={onDelete}
                          onStockChange={onStockChange}
                          onCategoryChange={onCategoryChange}
                          onAdjustStock={onAdjustStock}
                          onViewHistory={onViewHistory}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Uncategorized products section if any */}
      {uncategorizedProducts.length > 0 && (
        <div className="rounded-2xl border border-[var(--dash-warning)]/30 bg-[var(--dash-surface)] overflow-hidden">
          <div className="p-4 sm:px-5 flex items-center justify-between gap-3 bg-[var(--dash-warning-bg)]/20 border-b border-[var(--dash-warning)]/20">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <h2 className="text-sm font-bold text-[var(--dash-text)]">
                Sin Categoría o Desconocida
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--dash-warning)] text-[var(--dash-bg)] font-bold">
                {uncategorizedProducts.length}
              </span>
            </div>
            <p className="text-xs text-[var(--dash-muted)]">
              Reasigná estos productos usando el selector en cada fila.
            </p>
          </div>

          <div className="admin-desktop-only overflow-x-auto">
            <table className="admin-table w-full text-xs border-collapse">
              <thead>
                <tr className="bg-[var(--dash-surface-2)]/30 text-[var(--dash-muted)] font-semibold border-b border-[var(--dash-border)]">
                  <th className="text-left px-3.5 py-2.5">Producto</th>
                  <th className="text-left px-3.5 py-2.5">Categoría</th>
                  <th className="text-left px-3.5 py-2.5">Precio</th>
                  <th className="text-left px-3.5 py-2.5">Stock</th>
                  <th className="text-left px-3.5 py-2.5">Estado</th>
                  <th className="text-right px-3.5 py-2.5">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {uncategorizedProducts.map((product, idx) => (
                  <ProductDesktopRow
                    key={product.id}
                    product={product}
                    categories={categories}
                    index={idx}
                    onEdit={onEdit}
                    onDuplicate={onDuplicate}
                    onDelete={onDelete}
                    onStockChange={onStockChange}
                    onCategoryChange={onCategoryChange}
                    onAdjustStock={onAdjustStock}
                    onViewHistory={onViewHistory}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-mobile-only p-3 flex flex-col gap-2.5">
            {uncategorizedProducts.map((product, idx) => (
              <ProductMobileCard
                key={product.id}
                product={product}
                categories={categories}
                index={idx}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onStockChange={onStockChange}
                onCategoryChange={onCategoryChange}
                onAdjustStock={onAdjustStock}
                onViewHistory={onViewHistory}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
