"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  Camera,
  Upload,
  Save,
  RotateCcw,
  ExternalLink,
  Layers,
  Megaphone,
  Grid,
  Check,
  Plus,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
} from "lucide-react";
import { LandingContent, LandingGalleryPost, LandingAnnouncementItem } from "@/types/landing";
import { DEFAULT_LANDING_CONTENT } from "@/lib/landing";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminField } from "@/components/admin/AdminField";
import { AdminToggle } from "@/components/admin/AdminToggle";
import { useAdminToast } from "@/components/admin/AdminToast";
import { assertOk } from "@/lib/admin-fetch";

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
      <div style={{ padding: "40px 0", textAlign: "center", color: "var(--dash-muted)" }}>
        <Loader2 size={28} className="animate-spin" style={{ margin: "0 auto 12px" }} />
        <p style={{ fontSize: 14 }}>Cargando editor de landing y fotos...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />

      {/* Top Header & Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div>
          <h1 className="admin-page-title" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={22} style={{ color: "var(--dash-accent)" }} />
            Personalizar Landing & Fotos
          </h1>
          <p style={{ fontSize: 13, color: "var(--dash-muted)", marginTop: 4 }}>
            Cambiá las fotos principales, textos del hero, banners de promociones y la galería de Instagram.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="admin-btn admin-btn--secondary"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}
          >
            <Eye size={14} /> Ver Tienda en Vivo
          </Link>

          <AdminButton
            variant="secondary"
            onClick={handleReset}
            disabled={saving}
          >
            <RotateCcw size={14} style={{ marginRight: 6 }} />
            Restablecer
          </AdminButton>

          <AdminButton
            variant="primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 size={14} className="animate-spin" style={{ marginRight: 6 }} />
                Guardando...
              </>
            ) : (
              <>
                <Save size={14} style={{ marginRight: 6 }} />
                Guardar Cambios
              </>
            )}
          </AdminButton>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 border-b border-[var(--dash-border)] scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("hero")}
          className={`admin-toolbar-pill${activeTab === "hero" ? " admin-toolbar-pill--active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", fontSize: 13, flexShrink: 0, whiteSpace: "nowrap" }}
        >
          <Layers size={15} />
          <span>Hero Principal</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("promos")}
          className={`admin-toolbar-pill${activeTab === "promos" ? " admin-toolbar-pill--active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", fontSize: 13, flexShrink: 0, whiteSpace: "nowrap" }}
        >
          <Megaphone size={15} />
          <span>Banners & Anuncios</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("gallery")}
          className={`admin-toolbar-pill${activeTab === "gallery" ? " admin-toolbar-pill--active" : ""}`}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", fontSize: 13, flexShrink: 0, whiteSpace: "nowrap" }}
        >
          <Grid size={15} />
          <span>Fotos de Instagram ({content.galleryPosts.length})</span>
        </button>
      </div>

      {/* TAB 1: HERO PRINCIPAL */}
      {activeTab === "hero" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {/* Text & CTAs configuration */}
          <AdminCard>
            <h2 className="admin-section-title" style={{ marginBottom: 14 }}>
              Textos y Titulares del Hero
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <AdminField label="Etiqueta Superior (Badge)">
                <input
                  type="text"
                  value={content.hero.badge}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, badge: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="ej. Poné La Pava · Tienda Matera"
                />
              </AdminField>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <AdminField label="Título L1">
                  <input
                    type="text"
                    value={content.hero.titleLine1}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, titleLine1: e.target.value },
                      })
                    }
                    className="admin-input"
                    placeholder="El ritual"
                  />
                </AdminField>
                <AdminField label="Título L2">
                  <input
                    type="text"
                    value={content.hero.titleLine2}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, titleLine2: e.target.value },
                      })
                    }
                    className="admin-input"
                    placeholder="del mate"
                  />
                </AdminField>
                <AdminField label="Título L3">
                  <input
                    type="text"
                    value={content.hero.titleLine3}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, titleLine3: e.target.value },
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
                  value={content.hero.subtitle}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, subtitle: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="Yerbas seleccionadas, mates artesanales y accesorios para acompañar cada ronda."
                />
              </AdminField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <AdminField label="Botón Principal">
                  <input
                    type="text"
                    value={content.hero.ctaPrimaryText}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, ctaPrimaryText: e.target.value },
                      })
                    }
                    className="admin-input"
                    placeholder="Explorar el catálogo"
                  />
                </AdminField>
                <AdminField label="Enlace Botón Principal">
                  <input
                    type="text"
                    value={content.hero.ctaPrimaryLink}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        hero: { ...content.hero, ctaPrimaryLink: e.target.value },
                      })
                    }
                    className="admin-input"
                    placeholder="/catalogo"
                  />
                </AdminField>
              </div>
            </div>
          </AdminCard>

          {/* Background Image / Video */}
          <AdminCard>
            <h2 className="admin-section-title" style={{ marginBottom: 14 }}>
              Foto de Fondo del Hero
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "16/9",
                  borderRadius: 10,
                  overflow: "hidden",
                  backgroundColor: "#2c221e",
                  border: "1px solid var(--dash-border)",
                }}
              >
                {content.hero.backgroundImage ? (
                  <Image
                    src={content.hero.backgroundImage}
                    alt="Foto de Fondo Hero"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "#fff" }}>
                    Sin imagen seleccionada
                  </div>
                )}

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundColor: "rgba(0,0,0,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => triggerUpload("hero.backgroundImage")}
                    disabled={uploadingTarget === "hero.backgroundImage"}
                    className="admin-btn admin-btn--primary"
                    style={{ fontSize: 12, padding: "8px 14px", display: "inline-flex", alignItems: "center", gap: 6 }}
                  >
                    {uploadingTarget === "hero.backgroundImage" ? (
                      <>
                        <Loader2 size={14} className="animate-spin" /> Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload size={14} /> Cambiar Foto de Fondo
                      </>
                    )}
                  </button>
                </div>
              </div>

              <AdminField label="O ingresar URL directa de imagen">
                <input
                  type="text"
                  value={content.hero.backgroundImage}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      hero: { ...content.hero, backgroundImage: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="/hero_background_1786545961305.png o URL"
                />
              </AdminField>

              {/* Quick Presets */}
              <div>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--dash-muted)", display: "block", marginBottom: 6 }}>
                  Fotos de muestra recomendadas:
                </span>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[
                    { label: "Mesa Matera", url: "/hero_background_1786545961305.png" },
                    { label: "Mates en Local", url: "/brand-gallery/post-1.jpg" },
                    { label: "Mates Imperiales", url: "/brand-gallery/post-7.jpg" },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() =>
                        setContent({
                          ...content,
                          hero: { ...content.hero, backgroundImage: preset.url },
                        })
                      }
                      className="admin-toolbar-pill"
                      style={{ fontSize: 11, padding: "3px 8px" }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* TAB 2: PROMOS Y ANUNCIOS */}
      {activeTab === "promos" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {/* Top Announcement Bar */}
          <AdminCard>
            <h2 className="admin-section-title" style={{ margin: 0 }}>
              Barra de Anuncios Superior (Rotativa)
            </h2>
            <p style={{ fontSize: 12, color: "var(--dash-muted)", marginBottom: 14 }}>
              Mensajes que rotan automáticamente en la parte superior de la tienda.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {content.announcements.map((ann, idx) => (
                <div
                  key={ann.id || idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: 10,
                    borderRadius: 8,
                    backgroundColor: "var(--dash-surface-2)",
                    border: "1px solid var(--dash-border)",
                  }}
                >
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                    <input
                      type="text"
                      value={ann.highlight}
                      onChange={(e) => {
                        const next = [...content.announcements];
                        next[idx] = { ...next[idx], highlight: e.target.value };
                        setContent({ ...content, announcements: next });
                      }}
                      className="admin-input"
                      placeholder="Texto destacado (ej. 10% OFF EXTRA)"
                      style={{ fontSize: 12, fontWeight: 700 }}
                    />
                    <input
                      type="text"
                      value={ann.text}
                      onChange={(e) => {
                        const next = [...content.announcements];
                        next[idx] = { ...next[idx], text: e.target.value };
                        setContent({ ...content, announcements: next });
                      }}
                      className="admin-input"
                      placeholder="Texto secundario"
                      style={{ fontSize: 12 }}
                    />
                  </div>

                  {content.announcements.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setContent({
                          ...content,
                          announcements: content.announcements.filter((_, i) => i !== idx),
                        });
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--dash-danger)",
                        cursor: "pointer",
                        padding: 6,
                      }}
                      title="Eliminar anuncio"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  setContent({
                    ...content,
                    announcements: [
                      ...content.announcements,
                      {
                        id: `ann-${Date.now()}`,
                        highlight: "Nueva Promo",
                        text: "envíos o descuentos especiales",
                      },
                    ],
                  });
                }}
                className="admin-btn admin-btn--secondary"
                style={{ fontSize: 12, marginTop: 4, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}
              >
                <Plus size={14} /> Agregar Anuncio
              </button>
            </div>
          </AdminCard>

          {/* Promo Section Configuration */}
          <AdminCard>
            <h2 className="admin-section-title" style={{ marginBottom: 14 }}>
              Banner de Promoción Destacada
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <AdminToggle
                label="Mostrar Banner de Promoción en la tienda"
                checked={content.promoBanner.active}
                onChange={(checked) =>
                  setContent({
                    ...content,
                    promoBanner: { ...content.promoBanner, active: checked },
                  })
                }
              />

              <AdminField label="Etiqueta / Badge">
                <input
                  type="text"
                  value={content.promoBanner.badge}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      promoBanner: { ...content.promoBanner, badge: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="PROMO EXCLUSIVA"
                />
              </AdminField>

              <AdminField label="Título de la Promo">
                <input
                  type="text"
                  value={content.promoBanner.title}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      promoBanner: { ...content.promoBanner, title: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="Armá tu Set Matero con 10% OFF"
                />
              </AdminField>

              <AdminField label="Descripción de la Oferta">
                <textarea
                  rows={2}
                  value={content.promoBanner.description}
                  onChange={(e) =>
                    setContent({
                      ...content,
                      promoBanner: { ...content.promoBanner, description: e.target.value },
                    })
                  }
                  className="admin-input"
                  placeholder="Elegí tu mate, bombilla y yerba favorita y llevátelos con descuento."
                />
              </AdminField>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <AdminField label="Texto del Botón">
                  <input
                    type="text"
                    value={content.promoBanner.buttonText}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        promoBanner: { ...content.promoBanner, buttonText: e.target.value },
                      })
                    }
                    className="admin-input"
                    placeholder="Armar mi Set"
                  />
                </AdminField>
                <AdminField label="Enlace del Botón">
                  <input
                    type="text"
                    value={content.promoBanner.buttonLink}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        promoBanner: { ...content.promoBanner, buttonLink: e.target.value },
                      })
                    }
                    className="admin-input"
                    placeholder="/#arma-tu-set"
                  />
                </AdminField>
              </div>

              {/* Promo Image */}
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--dash-text)", display: "block", marginBottom: 6 }}>
                  Foto de la Promoción
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      position: "relative",
                      width: 80,
                      height: 80,
                      borderRadius: 8,
                      overflow: "hidden",
                      backgroundColor: "var(--dash-surface-2)",
                      border: "1px solid var(--dash-border)",
                      flexShrink: 0,
                    }}
                  >
                    {content.promoBanner.image && (
                      <Image
                        src={content.promoBanner.image}
                        alt="Promo Image"
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <button
                      type="button"
                      onClick={() => triggerUpload("promoBanner.image")}
                      disabled={uploadingTarget === "promoBanner.image"}
                      className="admin-btn admin-btn--secondary"
                      style={{ fontSize: 12, padding: "6px 12px", display: "inline-flex", alignItems: "center", gap: 6 }}
                    >
                      {uploadingTarget === "promoBanner.image" ? (
                        <>
                          <Loader2 size={13} className="animate-spin" /> Subiendo...
                        </>
                      ) : (
                        <>
                          <Upload size={13} /> Cambiar Foto Promo
                        </>
                      )}
                    </button>
                    <input
                      type="text"
                      value={content.promoBanner.image}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          promoBanner: { ...content.promoBanner, image: e.target.value },
                        })
                      }
                      className="admin-input"
                      style={{ marginTop: 6, fontSize: 11 }}
                      placeholder="URL de imagen"
                    />
                  </div>
                </div>
              </div>
            </div>
          </AdminCard>
        </div>
      )}

      {/* TAB 3: GALERIA INSTAGRAM (@ponelapava) */}
      {activeTab === "gallery" && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <h2 className="admin-section-title" style={{ margin: 0 }}>
              Fotos de la Grilla de Instagram y Local
            </h2>
            <p style={{ fontSize: 13, color: "var(--dash-muted)", marginTop: 4 }}>
              Estas 5 fotos componen el mosaico visual del feed (@ponelapava_yerbas) en la página de inicio. Podés cambiar cualquiera de ellas con fotos reales de tus productos o del local en Catriel.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {content.galleryPosts.map((post, idx) => (
              <AdminCard key={post.id || idx}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "var(--dash-accent)" }}>
                      Posición #{idx + 1} {idx === 0 && "(Foto Principal Grande)"}
                    </span>
                  </div>

                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      aspectRatio: "1/1",
                      borderRadius: 8,
                      overflow: "hidden",
                      backgroundColor: "var(--dash-surface-2)",
                      border: "1px solid var(--dash-border)",
                    }}
                  >
                    {post.image ? (
                      <Image
                        src={post.image}
                        alt={post.alt || `Foto #${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--dash-muted)", fontSize: 12 }}>
                        Sin imagen
                      </div>
                    )}

                    <div
                      style={{
                        position: "absolute",
                        bottom: 6,
                        right: 6,
                        left: 6,
                        display: "flex",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => triggerUpload(`gallery.${idx}`)}
                        disabled={uploadingTarget === `gallery.${idx}`}
                        className="admin-btn admin-btn--primary"
                        style={{ fontSize: 11, padding: "5px 10px", display: "inline-flex", alignItems: "center", gap: 5, boxShadow: "0 2px 8px rgba(0,0,0,0.4)" }}
                      >
                        {uploadingTarget === `gallery.${idx}` ? (
                          <>
                            <Loader2 size={12} className="animate-spin" /> Subiendo...
                          </>
                        ) : (
                          <>
                            <Upload size={12} /> Subir Foto
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <AdminField label="Texto Alternativo / Descripción">
                    <input
                      type="text"
                      value={post.alt}
                      onChange={(e) => {
                        const next = [...content.galleryPosts];
                        next[idx] = { ...next[idx], alt: e.target.value };
                        setContent({ ...content, galleryPosts: next });
                      }}
                      className="admin-input"
                      placeholder="Descripción de la foto"
                      style={{ fontSize: 12 }}
                    />
                  </AdminField>
                </div>
              </AdminCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
