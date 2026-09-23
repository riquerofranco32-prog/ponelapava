"use client";

import { useState, useEffect } from "react";
import { Clock, MapPin, MessageCircle, Store, Calendar, Plus, Trash2, Copy, CreditCard, Banknote } from "lucide-react";
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
      <div className="flex flex-col gap-3 max-w-[520px]">
        {[56, 56, 56, 56, 56, 100].map((height, i) => (
          <div
            key={i}
            className="admin-skeleton-row rounded-[var(--dash-radius-md)] bg-[var(--dash-surface-2)]"
            style={{ height }}
          />
        ))}
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="bg-[var(--dash-danger-bg)] border border-[var(--dash-danger-border)] rounded-[var(--dash-radius-md)] p-3 text-sm text-[var(--dash-danger)]">
        {error ?? "No se pudo cargar la configuración"}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-6 items-start">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[var(--dash-radius-lg)] p-5 flex-[1_1_420px] max-w-[520px]"
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
        <div className="border-t border-[var(--dash-border)] pt-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} className="text-[var(--dash-accent)]" />
            <h3 className="text-sm font-bold text-[var(--dash-text)] m-0">
              Días y horarios de atención al público
            </h3>
          </div>
          <p className="text-xs text-[var(--dash-muted)] mb-4 -mt-1">
            Configurá qué días abre el local y los turnos de atención. Si atendés en horario cortado podés agregar una 2da franja por día.
          </p>

          <div className="flex flex-col gap-2.5">
            {DAY_ORDER.map((day) => {
              const currentHours = settings.openingHours || DEFAULT_OPENING_HOURS;
              const sched = currentHours[day] || { closed: true, ranges: [] };

              return (
                <div
                  key={day}
                  className={`p-3 rounded-[var(--dash-radius-md)] border border-[var(--dash-border)] flex flex-col gap-2 ${
                    sched.closed ? "bg-[var(--dash-surface)]" : "bg-[var(--dash-surface-2)]"
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold min-w-[85px] text-[var(--dash-text)]">
                        {DAY_LABELS[day]}
                      </span>
                      <label className="inline-flex items-center gap-1.5 text-xs cursor-pointer text-[var(--dash-text)]">
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
                        className="inline-flex items-center gap-1 text-xs text-[var(--dash-accent)] bg-transparent border-none cursor-pointer py-0.5 px-1.5 rounded hover:bg-[var(--dash-surface-3)] transition-colors"
                        title={`Copiar horario de ${DAY_LABELS[day]} a los demás días que estén abiertos`}
                      >
                        <Copy size={12} />
                        <span>Copiar a días abiertos</span>
                      </button>
                    )}
                  </div>

                  {!sched.closed && (
                    <div className="flex flex-col gap-2 mt-1">
                      {sched.ranges.map((range, idx) => (
                        <div key={idx} className="flex items-center gap-2 flex-wrap text-xs">
                          <span className="text-xs text-[var(--dash-muted)] min-w-[50px]">
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
                            className="admin-input !w-[110px] !py-1 !px-2 !text-xs"
                          />
                          <span className="text-xs text-[var(--dash-muted)]">a</span>
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
                            className="admin-input !w-[110px] !py-1 !px-2 !text-xs"
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
                              className="inline-flex items-center gap-1 text-[var(--dash-danger)] bg-transparent border-none cursor-pointer text-xs py-0.5 px-1.5"
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
                            className="inline-flex items-center gap-1 text-xs text-[var(--dash-muted)] bg-transparent border border-dashed border-[var(--dash-border)] rounded-[var(--dash-radius-sm)] py-1 px-2 cursor-pointer hover:text-[var(--dash-text)] transition-colors"
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
        <div className="border-t border-[var(--dash-border)] pt-4">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-[var(--dash-accent)]" />
            <h3 className="text-sm font-bold text-[var(--dash-text)] m-0">
              Feriados y vacaciones (fechas cerradas)
            </h3>
          </div>
          <p className="text-xs text-[var(--dash-muted)] mb-3">
            Fechas específicas en las que el local permanecerá cerrado aunque el día de la semana sea habitualmente laborable.
          </p>

          <div className="flex gap-2 items-center mb-3 flex-wrap">
            <input
              type="date"
              value={newClosedDate}
              onChange={(e) => setNewClosedDate(e.target.value)}
              className="admin-input !w-[170px] !text-xs"
            />
            <AdminButton
              type="button"
              variant="secondary"
              onClick={addClosedDate}
              disabled={!newClosedDate}
            >
              <Plus size={13} className="mr-1" />
              Agregar fecha cerrada
            </AdminButton>
          </div>

          {(settings.closedDates && settings.closedDates.length > 0) ? (
            <div className="flex flex-wrap gap-2">
              {settings.closedDates.map((dateStr) => (
                <div
                  key={dateStr}
                  className="inline-flex items-center gap-1.5 py-1 px-2 rounded-[var(--dash-radius-sm)] bg-[var(--dash-surface-2)] border border-[var(--dash-border)] text-xs text-[var(--dash-text)]"
                >
                  <Calendar size={12} className="text-[var(--dash-accent)] shrink-0" />
                  <span>{dateStr}</span>
                  <button
                    type="button"
                    onClick={() => removeClosedDate(dateStr)}
                    className="bg-transparent border-none text-[var(--dash-muted)] hover:text-[var(--dash-danger)] cursor-pointer p-0.5 flex items-center transition-colors"
                    title="Eliminar fecha cerrada"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[var(--dash-muted)] italic m-0">
              No hay feriados ni fechas cerradas configuradas.
            </p>
          )}
        </div>

        <AdminField label="Medios de pago habilitados en la tienda">
          <div className="flex flex-col gap-2.5 mt-1">
            <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer text-[var(--dash-text)]">
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
              <CreditCard size={14} className="text-[var(--dash-accent)]" />
              <span>Transferencia bancaria</span>
            </label>
            <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer text-[var(--dash-text)]">
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
              <Banknote size={14} className="text-[var(--dash-accent)]" />
              <span>Efectivo en el local</span>
            </label>
            <label className="flex items-center gap-2 text-xs sm:text-sm cursor-pointer text-[var(--dash-text)]">
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
              <CreditCard size={14} className="text-[var(--dash-accent)]" />
              <span>Mercado Pago (link de pago)</span>
            </label>
          </div>
        </AdminField>

        {error && (
          <p className="text-xs text-[var(--dash-danger)]">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <AdminButton type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </AdminButton>
        </div>
        <p className="text-xs text-[var(--dash-muted)]">
          Los cambios se reflejan en el sitio público en hasta 60 segundos.
        </p>

        {/* Database Backup Tool */}
        <div className="mt-6 pt-5 border-t border-[var(--dash-border)]">
          <div className="mb-3">
            <h3 className="text-sm font-bold text-[var(--dash-text)] mb-1">
              Copia de Seguridad (Backup)
            </h3>
            <p className="text-xs text-[var(--dash-muted)]">
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

      <AdminCard className="flex-[1_1_280px] max-w-[340px] h-fit">
        <p className="text-xs font-bold uppercase tracking-wider text-[var(--dash-muted)] mb-4">
          Vista previa
        </p>
        <div className="flex items-center gap-2.5 mb-4">
          <span className="flex items-center justify-center w-9 h-9 rounded-[var(--dash-radius-md)] bg-[var(--dash-accent-subtle)] text-[var(--dash-accent)] shrink-0">
            <Store size={16} />
          </span>
          <span className="font-playfair text-lg font-bold text-[var(--dash-text)]">
            {settings.businessName || "—"}
          </span>
        </div>
        <div className="flex flex-col gap-3 text-xs sm:text-sm">
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
        <p className="text-xs text-[var(--dash-muted)] mt-4 pt-4 border-t border-[var(--dash-border)]">
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
    <div className="flex items-start gap-2.5">
      <span className="text-[var(--dash-accent)] shrink-0 mt-0.5">
        <Icon size={14} />
      </span>
      <span className="text-[var(--dash-text)] leading-relaxed text-xs sm:text-sm">
        {children}
      </span>
    </div>
  );
}
