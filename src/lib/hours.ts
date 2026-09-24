export const STORE_TIMEZONE = "America/Argentina/Buenos_Aires";
// ponytail: Argentina has no DST since 2009; switch to Intl offset lookup if that changes.
export const STORE_UTC_OFFSET = "-03:00";

// "YYYY-MM-DD" of an instant in store-local time (not the UTC date of toISOString).
export function storeDateKey(date: Date | string = new Date()): string {
  return getStoreTimeParts(typeof date === "string" ? new Date(date) : date).dateStr;
}

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface TimeRange {
  open: string;  // "HH:MM", e.g. "09:00"
  close: string; // "HH:MM", e.g. "13:00"
}

export interface DaySchedule {
  closed: boolean;
  ranges: TimeRange[];
}

export type OpeningHours = Record<DayKey, DaySchedule>;

export const DAY_ORDER: DayKey[] = [
  "mon",
  "tue",
  "wed",
  "thu",
  "fri",
  "sat",
  "sun",
];

export const DAY_NAMES: Record<DayKey, string> = {
  mon: "lunes",
  tue: "martes",
  wed: "miércoles",
  thu: "jueves",
  fri: "viernes",
  sat: "sábado",
  sun: "domingo",
};

export const DAY_LABELS: Record<DayKey, string> = {
  mon: "Lunes",
  tue: "Martes",
  wed: "Miércoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sábado",
  sun: "Domingo",
};

export const SCHEMA_DAYS: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export const DEFAULT_OPENING_HOURS: OpeningHours = {
  mon: { closed: true, ranges: [] },
  tue: { closed: false, ranges: [{ open: "09:00", close: "19:00" }] },
  wed: { closed: false, ranges: [{ open: "09:00", close: "19:00" }] },
  thu: { closed: false, ranges: [{ open: "09:00", close: "19:00" }] },
  fri: { closed: false, ranges: [{ open: "09:00", close: "19:00" }] },
  sat: { closed: false, ranges: [{ open: "09:00", close: "14:00" }] },
  sun: { closed: true, ranges: [] },
};

export function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

// Extrae componentes de fecha y hora en la zona horaria oficial del local
export function getStoreTimeParts(now = new Date()): {
  year: number;
  month: number;
  day: number;
  dateStr: string; // "YYYY-MM-DD"
  weekdayKey: DayKey;
  minutesNow: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  const year = Number(get("year"));
  const month = Number(get("month"));
  const day = Number(get("day"));
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));
  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const shortW = get("weekday");
  const map: Record<string, DayKey> = {
    Mon: "mon",
    Tue: "tue",
    Wed: "wed",
    Thu: "thu",
    Fri: "fri",
    Sat: "sat",
    Sun: "sun",
  };
  const weekdayKey = map[shortW] ?? "mon";
  const minutesNow = hour * 60 + minute;

  return { year, month, day, dateStr, weekdayKey, minutesNow };
}

export function normalizeOpeningHours(
  input?: unknown,
  legacyWeekday?: string,
  legacySaturday?: string,
): OpeningHours {
  if (input && typeof input === "object") {
    const raw = input as Record<string, unknown>;
    const normalized = {} as OpeningHours;
    let hasAnyValid = false;

    for (const day of DAY_ORDER) {
      const schedule = raw[day] as { closed?: boolean; ranges?: TimeRange[] } | undefined;
      if (schedule && typeof schedule === "object") {
        const closed = Boolean(schedule.closed);
        const ranges = Array.isArray(schedule.ranges)
          ? schedule.ranges
              .filter((r) => r && typeof r.open === "string" && typeof r.close === "string")
              .map((r) => ({ open: r.open.trim(), close: r.close.trim() }))
          : [];
        normalized[day] = { closed, ranges };
        hasAnyValid = true;
      } else {
        normalized[day] = { ...DEFAULT_OPENING_HOURS[day] };
      }
    }
    if (hasAnyValid) return normalized;
  }

  // Fallback a columnas legacy si existen
  if (legacyWeekday || legacySaturday) {
    const parseLegacy = (rangeStr?: string): TimeRange[] => {
      if (!rangeStr) return [];
      const [start, end] = rangeStr.split(/[–—-]/).map((s) => s.trim());
      if (start && end) return [{ open: start.padStart(5, "0"), close: end.padStart(5, "0") }];
      return [];
    };

    const weekdayRanges = parseLegacy(legacyWeekday || "09:00 – 19:00");
    const saturdayRanges = parseLegacy(legacySaturday || "09:00 – 14:00");

    return {
      mon: { closed: true, ranges: [] },
      tue: { closed: false, ranges: weekdayRanges },
      wed: { closed: false, ranges: weekdayRanges },
      thu: { closed: false, ranges: weekdayRanges },
      fri: { closed: false, ranges: weekdayRanges },
      sat: { closed: false, ranges: saturdayRanges },
      sun: { closed: true, ranges: [] },
    };
  }

  return DEFAULT_OPENING_HOURS;
}

