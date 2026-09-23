"use client";

import { useState } from "react";
import { Eye, Printer, MessageCircle, GripVertical } from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { buildAdminCustomerWhatsAppUrl } from "@/lib/whatsapp";
import { printOrderRemito } from "@/lib/orderPrint";

const KANBAN_COLUMNS: {
  status: Order["status"];
  label: string;
  badgeBg: string;
  badgeColor: string;
}[] = [
  { status: "pending", label: "Pendientes", badgeBg: "rgba(245, 158, 11, 0.15)", badgeColor: "#f59e0b" },
  { status: "confirmed", label: "Confirmados", badgeBg: "rgba(59, 130, 246, 0.15)", badgeColor: "#3b82f6" },
  { status: "preparing", label: "En preparación", badgeBg: "rgba(168, 85, 247, 0.15)", badgeColor: "#a855f7" },
  { status: "ready", label: "Listos", badgeBg: "rgba(199, 166, 122, 0.2)", badgeColor: "var(--dash-accent)" },
  { status: "delivered", label: "Entregados", badgeBg: "rgba(16, 185, 129, 0.15)", badgeColor: "#10b981" },
  { status: "cancelled", label: "Cancelados", badgeBg: "rgba(239, 68, 68, 0.15)", badgeColor: "#ef4444" },
];

export interface OrdersKanbanViewProps {
  orders: Order[];
  onStatusChange: (id: string, status: Order["status"]) => void;
  onPaymentStatusChange?: (id: string, status: "unpaid" | "paid") => void;
  onViewOrder: (order: Order) => void;
}

