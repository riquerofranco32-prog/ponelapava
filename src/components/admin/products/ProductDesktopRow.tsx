"use client";

import { Edit2, Trash2, Copy, ExternalLink } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import { ProductThumb } from "./ProductThumb";
import { StockStepper } from "./StockStepper";
import { StatusBadge } from "./StatusBadge";
import { IconButton } from "./IconButton";

export function ProductDesktopRow({
  product,
  index = 0,
  compact = false,
  onEdit,
  onDuplicate,
  onDelete,
  onStockChange,
}: {
  product: Product;
  index?: number;
  compact?: boolean;
  onEdit: (product: Product) => void;
  onDuplicate?: (product: Product) => void;
  onDelete?: (product: Product) => void;
  onStockChange: (product: Product, next: number) => Promise<void>;
}) {
  return (
    <tr
      className="admin-row-in admin-row-hover"
      style={{ "--i": index } as React.CSSProperties}
    >
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
        <td className="py-2.5 px-3.5 border-t border-[var(--dash-border)] align-middle text-[var(--dash-muted)]">
          {getCategoryLabel(product.category)}
        </td>
      )}
      <td className="py-2.5 px-3.5 border-t border-[var(--dash-border)] align-middle font-medium text-[var(--dash-text)]">
        {formatPrice(product.price)}
      </td>
      {!compact && (
        <td className="py-2.5 px-3.5 border-t border-[var(--dash-border)] align-middle">
          <StockStepper
            value={product.stock}
            onChange={(next) => onStockChange(product, next)}
          />
        </td>
      )}
      <td className="py-2.5 px-3.5 border-t border-[var(--dash-border)] align-middle">
        <StatusBadge status={product.status} />
      </td>
      <td className="py-2.5 px-3.5 border-t border-[var(--dash-border)] align-middle text-right">
        <div className="flex justify-end gap-1.5">
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
