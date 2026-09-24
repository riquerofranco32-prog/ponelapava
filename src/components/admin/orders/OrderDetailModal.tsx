"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  MessageCircle,
  Printer,
  Phone,
  MapPin,
  Clock,
  Package,
  PackageCheck,
  Truck,
  CheckCircle2,
  XCircle,
  Tag,
  Trash2,
} from "lucide-react";
import { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { buildAdminCustomerWhatsAppUrl } from "@/lib/whatsapp";
import { printOrderRemito, getPaymentMethodLabel } from "@/lib/orderPrint";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Button } from "@/components/admin/ui/Button";
import { StatusPill } from "@/components/admin/ui/Badge";
import { OrderStatusSelect } from "./OrderStatusSelect";

function buildSummary(order: Order): string {
  const lines = [
    `Pedido de ${order.customerName}`,
    new Date(order.createdAt).toLocaleString("es-AR"),
    "",
    ...order.items.map(
      (i) => `${i.quantity}x ${i.productName} — ${formatPrice(i.subtotal)}`
    ),
    "",
    `Total: ${formatPrice(order.total)}`,
  ];
  if (order.customerPhone) lines.push(`Teléfono: ${order.customerPhone}`);
  if (order.comment) lines.push("", `Comentario: ${order.comment}`);
  return lines.join("\n");
}

const WORKFLOW_STEPS: { status: OrderStatus; label: string; icon: typeof Clock }[] = [
  { status: "pending", label: "Pendiente", icon: Clock },
  { status: "confirmed", label: "Confirmado", icon: CheckCircle2 },
  { status: "preparing", label: "En preparación", icon: Package },
  { status: "ready", label: "Listo para entrega", icon: PackageCheck },
  { status: "delivered", label: "Entregado", icon: Truck },
];

