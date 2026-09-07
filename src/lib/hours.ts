export const STORE_TIMEZONE = "America/Argentina/Buenos_Aires";

// El local abre de martes a sábado. Antes esto no se podía expresar: la única
// regla era "domingo cerrado", así que los lunes el sitio se anunciaba abierto
// y prometía atención un día que nadie atiende.
//
// Acá vive QUÉ DÍAS abre; los HORARIOS siguen viniendo de site_settings, que
// los dueños editan desde /admin. hoursWeekday cubre martes a viernes y
// hoursSaturday el sábado.
const WEEKDAY_KEYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;
type WeekdayKey = (typeof WEEKDAY_KEYS)[number];

const MIDWEEK_DAYS: WeekdayKey[] = ["Tue", "Wed", "Thu", "Fri"];
const SATURDAY: WeekdayKey = "Sat";
const CLOSED_DAYS: WeekdayKey[] = ["Sun", "Mon"];

export const OPEN_DAYS_LABEL = "MARTES A SÁBADO";

// Nombres para el copy de "abre el <día>".
const DAY_NAMES: Record<WeekdayKey, string> = {
  Sun: "domingo",
  Mon: "lunes",
  Tue: "martes",
  Wed: "miércoles",
  Thu: "jueves",
  Fri: "viernes",
  Sat: "sábado",
};

// Los días de la semana como los nombra schema.org, para el JSON-LD.
export const MIDWEEK_SCHEMA_DAYS = [
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

function weekdayKeyOf(date: Date): WeekdayKey {
  const value = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    weekday: "short",
  }).format(date);
  return (WEEKDAY_KEYS as readonly string[]).includes(value)
    ? (value as WeekdayKey)
    : "Mon";
}

// El rango que rige ese día, o null si está cerrado.
function rangeForDay(
  day: WeekdayKey,
  hoursWeekday: string,
  hoursSaturday: string,
): string | null {
  if (CLOSED_DAYS.includes(day)) return null;
  if (day === SATURDAY) return hoursSaturday;
  if (MIDWEEK_DAYS.includes(day)) return hoursWeekday;
  return null;
}

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

// Hours are stored as "9:00 – 19:00" (en dash). Splitting on any dash-like
// character keeps this resilient to a hyphen sneaking in from manual edits.
function splitRange(range: string): [string, string] {
  const [start, end] = range.split(/[–—-]/).map((s) => s.trim());
  return [start, end];
}

function parseRange(range: string): [number, number] {
  const [start, end] = splitRange(range);
  return [toMinutes(start), toMinutes(end)];
}

// Zero-padded "HH:MM", as schema.org's OpeningHoursSpecification expects.
function toOpeningHoursTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  return `${String(h).padStart(2, "0")}:${String(m || 0).padStart(2, "0")}`;
}

export function parseOpeningHoursRange(range: string): [string, string] {
  const [start, end] = splitRange(range);
  return [toOpeningHoursTime(start), toOpeningHoursTime(end)];
}

export function isStoreOpenNow(
  hoursWeekday: string,
  hoursSaturday: string,
  now = new Date(),
): boolean {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const weekday = (parts.find((p) => p.type === "weekday")?.value ??
    "Mon") as WeekdayKey;
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const minutesNow = hour * 60 + minute;

  const range = rangeForDay(weekday, hoursWeekday, hoursSaturday);
  if (!range) return false;

  const [start, end] = parseRange(range);
  return minutesNow >= start && minutesNow < end;
}

// Apertura del próximo día que el local abre, para el copy de fuera de
// horario ("te respondemos mañana desde las 18:00"). Camina hacia adelante
// hasta encontrar un día abierto en vez de asumir cuál es: con domingo y
// lunes cerrados, un sábado a la noche el próximo turno es el martes.
export function getNextOpeningLabel(
  hoursWeekday: string,
  hoursSaturday: string,
  now = new Date(),
): string {
  for (let offset = 1; offset <= 7; offset++) {
    const day = new Date(now.getTime() + offset * 24 * 60 * 60 * 1000);
    const key = weekdayKeyOf(day);
    const range = rangeForDay(key, hoursWeekday, hoursSaturday);
    if (!range) continue;
    const [start] = splitRange(range);
    return offset === 1
      ? `mañana desde las ${start}`
      : `el ${DAY_NAMES[key]} desde las ${start}`;
  }
  return "cuando volvamos a abrir";
}
