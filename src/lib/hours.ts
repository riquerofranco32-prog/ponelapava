export const STORE_TIMEZONE = "America/Argentina/Buenos_Aires";

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

  const weekday = parts.find((p) => p.type === "weekday")?.value ?? "Mon";
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  const minutesNow = hour * 60 + minute;

  if (weekday === "Sun") return false; // closed Sundays

  const [start, end] = parseRange(
    weekday === "Sat" ? hoursSaturday : hoursWeekday,
  );
  return minutesNow >= start && minutesNow < end;
}

// Opening time for the next day the store is open, for closed-hours copy
// ("te respondemos mañana desde las 9:00"). Skips straight to Monday when
// tomorrow would be Sunday (closed) instead of saying "mañana" for a day
// the store never opens.
export function getNextOpeningLabel(
  hoursWeekday: string,
  hoursSaturday: string,
  now = new Date(),
): string {
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const weekdayTomorrow = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TIMEZONE,
    weekday: "short",
  }).format(tomorrow);

  if (weekdayTomorrow === "Sun") {
    const [start] = splitRange(hoursWeekday);
    return `el lunes desde las ${start}`;
  }
  const [start] = splitRange(
    weekdayTomorrow === "Sat" ? hoursSaturday : hoursWeekday,
  );
  return `mañana desde las ${start}`;
}