export function OrderDetailModal({
  order,
  onClose,
  onStatusChange,
  onPaymentStatusChange,
  onDelete,
}: {
  order: Order;
  onClose: () => void;
  onStatusChange?: (id: string, status: OrderStatus) => void;
  onPaymentStatusChange?: (id: string, status: "unpaid" | "paid") => void;
  onDelete?: (order: Order) => void;
}) {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState(false);

  function handlePrint() {
    printOrderRemito(order);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildSummary(order));
      setCopyError(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopyError(true);
    }
  }

  const hasPhone = Boolean(
    order.customerPhone && order.customerPhone.trim().length > 5
  );

  const currentStepIdx = WORKFLOW_STEPS.findIndex((s) => s.status === order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <Drawer
      isOpen={true}
      onClose={onClose}
      title={`Pedido #${order.id?.slice(0, 8) || ""} · ${order.customerName}`}
      subtitle={new Date(order.createdAt).toLocaleString("es-AR", {
        dateStyle: "medium",
        timeStyle: "short",
      })}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3 w-full">
          <div className="flex items-center gap-2">
            {hasPhone && (
              <a
                href={buildAdminCustomerWhatsAppUrl(
                  order.customerPhone!,
                  order.customerName,
                  order.total,
                  order.status === "confirmed"
                    ? "confirmed"
                    : order.status === "delivered"
                    ? "delivered"
                    : "general"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
                style={{ backgroundColor: "#25d366" }}
              >
                <MessageCircle size={15} />
                <span>WhatsApp</span>
              </a>
            )}
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(order)}
                icon={<Trash2 size={14} />}
              >
                Eliminar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {copyError && (
              <span className="text-xs text-[var(--dash-danger)]">
                Error al copiar
              </span>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePrint}
              icon={<Printer size={14} />}
            >
              Imprimir
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleCopy}
              icon={copied ? <Check size={14} /> : <Copy size={14} />}
            >
              {copied ? "Copiado" : "Copiar"}
            </Button>
          </div>
        </div>
      }
    >
      {/* Quick Action Bar: Status & Payment Direct Controls */}
      {(onStatusChange || onPaymentStatusChange) && (
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider">
              Estado:
            </span>
            {onStatusChange ? (
              <OrderStatusSelect
                status={order.status}
                onChange={(next) => onStatusChange(order.id!, next)}
              />
            ) : (
              <StatusPill type="order" value={order.status} />
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider">
              Cobro:
            </span>
            {onPaymentStatusChange ? (
              <button
                type="button"
                onClick={() =>
                  onPaymentStatusChange(
                    order.id!,
                    order.paymentStatus === "paid" ? "unpaid" : "paid"
                  )
                }
                className={`inline-flex items-center gap-1.5 border rounded-full px-3 py-1 text-xs font-semibold cursor-pointer transition-all ${
                  order.paymentStatus === "paid"
                    ? "bg-[var(--dash-success-bg)] text-[var(--dash-success)] border-[var(--dash-success-border)]"
                    : "bg-[var(--dash-warning-bg)] text-[var(--dash-warning)] border-[var(--dash-warning-border)]"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    order.paymentStatus === "paid"
                      ? "bg-[var(--dash-success)]"
                      : "bg-[var(--dash-warning)]"
                  }`}
                />
                {order.paymentStatus === "paid" ? "Cobrado" : "Sin cobrar"}
              </button>
            ) : (
              <StatusPill
                type="payment"
                value={order.paymentStatus || "unpaid"}
              />
            )}
          </div>
        </div>
      )}

      {/* Status & Key Badges */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusPill type="order" value={order.status} />
        <StatusPill type="payment" value={order.paymentStatus || "unpaid"} />
        {order.paymentMethod && (
          <StatusPill type="payment_method" value={order.paymentMethod} />
        )}
        {order.deliveryMethod && (
          <span className="admin-badge admin-badge--neutral">
            {order.deliveryMethod === "pickup" ? (
              <>
                <Truck size={12} className="text-current" />
                <span>Retiro en Local</span>
              </>
            ) : (
              <>
                <Truck size={12} className="text-current" />
                <span>Envío a Domicilio</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* Order Workflow Timeline */}
      <div className="p-4 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">
          Línea de tiempo del pedido
        </div>

        {isCancelled ? (
          <div className="flex items-center gap-2.5 text-sm text-[var(--dash-danger)] font-medium">
            <XCircle size={18} />
            <span>Este pedido fue cancelado.</span>
          </div>
        ) : (
          <div className="relative flex items-center justify-between pt-2 pb-1">
            {/* Connecting line */}
            <div className="absolute left-3 right-3 top-5 h-0.5 bg-[var(--dash-surface-3)] -z-0" />

            {WORKFLOW_STEPS.map((step, idx) => {
              const isPast = idx <= currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const Icon = step.icon;

              return (
                <div
                  key={step.status}
                  className="flex flex-col items-center gap-1.5 z-10"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all ${
                      isCurrent
                        ? "bg-[var(--dash-accent)] text-[var(--dash-bg)] border-[var(--dash-accent)] shadow-md"
                        : isPast
                        ? "bg-[var(--dash-surface-3)] text-[var(--dash-text)] border-[var(--dash-border)]"
                        : "bg-[var(--dash-surface-2)] text-[var(--dash-muted)] border-[var(--dash-border-subtle)]"
                    }`}
                  >
                    <Icon size={13} />
                  </div>
                  <span
                    className={`text-xs text-center max-w-[64px] font-medium leading-tight ${
                      isCurrent
                        ? "text-[var(--dash-accent)] font-bold"
                        : isPast
                        ? "text-[var(--dash-text)]"
                        : "text-[var(--dash-muted)] opacity-60"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer Info */}
      <div className="space-y-2 p-3.5 rounded-lg bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-sm">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-[var(--dash-text)]">
            {order.customerName}
          </span>
          {order.customerPhone && (
            <span className="flex items-center gap-1.5 text-xs text-[var(--dash-muted)]">
              <Phone size={13} />
              <span>{order.customerPhone}</span>
            </span>
          )}
        </div>

        {order.deliveryAddress && (
          <div className="flex items-start gap-2 text-xs text-[var(--dash-muted)] pt-1 border-t border-[var(--dash-border-subtle)]">
            <MapPin size={14} className="shrink-0 text-[var(--dash-accent)] mt-0.5" />
            <span>{order.deliveryAddress}</span>
          </div>
        )}
      </div>

      {/* Products List */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)]">
          Productos incluidos
        </div>

        <div className="divide-y divide-[var(--dash-border-subtle)] border-y border-[var(--dash-border)]">
          {order.items.map((item) => (
            <div
              key={item.productId}
              className="py-2.5 flex items-center justify-between text-sm gap-3"
            >
              <span className="text-[var(--dash-text)]">
                <span className="text-[var(--dash-muted)] font-medium">
                  {item.quantity}x
                </span>{" "}
                {item.productName}
              </span>
              <span className="font-semibold text-[var(--dash-text)] shrink-0">
                {formatPrice(item.subtotal)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Discounts & Totals */}
      <div className="space-y-2 pt-1 text-sm">
        {order.discount && order.discount > 0 ? (
          <div className="flex items-center justify-between text-[var(--dash-success)] font-medium">
            <span className="flex items-center gap-1.5">
              <Tag size={14} />
              <span>Descuento aplicado {order.couponCode ? `(${order.couponCode})` : ""}</span>
            </span>
            <span>-{formatPrice(order.discount)}</span>
          </div>
        ) : null}

        {order.comment && (
          <div className="p-3 rounded-lg bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] space-y-1">
            <span className="font-bold text-[var(--dash-muted)] block">Nota del cliente:</span>
            <p>{order.comment}</p>
          </div>
        )}

        <div className="flex items-baseline justify-between pt-3 border-t border-[var(--dash-border)]">
          <span className="text-sm font-semibold text-[var(--dash-muted)]">
            Total del pedido
          </span>
          <span className="font-serif text-2xl font-bold text-[var(--dash-accent)]">
            {formatPrice(order.total)}
          </span>
        </div>
      </div>
    </Drawer>
  );
}

export default OrderDetailModal;
