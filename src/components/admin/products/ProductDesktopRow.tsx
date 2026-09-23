"use client";

import { Edit2, Trash2, Copy, ExternalLink, SlidersHorizontal, History, AlertTriangle, Tag } from "lucide-react";
import { Product, Category } from "@/types";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import { ProductThumb } from "./ProductThumb";
import { StockStepper } from "./StockStepper";
import { StatusBadge } from "./StatusBadge";
import { IconButton } from "./IconButton";

export function ProductDesktopRow({
  product,
  categories,
  index = 0,
  compact = false,
  selectable = false,
  selected = false,
  onToggleSelect,
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
  compact?: boolean;
  selectable?: boolean;
  selected?: boolean;
  onToggleSelect?: (id: string) => void;
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
    <tr
      className={`admin-row-in admin-row-hover ${selected ? "bg-[var(--dash-surface-2)]" : ""}`}
      style={{ "--i": index } as React.CSSProperties}
    >
      {selectable && (
        <td className="py-2.5 px-3 border-t border-[var(--dash-border)] align-middle text-center w-10">
          <input
            type="checkbox"
            checked={selected}
            onChange={() => onToggleSelect?.(product.id)}
            className="cursor-pointer rounded border-[var(--dash-border)] text-[var(--dash-accent)] focus:ring-[var(--dash-accent)]"
            aria-label={`Seleccionar ${product.name}`}
          />
        </td>
      )}
      <td className="py-2.5 px-3.5 border-t border-[var(--dash-border)] align-middle">
        <div className="flex items-center gap-2.5">
          <ProductThumb src={product.images[0]} />
          <div>
            <span className="font-medium text-[var(--dash-text)]">
              {product.name}
            </span>
            {!compact && product.brand && (
              <span className="block text-xs text-[var(--dash-muted)] mt-0.5">
                {product.brand}
              </span>
            )}
          </div>
        </div>
      </td>
      {!compact && (
        <td className="py-2.5 px-3.5 border-t border-[var(--dash-border)] align-middle">
          {categories && onCategoryChange ? (
            <div className="relative inline-block">
              <select
                value={product.category}
                onChange={(e) => onCategoryChange(product, e.target.value)}
                className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-[var(--dash-border)] hover:border-[var(--dash-accent)] bg-[var(--dash-surface-2)] text-[var(--dash-text)] transition-colors outline-none cursor-pointer"
                title="Cambiar categoría en 1 clic"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.icon ? `${c.icon} ` : ""}{c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-xs text-[var(--dash-muted)] font-medium">
              {getCategoryLabel(product.category)}
            </span>
          )}
        </td>
      )}
      <td className="py-2.5 px-3.5 border-t border-[var(--dash-border)] align-middle font-medium text-[var(--dash-text)]">
        <div>
          <span>{formatPrice(product.price)}</span>
          {product.costPrice && (
            <span className="block text-[11px] text-[var(--dash-muted)]">
              Costo: {formatPrice(product.costPrice)}
            </span>
          )}
        </div>
      </td>
      {!compact && (
        <td className="py-2.5 px-3.5 border-t border-[var(--dash-border)] align-middle">
          <div className="flex flex-col gap-1 items-start">
            <StockStepper
              value={product.stock}
              onChange={(next) => onStockChange(product, next)}
            />
            {isLowStock && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded text-[var(--dash-warning)] bg-[var(--dash-warning-bg)] border border-[var(--dash-warning-border)]"
                title={`Stock actual (${product.stock}) igual o inferior al mínimo configurado (${minStock})`}
              >
                <AlertTriangle size={11} />
                <span>Bajo ({product.stock}/{minStock})</span>
              </span>
            )}
          </div>
        </td>
      )}
      <td className="py-2.5 px-3.5 border-t border-[var(--dash-border)] align-middle">
        <StatusBadge status={product.status} />
      </td>
      <td className="py-2.5 px-3.5 border-t border-[var(--dash-border)] align-middle text-right">
        <div className="flex justify-end gap-1.5">
          {onAdjustStock && (
            <IconButton
              onClick={() => onAdjustStock(product)}
              title="Ajustar stock con motivo (auditoría)"
              icon={SlidersHorizontal}
            />
          )}
          {onViewHistory && (
            <IconButton
              onClick={() => onViewHistory(product)}
              title="Ver movimientos e historial"
              icon={History}
            />
          )}
          <a
            href={`/producto/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver en la tienda"
            className="admin-icon-btn !no-underline"
          >
            <ExternalLink size={14} />
          </a>
          {onDuplicate && (
            <IconButton
              onClick={() => onDuplicate(product)}
              title="Duplicar / Clonar producto"
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
      </td>
    </tr>
  );
}
