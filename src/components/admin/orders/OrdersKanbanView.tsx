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
  { status: "pending", label: "Pendientes", badgeBg: "var(--dash-warning-bg)", badgeColor: "var(--dash-warning)" },
  { status: "confirmed", label: "Confirmados", badgeBg: "var(--dash-info-bg)", badgeColor: "var(--dash-info)" },
  { status: "preparing", label: "En preparación", badgeBg: "var(--dash-info-bg)", badgeColor: "var(--dash-info)" },
  { status: "ready", label: "Listos", badgeBg: "var(--dash-accent-subtle, rgba(199, 166, 122, 0.2))", badgeColor: "var(--dash-accent)" },
  { status: "delivered", label: "Entregados", badgeBg: "var(--dash-success-bg)", badgeColor: "var(--dash-success)" },
  { status: "cancelled", label: "Cancelados", badgeBg: "var(--dash-danger-bg)", badgeColor: "var(--dash-danger)" },
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
    <div className="flex gap-3.5 overflow-x-auto pb-4 items-start min-h-[520px]">
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
            className={`w-[280px] shrink-0 rounded-xl p-3 flex flex-col max-h-[calc(100vh-250px)] transition-all ${
              isTarget
                ? "bg-[rgba(199,166,122,0.08)] border-2 border-dashed border-[var(--dash-accent)]"
                : "bg-[var(--dash-surface)] border border-[var(--dash-border)]"
            }`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-[var(--dash-border)] mb-2.5">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[var(--dash-text)]">
                  {col.label}
                </span>
                <span
                  style={{ background: col.badgeBg, color: col.badgeColor }}
                  className="text-xs font-bold px-1.5 py-0.5 rounded-full"
                >
                  {colOrders.length}
                </span>
              </div>
              <span className="text-xs text-[var(--dash-muted)] font-medium">
                {formatPrice(colTotal)}
              </span>
            </div>

            {/* Cards List */}
            <div className="overflow-y-auto flex flex-col gap-2.5 flex-1 pr-0.5">
              {colOrders.length === 0 ? (
                <div className="py-6 px-3 text-center text-[var(--dash-muted)] text-xs border border-dashed border-[var(--dash-border)] rounded-lg mt-1">
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
                      className={`bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-xl p-3 cursor-grab transition-all shadow-sm ${
                        isDragging ? "opacity-40" : "opacity-100"
                      }`}
                    >
                      {/* Top Bar: Customer & Actions */}
                      <div className="flex items-center justify-between mb-1.5">
                        <button
                          type="button"
                          onClick={() => onViewOrder(order)}
                          className="border-none bg-transparent p-0 cursor-pointer text-xs font-bold text-[var(--dash-text)] text-left truncate max-w-[160px] flex items-center gap-1 hover:underline"
                        >
                          <GripVertical size={12} className="opacity-40 shrink-0" />
                          <span>{order.customerName}</span>
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => printOrderRemito(order)}
                            title="Imprimir remito"
                            className="bg-transparent border-none text-[var(--dash-muted)] cursor-pointer p-0.5 inline-flex hover:text-[var(--dash-text)]"
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
                              className="text-[#25d366] inline-flex p-0.5 opacity-80 hover:opacity-100"
                            >
                              <MessageCircle size={14} />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => onViewOrder(order)}
                            title="Ver detalles"
                            className="bg-transparent border-none text-[var(--dash-muted)] cursor-pointer p-0.5 inline-flex hover:text-[var(--dash-text)]"
                          >
                            <Eye size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Items */}
                      <p className="text-xs text-[var(--dash-muted)] mb-2 line-clamp-2 leading-relaxed">
                        {itemsSummary}
                      </p>

                      {/* Bottom row: Total & Payment status */}
                      <div className="flex items-center justify-between pt-1.5 border-t border-[var(--dash-border)]">
                        <span className="text-xs font-bold text-[var(--dash-text)]">
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
                          className={`border-none rounded-full px-2 py-0.5 text-xs font-semibold ${
                            onPaymentStatusChange ? "cursor-pointer" : "cursor-default"
                          } ${
                            order.paymentStatus === "paid"
                              ? "bg-[var(--dash-success-bg)] text-[var(--dash-success)] border border-[var(--dash-success-border)]"
                              : "bg-[var(--dash-warning-bg)] text-[var(--dash-warning)] border border-[var(--dash-warning-border)]"
                          }`}
                        >
                          {order.paymentStatus === "paid" ? "Cobrado" : "Sin cobrar"}
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
