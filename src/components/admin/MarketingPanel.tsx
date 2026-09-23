"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  Save,
  RotateCcw,
  Layers,
  Megaphone,
  Grid,
  Loader2,
  Eye,
} from "lucide-react";
import { LandingContent } from "@/types/landing";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing";
import { AdminButton } from "@/components/admin/AdminButton";
import { useAdminToast } from "@/components/admin/AdminToast";
import { Tabs } from "@/components/admin/ui/Tabs";
import { assertOk } from "@/lib/admin-fetch";
import { HeroSettingsSection } from "./marketing/HeroSettingsSection";
import { PromosSettingsSection } from "./marketing/PromosSettingsSection";
import { GallerySettingsSection } from "./marketing/GallerySettingsSection";

type MarketingTab = "hero" | "promos" | "gallery";

export default function MarketingPanel() {
  const [content, setContent] = useState<LandingContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<MarketingTab>("hero");
  const [uploadingTarget, setUploadingTarget] = useState<string | null>(null);
  const showToast = useAdminToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUploadField, setCurrentUploadField] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/landing")
      .then((res) => {
        assertOk(res, "No se pudo cargar el contenido de la landing");
        return res.json();
      })
      .then((data: LandingContent) => {
        setContent(data);
      })
      .catch((err) => {
        showToast(err instanceof Error ? err.message : "Error al cargar", "error");
        setContent(DEFAULT_LANDING_CONTENT);
      })
      .finally(() => setLoading(false));
  }, [showToast]);

  async function handleSave() {
    if (!content) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/landing", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      assertOk(res, "No se pudo guardar la configuración");
      const updated = await res.json();
      setContent(updated);
      showToast("¡Cambios de la landing guardados con éxito!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    if (confirm("¿Estás seguro de restablecer los textos y fotos a los valores predeterminados?")) {
      setContent(DEFAULT_LANDING_CONTENT);
      showToast("Contenido restablecido. Guardá los cambios para confirmar.");
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !currentUploadField || !content) return;

    setUploadingTarget(currentUploadField);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/products/upload", {
        method: "POST",
        body: formData,
      });
      assertOk(res, "Error al subir la imagen");
      const { url } = await res.json();

      if (currentUploadField === "hero.backgroundImage") {
        setContent({
          ...content,
          hero: { ...content.hero, backgroundImage: url },
        });
      } else if (currentUploadField === "promoBanner.image") {
        setContent({
          ...content,
          promoBanner: { ...content.promoBanner, image: url },
        });
      } else if (currentUploadField.startsWith("gallery.")) {
        const index = parseInt(currentUploadField.split(".")[1], 10);
        const newPosts = [...content.galleryPosts];
        if (newPosts[index]) {
          newPosts[index] = { ...newPosts[index], image: url };
          setContent({ ...content, galleryPosts: newPosts });
        }
      }

      showToast("Foto subida correctamente", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Error al subir foto", "error");
    } finally {
      setUploadingTarget(null);
      setCurrentUploadField(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function triggerUpload(targetField: string) {
    setCurrentUploadField(targetField);
    fileInputRef.current?.click();
  }

  if (loading || !content) {
    return (
      <div className="py-20 text-center text-[var(--dash-muted)] space-y-3">
        <Loader2 size={32} className="animate-spin mx-auto text-[var(--dash-accent)]" />
        <p className="text-sm">Cargando editor de landing y fotos...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mb-12">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Header & Main Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--dash-text)] flex items-center gap-2">
            <Sparkles size={22} className="text-[var(--dash-accent)]" />
            <span>Personalizar Landing & Fotos</span>
          </h1>
          <p className="text-xs text-[var(--dash-muted)] mt-1">
            Fotos principales, textos del hero, banners de promociones y la galería de Instagram.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--secondary admin-btn--sm"
          >
            <Eye size={14} />
            <span>Ver Tienda</span>
          </Link>

          <AdminButton
            variant="secondary"
            size="sm"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw size={14} />
            <span>Restablecer</span>
          </AdminButton>

          <AdminButton
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            loading={saving}
          >
            <Save size={14} />
            <span>Guardar Cambios</span>
          </AdminButton>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs
        tabs={[
          { id: "hero", label: "Hero Principal", icon: <Layers size={14} /> },
          { id: "promos", label: "Banners & Anuncios", icon: <Megaphone size={14} /> },
          {
            id: "gallery",
            label: "Fotos de Instagram",
            count: content.galleryPosts.length,
            icon: <Grid size={14} />,
          },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as MarketingTab)}
      />

      {/* Active Tab View */}
      {activeTab === "hero" && (
        <HeroSettingsSection
          content={content}
          onChange={setContent}
          onTriggerUpload={triggerUpload}
          uploadingTarget={uploadingTarget}
        />
      )}

      {activeTab === "promos" && (
        <PromosSettingsSection
          content={content}
          onChange={setContent}
          onTriggerUpload={triggerUpload}
          uploadingTarget={uploadingTarget}
        />
      )}

      {activeTab === "gallery" && (
        <GallerySettingsSection
          content={content}
          onChange={setContent}
          onTriggerUpload={triggerUpload}
          uploadingTarget={uploadingTarget}
        />
      )}
    </div>
  );
}
