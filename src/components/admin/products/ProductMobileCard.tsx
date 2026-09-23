"use client";

import { Edit2, Trash2, Copy, ExternalLink, SlidersHorizontal, History, AlertTriangle } from "lucide-react";
import { Product, Category } from "@/types";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import { ProductThumb } from "./ProductThumb";
import { StockStepper } from "./StockStepper";
import { StatusBadge } from "./StatusBadge";
import { IconButton } from "./IconButton";

export function ProductMobileCard({
  product,
  categories,
  index = 0,
  onEdit,
  onDuplicate,
  onDelete,
  onStockChange,
  onCategoryChange,
  onAdjustStock,
  onViewHistory,
}: {
  product: Product;
  categories?: Category[];
  index?: number;
  onEdit: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onStockChange: (product: Product, next: number) => Promise<void>;
  onCategoryChange?: (product: Product, nextCategory: string) => Promise<void>;
  onAdjustStock?: (product: Product) => void;
  onViewHistory?: (product: Product) => void;
}) {
  const minStock = product.minStock ?? 5;
  const isLowStock = product.stock <= minStock;

  return (
    <div
      className="admin-row-in"
      style={
        {
          display: "flex",
          gap: 12,
          padding: 14,
          background: "var(--dash-surface)",
          border: "1px solid var(--dash-border)",
          borderRadius: 10,
          "--i": index,
        } as React.CSSProperties
      }
    >
      <ProductThumb src={product.images[0]} size={52} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-2 items-start">
          <div className="min-w-0">
            <div className="font-medium text-[var(--dash-text)] truncate">
              {product.name}
            </div>
            <div className="mt-1">
              {categories && onCategoryChange ? (
                <select
                  value={product.category}
                  onChange={(e) => onCategoryChange(product, e.target.value)}
                  className="text-xs font-semibold py-0.5 px-2 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-2)] text-[var(--dash-text)] outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              ) : (
                <span className="text-xs text-[var(--dash-muted)]">
                  {getCategoryLabel(product.category)}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            {onAdjustStock && (
              <IconButton
                onClick={() => onAdjustStock(product)}
                title="Ajustar stock"
                icon={SlidersHorizontal}
              />
            )}
            {onViewHistory && (
              <IconButton
                onClick={() => onViewHistory(product)}
                title="Historial de movimientos"
                icon={History}
              />
            )}
            <a
              href={`/producto/${product.id}`}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver en la tienda"
              className="admin-icon-btn !no-underline !w-8 !h-8"
            >
              <ExternalLink size={14} />
            </a>
            {onDuplicate && (
              <IconButton
                onClick={() => onDuplicate(product)}
                title="Duplicar"
                icon={Copy}
              />
            )}
            <IconButton
              onClick={() => onEdit(product)}
              title="Editar"
              icon={Edit2}
            />
            {onDelete && (
              <IconButton
                onClick={() => onDelete(product)}
                title="Eliminar"
                icon={Trash2}
                danger
              />
            )}
          </div>
        </div>

        <div className="mt-2.5 flex items-center justify-between flex-wrap gap-2.5">
          <div>
            <span className="font-semibold text-[var(--dash-text)]">
              {formatPrice(product.price)}
            </span>
            {product.costPrice && (
              <span className="block text-[11px] text-[var(--dash-muted)]">
                Costo: {formatPrice(product.costPrice)}
              </span>
            )}
          </div>
          <StatusBadge status={product.status} />
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-[var(--dash-border)] pt-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)]">
              Stock
            </span>
            {isLowStock && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded text-[var(--dash-warning)] bg-[var(--dash-warning-bg)] border border-[var(--dash-warning-border)]"
                title={`Stock actual (${product.stock}) igual o inferior al mínimo configurado (${minStock})`}
              >
                <AlertTriangle size={10} />
                <span>Bajo ({product.stock}/{minStock})</span>
              </span>
            )}
          </div>
          <StockStepper
            value={product.stock}
            onChange={(next) => onStockChange(product, next)}
          />
        </div>
      </div>
    </div>
  );
}
