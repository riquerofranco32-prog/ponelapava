"use client";

import Image from "next/image";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { LandingContent, LandingLocal } from "@/types/landing";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";

interface LocalSettingsSectionProps {
  content: LandingContent;
  onChange: (updated: LandingContent) => void;
  onTriggerUpload: (field: string) => void;
  uploadingTarget: string | null;
}

const DEFAULT_LOCAL: LandingLocal = {
  eyebrow: "El local",
  title: "Vení, elegí",
  titleHighlight: "y quedate un rato.",
  description:
    "Nuestro local físico es el punto de encuentro de los mateadores. Venís, tocás los productos, los olés y encontrás ese detalle que hace propio a tu ritual.",
  photos: [
    { src: "/local/local-1.jpg", alt: "Fachada y vidriera del local Poné La Pava" },
    { src: "/local/local-2.jpg", alt: "Estantería de termos Stanley y yerbas" },
    { src: "/local/local-3.jpg", alt: "Sector de mates artesanales y cuero" },
    { src: "/local/local-4.jpg", alt: "Exhibición de bombillas de alpaca y bolsos" },
    { src: "/local/local-5.jpg", alt: "Mates camioneros e imperiales en el local" },
    { src: "/local/local-6.jpg", alt: "Vista interior del salón matero" },
  ],
};

export function LocalSettingsSection({
  content,
  onChange,
  onTriggerUpload,
  uploadingTarget,
}: LocalSettingsSectionProps) {
  const local = content.local || DEFAULT_LOCAL;

  const updateLocal = (patch: Partial<LandingLocal>) => {
    onChange({
      ...content,
      local: { ...local, ...patch },
    });
  };

  const updatePhoto = (index: number, patch: Partial<{ src: string; alt: string }>) => {
    const nextPhotos = [...local.photos];
    if (nextPhotos[index]) {
      nextPhotos[index] = { ...nextPhotos[index], ...patch };
      updateLocal({ photos: nextPhotos });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top: Titles and Description */}
      <AdminCard>
        <h2 className="admin-section-title mb-4">Textos de la Sección "El Local" en Catriel</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <AdminField label="Etiqueta Superior (Eyebrow)">
            <input
              type="text"
              value={local.eyebrow}
              onChange={(e) => updateLocal({ eyebrow: e.target.value })}
              className="admin-input"
              placeholder="ej. El local"
            />
          </AdminField>

          <AdminField label="Título L1">
            <input
              type="text"
              value={local.title}
              onChange={(e) => updateLocal({ title: e.target.value })}
              className="admin-input"
              placeholder="ej. Vení, elegí"
            />
          </AdminField>

          <AdminField label="Título L2 (Resaltado en dorado)">
            <input
              type="text"
              value={local.titleHighlight}
              onChange={(e) => updateLocal({ titleHighlight: e.target.value })}
              className="admin-input"
              placeholder="ej. y quedate un rato."
            />
          </AdminField>
        </div>

        <div className="mt-3">
          <AdminField label="Descripción de la experiencia en el local">
            <textarea
              rows={2}
              value={local.description}
              onChange={(e) => updateLocal({ description: e.target.value })}
              className="admin-input resize-y"
              placeholder="Texto descriptivo sobre la visita al local físico..."
            />
          </AdminField>
        </div>
      </AdminCard>

      {/* Grid of Store Photos */}
      <AdminCard>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="admin-section-title">Fotos de la Galería del Local Físico</h2>
            <p className="text-xs text-[var(--dash-muted)] mt-0.5">
              Las 6 fotos que se exhiben al lado del mapa de Google Maps. Podés subir fotos de tu vidriera, termos, mates y salón.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {local.photos.map((photo, idx) => (
            <div
              key={idx}
              className="p-3 bg-[var(--dash-surface-2)] border border-[var(--dash-border)] rounded-xl space-y-3"
            >
              <div className="relative aspect-square rounded-lg overflow-hidden bg-black/30 border border-[var(--dash-border)] group">
                {photo.src ? (
                  <Image
                    src={photo.src}
                    alt={photo.alt || `Foto ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-[var(--dash-muted)]">
                    <ImageIcon size={32} className="opacity-30" />
                  </div>
                )}

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <AdminButton
                    variant="primary"
                    size="sm"
                    onClick={() => onTriggerUpload(`local.photos.${idx}`)}
                    disabled={uploadingTarget === `local.photos.${idx}`}
                  >
                    {uploadingTarget === `local.photos.${idx}` ? (
                      <Loader2 size={13} className="animate-spin mr-1" />
                    ) : (
                      <Upload size={13} className="mr-1" />
                    )}
                    Subir foto
                  </AdminButton>
                </div>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={photo.alt}
                  onChange={(e) => updatePhoto(idx, { alt: e.target.value })}
                  className="admin-input text-xs"
                  placeholder="Descripción de la foto..."
                />
                <input
                  type="text"
                  value={photo.src}
                  onChange={(e) => updatePhoto(idx, { src: e.target.value })}
                  className="admin-input text-xs font-mono text-[var(--dash-muted)]"
                  placeholder="/local/local-1.jpg"
                />
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}
