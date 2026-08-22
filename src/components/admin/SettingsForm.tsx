"use client";

import { useEffect, useState } from "react";
import { Clock, MapPin, MessageCircle, Store } from "lucide-react";
import { SiteSettings } from "@/lib/settings";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";
import { AdminCard } from "@/components/admin/AdminCard";
import { useAdminToast } from "@/components/admin/AdminToast";
import { assertOk } from "@/lib/admin-fetch";

export default function SettingsForm() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const showToast = useAdminToast();

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => {
        assertOk(res, "No se pudo cargar la configuración");
        return res.json();
      })
      .then(setSettings)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      assertOk(res, "No se pudo guardar la configuración");
      setSettings(await res.json());
      showToast("Configuración guardada");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  function update<K extends keyof SiteSettings>(
    key: K,
    value: SiteSettings[K],
  ) {
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          maxWidth: 520,
        }}
      >
        {[56, 56, 56, 56, 56, 100].map((height, i) => (
          <div
            key={i}
            className="admin-skeleton-row"
            style={{
              height,
              borderRadius: 8,
              background: "var(--dash-surface-2)",
            }}
          />
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <div
        style={{
          background: "var(--dash-danger-bg)",
          border: "1px solid var(--dash-danger-border)",
          borderRadius: 8,
          padding: "12px 16px",
          fontSize: 14,
          color: "var(--dash-danger)",
        }}
      >
        {error ?? "No se pudo cargar la configuración"}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 24 }}>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          background: "var(--dash-surface)",
          border: "1px solid var(--dash-border)",
          borderRadius: 12,
          padding: 20,
          flex: "1 1 420px",
          maxWidth: 520,
        }}
      >
        <AdminField label="Nombre del negocio">
          <input
            required
            value={settings.businessName}
            onChange={(e) => update("businessName", e.target.value)}
            className="admin-input"
          />
        </AdminField>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <AdminField label="WhatsApp (solo dígitos, con código de país)">
            <input
              required
              value={settings.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              placeholder="5492994650177"
              className="admin-input"
            />
          </AdminField>
          <AdminField label="WhatsApp (texto a mostrar)">
            <input
              required
              value={settings.whatsappDisplay}
              onChange={(e) => update("whatsappDisplay", e.target.value)}
              placeholder="+54 9 2994 65-0177"
              className="admin-input"
            />
          </AdminField>
        </div>

        <AdminField label="Dirección">
          <input
            required
            value={settings.addressLine}
            onChange={(e) => update("addressLine", e.target.value)}
            className="admin-input"
          />
        </AdminField>

        <AdminField label="Ciudad">
          <input
            required
            value={settings.addressCity}
            onChange={(e) => update("addressCity", e.target.value)}
            className="admin-input"
          />
        </AdminField>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <AdminField label="Horario Lun–Vie">
            <input
              required
              value={settings.hoursWeekday}
              onChange={(e) => update("hoursWeekday", e.target.value)}
              placeholder="9:00 – 19:00"
              className="admin-input"
            />
          </AdminField>
          <AdminField label="Horario Sábado">
            <input
              required
              value={settings.hoursSaturday}
              onChange={(e) => update("hoursSaturday", e.target.value)}
              placeholder="9:00 – 14:00"
              className="admin-input"
            />
          </AdminField>
        </div>

        {error && (
          <p style={{ fontSize: 13, color: "var(--dash-danger)" }}>{error}</p>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <AdminButton type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </AdminButton>
        </div>
        <p style={{ fontSize: 12, color: "var(--dash-muted)" }}>
          Los cambios se reflejan en el sitio público en hasta 60 segundos.
        </p>
      </form>

      <AdminCard
        style={{ flex: "1 1 280px", maxWidth: 340, height: "fit-content" }}
      >
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--dash-muted)",
            marginBottom: 16,
          }}
        >
          Vista previa
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 16,
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(199,166,122,0.12)",
              color: "var(--dash-accent)",
              flexShrink: 0,
            }}
          >
            <Store size={16} />
          </span>
          <span
            style={{
              fontFamily: "var(--font-playfair), Georgia, serif",
              fontSize: 17,
              fontWeight: 700,
              color: "var(--dash-text)",
            }}
          >
            {settings.businessName || "—"}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            fontSize: 13,
          }}
        >
          <PreviewRow icon={MapPin}>
            {settings.addressLine || "—"}
            {settings.addressCity && `, ${settings.addressCity}`}
          </PreviewRow>
          <PreviewRow icon={MessageCircle}>
            {settings.whatsappDisplay || "—"}
          </PreviewRow>
          <PreviewRow icon={Clock}>
            Lun–Vie {settings.hoursWeekday || "—"} · Sáb{" "}
            {settings.hoursSaturday || "—"}
          </PreviewRow>
        </div>
        <p
          style={{
            fontSize: 11,
            color: "var(--dash-muted)",
            marginTop: 16,
            paddingTop: 16,
            borderTop: "1px solid var(--dash-border)",
          }}
        >
          Así aparece este contacto en el pie de página del sitio.
        </p>
      </AdminCard>
    </div>
  );
}

function PreviewRow({
  icon: Icon,
  children,
}: {
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
      <span
        style={{ color: "var(--dash-accent)", flexShrink: 0, marginTop: 1 }}
      >
        <Icon size={14} />
      </span>
      <span style={{ color: "var(--dash-text)", lineHeight: 1.5 }}>
        {children}
      </span>
    </div>
  );
}
