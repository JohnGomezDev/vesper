import { MS_PER_HOUR } from '@/modules/night/constants/night.constants';
import type { INightAnalysis, TNightWindow } from '@/modules/night/types/night.types';
import { addDays, getTodayLocalDate, parseLocalDateTime } from '@/modules/location/utils/datetime';

const HOURS_PER_DAY = 24;

export function createEmptyAnalysis(nightDate: string): INightAnalysis {
  return {
    nightDate,
    isArchived: false,
    rows: [],
    window: { kind: 'no-astronomical-night' },
    windows: [],
    bestWindow: null,
    notices: [],
    moon: null,
    moonPeakAltitudeDeg: null,
    moonPeakMs: null,
    currentSunAltitudeDeg: null,
    summary: null,
    sunAltitudes: new Map(),
    cloudByTime: new Map(),
    cloudClassByTime: new Map(),
  };
}

/** Last hourly row whose one-hour interval contains `instantMs`, or `-1`. */
export function findHourIndex(rowInstants: number[], instantMs: number): number {
  let low = 0;
  let high = rowInstants.length - 1;
  let found = -1;

  while (low <= high) {
    const middle = Math.floor((low + high) / 2);

    if (rowInstants[middle] <= instantMs) {
      found = middle;
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }

  if (found === -1 || instantMs >= rowInstants[found] + MS_PER_HOUR) {
    return -1;
  }

  return found;
}

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

  const sunsetMs = parseLocalDateTime(sunset, timeZone);
  const sunriseMs = parseLocalDateTime(sunriseNext, timeZone);

  // Open-Meteo returns `00:00` for both events during polar day/night instead
  // of `null`. That produces a 24-hour difference, which is not a night.
  if (sunriseMs - sunsetMs >= HOURS_PER_DAY * MS_PER_HOUR) {
    return { kind: 'no-astronomical-night' };
  }

  if (sunriseMs <= sunsetMs) {
    return { kind: 'no-astronomical-night' };
  }

  return {
    kind: 'available',
    startMs: sunsetMs - MS_PER_HOUR,
    endMs: sunriseMs + MS_PER_HOUR,
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