export function OrdersKanbanView({
  orders,
  onStatusChange,
  onPaymentStatusChange,
  onViewOrder,
}: OrdersKanbanViewProps) {
  const [dragOverCol, setDragOverCol] = useState<Order["status"] | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        overflowX: "auto",
        paddingBottom: 16,
        alignItems: "flex-start",
        minHeight: 520,
      }}
    >
      {KANBAN_COLUMNS.map((col) => {
        const colOrders = orders.filter((o) => o.status === col.status);
        const colTotal = colOrders.reduce((sum, o) => sum + (o.total || 0), 0);
        const isTarget = dragOverCol === col.status;

        return (
          <div
            key={col.status}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              if (dragOverCol !== col.status) setDragOverCol(col.status);
            }}
            onDragLeave={() => {
              if (dragOverCol === col.status) setDragOverCol(null);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragOverCol(null);
              const orderId = e.dataTransfer.getData("text/plain");
              if (orderId) {
                onStatusChange(orderId, col.status);
              }
              setDraggingId(null);
            }}
            style={{
              flex: "0 0 280px",
              width: 280,
              background: isTarget ? "rgba(199, 166, 122, 0.08)" : "var(--dash-surface)",
              border: isTarget
                ? "2px dashed var(--dash-accent)"
                : "1px solid var(--dash-border)",
              borderRadius: 12,
              padding: 12,
              display: "flex",
              flexDirection: "column",
              maxHeight: "calc(100vh - 250px)",
              transition: "border 0.15s ease, background 0.15s ease",
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: 10,
                borderBottom: "1px solid var(--dash-border)",
                marginBottom: 10,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "var(--dash-text)",
                  }}
                >
                  {col.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 6px",
                    borderRadius: 999,
                    background: col.badgeBg,
                    color: col.badgeColor,
                  }}
                >
                  {colOrders.length}
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: "var(--dash-muted)",
                  fontWeight: 500,
                }}
              >
                {formatPrice(colTotal)}
              </span>
            </div>

            {/* Cards List */}
            <div
              style={{
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: 10,
                flex: 1,
                paddingRight: 2,
              }}
            >
              {colOrders.length === 0 ? (
                <div
                  style={{
                    padding: "24px 12px",
                    textAlign: "center",
                    color: "var(--dash-muted)",
                    fontSize: 12,
                    border: "1px dashed var(--dash-border)",
                    borderRadius: 8,
                    marginTop: 4,
                  }}
                >
                  Soltá pedidos acá
                </div>
              ) : (
                colOrders.map((order) => {
                  const isDragging = draggingId === order.id;
                  const itemsSummary = order.items
                    .map((i) => `${i.productName} x${i.quantity}`)
                    .join(", ");

                  return (
                    <div
                      key={order.id}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", order.id!);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingId(order.id!);
                      }}
                      onDragEnd={() => setDraggingId(null)}
                      style={{
                        background: "var(--dash-surface-2)",
                        border: "1px solid var(--dash-border)",
                        borderRadius: 10,
                        padding: "10px 12px",
                        cursor: "grab",
                        opacity: isDragging ? 0.4 : 1,
                        transition: "box-shadow 0.15s, opacity 0.15s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      {/* Top Bar: Customer & Actions */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 6,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => onViewOrder(order)}
                          style={{
                            border: "none",
                            background: "none",
                            padding: 0,
                            cursor: "pointer",
                            fontSize: 13,
                            fontWeight: 600,
                            color: "var(--dash-text)",
                            textAlign: "left",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 160,
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <GripVertical
                            size={12}
                            style={{ opacity: 0.4, flexShrink: 0 }}
                          />
                          <span>{order.customerName}</span>
                        </button>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <button
                            type="button"
                            onClick={() => printOrderRemito(order)}
                            title="Imprimir remito"
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--dash-muted)",
                              cursor: "pointer",
                              padding: 2,
                              display: "inline-flex",
                            }}
                          >
                            <Printer size={13} />
                          </button>
                          {order.customerPhone && (
                            <a
                              href={buildAdminCustomerWhatsAppUrl(
                                order.customerPhone,
                                order.customerName,
                                order.total,
                                order.status === "confirmed"
                                  ? "confirmed"
                                  : order.status === "delivered"
                                  ? "delivered"
                                  : "general",
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                              title="WhatsApp"
                              style={{
                                color: "var(--color-whatsapp, #25d366)",
                                display: "inline-flex",
                                padding: 2,
                              }}
                            >
                              <MessageCircle size={14} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => onViewOrder(order)}
                            title="Ver detalles"
                            style={{
                              background: "none",
                              border: "none",
                              color: "var(--dash-muted)",
                              cursor: "pointer",
                              padding: 2,
                              display: "inline-flex",
                            }}
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <p
                        style={{
                          fontSize: 11,
                          color: "var(--dash-muted)",
                          margin: "0 0 8px 0",
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {itemsSummary}
                      </p>

                      {/* Bottom row: Total & Payment status */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: 6,
                          borderTop: "1px solid var(--dash-border)",
                        }}
                      >
                        <span
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: "var(--dash-text)",
                          }}
                        >
                          {formatPrice(order.total)}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            onPaymentStatusChange?.(
                              order.id!,
                              order.paymentStatus === "paid" ? "unpaid" : "paid",
                            )
                          }
                          title={
                            order.paymentStatus === "paid"
                              ? "Cobrado. Clic para cambiar."
                              : "Sin cobrar. Clic para marcar cobrado."
                          }
                          style={{
                            border: "none",
                            borderRadius: 999,
                            padding: "2px 7px",
                            fontSize: 10,
                            fontWeight: 600,
                            cursor: onPaymentStatusChange ? "pointer" : "default",
                            background:
                              order.paymentStatus === "paid"
                                ? "rgba(16, 185, 129, 0.15)"
                                : "rgba(245, 158, 11, 0.15)",
                            color:
                              order.paymentStatus === "paid"
                                ? "#10b981"
                                : "#f59e0b",
                          }}
                        >
                          {order.paymentStatus === "paid"
                            ? "✓ Cobrado"
                            : "⏳ Sin cobrar"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
