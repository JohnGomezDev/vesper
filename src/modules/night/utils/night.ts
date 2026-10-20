import type { TNightWindow } from '@/modules/night/types/night.types';
import { addDays, getTodayLocalDate, parseLocalDateTime } from '@/modules/location/utils/datetime';

const MS_PER_HOUR = 3_600_000;

export function getNightWindow(input: {
  date: string;
  sunset: string | null;
  sunriseNext: string | null;
  timeZone: string;
}): TNightWindow {
  const { sunset, sunriseNext, timeZone } = input;

  if (sunset === null || sunriseNext === null) {
    return { kind: 'no-astronomical-night' };
  }

  return {
    kind: 'available',
    startMs: parseLocalDateTime(sunset, timeZone) - MS_PER_HOUR,
    endMs: parseLocalDateTime(sunriseNext, timeZone) + MS_PER_HOUR,
  };
}

export function filterHoursInWindow(
  hourlyTimes: string[],
  window: TNightWindow,
  timeZone: string,
): number[] {
  if (window.kind === 'no-astronomical-night') {
    return [];
  }

  const rows: number[] = [];

  hourlyTimes.forEach((time, index) => {
    const rowStartMs = parseLocalDateTime(time, timeZone);
    const rowEndMs = rowStartMs + MS_PER_HOUR;

    if (rowStartMs < window.endMs && rowEndMs > window.startMs) {
      rows.push(index);
    }
  });

  return rows;
}

export function getCurrentNightDate(input: {
  nowMs: number;
  timeZone: string;
  sunriseByDate: ReadonlyMap<string, string | null>;
}): { kind: 'night'; date: string } | { kind: 'no-current-night' } {
  const todayLocal = getTodayLocalDate(input.nowMs, input.timeZone);
  const sunrise = input.sunriseByDate.get(todayLocal);

  if (sunrise === undefined || sunrise === null) {
    return { kind: 'no-current-night' };
  }

  if (input.nowMs < parseLocalDateTime(sunrise, input.timeZone)) {
    return { kind: 'night', date: addDays(todayLocal, -1) };
  }

  return { kind: 'night', date: todayLocal };
}
