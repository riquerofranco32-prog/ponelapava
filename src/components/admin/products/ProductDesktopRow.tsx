"use client";

import { Edit2, Trash2, Copy, ExternalLink } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import { ProductThumb } from "./ProductThumb";
import { StockStepper } from "./StockStepper";
import { StatusBadge } from "./StatusBadge";
import { IconButton } from "./IconButton";

const td: React.CSSProperties = {
  padding: "10px 14px",
  borderTop: "1px solid var(--dash-border)",
  verticalAlign: "middle",
};

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
  onDelete: (product: Product) => void;
  onStockChange: (product: Product, next: number) => Promise<void>;
}) {
  return (
    <tr
      className="admin-row-in admin-row-hover"
      style={{ "--i": index } as React.CSSProperties}
    >
      <td style={td}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ProductThumb src={product.images[0]} />
          <div>
            <span style={{ fontWeight: 500, color: "var(--dash-text)" }}>
              {product.name}
            </span>
            {!compact && product.brand && (
              <span
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--dash-muted)",
                  marginTop: 2,
                }}
              >
                {product.brand}
              </span>
            )}
          </div>
        </div>
      </td>
      {!compact && (
        <td style={{ ...td, color: "var(--dash-muted)" }}>
          {getCategoryLabel(product.category)}
        </td>
      )}
      <td style={{ ...td, fontWeight: 500, color: "var(--dash-text)" }}>
        {formatPrice(product.price)}
      </td>
      {!compact && (
        <td style={td}>
          <StockStepper
            value={product.stock}
            onChange={(next) => onStockChange(product, next)}
          />
        </td>
      )}
      <td style={td}>
        <StatusBadge status={product.status} />
      </td>
      <td style={{ ...td, textAlign: "right" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
          <a
            href={`/producto/${product.id}`}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver en la tienda"
            className="admin-icon-btn"
            style={{ textDecoration: "none" }}
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
          <IconButton
            onClick={() => onDelete(product)}
            title="Eliminar"
            icon={Trash2}
            danger
          />
        </div>
      </td>
    </tr>
  );
}
