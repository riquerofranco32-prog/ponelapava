"use client";

import { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  ShoppingBag,
  Calendar,
  Phone,
  DollarSign,
  Package,
  StickyNote,
  Crown,
  Sparkles,
  Gift,
  Send,
  Save,
  Printer,
  Check,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/orderStatus";
import { printOrderRemito } from "@/lib/orderPrint";
import { AdminButton } from "./AdminButton";

export interface CustomerData {
  id: string;
  name: string;
  phone?: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderDate: string;
  segment?: "vip" | "recurring" | "risk" | "new";
  orders: {
    id?: string;
    total: number;
    status: string;
    createdAt: string;
    items: { productName: string; quantity: number; price: number }[];
    comment?: string;
  }[];
  favoriteProducts: { name: string; quantity: number }[];
}

interface CustomerDetailModalProps {
  customer: CustomerData | null;
  onClose: () => void;
}

export function CustomerDetailModal({
  customer,
  onClose,
}: CustomerDetailModalProps) {
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string>("gift");
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    if (customer) {
      const savedNote = localStorage.getItem(`pava-crm-note-${customer.id}`) || "";
      setNote(savedNote);
      setNoteSaved(false);

      try {
        const savedTags = localStorage.getItem(`pava-crm-tags-${customer.id}`);
        if (savedTags) {
          setTags(JSON.parse(savedTags));
        } else {
          // Defaults based on segment
          const initial = customer.segment === "vip" ? ["VIP"] : customer.segment === "recurring" ? ["Recurrente"] : [];
          setTags(initial);
        }
      } catch {
        setTags([]);
      }
    }
  }, [customer]);

  if (!customer) return null;

  function handleSaveNote() {
    if (!customer) return;
    localStorage.setItem(`pava-crm-note-${customer.id}`, note);
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  }

  function handleAddTag(tagText: string) {
    if (!customer) return;
    const clean = tagText.trim();
    if (!clean || tags.includes(clean)) return;
    const next = [...tags, clean];
    setTags(next);
    localStorage.setItem(`pava-crm-tags-${customer.id}`, JSON.stringify(next));
    setNewTagInput("");
  }

  function handleRemoveTag(tagToRemove: string) {
    if (!customer) return;
    const next = tags.filter((t) => t !== tagToRemove);
    setTags(next);
    localStorage.setItem(`pava-crm-tags-${customer.id}`, JSON.stringify(next));
  }

  async function handleCopyTemplate(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedMsg(true);
      setTimeout(() => setCopiedMsg(false), 2000);
    } catch {
      // ignore
    }
  }

  const cleanPhone = customer.phone?.replace(/\D/g, "");
  let formattedPhone = cleanPhone || "";
  if (formattedPhone.startsWith("0")) formattedPhone = formattedPhone.slice(1);
  if (formattedPhone.length === 10) formattedPhone = `549${formattedPhone}`;
  else if (formattedPhone.startsWith("54") && !formattedPhone.startsWith("549") && formattedPhone.length === 12) {
    formattedPhone = `549${formattedPhone.slice(2)}`;
  }

  const topProduct = customer.favoriteProducts[0]?.name || "yerba o mate";

  const templates = [
    {
      id: "gift",
      title: "🎁 Agradecimiento + Cupón 10% OFF",
      text: `¡Hola ${customer.name}! 👋 Gracias por elegir a Poné La Pava. Como cliente especial, te regalamos un 10% OFF con el código *MATEROVIP* en tu próxima compra de yerbas o accesorios. ¡Que disfrutes cada mate! 🧉✨`,
    },
    {
      id: "restock",
      title: "🧉 Aviso de Stock de su producto",
      text: `¡Hola ${customer.name}! 🧉 Te avisamos que ingresó stock fresco de *${topProduct}* en nuestro local de Catriel. ¿Te gustaría que te reservemos uno antes de que se agote?`,
    },
    {
      id: "feedback",
      title: "💬 Consulta de satisfacción",
      text: `¡Hola ${customer.name}! 👋 ¿Cómo estás? Te escribimos de Poné La Pava para ver cómo te fue con tu pedido. ¿Todo en orden con tu mate? ¡Cualquier duda estamos para ayudarte! ✨`,
    },
  ];

  const currentTemplate = templates.find((t) => t.id === activeTemplate) || templates[0];
  const whatsappUrl = formattedPhone
    ? `https://wa.me/${formattedPhone}?text=${encodeURIComponent(currentTemplate.text)}`
    : null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6 sm:p-8 text-[var(--dash-text)] shadow-2xl space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--dash-border)] pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--dash-accent)]/20 text-[var(--dash-accent)] font-bold text-lg border border-[var(--dash-accent)]/30">
              {customer.name.charAt(0).toUpperCase()}
            </span>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-bold text-[var(--dash-text)] font-display">
                  {customer.name}
                </h2>
                {customer.segment === "vip" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 text-[11px] font-bold">
                    <Crown size={12} className="text-amber-400" /> Cliente VIP
                  </span>
                )}
                {customer.segment === "recurring" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold">
                    🔄 Recurrente
                  </span>
                )}
                {customer.segment === "risk" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-0.5 text-[11px] font-bold">
                    ⚠️ Inactivo (&gt;45d)
                  </span>
                )}
              </div>
              {customer.phone && (
                <p className="text-xs text-[var(--dash-muted)] mt-1 flex items-center gap-1">
                  <Phone size={12} /> {customer.phone}
                </p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-control p-1.5 text-[var(--dash-text)]/50 hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-2)] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dash-accent)] block">
              Total Gastado (LTV)
            </span>
            <span className="text-lg font-bold text-[var(--dash-text)]">
              {formatPrice(customer.totalSpent)}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dash-accent)] block">
              Pedidos Realizados
            </span>
            <span className="text-lg font-bold text-[var(--dash-text)]">
              {customer.ordersCount}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dash-accent)] block">
              Ticket Promedio
            </span>
            <span className="text-lg font-bold text-[var(--dash-text)]">
              {formatPrice(Math.round(customer.totalSpent / (customer.ordersCount || 1)))}
            </span>
          </div>
        </div>

        {/* Tags / Custom Labels Manager */}
        <div className="p-4 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] flex items-center gap-1.5">
              <Crown size={14} /> Etiquetas & Preferencias del Cliente
            </label>
            <span className="text-[10px] text-[var(--dash-muted)] font-mono">
              {tags.length} activas
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-[var(--dash-surface-3)] text-[var(--dash-text)] border border-[var(--dash-border)]"
              >
                <span>{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="text-[var(--dash-muted)] hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer"
                  title={`Eliminar etiqueta ${tag}`}
                >
                  <X size={11} />
                </button>
              </span>
            ))}
          </div>

          {/* Add tag form & quick suggestions */}
          <div className="flex items-center gap-2 pt-1">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTag(newTagInput);
              }}
              className="flex items-center gap-2 flex-1"
            >
              <input
                type="text"
                placeholder="Nueva etiqueta (ej: Yerba Canarias, Retiro Local)..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="admin-input flex-1 py-1.5 text-xs"
              />
              <button
                type="submit"
                disabled={!newTagInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-[var(--dash-accent)] text-[#182b1d] text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
              >
                + Agregar
              </button>
            </form>
          </div>

          <div className="flex flex-wrap items-center gap-1 pt-1 text-[10px] text-[var(--dash-muted)]">
            <span>Sugerencias rápidas:</span>
            {["Yerba Intensa", "Yerba Suave", "Mate Imperial", "Retira en Tienda", "Envío a Domicilio", "Regalo Empresarial"].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => handleAddTag(suggestion)}
                className="px-2 py-0.5 rounded bg-[var(--dash-surface)] hover:bg-[var(--dash-surface-3)] text-[var(--dash-text)]/80 border border-[var(--dash-border)] transition-colors cursor-pointer"
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* CRM Internal Private Notes */}
        <div className="p-4 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] flex items-center gap-1.5">
              <StickyNote size={14} /> Notas Internas del Cliente (Privadas)
            </label>
            {noteSaved && (
              <span className="text-[11px] font-bold text-emerald-400">
                ¡Nota guardada!
              </span>
            )}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ej: Toma mate amargo, prefiere molienda fina uruguaya, retira siempre por el local de Catriel..."
            className="admin-input"
            rows={2}
            style={{ fontSize: 13, resize: "vertical" }}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveNote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--dash-surface-3)] hover:bg-[var(--dash-accent)] hover:text-[#182b1d] text-xs font-bold text-[var(--dash-text)] border border-[var(--dash-border)] transition-colors cursor-pointer"
            >
              <Save size={13} />
              Guardar Nota
            </button>
          </div>
        </div>

        {/* WhatsApp Direct Action Templates */}
        <div className="p-4 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <MessageCircle size={14} /> Mensaje Rápido por WhatsApp
            </h3>
            <span className="text-[11px] text-[var(--dash-muted)]">
              Elegí plantilla
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => setActiveTemplate(tpl.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  activeTemplate === tpl.id
                    ? "bg-emerald-600 text-white shadow-sm"
                    : "bg-[var(--dash-surface)] text-[var(--dash-text)]/80 hover:text-[var(--dash-text)] border border-[var(--dash-border)]"
                }`}
              >
                {tpl.title}
              </button>
            ))}
          </div>

          <p className="text-xs text-[var(--dash-text)]/90 bg-[var(--dash-surface)] p-3 rounded-lg border border-[var(--dash-border)] italic font-mono leading-relaxed">
            &ldquo;{currentTemplate.text}&rdquo;
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleCopyTemplate(currentTemplate.text)}
              className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[var(--dash-surface-3)] hover:bg-[var(--dash-border)] text-[var(--dash-text)] font-bold text-xs border border-[var(--dash-border)] transition-colors cursor-pointer"
            >
              {copiedMsg ? <Check size={14} className="text-emerald-400" /> : <Gift size={14} />}
              {copiedMsg ? "¡Texto Copiado!" : "Copiar Texto"}
            </button>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-transform active:scale-98"
              >
                <Send size={14} />
                Abrir en WhatsApp
              </a>
            ) : (
              <p className="text-xs text-[var(--dash-muted)] text-center flex-1">
                Sin número registrado
              </p>
            )}
          </div>
        </div>

        {/* Top products purchased */}
        {customer.favoriteProducts.length > 0 && (
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] mb-3 flex items-center gap-1.5">
              <Package size={14} /> Productos Favoritos / Más Comprados
            </h3>
            <div className="flex flex-wrap gap-2">
              {customer.favoriteProducts.map((p) => (
                <span
                  key={p.name}
                  className="rounded-chip bg-[var(--dash-surface-2)] border border-[var(--dash-border)] px-3 py-1.5 text-xs text-[var(--dash-text)] font-medium flex items-center gap-1.5"
                >
                  <span>{p.name}</span>
                  <span className="text-[10px] font-bold text-[var(--dash-accent)] bg-[var(--dash-surface-3)] px-1.5 py-0.5 rounded-full">
                    x{p.quantity}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Orders History */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] mb-3 flex items-center gap-1.5">
            <ShoppingBag size={14} /> Historial de Pedidos ({customer.orders.length})
          </h3>
          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {customer.orders.map((o, idx) => (
              <div
                key={o.id || idx}
                className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[var(--dash-text)]/60 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(o.createdAt).toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        printOrderRemito({
                          id: o.id,
                          customerName: customer.name,
                          customerPhone: customer.phone,
                          items: o.items.map((item) => ({
                            productId: "",
                            productName: item.productName,
                            quantity: item.quantity,
                            price: item.price,
                            subtotal: item.price * item.quantity,
                          })),
                          subtotal: o.total,
                          total: o.total,
                          comment: o.comment,
                          status: (o.status as "pending" | "confirmed" | "delivered" | "cancelled") || "delivered",
                          createdAt: o.createdAt,
                        })
                      }
                      title="Imprimir remito de despacho"
                      className="p-1 rounded text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-3)] transition-colors cursor-pointer"
                    >
                      <Printer size={13} />
                    </button>
                    <span className="font-bold text-[var(--dash-text)]">
                      {formatPrice(o.total)}
                    </span>
                    <span className="rounded-chip px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-[var(--dash-surface-3)] border border-[var(--dash-border)]">
                      {STATUS_LABELS[o.status as keyof typeof STATUS_LABELS] || o.status}
                    </span>
                  </div>
                </div>
                <div className="text-[var(--dash-text)]/80 text-[11px] pl-2 border-l border-[var(--dash-border)] space-y-0.5">
                  {o.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span>• {item.productName} x{item.quantity}</span>
                      <span>{formatPrice(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--dash-border)]">
          <AdminButton variant="secondary" onClick={onClose}>
            Cerrar
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
