"use client";

import { Plus, Trash2, ShieldCheck } from "lucide-react";
import { LandingContent, LandingAnnouncementItem } from "@/types/landing";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";

interface TrustSettingsSectionProps {
  content: LandingContent;
  onChange: (updated: LandingContent) => void;
}

export function TrustSettingsSection({ content, onChange }: TrustSettingsSectionProps) {
  const announcements = content.announcements || [];

  const handleUpdate = (index: number, patch: Partial<LandingAnnouncementItem>) => {
    const next = [...announcements];
    if (next[index]) {
      next[index] = { ...next[index], ...patch };
      onChange({ ...content, announcements: next });
    }
  };

  const handleAdd = () => {
    const newItem: LandingAnnouncementItem = {
      id: `custom_${Date.now()}`,
      highlight: "Nuevo beneficio",
      text: "Descripción del beneficio",
      badge: "DESTACADO",
    };
    onChange({ ...content, announcements: [...announcements, newItem] });
  };

  const handleRemove = (index: number) => {
    const next = announcements.filter((_, i) => i !== index);
    onChange({ ...content, announcements: next });
  };

  return (
    <div className="space-y-6">
      <AdminCard>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="admin-section-title flex items-center gap-2">
              <ShieldCheck size={18} className="text-[var(--dash-accent)]" />
              <span>Cinta de Confianza y Anuncios (Marquee)</span>
            </h2>
            <p className="text-xs text-[var(--dash-muted)] mt-1">
              Las insignias dinámicas que se desplazan infinitamente debajo del Hero principal.
            </p>
          </div>
          <AdminButton variant="primary" size="sm" onClick={handleAdd}>
            <Plus size={14} className="mr-1" />
            Agregar beneficio
          </AdminButton>
        </div>

        <div className="space-y-3">
          {announcements.map((item, idx) => (
            <div
              key={item.id || idx}
              className="p-4 bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-xl space-y-3"
            >
              <div className="flex items-center justify-between gap-2 border-b border-[var(--dash-border-subtle)] pb-2">
                <span className="text-xs font-bold text-[var(--dash-accent)]">
                  Beneficio #{idx + 1}
                </span>
                {announcements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    className="text-[var(--dash-muted)] hover:text-[var(--dash-danger)] transition-colors p-1"
                    title="Eliminar beneficio"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <AdminField label="Texto Principal (Resaltado)">
                  <input
                    type="text"
                    value={item.highlight}
                    onChange={(e) => handleUpdate(idx, { highlight: e.target.value })}
                    className="admin-input text-xs"
                    placeholder="ej. Envíos Seguros"
                  />
                </AdminField>

                <AdminField label="Subtexto o Aclaración">
                  <input
                    type="text"
                    value={item.text}
                    onChange={(e) => handleUpdate(idx, { text: e.target.value })}
                    className="admin-input text-xs"
                    placeholder="ej. a Río Negro, Neuquén y todo el país"
                  />
                </AdminField>

                <AdminField label="Etiqueta / Badge">
                  <input
                    type="text"
                    value={item.badge || ""}
                    onChange={(e) => handleUpdate(idx, { badge: e.target.value })}
                    className="admin-input text-xs"
                    placeholder="ej. ENVÍOS o ★★★★★"
                  />
                </AdminField>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
