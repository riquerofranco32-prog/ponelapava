"use client";

import Image from "next/image";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { LandingContent } from "@/types/landing";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";

interface HeroSettingsSectionProps {
  content: LandingContent;
  onChange: (updated: LandingContent) => void;
  onTriggerUpload: (field: string) => void;
  uploadingTarget: string | null;
}

export function HeroSettingsSection({
  content,
  onChange,
  onTriggerUpload,
  uploadingTarget,
}: HeroSettingsSectionProps) {
  const { hero } = content;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column: Titles & CTAs */}
      <div className="lg:col-span-7 space-y-4">
        <AdminCard>
          <h2 className="admin-section-title mb-4">Textos y Titulares del Hero</h2>
          <div className="space-y-4">
            <AdminField label="Etiqueta Superior (Badge)">
              <input
                type="text"
                value={hero.badge}
                onChange={(e) =>
                  onChange({
                    ...content,
                    hero: { ...hero, badge: e.target.value },
                  })
                }
                className="admin-input"
                placeholder="ej. Poné La Pava · Tienda Matera"
              />
            </AdminField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <AdminField label="Título L1">
                <input
                  type="text"
                  value={hero.titleLine1}
                  onChange={(e) =>
                    onChange({
                      ...content,
                      hero: { ...hero, titleLine1: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="El ritual"
                />
              </AdminField>
              <AdminField label="Título L2">
                <input
                  type="text"
                  value={hero.titleLine2}
                  onChange={(e) =>
                    onChange({
                      ...content,
                      hero: { ...hero, titleLine2: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="del mate"
                />
              </AdminField>
              <AdminField label="Título L3">
                <input
                  type="text"
                  value={hero.titleLine3}
                  onChange={(e) =>
                    onChange({
                      ...content,
                      hero: { ...hero, titleLine3: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="es tuyo."
                />
              </AdminField>
            </div>

            <AdminField label="Bajada / Subtítulo">
              <textarea
                rows={3}
                value={hero.subtitle}
                onChange={(e) =>
                  onChange({
                    ...content,
                    hero: { ...hero, subtitle: e.target.value },
                  })
                }
                className="admin-input text-xs"
                placeholder="Yerbas seleccionadas, mates artesanales y accesorios..."
              />
            </AdminField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <AdminField label="Botón Principal">
                <input
                  type="text"
                  value={hero.ctaPrimaryText}
                  onChange={(e) =>
                    onChange({
                      ...content,
                      hero: { ...hero, ctaPrimaryText: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="Explorar el catálogo"
                />
              </AdminField>
              <AdminField label="Enlace Botón">
                <input
                  type="text"
                  value={hero.ctaPrimaryLink}
                  onChange={(e) =>
                    onChange({
                      ...content,
                      hero: { ...hero, ctaPrimaryLink: e.target.value },
                    })
                  }
                  className="admin-input font-mono text-xs"
                  placeholder="/catalogo"
                />
              </AdminField>
            </div>
          </div>
        </AdminCard>
      </div>

      {/* Right Column: Hero Background Image */}
      <div className="lg:col-span-5 space-y-4">
        <AdminCard>
          <h2 className="admin-section-title mb-4">Foto de Portada del Hero</h2>
          <div className="space-y-3">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
              {hero.backgroundImage ? (
                <Image
                  src={hero.backgroundImage}
                  alt="Foto Hero"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[var(--dash-muted)] gap-2">
                  <ImageIcon size={32} className="opacity-40" />
                  <span className="text-xs">Sin imagen seleccionada</span>
                </div>
              )}

              <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-3 opacity-0 hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => onTriggerUpload("hero.backgroundImage")}
                  disabled={uploadingTarget === "hero.backgroundImage"}
                  className="admin-btn admin-btn--primary admin-btn--sm"
                >
                  {uploadingTarget === "hero.backgroundImage" ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <Upload size={13} />
                      <span>Cambiar Foto</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <AdminField label="URL directa de imagen">
              <input
                type="text"
                value={hero.backgroundImage}
                onChange={(e) =>
                  onChange({
                    ...content,
                    hero: { ...hero, backgroundImage: e.target.value },
                  })
                }
                className="admin-input text-xs"
                placeholder="/hero_background.png o URL"
              />
            </AdminField>

            <div className="pt-2">
              <span className="text-xs text-[var(--dash-muted)] block mb-1.5 font-medium">
                Imágenes de muestra:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "Mesa Matera", url: "/hero_background_1786545961305.png" },
                  { label: "Mates en Local", url: "/brand-gallery/post-1.jpg" },
                  { label: "Mates Imperiales", url: "/brand-gallery/post-7.jpg" },
                ].map((preset) => (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...content,
                        hero: { ...hero, backgroundImage: preset.url },
                      })
                    }
                    className="admin-toolbar-pill text-xs"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

export default HeroSettingsSection;
