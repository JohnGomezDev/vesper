const MISSING_VALUE = '—';
const MS_PER_MINUTE = 60_000;
const MINUTES_PER_HOUR = 60;

const nightDateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  timeZone: 'UTC',
});

/** `2026-10-19T18:00` → `18:00`; the value is already the place wall clock. */
export function formatHourLabel(localIso: string): string {
  const timePart = localIso.split('T')[1] ?? '';

  return timePart.slice(0, 5) || MISSING_VALUE;
}

export function formatDegrees(value: number | null): string {
  return value === null ? MISSING_VALUE : `${Math.round(value)}°`;
}

/** Human label of a `YYYY-MM-DD` local date, without using the device zone. */
export function formatNightDateLabel(date: string): string {
  const [year, month, day] = date.split('-').map(Number);

  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) {
    return date;
  }

  return nightDateFormatter.format(new Date(Date.UTC(year, month - 1, day, 12)));
}

export function formatDuration(ms: number): string {
  const totalMinutes = Math.max(0, Math.round(ms / MS_PER_MINUTE));
  const hours = Math.floor(totalMinutes / MINUTES_PER_HOUR);
  const minutes = totalMinutes % MINUTES_PER_HOUR;

  if (hours === 0) {
    return `${minutes} min`;
  }

  if (minutes === 0) {
    return `${hours} h`;
  }

  return `${hours} h ${minutes} min`;
}
