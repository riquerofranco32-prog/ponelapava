"use client";

import { useState } from "react";
import { AlertCircle, MessageCircle, Copy, Check, ExternalLink, Package, Truck, SlidersHorizontal } from "lucide-react";
import { Product, Supplier } from "@/types";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { normalizeArPhone } from "@/lib/phone";
import { useAdminToast } from "@/components/admin/AdminToast";

interface ReplenishmentSectionProps {
  products: Product[];
  suppliers: Supplier[];
  onAdjustStock: (product: Product) => void;
}

export function ReplenishmentSection({
  products,
  suppliers,
  onAdjustStock,
}: ReplenishmentSectionProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const showToast = useAdminToast();

  // Filtramos productos con stock <= min_stock
  const criticalProducts = products.filter(
    (p) => p.stock <= (p.minStock ?? 5)
  );

  // Cantidad sugerida por defecto: (minStock * 2) - stock
  function getSuggestedQty(p: Product): number {
    if (quantities[p.id] !== undefined) return quantities[p.id];
    const min = p.minStock ?? 5;
    return Math.max(1, min * 2 - p.stock);
  }

  function handleQtyChange(pId: string, value: number) {
    setQuantities((prev) => ({
      ...prev,
      [pId]: Math.max(1, value || 1),
    }));
  }

  // Agrupar por proveedor
  const supplierMap = new Map<string, Supplier>();
  suppliers.forEach((s) => supplierMap.set(s.id, s));

  const grouped = new Map<string, Product[]>();
  criticalProducts.forEach((p) => {
    const sId = p.supplierId || "unassigned";
    if (!grouped.has(sId)) grouped.set(sId, []);
    grouped.get(sId)!.push(p);
  });

  function buildWhatsAppText(supplier: Supplier | null, items: Product[]): string {
    const greeting = supplier?.contactName || supplier?.name || "Proveedor";
    const header = `Hola ${greeting}! Te escribo de *Poné La Pava* para pasarte un pedido de reposición de stock:\n\n`;
    const lines = items
      .map((p) => `• *${p.name}*: ${getSuggestedQty(p)} unidades`)
      .join("\n");
    const footer = `\n\n¿Nos confirmás disponibilidad y tiempo estimado de entrega? ¡Muchas gracias!`;
    return header + lines + footer;
  }

  function handleSendWhatsApp(supplier: Supplier | null, items: Product[]) {
    const text = buildWhatsAppText(supplier, items);
    const rawPhone = supplier?.phone?.trim();

    if (!rawPhone) {
      // Copiar al portapapeles si el proveedor no tiene teléfono cargado
      navigator.clipboard.writeText(text);
      showToast("Texto copiado al portapapeles (este proveedor no tiene teléfono cargado)");
      return;
    }

    const normalized = normalizeArPhone(rawPhone).replace(/\D/g, "");
    const url = `https://wa.me/${normalized}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  function handleCopyOrder(supplierId: string, supplier: Supplier | null, items: Product[]) {
    const text = buildWhatsAppText(supplier, items);
    navigator.clipboard.writeText(text);
    setCopiedId(supplierId);
    showToast("Pedido copiado al portapapeles");
    setTimeout(() => setCopiedId(null), 2500);
  }

  if (criticalProducts.length === 0) {
    return (
      <AdminCard className="p-8 text-center bg-[var(--dash-surface)]">
        <div className="w-12 h-12 rounded-full bg-[var(--dash-success-bg)] text-[var(--dash-success)] flex items-center justify-center mx-auto mb-3">
          <Truck size={24} />
        </div>
        <h3 className="text-base font-bold text-[var(--dash-text)] m-0">
          ¡Inventario al día!
        </h3>
        <p className="text-xs text-[var(--dash-muted)] mt-1.5 max-w-sm mx-auto">
          No hay productos con stock igual o inferior a su punto de reposición mínimo configurado.
        </p>
      </AdminCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Resumen de alerta */}
      <div className="flex items-center justify-between p-4 bg-[var(--dash-warning-bg)] border border-[var(--dash-warning-border)] rounded-[var(--dash-radius-md)] text-[var(--dash-warning)]">
        <div className="flex items-center gap-3">
          <AlertCircle size={20} className="shrink-0" />
          <div>
            <h4 className="text-sm font-bold m-0 text-[var(--dash-warning)]">
              {criticalProducts.length} producto{criticalProducts.length === 1 ? "" : "s"} para reponer
            </h4>
            <span className="text-xs text-[var(--dash-text)] opacity-85 block mt-0.5">
              Productos con stock actual por debajo o igual a su stock mínimo de seguridad.
            </span>
          </div>
        </div>
      </div>

      {/* Grupos por Proveedor */}
      {Array.from(grouped.entries()).map(([supplierId, items]) => {
        const supplier = supplierId === "unassigned" ? null : supplierMap.get(supplierId) || null;
        const isUnassigned = !supplier;
        const hasPhone = Boolean(supplier?.phone?.trim());

        return (
          <AdminCard key={supplierId} className="p-0 overflow-hidden border border-[var(--dash-border)]">
            {/* Header del Proveedor */}
            <div className="p-4 bg-[var(--dash-surface-2)] border-b border-[var(--dash-border)] flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <Truck size={18} className="text-[var(--dash-accent)]" />
                <div>
                  <h3 className="text-sm font-bold text-[var(--dash-text)] m-0">
                    {supplier ? supplier.name : "Sin proveedor asignado"}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[var(--dash-muted)] mt-0.5">
                    {supplier?.contactName && <span>Contacto: {supplier.contactName}</span>}
                    {supplier?.contactName && supplier?.phone && <span>•</span>}
                    {supplier?.phone && <span>Tel: {supplier.phone}</span>}
                    {isUnassigned && <span>Podés asignar un proveedor editando cada producto</span>}
                  </div>
                </div>
              </div>

              {/* Botones de acción para el pedido */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyOrder(supplierId, supplier, items)}
                  className="admin-btn admin-btn--secondary !text-xs !py-1.5"
                  title="Copiar texto del pedido"
                >
                  {copiedId === supplierId ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copiedId === supplierId ? "Copiado" : "Copiar pedido"}</span>
                </button>

                <AdminButton
                  onClick={() => handleSendWhatsApp(supplier, items)}
                  className="!text-xs !py-1.5 !bg-[#25d366] !text-white hover:!opacity-90"
                  title={hasPhone ? "Enviar pedido por WhatsApp" : "Copiar pedido para enviar"}
                >
                  <MessageCircle size={14} />
                  <span>{hasPhone ? "Pedir por WhatsApp" : "Copiar para WhatsApp"}</span>
                </AdminButton>
              </div>
            </div>

            {/* Tabla de productos a reponer para este proveedor */}
            <div className="overflow-x-auto">
              <table className="admin-table w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--dash-border)] bg-[var(--dash-surface-3)]">
                    <th className="text-left px-4 py-2.5 font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                      Producto
                    </th>
                    <th className="text-center px-4 py-2.5 font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                      Stock actual
                    </th>
                    <th className="text-center px-4 py-2.5 font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                      Mínimo
                    </th>
                    <th className="text-center px-4 py-2.5 font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                      Sugerido a pedir
                    </th>
                    <th className="text-right px-4 py-2.5 font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                      Acción
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--dash-border-subtle)]">
                  {items.map((p) => {
                    const isOutOfStock = p.stock <= 0;
                    const suggested = getSuggestedQty(p);

                    return (
                      <tr key={p.id} className="hover:bg-[var(--dash-surface-2)] transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded bg-[var(--dash-surface-3)] text-[var(--dash-accent)] flex items-center justify-center font-bold">
                              <Package size={13} />
                            </span>
                            <div>
                              <span className="font-semibold text-[var(--dash-text)] block">
                                {p.name}
                              </span>
                              <span className="text-[11px] text-[var(--dash-muted)]">
                                {p.category}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded font-bold ${
                              isOutOfStock
                                ? "bg-[var(--dash-danger-bg)] text-[var(--dash-danger)]"
                                : "bg-[var(--dash-warning-bg)] text-[var(--dash-warning)]"
                            }`}
                          >
                            {p.stock} un.
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center text-[var(--dash-muted)] font-medium">
                          {p.minStock ?? 5} un.
                        </td>

                        <td className="px-4 py-3 text-center">
                          <div className="inline-flex items-center gap-1.5">
                            <input
                              type="number"
                              min={1}
                              max={10000}
                              value={suggested}
                              onChange={(e) =>
                                handleQtyChange(p.id, parseInt(e.target.value, 10) || 1)
                              }
                              className="admin-input !text-xs !w-16 !py-1 text-center font-bold text-[var(--dash-accent)]"
                            />
                            <span className="text-[var(--dash-muted)]">un.</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => onAdjustStock(p)}
                            className="admin-btn admin-btn--secondary !text-xs !py-1 !px-2"
                            title="Ajustar o ingresar stock recién llegado"
                          >
                            <SlidersHorizontal size={13} />
                            <span>Ingresar stock</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </AdminCard>
        );
      })}
    </div>
  );
}
