"use client";

import Image from "next/image";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { LandingContent } from "@/types/landing";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminField } from "@/components/admin/AdminField";

interface GallerySettingsSectionProps {
  content: LandingContent;
  onChange: (updated: LandingContent) => void;
  onTriggerUpload: (field: string) => void;
  uploadingTarget: string | null;
}

export function GallerySettingsSection({
  content,
  onChange,
  onTriggerUpload,
  uploadingTarget,
}: GallerySettingsSectionProps) {
  const { galleryPosts } = content;

  return (
    <div className="space-y-4">
      <div className="mb-2">
        <h2 className="admin-section-title mb-1">
          Fotos de la Grilla de Instagram & Local
        </h2>
        <p className="text-xs text-[var(--dash-muted)]">
          Estas fotos componen el mosaico visual del feed (@ponelapava_yerbas) en la página principal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {galleryPosts.map((post, idx) => (
          <AdminCard key={post.id || idx}>
            <div className="space-y-3">
              <span className="text-xs font-bold text-[var(--dash-accent)] block">
                Posición #{idx + 1} {idx === 0 && "(Principal)"}
              </span>

              <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-[var(--dash-surface-2)] border border-[var(--dash-border)]">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.alt || `Foto #${idx + 1}`}
                    fill
                    sizes="200px"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[var(--dash-muted)] gap-1">
                    <ImageIcon size={24} className="opacity-40" />
                    <span className="text-xs">Sin imagen</span>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 right-2 flex justify-center">
                  <button
                    type="button"
                    onClick={() => onTriggerUpload(`gallery.${idx}`)}
                    disabled={uploadingTarget === `gallery.${idx}`}
                    className="admin-btn admin-btn--primary admin-btn--sm text-xs py-1 px-2.5 shadow-md"
                  >
                    {uploadingTarget === `gallery.${idx}` ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Subiendo...</span>
                      </>
                    ) : (
                      <>
                        <Upload size={12} />
                        <span>Subir Foto</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <AdminField label="Descripción de la foto">
                <input
                  type="text"
                  value={post.alt}
                  onChange={(e) => {
                    const next = [...galleryPosts];
                    next[idx] = { ...next[idx], alt: e.target.value };
                    onChange({ ...content, galleryPosts: next });
                  }}
                  className="admin-input text-xs"
                  placeholder="Descripción"
                />
              </AdminField>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}

export default GallerySettingsSection;
