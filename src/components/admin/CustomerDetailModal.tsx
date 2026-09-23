"use client";

import { useState, useEffect } from "react";
import {
  X,
  MessageCircle,
  Calendar,
  Phone,
  Package,
  StickyNote,
  Crown,
  Sparkles,
  Send,
  Save,
  Printer,
  Check,
  AlertCircle,
  Tag,
  Copy,
} from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { STATUS_LABELS } from "@/lib/orderStatus";
import { printOrderRemito } from "@/lib/orderPrint";
import { CustomerWithStats, CustomerDetail } from "@/lib/customers";

interface CustomerDetailModalProps {
  customer: CustomerWithStats | null;
  onClose: () => void;
  onCustomerUpdated?: () => void;
}

export function CustomerDetailModal({
  customer,
  onClose,
  onCustomerUpdated,
}: CustomerDetailModalProps) {
  const [detail, setDetail] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);
  const [followUpSaved, setFollowUpSaved] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState<string>("gratitude");
  const [copiedMsg, setCopiedMsg] = useState(false);

  useEffect(() => {
    if (!customer) {
      setDetail(null);
      return;
    }

    setNote(customer.notes || "");
    setTags(customer.tags || []);
    setFollowUpDate(customer.followUpAt ? customer.followUpAt.slice(0, 10) : "");

    // Cargar detalle completo desde la API
    setLoading(true);
    fetch(`/api/admin/customers/${customer.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener detalle");
        return res.json();
      })
      .then((data: CustomerDetail) => {
        setDetail(data);
        setNote(data.notes || "");
        setTags(data.tags || []);
        if (data.followUpAt) {
          setFollowUpDate(data.followUpAt.slice(0, 10));
        }
      })
      .catch(() => {
        // Fallback al cliente recibido
      })
      .finally(() => setLoading(false));
  }, [customer]);

  if (!customer) return null;

  const current = detail || customer;
  const daysSinceLast = current.daysSinceLastOrder;

  async function handleSaveNote() {
    if (!customer) return;
    setSavingNote(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: note }),
      });
      if (res.ok) {
        setNoteSaved(true);
        setTimeout(() => setNoteSaved(false), 2500);
        onCustomerUpdated?.();
      }
    } catch {
      // ignore
    } finally {
      setSavingNote(false);
    }
  }

  async function handleAddTag(tagText: string) {
    if (!customer) return;
    const clean = tagText.trim();
    if (!clean || tags.includes(clean)) return;
    const nextTags = [...tags, clean];
    setTags(nextTags);
    setNewTagInput("");

    try {
      await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: nextTags }),
      });
      onCustomerUpdated?.();
    } catch {
      // ignore
    }
  }

  async function handleRemoveTag(tagToRemove: string) {
    if (!customer) return;
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);

    try {
      await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: nextTags }),
      });
      onCustomerUpdated?.();
    } catch {
      // ignore
    }
  }

  async function handleSaveFollowUp(newDate: string) {
    if (!customer) return;
    setSavingFollowUp(true);
    setFollowUpDate(newDate);

    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follow_up_at: newDate ? new Date(`${newDate}T12:00:00Z`).toISOString() : null,
        }),
      });
      if (res.ok) {
        setFollowUpSaved(true);
        setTimeout(() => setFollowUpSaved(false), 2500);
        onCustomerUpdated?.();
      }
    } catch {
      // ignore
    } finally {
      setSavingFollowUp(false);
    }
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

  const cleanPhone = customer.phoneNormalized.replace(/\D/g, "");
  const topProduct = detail?.favoriteProducts[0]?.name || "yerba o mate";

  // Plantillas directas sin cupones ni promesas inexistentes
  const templates = [
    {
      id: "gratitude",
      title: "🎁 Agradecimiento y Atención",
      text: `¡Hola ${customer.name}! 👋 Gracias por elegir a Poné La Pava. Te escribimos para agradecerte por tu compra y recordarte que estamos a tu disposición en Catriel para lo que necesites. ¡Que disfrutes cada mate! 🧉✨`,
    },
    {
      id: "followup",
      title: "🧉 Seguimiento Post-Compra",
      text: `¡Hola ${customer.name}! 👋 ¿Cómo estás? Te escribimos desde el local de Poné La Pava para saber cómo te resultó tu último pedido. ¿Todo en orden con tu mate y yerba? Cualquier consulta estamos a un mensaje.`,
    },
    {
      id: "restock",
      title: "🌿 Novedades de Yerbas / Stock",
      text: `¡Hola ${customer.name}! 🧉 Te avisamos que ingresó stock fresco en nuestro local de Catriel (incluyendo variedades seleccionadas como *${topProduct}*). Si querés que te reservemos algo antes de pasar a retirar, avisanos por acá.`,
    },
    {
      id: "ready",
      title: "📦 Pedido Listo para Retiro",
      text: `¡Hola ${customer.name}! 🧉 Tu pedido ya está preparado en nuestro local de Poné La Pava para que pases a retirarlo cuando gustes. ¡Te esperamos!`,
    },
  ];

  const currentTemplate = templates.find((t) => t.id === activeTemplate) || templates[0];
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentTemplate.text)}`
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
                    ⚠️ En riesgo ({daysSinceLast !== null ? `${daysSinceLast}d` : ""})
                  </span>
                )}
                {customer.segment === "new" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-0.5 text-[11px] font-bold">
                    ✨ Nuevo
                  </span>
                )}
              </div>
              {customer.phoneNormalized && (
                <p className="text-xs text-[var(--dash-muted)] mt-1 flex items-center gap-1">
                  <Phone size={12} /> {customer.displayPhone || customer.phoneNormalized}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dash-accent)] block">
              Total Gastado
            </span>
            <span className="text-base sm:text-lg font-bold text-[var(--dash-text)]">
              {formatPrice(customer.totalSpent)}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dash-accent)] block">
              Pedidos
            </span>
            <span className="text-base sm:text-lg font-bold text-[var(--dash-text)]">
              {customer.ordersCount}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dash-accent)] block">
              Ticket Promedio
            </span>
            <span className="text-base sm:text-lg font-bold text-[var(--dash-text)]">
              {formatPrice(customer.averageTicket)}
            </span>
          </div>
          <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[var(--dash-accent)] block">
              Última Compra
            </span>
            <span className="text-sm sm:text-base font-bold text-[var(--dash-text)]">
              {daysSinceLast !== null ? `Hace ${daysSinceLast} d` : "Sin compras"}
            </span>
          </div>
        </div>

        {/* Próximo Seguimiento (Follow-up) */}
        <div className="p-4 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] flex items-center gap-1.5">
              <Calendar size={14} /> Próximo Seguimiento (CRM)
            </label>
            {followUpSaved && (
              <span className="text-[11px] font-bold text-emerald-400">
                ¡Seguimiento actualizado!
              </span>
            )}
            {customer.isFollowUpOverdue && (
              <span className="text-[11px] font-bold text-red-400 flex items-center gap-1">
                <AlertCircle size={12} /> Seguimiento vencido
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => handleSaveFollowUp(e.target.value)}
              className="admin-input py-1.5 px-3 text-xs"
              style={{ width: 170 }}
            />
            {followUpDate && (
              <button
                type="button"
                onClick={() => handleSaveFollowUp("")}
                disabled={savingFollowUp}
                className="text-xs text-[var(--dash-muted)] hover:text-red-400 underline transition-colors cursor-pointer"
              >
                Limpiar fecha
              </button>
            )}
            <span className="text-[11px] text-[var(--dash-muted)]">
              Aparece en la vista &quot;Hoy&quot; para contactar al cliente en la fecha asignada.
            </span>
          </div>
        </div>

        {/* Tags / Custom Labels Manager */}
        <div className="p-4 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] flex items-center gap-1.5">
              <Tag size={14} /> Etiquetas & Preferencias del Cliente
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
            {["Yerba Despalada", "Yerba Suave", "Mate Imperial", "Camionero", "Retiro Local", "Envío", "Corporativo"].map((suggestion) => (
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
              <StickyNote size={14} /> Notas Internas del Cliente (Guardadas en Servidor)
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
            placeholder="Ej: Toma mate amargo, prefiere molienda uruguaya, retira siempre por el local de Catriel..."
            className="admin-input"
            rows={2}
            style={{ fontSize: 13, resize: "vertical" }}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSaveNote}
              disabled={savingNote}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--dash-surface-3)] hover:bg-[var(--dash-accent)] hover:text-[#182b1d] text-xs font-bold text-[var(--dash-text)] border border-[var(--dash-border)] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Save size={13} />
              {savingNote ? "Guardando..." : "Guardar Nota"}
            </button>
          </div>
        </div>

        {/* WhatsApp Direct Action Templates */}
        <div className="p-4 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <MessageCircle size={14} /> Mensaje Directo por WhatsApp
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  activeTemplate === tpl.id
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs"
                    : "bg-[var(--dash-surface)] text-[var(--dash-text)]/70 border-[var(--dash-border)] hover:bg-[var(--dash-surface-3)]"
                }`}
              >
                {tpl.title}
              </button>
            ))}
          </div>

          {/* Template preview */}
          <div className="p-3 rounded-lg bg-[var(--dash-surface-3)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)]/90 leading-relaxed font-sans relative">
            <p className="whitespace-pre-line">{currentTemplate.text}</p>
          </div>

          <div className="flex items-center justify-between pt-1 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleCopyTemplate(currentTemplate.text)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--dash-surface)] hover:bg-[var(--dash-surface-3)] text-xs font-semibold text-[var(--dash-text)] border border-[var(--dash-border)] transition-colors cursor-pointer"
            >
              {copiedMsg ? (
                <>
                  <Check size={13} className="text-emerald-400" /> ¡Texto Copiado!
                </>
              ) : (
                <>
                  <Copy size={13} /> Copiar Mensaje
                </>
              )}
            </button>

            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md hover:shadow-emerald-900/30 transition-all cursor-pointer"
              >
                <Send size={13} />
                Abrir WhatsApp con este mensaje
              </a>
            ) : (
              <span className="text-xs text-[var(--dash-muted)]">
                Teléfono no disponible
              </span>
            )}
          </div>
        </div>

        {/* Favorite Products */}
        {detail && detail.favoriteProducts && detail.favoriteProducts.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] flex items-center gap-1.5">
              <Sparkles size={14} /> Productos Más Comprados
            </h3>
            <div className="flex flex-wrap gap-2">
              {detail.favoriteProducts.map((p) => (
                <span
                  key={p.name}
                  className="px-2.5 py-1 rounded-md text-xs bg-[var(--dash-surface-2)] text-[var(--dash-text)] border border-[var(--dash-border)]"
                >
                  {p.name} <strong className="text-[var(--dash-accent)] font-bold">x{p.quantity}</strong>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Orders History */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] flex items-center gap-1.5">
            <Package size={14} /> Historial de Pedidos ({detail?.orders?.length || customer.ordersCount})
          </h3>

          {loading ? (
            <p className="text-xs text-[var(--dash-muted)]">Cargando pedidos del cliente...</p>
          ) : detail && detail.orders && detail.orders.length > 0 ? (
            <div className="space-y-2">
              {detail.orders.map((o) => (
                <div
                  key={o.id}
                  className="p-3 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-xs flex items-center justify-between gap-3 flex-wrap"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[var(--dash-text)]">
                        #{o.id.slice(0, 8)}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--dash-surface-3)] text-[var(--dash-text)]">
                        {STATUS_LABELS[o.status as keyof typeof STATUS_LABELS] || o.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--dash-muted)] mt-1">
                      {new Date(o.createdAt).toLocaleDateString("es-AR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                      {o.items && o.items.length > 0 && (
                        <span> · {o.items.map((i) => `${i.productName} (x${i.quantity})`).join(", ")}</span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[var(--dash-text)] font-display">
                      {formatPrice(o.total)}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        printOrderRemito({
                          id: o.id,
                          customerName: customer.name,
                          customerPhone: customer.phoneNormalized,
                          total: o.total,
                          subtotal: o.subtotal,
                          status: o.status as Order["status"],
                          createdAt: o.createdAt,
                          items: (o.items || []).map((it) => ({
                            productId: it.productId || "",
                            productName: it.productName,
                            quantity: it.quantity,
                            price: it.price,
                            subtotal: it.subtotal,
                          })),
                          comment: o.comment ?? undefined,
                        })
                      }
                      className="p-1.5 rounded-md hover:bg-[var(--dash-surface-3)] text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors cursor-pointer"
                      title="Imprimir remito"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--dash-muted)]">No hay pedidos registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}
