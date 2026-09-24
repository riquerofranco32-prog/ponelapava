"use client";

import { Plus, Trash2, HelpCircle } from "lucide-react";
import { LandingContent, LandingFAQItem } from "@/types/landing";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";

interface FaqSettingsSectionProps {
  content: LandingContent;
  onChange: (updated: LandingContent) => void;
}

const DEFAULT_FAQS: LandingFAQItem[] = [
  {
    id: "1",
    category: "pagos",
    question: "¿Qué medios de pago aceptan?",
    answer:
      "Aceptamos transferencia bancaria, Mercado Pago y efectivo al retirar en nuestro local de Catriel. Cuando confirmás el pedido por WhatsApp te pasamos los datos para transferir o el link de pago.",
  },
  {
    id: "2",
    category: "pagos",
    question: "¿Cómo es el proceso de compra directa por WhatsApp?",
    answer:
      "Armás tu carrito en la web con los productos que desees y hacés clic en 'Pedir por WhatsApp'. El sistema genera automáticamente el detalle de tu compra y te atiende una persona del local para confirmar stock, pasarte los datos de pago y despacharlo en el día.",
  },
  {
    id: "3",
    category: "envios",
    question: "¿Hacen envíos a todo el país y cuánto tardan?",
    answer:
      "Despachamos a todo el país. El costo del envío lo coordinamos por WhatsApp al confirmar tu pedido, según tu localidad. También podés retirar sin cargo en nuestro local de Catriel.",
  },
  {
    id: "4",
    category: "curado",
    question: "¿Los mates vienen curados?",
    answer:
      "Los mates de madera o calabaza se entregan naturales para que cada cliente los cure según su gusto. Te adjuntamos la guía paso a paso con el mate y también podés consultarnos por WhatsApp.",
  },
  {
    id: "5",
    category: "garantia",
    question: "¿Tienen garantía los productos?",
    answer:
      "Todos nuestros mates, termos y bombillas cuentan con garantía por defectos de fabricación y control de calidad previo a cada entrega.",
  },
];

export function FaqSettingsSection({ content, onChange }: FaqSettingsSectionProps) {
  const faqs = content.faqs && content.faqs.length > 0 ? content.faqs : DEFAULT_FAQS;

  const handleUpdate = (index: number, patch: Partial<LandingFAQItem>) => {
    const next = [...faqs];
    if (next[index]) {
      next[index] = { ...next[index], ...patch };
      onChange({ ...content, faqs: next });
    }
  };

  const handleAdd = () => {
    const newItem: LandingFAQItem = {
      id: `faq_${Date.now()}`,
      category: "pagos",
      question: "¿Nueva pregunta frecuente?",
      answer: "Respuesta detallada para tus clientes.",
    };
    onChange({ ...content, faqs: [...faqs, newItem] });
  };

  const handleRemove = (index: number) => {
    const next = faqs.filter((_, i) => i !== index);
    onChange({ ...content, faqs: next });
  };

  return (
    <div className="space-y-6">
      <AdminCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="admin-section-title flex items-center gap-2">
              <HelpCircle size={18} className="text-[var(--dash-accent)]" />
              <span>Preguntas Frecuentes (FAQ)</span>
            </h2>
            <p className="text-xs text-[var(--dash-muted)] mt-1">
              Respuestas rápidas para resolver dudas de pagos, envíos, curado y garantías en la landing.
            </p>
          </div>
          <AdminButton variant="primary" size="sm" onClick={handleAdd}>
            <Plus size={14} className="mr-1" />
            Nueva pregunta
          </AdminButton>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={faq.id || idx}
              className="p-4 bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between gap-3 border-b border-[var(--dash-border-subtle)] pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--dash-accent)]">
                    #{idx + 1}
                  </span>
                  <select
                    value={faq.category}
                    onChange={(e) =>
                      handleUpdate(idx, {
                        category: e.target.value as LandingFAQItem["category"],
                      })
                    }
                    className="admin-input py-1 text-xs font-semibold"
                  >
                    <option value="pagos">💳 Pagos</option>
                    <option value="envios">🚚 Envíos & Retiro</option>
                    <option value="curado">🧉 Curado & Mates</option>
                    <option value="garantia">🛡️ Garantía & Local</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="text-[var(--dash-muted)] hover:text-[var(--dash-danger)] transition-colors p-1"
                  title="Eliminar pregunta"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              <AdminField label="Pregunta">
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => handleUpdate(idx, { question: e.target.value })}
                  className="admin-input text-xs font-semibold"
                  placeholder="¿Cuál es la duda del cliente?"
                />
              </AdminField>

              <AdminField label="Respuesta">
                <textarea
                  rows={2}
                  value={faq.answer}
                  onChange={(e) => handleUpdate(idx, { answer: e.target.value })}
                  className="admin-input text-xs resize-y"
                  placeholder="Explicación clara y concisa..."
                />
              </AdminField>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