export type ScheduleSource =
  | {
      openingHours?: OpeningHours | null;
      closedDates?: string[] | null;
      hoursWeekday?: string | null;
      hoursSaturday?: string | null;
    }
  | OpeningHours;

function resolveSchedule(source?: ScheduleSource): {
  openingHours: OpeningHours;
  closedDates: string[];
} {
  if (!source) {
    return { openingHours: DEFAULT_OPENING_HOURS, closedDates: [] };
  }
  if ("mon" in source && "tue" in source) {
    return {
      openingHours: normalizeOpeningHours(source),
      closedDates: [],
    };
  }

  const openingHours = normalizeOpeningHours(
    source.openingHours,
    source.hoursWeekday || undefined,
    source.hoursSaturday || undefined,
  );
  const closedDates = Array.isArray(source.closedDates) ? source.closedDates : [];
  return { openingHours, closedDates };
}

// Verifica si el local se encuentra actualmente abierto
export function isStoreOpenNow(
  source?: ScheduleSource | string,
  closedDatesOrLegacySaturday?: string[] | string,
  now = new Date(),
): boolean {
  let schedule: { openingHours: OpeningHours; closedDates: string[] };

  if (typeof source === "string") {
    // Firma histórica: isStoreOpenNow(hoursWeekday, hoursSaturday, now?)
    const legacyWeekday = source;
    const legacySaturday = typeof closedDatesOrLegacySaturday === "string" ? closedDatesOrLegacySaturday : "";
    schedule = {
      openingHours: normalizeOpeningHours(null, legacyWeekday, legacySaturday),
      closedDates: [],
    };
  } else {
    schedule = resolveSchedule(source);
    if (Array.isArray(closedDatesOrLegacySaturday)) {
      schedule.closedDates = closedDatesOrLegacySaturday;
    }
  }

  const { dateStr, weekdayKey, minutesNow } = getStoreTimeParts(now);

  // 1. Revisar si la fecha está explícitamente cerrada (feriado/vacaciones)
  if (schedule.closedDates.includes(dateStr)) {
    return false;
  }

  // 2. Revisar el día de la semana
  const daySchedule = schedule.openingHours[weekdayKey];
  if (!daySchedule || daySchedule.closed) {
    return false;
  }

  // 3. Revisar si la hora actual está dentro de alguna franja horaria
  return daySchedule.ranges.some((range) => {
    const start = toMinutes(range.open);
    const end = toMinutes(range.close);
    return minutesNow >= start && minutesNow < end;
  });
}

