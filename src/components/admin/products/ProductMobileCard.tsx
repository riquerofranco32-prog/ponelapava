"use client";

import { Edit2, Trash2 } from "lucide-react";
import { Product } from "@/types";
import { formatPrice, getCategoryLabel } from "@/lib/utils";
import { ProductThumb } from "./ProductThumb";
import { StockStepper } from "./StockStepper";
import { StatusBadge } from "./StatusBadge";
import { IconButton } from "./IconButton";

export function ProductMobileCard({
  product,
  index = 0,
  onEdit,
  onDelete,
  onStockChange,
}: {
  product: Product;
  index?: number;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onStockChange: (product: Product, next: number) => Promise<void>;
}) {
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
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 8,
            alignItems: "flex-start",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 500,
                color: "var(--dash-text)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {product.name}
            </div>
            <div
              style={{ fontSize: 12, color: "var(--dash-muted)", marginTop: 2 }}
            >
              {getCategoryLabel(product.category)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
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
        </div>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <span style={{ fontWeight: 600, color: "var(--dash-text)" }}>
            {formatPrice(product.price)}
          </span>
          <StatusBadge status={product.status} />
        </div>

        <div
          style={{
            marginTop: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid var(--dash-border)",
            paddingTop: 10,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: "var(--dash-muted)",
            }}
          >
            Stock
          </span>
          <StockStepper
            value={product.stock}
            onChange={(next) => onStockChange(product, next)}
          />
        </div>
      </div>
    </div>
  );
}
