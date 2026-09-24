"use client";

import { Sparkles } from "lucide-react";
import { LandingContent, LandingFinalCta } from "@/types/landing";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";

interface FinalCtaSettingsSectionProps {
  content: LandingContent;
  onChange: (updated: LandingContent) => void;
}

const DEFAULT_FINAL_CTA: LandingFinalCta = {
  eyebrow: "Tu próximo mate empieza acá",
  titleLine1: "¿Listo para renovar",
  titleHighlight: "tu ritual diario?",
  description:
    "Yerbas seleccionadas, mates de calabaza brasilera con virola de alpaca y accesorios duraderos. Hacé tu pedido online en minutos con atención personalizada.",
  primaryButtonText: "Explorar Catálogo Completo",
  primaryButtonLink: "/catalogo",
  secondaryButtonText: "Asesoramiento por WhatsApp",
  secondaryButtonMessage: "¡Hola! Quiero consultar por productos y envíos.",
};

export function FinalCtaSettingsSection({
  content,
  onChange,
}: FinalCtaSettingsSectionProps) {
  const cta = content.finalCta || DEFAULT_FINAL_CTA;

  const updateCta = (patch: Partial<LandingFinalCta>) => {
    onChange({
      ...content,
      finalCta: { ...cta, ...patch },
    });
  };

  return (
    <div className="space-y-6">
      <AdminCard>
        <h2 className="admin-section-title mb-4 flex items-center gap-2">
          <Sparkles size={18} className="text-[var(--dash-accent)]" />
          <span>Cierre de la Landing (Llamado a la Acción Final)</span>
        </h2>
        <p className="text-xs text-[var(--dash-muted)] -mt-2 mb-5">
          El banner impactante al final de la página antes del pie de página.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <AdminField label="Etiqueta Superior (Eyebrow)">
              <input
                type="text"
                value={cta.eyebrow}
                onChange={(e) => updateCta({ eyebrow: e.target.value })}
                className="admin-input"
                placeholder="Tu próximo mate empieza acá"
              />
            </AdminField>

            <AdminField label="Título L1">
              <input
                type="text"
                value={cta.titleLine1}
                onChange={(e) => updateCta({ titleLine1: e.target.value })}
                className="admin-input"
                placeholder="¿Listo para renovar"
              />
            </AdminField>

            <AdminField label="Título L2 (En dorado cursiva)">
              <input
                type="text"
                value={cta.titleHighlight}
                onChange={(e) => updateCta({ titleHighlight: e.target.value })}
                className="admin-input"
                placeholder="tu ritual diario?"
              />
            </AdminField>
          </div>

          <AdminField label="Descripción de la propuesta de valor">
            <textarea
              rows={2}
              value={cta.description}
              onChange={(e) => updateCta({ description: e.target.value })}
              className="admin-input resize-y"
              placeholder="Texto descriptivo de cierre..."
            />
          </AdminField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-[var(--dash-border)]">
            {/* Primary button */}
            <div className="space-y-3 p-3.5 bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-xl">
              <span className="text-xs font-bold text-[var(--dash-accent)] block">
                Botón Principal (Dorado)
              </span>
              <AdminField label="Texto del Botón">
                <input
                  type="text"
                  value={cta.primaryButtonText}
                  onChange={(e) => updateCta({ primaryButtonText: e.target.value })}
                  className="admin-input text-xs"
                  placeholder="Explorar Catálogo Completo"
                />
              </AdminField>
              <AdminField label="Enlace del Botón">
                <input
                  type="text"
                  value={cta.primaryButtonLink}
                  onChange={(e) => updateCta({ primaryButtonLink: e.target.value })}
                  className="admin-input text-xs"
                  placeholder="/catalogo"
                />
              </AdminField>
            </div>

            {/* Secondary button */}
            <div className="space-y-3 p-3.5 bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-xl">
              <span className="text-xs font-bold text-[var(--dash-text)] block">
                Botón Secundario (WhatsApp)
              </span>
              <AdminField label="Texto del Botón">
                <input
                  type="text"
                  value={cta.secondaryButtonText}
                  onChange={(e) => updateCta({ secondaryButtonText: e.target.value })}
                  className="admin-input text-xs"
                  placeholder="Asesoramiento por WhatsApp"
                />
              </AdminField>
              <AdminField label="Mensaje predeterminado de WhatsApp">
                <input
                  type="text"
                  value={cta.secondaryButtonMessage}
                  onChange={(e) => updateCta({ secondaryButtonMessage: e.target.value })}
                  className="admin-input text-xs"
                  placeholder="¡Hola! Quiero consultar por productos y envíos."
                />
              </AdminField>
            </div>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