// Obtiene la etiqueta del próximo momento de apertura
export function getNextOpeningLabel(
  source?: ScheduleSource | string,
  closedDatesOrLegacySaturday?: string[] | string,
  now = new Date(),
): string {
  let schedule: { openingHours: OpeningHours; closedDates: string[] };

  if (typeof source === "string") {
    const legacyWeekday = source;
    const legacySaturday = typeof closedDatesOrLegacySaturday === "string" ? closedDatesOrLegacySaturday : "";
    schedule = {
      openingHours: normalizeOpeningHours(null, legacyWeekday, legacySaturday),
      closedDates: [],
    };
  } else {
    schedule = resolveSchedule(source);
    if (Array.isArray(closedDatesOrLegacySaturday)) {
      schedule.closedDates = closedDatesOrLegacySaturday;
    }
  }

  const { minutesNow, dateStr, weekdayKey } = getStoreTimeParts(now);

  // 1. ¿Abre más tarde hoy mismo? (ej. horario cortado de siesta)
  if (!schedule.closedDates.includes(dateStr)) {
    const todaySched = schedule.openingHours[weekdayKey];
    if (todaySched && !todaySched.closed) {
      for (const range of todaySched.ranges) {
        const start = toMinutes(range.open);
        if (start > minutesNow) {
          return `hoy desde las ${range.open}`;
        }
      }
    }
  }

  // 2. Caminar los próximos 14 días hasta encontrar un turno de apertura abierto
  for (let offset = 1; offset <= 14; offset++) {
    const targetDate = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const parts = getStoreTimeParts(targetDate);

    // Si es feriado o está cerrado en esa fecha, continuar
    if (schedule.closedDates.includes(parts.dateStr)) {
      continue;
    }

    const daySched = schedule.openingHours[parts.weekdayKey];
    if (!daySched || daySched.closed || daySched.ranges.length === 0) {
      continue;
    }

    const firstRange = daySched.ranges[0];
    if (offset === 1) {
      return `mañana desde las ${firstRange.open}`;
    }
    return `el ${DAY_NAMES[parts.weekdayKey]} desde las ${firstRange.open}`;
  }

  return "cuando volvamos a abrir";
}

// Genera la etiqueta consolidada de días de atención (ej. "Martes a sábado")
export function getOpenDaysLabel(openingHours: OpeningHours): string {
  const openDays = DAY_ORDER.filter(
    (d) => !openingHours[d].closed && openingHours[d].ranges.length > 0,
  );

  if (openDays.length === 0) return "Cerrado temporalmente";
  if (openDays.length === 7) return "Lunes a domingo";

  const indices = openDays.map((d) => DAY_ORDER.indexOf(d));
  const isContiguous = indices.every((val, i) => i === 0 || val === indices[i - 1] + 1);

  if (isContiguous && openDays.length > 1) {
    const startName = DAY_LABELS[openDays[0]];
    const endName = DAY_LABELS[openDays[openDays.length - 1]].toLowerCase();
    return `${startName} a ${endName}`;
  }

  if (openDays.length === 1) {
    return `${DAY_LABELS[openDays[0]]}s`;
  }

  const names = openDays.map((d) => DAY_LABELS[d].toLowerCase());
  return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
}

export const OPEN_DAYS_LABEL = "Martes a sábado";

// Resumen legible del cronograma de atención para el pie de página o LocalSection
export function formatScheduleSummary(source?: ScheduleSource): string[] {
  const { openingHours } = resolveSchedule(source);
  const groups: { days: DayKey[]; rangesStr: string }[] = [];

  for (const day of DAY_ORDER) {
    const sched = openingHours[day];
    const rangesStr = sched.closed || sched.ranges.length === 0
      ? "Cerrado"
      : sched.ranges.map((r) => `${r.open} – ${r.close}`).join(" y ");

    const last = groups[groups.length - 1];
    if (last && last.rangesStr === rangesStr) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], rangesStr });
    }
  }

  return groups.map((g) => {
    let dayLabel: string;
    if (g.days.length === 1) {
      dayLabel = DAY_LABELS[g.days[0]];
    } else if (
      g.days.length > 2 &&
      g.days.every((d, i) => i === 0 || DAY_ORDER.indexOf(d) === DAY_ORDER.indexOf(g.days[i - 1]) + 1)
    ) {
      dayLabel = `${DAY_LABELS[g.days[0]]} a ${DAY_LABELS[g.days[g.days.length - 1]].toLowerCase()}`;
    } else {
      dayLabel = g.days.map((d) => DAY_LABELS[d].slice(0, 3)).join(", ");
    }
    return `${dayLabel}: ${g.rangesStr}`;
  });
}

// Genera la especificación schema.org de horarios reales para layout.tsx
export function generateOpeningHoursSchema(source?: ScheduleSource) {
  const { openingHours } = resolveSchedule(source);
  const specifications: {
    "@type": "OpeningHoursSpecification";
    dayOfWeek: string[];
    opens: string;
    closes: string;
  }[] = [];

  for (const day of DAY_ORDER) {
    const sched = openingHours[day];
    if (sched.closed) continue;
    for (const range of sched.ranges) {
      specifications.push({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [SCHEMA_DAYS[day]],
        opens: range.open,
        closes: range.close,
      });
    }
  }

  return specifications;
}

