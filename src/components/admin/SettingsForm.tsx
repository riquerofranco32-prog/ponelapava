"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, MessageCircle, Store, Calendar, Plus, Trash2, Copy } from "lucide-react";
import { SiteSettings } from "@/lib/settings";
import {
  DAY_ORDER,
  DAY_LABELS,
  DEFAULT_OPENING_HOURS,
  DayKey,
  DaySchedule,
  OpeningHours,
  formatScheduleSummary,
} from "@/lib/hours";
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
  const [newClosedDate, setNewClosedDate] = useState("");
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

  function setDaySchedule(day: DayKey, updater: (prev: DaySchedule) => DaySchedule) {
    const current = settings?.openingHours || DEFAULT_OPENING_HOURS;
    const currentDay = current[day] || { closed: false, ranges: [{ open: "09:00", close: "19:00" }] };
    const nextDay = updater(currentDay);
    const nextHours: OpeningHours = { ...current, [day]: nextDay };
    update("openingHours", nextHours);

    // Sincronizar columnas fallback para compatibilidad
    const tue = nextHours.tue;
    if (!tue.closed && tue.ranges.length > 0) {
      update("hoursWeekday", tue.ranges.map((r) => `${r.open} – ${r.close}`).join(" y "));
    }
    const sat = nextHours.sat;
    if (!sat.closed && sat.ranges.length > 0) {
      update("hoursSaturday", sat.ranges.map((r) => `${r.open} – ${r.close}`).join(" y "));
    }
  }

  function copyDayToAllOpen(sourceDay: DayKey) {
    const current = settings?.openingHours || DEFAULT_OPENING_HOURS;
    const sourceRanges = current[sourceDay]?.ranges || [{ open: "09:00", close: "19:00" }];
    const nextHours: OpeningHours = { ...current };
    for (const day of DAY_ORDER) {
      if (!nextHours[day].closed) {
        nextHours[day] = {
          ...nextHours[day],
          ranges: sourceRanges.map((r) => ({ ...r })),
        };
      }
    }
    update("openingHours", nextHours);
    showToast(`Horario de ${DAY_LABELS[sourceDay]} copiado a los días abiertos`);
  }

  function addClosedDate() {
    if (!newClosedDate) return;
    const current = settings?.closedDates || [];
    if (current.includes(newClosedDate)) {
      showToast("La fecha ya está en la lista de cerradas");
      return;
    }
    const next = [...current, newClosedDate].sort();
    update("closedDates", next);
    setNewClosedDate("");
  }

  function removeClosedDate(dateStr: string) {
    const current = settings?.closedDates || [];
    update("closedDates", current.filter((d) => d !== dateStr));
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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

        {/* Editor de Horarios Semanales (7 días) */}
        <div style={{ borderTop: "1px solid var(--dash-border)", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Clock size={16} style={{ color: "var(--dash-accent)" }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>
              Días y horarios de atención al público
            </h3>
          </div>
          <p style={{ fontSize: 12, color: "var(--dash-muted)", marginBottom: 16, marginTop: -4 }}>
            Configurá qué días abre el local y los turnos de atención. Si atendés en horario cortado podés agregar una 2da franja por día.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {DAY_ORDER.map((day) => {
              const currentHours = settings.openingHours || DEFAULT_OPENING_HOURS;
              const sched = currentHours[day] || { closed: true, ranges: [] };

              return (
                <div
                  key={day}
                  style={{
                    padding: 12,
                    borderRadius: 8,
                    background: sched.closed ? "var(--dash-surface)" : "var(--dash-surface-2)",
                    border: "1px solid var(--dash-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, minWidth: 85, color: "var(--dash-text)" }}>
                        {DAY_LABELS[day]}
                      </span>
                      <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, cursor: "pointer", color: "var(--dash-text)" }}>
                        <input
                          type="checkbox"
                          checked={!sched.closed}
                          onChange={(e) => {
                            const isNowOpen = e.target.checked;
                            setDaySchedule(day, (prev) => ({
                              ...prev,
                              closed: !isNowOpen,
                              ranges: isNowOpen && prev.ranges.length === 0
                                ? [{ open: "09:00", close: "19:00" }]
                                : prev.ranges,
                            }));
                          }}
                        />
                        <span>{sched.closed ? "Cerrado" : "Abierto"}</span>
                      </label>
                    </div>

                    {!sched.closed && (
                      <button
                        type="button"
                        onClick={() => copyDayToAllOpen(day)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: 11,
                          color: "var(--dash-accent)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "2px 6px",
                          borderRadius: 4,
                        }}
                        title={`Copiar horario de ${DAY_LABELS[day]} a los demás días que estén abiertos`}
                      >
                        <Copy size={12} />
                        <span>Copiar a días abiertos</span>
                      </button>
                    )}
                  </div>

                  {!sched.closed && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
                      {sched.ranges.map((range, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 11, color: "var(--dash-muted)", minWidth: 50 }}>
                            {idx === 0 ? "Turno 1:" : "Turno 2:"}
                          </span>
                          <input
                            type="time"
                            value={range.open}
                            required
                            onChange={(e) => {
                              const newOpen = e.target.value;
                              setDaySchedule(day, (prev) => {
                                const ranges = [...prev.ranges];
                                ranges[idx] = { ...ranges[idx], open: newOpen };
                                return { ...prev, ranges };
                              });
                            }}
                            className="admin-input"
                            style={{ width: 110, padding: "4px 8px", fontSize: 12 }}
                          />
                          <span style={{ fontSize: 12, color: "var(--dash-muted)" }}>a</span>
                          <input
                            type="time"
                            value={range.close}
                            required
                            onChange={(e) => {
                              const newClose = e.target.value;
                              setDaySchedule(day, (prev) => {
                                const ranges = [...prev.ranges];
                                ranges[idx] = { ...ranges[idx], close: newClose };
                                return { ...prev, ranges };
                              });
                            }}
                            className="admin-input"
                            style={{ width: 110, padding: "4px 8px", fontSize: 12 }}
                          />

                          {idx === 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setDaySchedule(day, (prev) => ({
                                  ...prev,
                                  ranges: [prev.ranges[0]],
                                }));
                              }}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 4,
                                color: "var(--dash-danger, #ef4444)",
                                background: "none",
                                border: "none",
                                cursor: "pointer",
                                fontSize: 11,
                                padding: "2px 6px",
                              }}
                              title="Quitar 2do turno"
                            >
                              <Trash2 size={12} /> Quitar
                            </button>
                          )}
                        </div>
                      ))}

                      {sched.ranges.length === 1 && (
                        <div>
                          <button
                            type="button"
                            onClick={() => {
                              setDaySchedule(day, (prev) => ({
                                ...prev,
                                ranges: [...prev.ranges, { open: "17:00", close: "21:00" }],
                              }));
                            }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 4,
                              fontSize: 11,
                              color: "var(--dash-muted)",
                              background: "none",
                              border: "1px dashed var(--dash-border)",
                              borderRadius: 4,
                              padding: "3px 8px",
                              cursor: "pointer",
                            }}
                          >
                            <Plus size={12} /> Agregar 2da franja (horario cortado)
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Feriados y Fechas Excepcionales Cerradas */}
        <div style={{ borderTop: "1px solid var(--dash-border)", paddingTop: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <Calendar size={16} style={{ color: "var(--dash-accent)" }} />
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--dash-text)", margin: 0 }}>
              Feriados y vacaciones (fechas cerradas)
            </h3>
          </div>
          <p style={{ fontSize: 12, color: "var(--dash-muted)", marginBottom: 12 }}>
            Fechas específicas en las que el local permanecerá cerrado aunque el día de la semana sea habitualmente laborable.
          </p>

          <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
            <input
              type="date"
              value={newClosedDate}
              onChange={(e) => setNewClosedDate(e.target.value)}
              className="admin-input"
              style={{ width: 170, fontSize: 12 }}
            />
            <AdminButton
              type="button"
              variant="secondary"
              onClick={addClosedDate}
              disabled={!newClosedDate}
            >
              <Plus size={13} style={{ marginRight: 4 }} />
              Agregar fecha cerrada
            </AdminButton>
          </div>

          {(settings.closedDates && settings.closedDates.length > 0) ? (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {settings.closedDates.map((dateStr) => (
                <div
                  key={dateStr}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "4px 8px",
                    borderRadius: 6,
                    background: "var(--dash-surface-2)",
                    border: "1px solid var(--dash-border)",
                    fontSize: 12,
                    color: "var(--dash-text)",
                  }}
                >
                  <span>📅 {dateStr}</span>
                  <button
                    type="button"
                    onClick={() => removeClosedDate(dateStr)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--dash-muted)",
                      cursor: "pointer",
                      padding: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Eliminar fecha cerrada"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 12, color: "var(--dash-muted)", fontStyle: "italic", margin: 0 }}>
              No hay feriados ni fechas cerradas configuradas.
            </p>
          )}
        </div>

        <AdminField label="Medios de pago habilitados en la tienda">
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "var(--dash-text)" }}>
              <input
                type="checkbox"
                checked={settings.paymentMethods?.includes("transfer") ?? true}
                onChange={(e) => {
                  const current = settings.paymentMethods || ["transfer", "cash", "card"];
                  const next = e.target.checked
                    ? [...current, "transfer"]
                    : current.filter((m) => m !== "transfer");
                  update("paymentMethods", next as typeof settings.paymentMethods);
                }}
              />
              <span>💳 Transferencia bancaria</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "var(--dash-text)" }}>
              <input
                type="checkbox"
                checked={settings.paymentMethods?.includes("cash") ?? true}
                onChange={(e) => {
                  const current = settings.paymentMethods || ["transfer", "cash", "card"];
                  const next = e.target.checked
                    ? [...current, "cash"]
                    : current.filter((m) => m !== "cash");
                  update("paymentMethods", next as typeof settings.paymentMethods);
                }}
              />
              <span>💵 Efectivo en el local</span>
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: "var(--dash-text)" }}>
              <input
                type="checkbox"
                checked={settings.paymentMethods?.includes("card") ?? true}
                onChange={(e) => {
                  const current = settings.paymentMethods || ["transfer", "cash", "card"];
                  const next = e.target.checked
                    ? [...current, "card"]
                    : current.filter((m) => m !== "card");
                  update("paymentMethods", next as typeof settings.paymentMethods);
                }}
              />
              <span>💳 Mercado Pago (link de pago)</span>
            </label>
          </div>
        </AdminField>

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

        {/* Database Backup Tool */}
        <div
          style={{
            marginTop: 24,
            paddingTop: 20,
            borderTop: "1px solid var(--dash-border)",
          }}
        >
          <div style={{ marginBottom: 12 }}>
            <h3
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "var(--dash-text)",
                marginBottom: 4,
              }}
            >
              Copia de Seguridad (Backup)
            </h3>
            <p style={{ fontSize: 12, color: "var(--dash-muted)" }}>
              Descargá una copia de respaldo completa de la configuración de la tienda.
            </p>
          </div>
          <AdminButton
            type="button"
            variant="secondary"
            onClick={async () => {
              try {
                showToast("Generando backup completo...");
                const res = await fetch("/api/admin/backup");
                if (!res.ok) throw new Error("Error al exportar");
                const backupData = await res.json();
                const dataStr =
                  "data:text/json;charset=utf-8," +
                  encodeURIComponent(JSON.stringify(backupData, null, 2));
                const downloadAnchor = document.createElement("a");
                downloadAnchor.setAttribute("href", dataStr);
                downloadAnchor.setAttribute(
                  "download",
                  `backup-ponelapava-completo-${new Date().toISOString().slice(0, 10)}.json`,
                );
                document.body.appendChild(downloadAnchor);
                downloadAnchor.click();
                downloadAnchor.remove();
                showToast("Backup completo descargado con éxito");
              } catch {
                showToast("No se pudo generar el backup");
              }
            }}
          >
            Exportar Backup Completo (.JSON)
          </AdminButton>
        </div>
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
            {formatScheduleSummary(settings).filter((s) => !s.endsWith("Cerrado")).join(" · ") || "Cerrado temporalmente"}
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
