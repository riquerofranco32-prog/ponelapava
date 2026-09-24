"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ShoppingBag, DollarSign, Store, Truck, Search, X } from "lucide-react";
import { AdminModal } from "@/components/admin/AdminModal";
import { Button } from "@/components/admin/ui/Button";
import { Product, Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useAdminToast } from "@/components/admin/AdminToast";

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderCreated: (order: Order) => void;
}

interface OrderItemDraft {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  maxStock: number;
}

export function CreateOrderModal({
  isOpen,
  onClose,
  onOrderCreated,
}: CreateOrderModalProps) {
  const showToast = useAdminToast();
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">("pickup");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "card">("cash");
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "unpaid">("paid");
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("confirmed");
  const [comment, setComment] = useState("");

  // Product selection
  const [selectedItems, setSelectedItems] = useState<OrderItemDraft[]>([]);
  const [searchProductQuery, setSearchProductQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);

  // Load catalog when modal opens
  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    async function loadProducts() {
      setLoadingCatalog(true);
      try {
        const res = await fetch("/api/admin/products");
        if (res.ok) {
          const data = await res.json();
          if (mounted) setCatalog(Array.isArray(data) ? data : data.products || []);
        }
      } catch {
        // silent
      } finally {
        if (mounted) setLoadingCatalog(false);
      }
    }
    loadProducts();
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const handleAddItem = () => {
    if (!selectedProductId) return;
    const prod = catalog.find((p) => p.id === selectedProductId);
    if (!prod) return;

    const existingIndex = selectedItems.findIndex((i) => i.productId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += itemQuantity;
      setSelectedItems(updated);
    } else {
      setSelectedItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          productName: prod.name,
          price: prod.price,
          quantity: itemQuantity,
          maxStock: prod.stock,
        },
      ]);
    }

    setSelectedProductId("");
    setItemQuantity(1);
    setSearchProductQuery("");
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index: number, qty: number) => {
    if (qty <= 0) return handleRemoveItem(index);
    setSelectedItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: qty } : item))
    );
  };

  // Compute subtotal
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast("Ingresá el nombre del cliente", "error");
      return;
    }
    if (selectedItems.length === 0) {
      showToast("Agregá al menos un producto al pedido", "error");
      return;
    }
    if (deliveryMethod === "delivery" && !deliveryAddress.trim()) {
      showToast("Ingresá la dirección de envío", "error");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim() || undefined,
          items: selectedItems.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          paymentMethod,
          paymentStatus,
          status: orderStatus,
          deliveryMethod,
          deliveryAddress: deliveryMethod === "delivery" ? deliveryAddress.trim() : undefined,
          comment: comment.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "No se pudo registrar el pedido");
      }

      const created = await res.json();
      showToast(`Pedido registrado con éxito (#${created.id?.slice(0, 8) || ""})`);
      onOrderCreated(created);
      onClose();

      // Reset
      setCustomerName("");
      setCustomerPhone("");
      setSelectedItems([]);
      setComment("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al crear el pedido", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = catalog.filter((p) =>
    p.name.toLowerCase().includes(searchProductQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchProductQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AdminModal
      onClose={onClose}
      title="Registrar Nuevo Pedido / Venta de Mostrador"
      maxWidth={680}
    >
      <p className="text-xs text-[var(--dash-muted)] -mt-2 mb-4">
        Creá un pedido manual para ventas presenciales en el local o pedidos por teléfono.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Juan Pérez"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="admin-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider mb-1">
              Teléfono / WhatsApp
            </label>
            <input
              type="tel"
              placeholder="Ej: 299 1234567"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="admin-input"
            />
          </div>
        </div>

        {/* Product Picker */}
        <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)]/60 border border-[var(--dash-border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text)] flex items-center gap-1.5">
              <ShoppingBag size={14} className="text-[var(--dash-accent)]" />
              <span>Productos a Incluir</span>
            </span>
            <span className="text-xs text-[var(--dash-muted)]">
              {selectedItems.length} producto{selectedItems.length === 1 ? "" : "s"}
            </span>
          </div>

          {/* Add product line */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="admin-input text-xs"
                disabled={loadingCatalog}
              >
                <option value="">
                  {loadingCatalog ? "Cargando catálogo..." : "Seleccionar producto..."}
                </option>
                {catalog.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} — {formatPrice(p.price)} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={99}
                value={itemQuantity}
                onChange={(e) => setItemQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="admin-input w-16 text-center text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleAddItem}
                disabled={!selectedProductId}
                icon={<Plus size={14} />}
              >
                Agregar
              </Button>
            </div>
          </div>

          {/* Items list */}
          {selectedItems.length > 0 ? (
            <div className="divide-y divide-[var(--dash-border-subtle)] border-t border-[var(--dash-border)] pt-2 max-h-48 overflow-y-auto">
              {selectedItems.map((item, idx) => (
                <div key={item.productId} className="py-2 flex items-center justify-between text-xs gap-3">
                  <div className="min-w-0 flex-1">
                    <span className="font-semibold text-[var(--dash-text)] block truncate">
                      {item.productName}
                    </span>
                    <span className="text-[var(--dash-muted)]">
                      {formatPrice(item.price)} c/u
                    </span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1 bg-[var(--dash-surface-3)] rounded-lg p-0.5 border border-[var(--dash-border)]">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(idx, item.quantity - 1)}
                        className="w-5 h-5 flex items-center justify-center text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)] rounded"
                      >
                        -
                      </button>
                      <span className="w-6 text-center font-bold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(idx, item.quantity + 1)}
                        className="w-5 h-5 flex items-center justify-center text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)] rounded"
                      >
                        +
                      </button>
                    </div>

                    <span className="font-bold text-[var(--dash-text)] w-20 text-right">
                      {formatPrice(item.price * item.quantity)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-[var(--dash-danger)] hover:bg-[var(--dash-danger-bg)] rounded"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--dash-muted)] text-center py-3">
              No hay productos agregados todavía.
            </p>
          )}

          {/* Totals Summary */}
          {selectedItems.length > 0 && (
            <div className="border-t border-[var(--dash-border)] pt-2.5 space-y-1 text-xs">
              <div className="flex justify-between text-[var(--dash-muted)]">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[var(--dash-text)] pt-1 border-t border-[var(--dash-border-subtle)]">
                <span>Total a cobrar:</span>
                <span className="text-[var(--dash-accent)] font-serif text-base">
                  {formatPrice(total)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Delivery & Payment Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Delivery Mode */}
          <div>
            <label className="block text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider mb-1">
              Modo de Entrega
            </label>
            <div className="grid grid-cols-2 gap-1.5 bg-[var(--dash-surface-2)] p-1 rounded-xl border border-[var(--dash-border)]">
              <button
                type="button"
                onClick={() => setDeliveryMethod("pickup")}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  deliveryMethod === "pickup"
                    ? "bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] border border-[var(--dash-accent-border)] shadow-xs"
                    : "text-[var(--dash-muted)]"
                }`}
              >
                <Store size={13} />
                <span>Retiro Local</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod("delivery")}
                className={`py-1.5 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  deliveryMethod === "delivery"
                    ? "bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] border border-[var(--dash-accent-border)] shadow-xs"
                    : "text-[var(--dash-muted)]"
                }`}
              >
                <Truck size={13} />
                <span>Envío</span>
              </button>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider mb-1">
              Medio de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as "cash" | "transfer" | "card")}
              className="admin-input text-xs"
            >
              <option value="cash">Efectivo en mostrador</option>
              <option value="transfer">Transferencia bancaria</option>
              <option value="card">Tarjeta de crédito / débito</option>
            </select>
          </div>
        </div>

        {/* Address if delivery */}
        {deliveryMethod === "delivery" && (
          <div>
            <label className="block text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider mb-1">
              Dirección de Entrega *
            </label>
            <input
              type="text"
              required
              placeholder="Calle, altura, piso, ciudad (Catriel / 25 de Mayo)"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              className="admin-input"
            />
          </div>
        )}

        {/* Payment & Order Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider mb-1">
              Estado de Cobro
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as "paid" | "unpaid")}
              className="admin-input text-xs"
            >
              <option value="paid">✅ Ya Cobrado</option>
              <option value="unpaid">⏳ Sin Cobrar (Pendiente)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider mb-1">
              Estado del Pedido
            </label>
            <select
              value={orderStatus}
              onChange={(e) => setOrderStatus(e.target.value as OrderStatus)}
              className="admin-input text-xs"
            >
              <option value="confirmed">Confirmado</option>
              <option value="preparing">En preparación</option>
              <option value="ready">Listo para entrega</option>
              <option value="delivered">Entregado / Cerrado</option>
            </select>
          </div>
        </div>

        {/* Optional note */}
        <div>
          <label className="block text-xs font-semibold text-[var(--dash-muted)] uppercase tracking-wider mb-1">
            Nota interna o del cliente (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: Cliente retira por la tarde, grabado láser incluido"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="admin-input"
          />
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--dash-border)]">
          <Button type="button" variant="secondary" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting || selectedItems.length === 0}
            icon={<Plus size={15} />}
          >
            {submitting ? "Creando pedido..." : `Crear Pedido (${formatPrice(total)})`}
          </Button>
        </div>
      </form>
    </AdminModal>
  );
}

export default CreateOrderModal;