// ── Validadores para el endpoint PUT /api/admin/settings ────────────

export function validateOpeningHoursInput(input: unknown): OpeningHours {
  if (!input || typeof input !== "object") {
    throw new Error("openingHours debe ser un objeto con los 7 días de la semana");
  }
  const raw = input as Record<string, unknown>;
  const result = {} as OpeningHours;

  for (const day of DAY_ORDER) {
    const sched = raw[day] as { closed?: unknown; ranges?: unknown } | undefined;
    if (!sched || typeof sched !== "object") {
      throw new Error(`Falta la configuración para el día "${DAY_LABELS[day]}"`);
    }

    const closed = Boolean(sched.closed);
    const ranges: TimeRange[] = [];

    if (!closed) {
      if (!Array.isArray(sched.ranges) || sched.ranges.length === 0) {
        throw new Error(
          `El día "${DAY_LABELS[day]}" está marcado como abierto pero no tiene franjas horarias`,
        );
      }
      if (sched.ranges.length > 2) {
        throw new Error(
          `El día "${DAY_LABELS[day]}" no puede tener más de 2 franjas horarias`,
        );
      }

      for (let i = 0; i < sched.ranges.length; i++) {
        const r = sched.ranges[i] as { open?: unknown; close?: unknown };
        if (!r || typeof r.open !== "string" || !TIME_REGEX.test(r.open.trim())) {
          throw new Error(
            `Hora de apertura inválida en "${DAY_LABELS[day]}" franja ${i + 1} (formato HH:MM)`,
          );
        }
        if (!r || typeof r.close !== "string" || !TIME_REGEX.test(r.close.trim())) {
          throw new Error(
            `Hora de cierre inválida en "${DAY_LABELS[day]}" franja ${i + 1} (formato HH:MM)`,
          );
        }

        const open = r.open.trim();
        const close = r.close.trim();
        const openMin = toMinutes(open);
        const closeMin = toMinutes(close);

        if (openMin >= closeMin) {
          throw new Error(
            `En "${DAY_LABELS[day]}", la hora de apertura (${open}) debe ser anterior a la de cierre (${close})`,
          );
        }

        ranges.push({ open, close });
      }

      // Validar que si hay dos franjas, la segunda sea posterior y no se pisen
      if (ranges.length === 2) {
        const firstEnd = toMinutes(ranges[0].close);
        const secondStart = toMinutes(ranges[1].open);
        if (firstEnd >= secondStart) {
          throw new Error(
            `En "${DAY_LABELS[day]}", las franjas horarias no pueden superponerse (${ranges[0].close} debe ser antes de ${ranges[1].open})`,
          );
        }
      }
    }

    result[day] = { closed, ranges };
  }

  return result;
}

export function validateClosedDatesInput(input: unknown): string[] {
  if (!Array.isArray(input)) return [];
  const unique = new Set<string>();

  for (const date of input) {
    if (typeof date !== "string" || !DATE_REGEX.test(date.trim())) {
      throw new Error(`Fecha cerrada inválida: "${date}" (formato esperado YYYY-MM-DD)`);
    }
    unique.add(date.trim());
  }

  return Array.from(unique).sort();
}

// Resumen conciso para el header del panel de administración
export function getAdminHeaderScheduleBadge(
  source?: ScheduleSource,
  now = new Date(),
): { isOpen: boolean; label: string } {
  const schedule = resolveSchedule(source);
  const { dateStr, weekdayKey, minutesNow } = getStoreTimeParts(now);

  const isClosedDate = schedule.closedDates.includes(dateStr);
  const daySched = schedule.openingHours[weekdayKey];

  if (!isClosedDate && daySched && !daySched.closed) {
    const activeRange = daySched.ranges.find((r) => {
      const start = toMinutes(r.open);
      const end = toMinutes(r.close);
      return minutesNow >= start && minutesNow < end;
    });

    if (activeRange) {
      return {
        isOpen: true,
        label: `Abierto ahora · Cierra ${activeRange.close}`,
      };
    }
  }

  const nextText = getNextOpeningLabel(schedule, undefined, now);
  return {
    isOpen: false,
    label: `Cerrado · Abre ${nextText}`,
  };
}

