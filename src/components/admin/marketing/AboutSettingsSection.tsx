"use client";

import Image from "next/image";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { LandingContent, LandingAbout } from "@/types/landing";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";

interface AboutSettingsSectionProps {
  content: LandingContent;
  onChange: (updated: LandingContent) => void;
  onTriggerUpload: (field: string) => void;
  uploadingTarget: string | null;
}

const DEFAULT_ABOUT: LandingAbout = {
  eyebrow: "Nosotros",
  title: "Más que una yerba.",
  titleHighlight: "Una forma de compartir.",
  quote: "El mate no se toma solo. Y tampoco se elige solo.",
  paragraph1:
    "En Poné La Pava creemos que el mate no es solo una bebida: es un ritual, un pretexto para estar juntos, para bajar el ritmo y conectar.",
  paragraph2:
    "Nacimos con la misión de reunir todo lo que necesitás para vivir ese ritual como se merece. Desde la yerba más cuidadosamente seleccionada hasta el mate que se convierte en tuyo con el tiempo.",
  image: "/local/local-1.jpg",
  badgeTop: "Desde Argentina",
  badgeBottom: "Para cada ronda",
  stats: [
    { value: "100%", label: "Artesanal" },
    { value: "Premium", label: "Selección" },
    { value: "Local", label: "Argentino" },
    { value: "Ritual", label: "Compartido" },
  ],
};

export function AboutSettingsSection({
  content,
  onChange,
  onTriggerUpload,
  uploadingTarget,
}: AboutSettingsSectionProps) {
  const about = content.about || DEFAULT_ABOUT;

  const updateAbout = (patch: Partial<LandingAbout>) => {
    onChange({
      ...content,
      about: { ...about, ...patch },
    });
  };

  const updateStat = (index: number, key: "value" | "label", val: string) => {
    const nextStats = [...about.stats];
    if (nextStats[index]) {
      nextStats[index] = { ...nextStats[index], [key]: val };
      updateAbout({ stats: nextStats });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Story & Texts */}
      <div className="lg:col-span-7 space-y-4">
        <AdminCard>
          <h2 className="admin-section-title mb-4">Textos de la Historia ("Nosotros")</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AdminField label="Etiqueta Superior (Eyebrow)">
                <input
                  type="text"
                  value={about.eyebrow}
                  onChange={(e) => updateAbout({ eyebrow: e.target.value })}
                  className="admin-input"
                  placeholder="ej. Nosotros"
                />
              </AdminField>

              <AdminField label="Título Principal">
                <input
                  type="text"
                  value={about.title}
                  onChange={(e) => updateAbout({ title: e.target.value })}
                  className="admin-input"
                  placeholder="ej. Más que una yerba."
                />
              </AdminField>
            </div>

            <AdminField label="Resaltado del Título (en cursiva dorada/terracota)">
              <input
                type="text"
                value={about.titleHighlight}
                onChange={(e) => updateAbout({ titleHighlight: e.target.value })}
                className="admin-input"
                placeholder="ej. Una forma de compartir."
              />
            </AdminField>

            <AdminField label="Frase Destacada (Cita)">
              <input
                type="text"
                value={about.quote}
                onChange={(e) => updateAbout({ quote: e.target.value })}
                className="admin-input"
                placeholder="ej. El mate no se toma solo. Y tampoco se elige solo."
              />
            </AdminField>

            <AdminField label="Párrafo 1 (Misión / Filosofía)">
              <textarea
                rows={3}
                value={about.paragraph1}
                onChange={(e) => updateAbout({ paragraph1: e.target.value })}
                className="admin-input resize-y"
                placeholder="Primer párrafo de la historia..."
              />
            </AdminField>

            <AdminField label="Párrafo 2 (Origen y Selección)">
              <textarea
                rows={3}
                value={about.paragraph2}
                onChange={(e) => updateAbout({ paragraph2: e.target.value })}
                className="admin-input resize-y"
                placeholder="Segundo párrafo de la historia..."
              />
            </AdminField>
          </div>
        </AdminCard>

        {/* 4 Stats */}
        <AdminCard>
          <h2 className="admin-section-title mb-4">4 Métricas / Insignias Destacadas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {about.stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-3 bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-xl space-y-2"
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-muted)]">
                  Métrica #{idx + 1}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={stat.value}
                    onChange={(e) => updateStat(idx, "value", e.target.value)}
                    className="admin-input text-xs"
                    placeholder="ej. 100%"
                  />
                  <input
                    type="text"
                    value={stat.label}
                    onChange={(e) => updateStat(idx, "label", e.target.value)}
                    className="admin-input text-xs"
                    placeholder="ej. Artesanal"
                  />
                </div>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      {/* Right Column: Image & Floating Card */}
      <div className="lg:col-span-5 space-y-4">
        <AdminCard>
          <h2 className="admin-section-title mb-4">Foto Principal de la Sección</h2>
          <div className="space-y-4">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-black/30 border border-[var(--dash-border)] group">
              {about.image ? (
                <Image
                  src={about.image}
                  alt="Vista previa de Nosotros"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[var(--dash-muted)]">
                  <ImageIcon size={40} className="opacity-30" />
                </div>
              )}

              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <AdminButton
                  variant="primary"
                  size="sm"
                  onClick={() => onTriggerUpload("about.image")}
                  disabled={uploadingTarget === "about.image"}
                >
                  {uploadingTarget === "about.image" ? (
                    <Loader2 size={14} className="animate-spin mr-1" />
                  ) : (
                    <Upload size={14} className="mr-1" />
                  )}
                  Cambiar foto
                </AdminButton>
              </div>
            </div>

            <AdminField label="URL directa de la imagen">
              <input
                type="text"
                value={about.image}
                onChange={(e) => updateAbout({ image: e.target.value })}
                className="admin-input text-xs"
                placeholder="https://... o /local/local-1.jpg"
              />
            </AdminField>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[var(--dash-border)]">
              <AdminField label="Insignia Flotante (L1)">
                <input
                  type="text"
                  value={about.badgeTop}
                  onChange={(e) => updateAbout({ badgeTop: e.target.value })}
                  className="admin-input text-xs"
                  placeholder="Desde Argentina"
                />
              </AdminField>

              <AdminField label="Insignia Flotante (L2)">
                <input
                  type="text"
                  value={about.badgeBottom}
                  onChange={(e) => updateAbout({ badgeBottom: e.target.value })}
                  className="admin-input text-xs"
                  placeholder="Para cada ronda"
                />
              </AdminField>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}
