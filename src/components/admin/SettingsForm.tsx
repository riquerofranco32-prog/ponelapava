"use client";

import { useEffect, useState } from "react";
import { SiteSettings } from "@/lib/settings";
import { AdminField } from "@/components/admin/AdminField";
import { AdminButton } from "@/components/admin/AdminButton";
import { assertOk } from "@/lib/admin-fetch";

export default function SettingsForm() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

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
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      assertOk(res, "No se pudo guardar la configuración");
      setSettings(await res.json());
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
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
      <p style={{ fontSize: 14, color: "var(--dash-muted)" }}>
        Cargando configuración...
      </p>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
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
        {saved && (
          <span style={{ fontSize: 13, color: "var(--dash-success)" }}>
            Guardado ✓
          </span>
        )}
      </div>
      <p style={{ fontSize: 12, color: "var(--dash-muted)" }}>
        Los cambios se reflejan en el sitio público en hasta 60 segundos.
      </p>
    </form>
  );
}
