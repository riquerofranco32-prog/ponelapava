"use client";

import Image from "next/image";
import { Upload, Loader2, Plus, Trash2 } from "lucide-react";
import { LandingContent } from "@/types/landing";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";
import { AdminToggle } from "@/components/admin/AdminToggle";

interface PromosSettingsSectionProps {
  content: LandingContent;
  onChange: (updated: LandingContent) => void;
  onTriggerUpload: (field: string) => void;
  uploadingTarget: string | null;
}

export function PromosSettingsSection({
  content,
  onChange,
  onTriggerUpload,
  uploadingTarget,
}: PromosSettingsSectionProps) {
  const { promoBanner, announcements } = content;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Top Rotating Announcements */}
      <div className="lg:col-span-6 space-y-4">
        <AdminCard>
          <div className="mb-4">
            <h2 className="admin-section-title mb-1">
              Barra de Anuncios Superior (Rotativa)
            </h2>
            <p className="text-xs text-[var(--dash-muted)]">
              Mensajes breves que rotan automáticamente arriba de la tienda.
            </p>
          </div>

          <div className="space-y-3">
            {announcements.map((ann, idx) => (
              <div
                key={ann.id || idx}
                className="p-3 rounded-lg bg-[var(--dash-surface-2)] border border-[var(--dash-border)] flex items-center gap-3"
              >
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={ann.highlight}
                    onChange={(e) => {
                      const next = [...announcements];
                      next[idx] = { ...next[idx], highlight: e.target.value };
                      onChange({ ...content, announcements: next });
                    }}
                    className="admin-input text-xs font-bold"
                    placeholder="Texto destacado (ej: ENVÍO GRATIS)"
                  />
                  <input
                    type="text"
                    value={ann.text}
                    onChange={(e) => {
                      const next = [...announcements];
                      next[idx] = { ...next[idx], text: e.target.value };
                      onChange({ ...content, announcements: next });
                    }}
                    className="admin-input text-xs"
                    placeholder="Texto complementario"
                  />
                </div>

                {announcements.length > 1 && (
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...content,
                        announcements: announcements.filter((_, i) => i !== idx),
                      });
                    }}
                    className="admin-icon-btn admin-icon-btn--danger"
                    title="Eliminar anuncio"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              onClick={() => {
                onChange({
                  ...content,
                  announcements: [
                    ...announcements,
                    {
                      id: `ann-${Date.now()}`,
                      highlight: "Nueva Promo",
                      text: "envíos o novedades especiales",
                    },
                  ],
                });
              }}
              className="admin-btn admin-btn--secondary admin-btn--sm w-full"
            >
              <Plus size={14} />
              <span>Agregar Anuncio</span>
            </button>
          </div>
        </AdminCard>
      </div>

      {/* Featured Promo Banner */}
      <div className="lg:col-span-6 space-y-4">
        <AdminCard>
          <h2 className="admin-section-title mb-4">
            Banner de Promoción Destacada
          </h2>
          <div className="space-y-4">
            <AdminToggle
              label="Mostrar Banner de Promoción en la tienda"
              checked={promoBanner.active}
              onChange={(checked) =>
                onChange({
                  ...content,
                  promoBanner: { ...promoBanner, active: checked },
                })
              }
            />

            <AdminField label="Etiqueta / Badge">
              <input
                type="text"
                value={promoBanner.badge}
                onChange={(e) =>
                  onChange({
                    ...content,
                    promoBanner: { ...promoBanner, badge: e.target.value },
                  })
                }
                className="admin-input"
                placeholder="PROMO EXCLUSIVA"
              />
            </AdminField>

            <AdminField label="Título de la Promo">
              <input
                type="text"
                value={promoBanner.title}
                onChange={(e) =>
                  onChange({
                    ...content,
                    promoBanner: { ...promoBanner, title: e.target.value },
                  })
                }
                className="admin-input"
                placeholder="Armá tu Set Matero personalizado"
              />
            </AdminField>

            <AdminField label="Descripción de la Oferta">
              <textarea
                rows={2}
                value={promoBanner.description}
                onChange={(e) =>
                  onChange({
                    ...content,
                    promoBanner: { ...promoBanner, description: e.target.value },
                  })
                }
                className="admin-input text-xs"
                placeholder="Elegí tu mate, bombilla y yerba favorita..."
              />
            </AdminField>

            <div className="grid grid-cols-2 gap-3">
              <AdminField label="Texto del Botón">
                <input
                  type="text"
                  value={promoBanner.buttonText}
                  onChange={(e) =>
                    onChange({
                      ...content,
                      promoBanner: { ...promoBanner, buttonText: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="Armar mi Set"
                />
              </AdminField>
              <AdminField label="Enlace del Botón">
                <input
                  type="text"
                  value={promoBanner.buttonLink}
                  onChange={(e) =>
                    onChange({
                      ...content,
                      promoBanner: { ...promoBanner, buttonLink: e.target.value },
                    })
                  }
                  className="admin-input font-mono text-xs"
                  placeholder="/#arma-tu-set"
                />
              </AdminField>
            </div>

            {/* Promo Photo */}
            <div className="pt-2 border-t border-[var(--dash-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--dash-muted)] block mb-2">
                Foto de la Promoción
              </span>
              <div className="flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-[var(--dash-surface-2)] border border-[var(--dash-border)] shrink-0">
                  {promoBanner.image && (
                    <Image
                      src={promoBanner.image}
                      alt="Promo Image"
                      fill
                      className="object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <button
                    type="button"
                    onClick={() => onTriggerUpload("promoBanner.image")}
                    disabled={uploadingTarget === "promoBanner.image"}
                    className="admin-btn admin-btn--secondary admin-btn--sm"
                  >
                    {uploadingTarget === "promoBanner.image" ? (
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
                  <input
                    type="text"
                    value={promoBanner.image}
                    onChange={(e) =>
                      onChange({
                        ...content,
                        promoBanner: { ...promoBanner, image: e.target.value },
                      })
                    }
                    className="admin-input text-xs"
                    placeholder="URL de imagen"
                  />
                </div>
              </div>
            </div>
          </div>
        </AdminCard>
      </div>
    </div>
  );
}

export default PromosSettingsSection;
