"use client";

import { useState, useEffect } from "react";
import {
  MessageCircle,
  Calendar,
  Phone,
  Package,
  StickyNote,
  Send,
  Save,
  Printer,
  Check,
  AlertCircle,
  Tag,
  Copy,
  X,
  FileText,
} from "lucide-react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { printOrderRemito } from "@/lib/orderPrint";
import { CustomerWithStats, CustomerDetail } from "@/lib/customers";
import { Drawer } from "@/components/admin/ui/Drawer";
import { Tabs } from "@/components/admin/ui/Tabs";
import { StatusPill } from "@/components/admin/ui/Badge";
import { Button } from "@/components/admin/ui/Button";

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
  const [activeTab, setActiveTab] = useState<"resumen" | "pedidos" | "notas">("resumen");

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
        // Fallback al cliente actual
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

  async function handleAddTag(tagToAdd: string) {
    if (!customer) return;
    const cleanTag = tagToAdd.trim();
    if (!cleanTag || tags.includes(cleanTag)) return;

    const newTags = [...tags, cleanTag];
    setTags(newTags);
    setNewTagInput("");

    try {
      await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });
      onCustomerUpdated?.();
    } catch {
      // ignore
    }
  }

  async function handleRemoveTag(tagToRemove: string) {
    if (!customer) return;
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);

    try {
      await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: newTags }),
      });
      onCustomerUpdated?.();
    } catch {
      // ignore
    }
  }

  async function handleSaveFollowUp(newDate: string) {
    if (!customer) return;
    setFollowUpDate(newDate);
    setSavingFollowUp(true);
    try {
      const res = await fetch(`/api/admin/customers/${customer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          follow_up_at: newDate ? new Date(`${newDate}T12:00:00-03:00`).toISOString() : null,
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

  const templates = [
    {
      id: "gratitude",
      title: "Agradecimiento",
      text: `¡Hola ${customer.name}! 👋 Gracias por elegir a Poné La Pava. Te escribimos para agradecerte por tu compra y recordarte que estamos a tu disposición en Catriel para lo que necesites. ¡Que disfrutes cada mate! 🧉✨`,
    },
    {
      id: "followup",
      title: "Seguimiento",
      text: `¡Hola ${customer.name}! 👋 ¿Cómo estás? Te escribimos desde el local de Poné La Pava para saber cómo te resultó tu último pedido. ¿Todo en orden con tu mate y yerba? Cualquier consulta estamos a un mensaje.`,
    },
    {
      id: "restock",
      title: "Novedades de Stock",
      text: `¡Hola ${customer.name}! 🧉 Te avisamos que ingresó stock fresco en nuestro local de Catriel (incluyendo variedades seleccionadas como *${topProduct}*). Si querés que te reservemos algo antes de pasar a retirar, avisanos por acá.`,
    },
    {
      id: "ready",
      title: "Pedido Listo",
      text: `¡Hola ${customer.name}! 🧉 Tu pedido ya está preparado en nuestro local de Poné La Pava para que pases a retirarlo cuando gustes. ¡Te esperamos!`,
    },
  ];

  const currentTemplate = templates.find((t) => t.id === activeTemplate) || templates[0];
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(currentTemplate.text)}`
    : null;

  return (
    <Drawer
      isOpen={Boolean(customer)}
      onClose={onClose}
      title={customer.name}
      subtitle={`Cliente #${customer.id.slice(0, 8)} · ${customer.displayPhone || customer.phoneNormalized}`}
      footer={
        <div className="flex items-center justify-between w-full">
          {whatsappUrl ? (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90 shadow-sm"
              style={{ backgroundColor: "#25d366" }}
            >
              <MessageCircle size={15} />
              <span>Abrir WhatsApp</span>
            </a>
          ) : (
            <span />
          )}

          <Button variant="secondary" size="sm" onClick={onClose}>
            Cerrar ficha
          </Button>
        </div>
      }
    >
      {/* Top Header Card */}
      <div className="flex items-center justify-between p-4 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-[var(--dash-accent-bg)] border border-[var(--dash-accent-border)] flex items-center justify-center font-bold text-lg text-[var(--dash-accent)]">
            {customer.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-[var(--dash-text)]">
                {customer.name}
              </h3>
              <StatusPill type="segment" value={customer.segment} />
            </div>
            <div className="flex items-center gap-2 text-xs text-[var(--dash-muted)] mt-0.5">
              <Phone size={12} />
              <span>{customer.displayPhone || customer.phoneNormalized}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Switcher: Resumen / Pedidos / Notas */}
      <Tabs
        tabs={[
          { id: "resumen", label: "Resumen", icon: <FileText size={14} /> },
          {
            id: "pedidos",
            label: "Pedidos",
            count: detail?.orders?.length ?? customer.ordersCount,
            icon: <Package size={14} />,
          },
          {
            id: "notas",
            label: "Notas & CRM",
            count: tags.length > 0 ? tags.length : undefined,
            icon: <StickyNote size={14} />,
          },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as "resumen" | "pedidos" | "notas")}
      />

      {/* Tab 1: Resumen */}
      {activeTab === "resumen" && (
        <div className="space-y-5">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)] block mb-1">
                Total Gastado
              </span>
              <span className="text-lg font-bold text-[var(--dash-accent)]">
                {formatPrice(customer.totalSpent)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)] block mb-1">
                Ticket Promedio
              </span>
              <span className="text-lg font-bold text-[var(--dash-text)]">
                {formatPrice(customer.averageTicket)}
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)] block mb-1">
                Cant. Pedidos
              </span>
              <span className="text-lg font-bold text-[var(--dash-text)]">
                {customer.ordersCount} pedidos
              </span>
            </div>
            <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)] block mb-1">
                Última Compra
              </span>
              <span className="text-sm font-bold text-[var(--dash-text)]">
                {daysSinceLast !== null ? `Hace ${daysSinceLast} días` : "Sin compras"}
              </span>
            </div>
          </div>

          {/* WhatsApp Direct Action Templates */}
          <div className="p-4 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] flex items-center gap-1.5">
                <MessageCircle size={14} />
                <span>Mensaje rápido por WhatsApp</span>
              </h4>
              <span className="text-xs text-[var(--dash-muted)]">
                Plantillas sin spam
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setActiveTemplate(tpl.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    activeTemplate === tpl.id
                      ? "bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] border-[var(--dash-accent-border)] font-bold"
                      : "bg-[var(--dash-surface)] text-[var(--dash-muted)] border-[var(--dash-border)] hover:text-[var(--dash-text)]"
                  }`}
                >
                  {tpl.title}
                </button>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-[var(--dash-surface-3)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)] leading-relaxed whitespace-pre-line">
              {currentTemplate.text}
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleCopyTemplate(currentTemplate.text)}
                icon={copiedMsg ? <Check size={14} className="text-[var(--dash-success)]" /> : <Copy size={14} />}
              >
                {copiedMsg ? "¡Copiado!" : "Copiar mensaje"}
              </Button>

              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: "#25d366" }}
                >
                  <Send size={13} />
                  <span>Enviar por WhatsApp</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pedidos */}
      {activeTab === "pedidos" && (
        <div className="space-y-3">
          {detail?.orders && detail.orders.length > 0 ? (
            detail.orders.map((o) => (
              <div
                key={o.id}
                className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[var(--dash-text)]">
                      #{o.id?.slice(0, 8)}
                    </span>
                    <span className="text-[var(--dash-muted)]">
                      {new Date(o.createdAt).toLocaleDateString("es-AR")}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <StatusPill type="order" value={o.status} />
                    <StatusPill type="payment" value={o.paymentStatus || "unpaid"} />
                  </div>
                </div>

                <div className="text-[var(--dash-text)] font-medium">
                  {o.items.map((i) => `${i.quantity}x ${i.productName}`).join(", ")}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-[var(--dash-border-subtle)]">
                  <span className="font-semibold text-sm text-[var(--dash-accent)]">
                    {formatPrice(o.total)}
                  </span>
                  <button
                    onClick={() =>
                      printOrderRemito({
                        ...o,
                        customerName: customer?.name || "Cliente",
                        customerPhone: customer?.displayPhone || customer?.phoneNormalized || "",
                        customerAddress: "",
                      } as Order)
                    }
                    className="inline-flex items-center gap-1 text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors p-1"
                    title="Imprimir ticket"
                  >
                    <Printer size={13} />
                    <span>Ticket</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-xs text-[var(--dash-muted)]">
              No hay pedidos registrados para este cliente.
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Notas & CRM */}
      {activeTab === "notas" && (
        <div className="space-y-4">
          {/* Follow-up date */}
          <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] flex items-center gap-1.5">
                <Calendar size={14} />
                <span>Fecha de seguimiento</span>
              </label>
              {followUpSaved && (
                <span className="text-xs font-bold text-[var(--dash-success)]">
                  ¡Actualizado!
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={followUpDate}
                onChange={(e) => handleSaveFollowUp(e.target.value)}
                className="admin-input py-1.5 px-3 text-xs max-w-[200px]"
              />
              {followUpDate && (
                <button
                  type="button"
                  onClick={() => handleSaveFollowUp("")}
                  disabled={savingFollowUp}
                  className="text-xs text-[var(--dash-danger)] hover:underline"
                >
                  Quitar fecha
                </button>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] flex items-center gap-1.5">
                <Tag size={14} />
                <span>Etiquetas del cliente</span>
              </label>
              <span className="text-xs text-[var(--dash-muted)]">
                {tags.length} activas
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-[var(--dash-surface-3)] text-[var(--dash-text)] border border-[var(--dash-border)]"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="text-[var(--dash-muted)] hover:text-[var(--dash-danger)]"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTag(newTagInput);
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                placeholder="Nueva etiqueta..."
                value={newTagInput}
                onChange={(e) => setNewTagInput(e.target.value)}
                className="admin-input py-1.5 text-xs flex-1"
              />
              <Button type="submit" variant="secondary" size="sm" disabled={!newTagInput.trim()}>
                + Agregar
              </Button>
            </form>
          </div>

          {/* Notes textarea */}
          <div className="p-3.5 rounded-xl bg-[var(--dash-surface-2)] border border-[var(--dash-border)] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-accent)] flex items-center gap-1.5">
                <StickyNote size={14} />
                <span>Notas privadas del cliente</span>
              </label>
              {noteSaved && (
                <span className="text-xs font-bold text-[var(--dash-success)]">
                  ¡Guardada!
                </span>
              )}
            </div>

            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Preferencias de yerba, horarios de entrega, comentarios..."
              className="admin-input text-xs"
              rows={4}
            />

            <div className="flex justify-end pt-1">
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveNote}
                loading={savingNote}
                icon={<Save size={13} />}
              >
                Guardar notas
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

export default CustomerDetailModal;
