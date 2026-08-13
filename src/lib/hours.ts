const STORE_TIMEZONE = "America/Argentina/Buenos_Aires";

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + (m || 0);
}

// Hours are stored as "9:00 – 19:00" (en dash). Splitting on any dash-like
// character keeps this resilient to a hyphen sneaking in from manual edits.
function parseRange(range: string): [number, number] {
  const [start, end] = range.split(/[–—-]/).map((s) => s.trim());
  return [toMinutes(start), toMinutes(end)];
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
