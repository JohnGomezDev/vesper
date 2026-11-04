import { getMoonPhase, getMoonPosition } from '@/modules/astronomy/services/moon.service';
import { getSunPosition } from '@/modules/astronomy/services/sun.service';
import type { IObserver } from '@/modules/astronomy/types/astronomy.types';
import {
  addDays,
  getLocalMidnightMs,
  getNightDateRange,
  parseLocalDateTime,
} from '@/modules/location/utils/datetime';
import { MS_PER_HOUR } from '@/modules/night/constants/night.constants';
import type { INightSummary } from '@/modules/night/types/night.types';
import { getNightSummary } from '@/modules/night/utils/night-summary';
import { getNightWindow } from '@/modules/night/utils/night';
import type { IForecastResponse, IHourlyRow } from '@/modules/weather/types/weather.types';
import { getDailySun, indexHourly } from '@/modules/weather/utils/hourly';

/**
 * Summaries of the 18 selectable nights (−3…+14) for the night selector
 * (SPEC §8.2, §8.6).
 *
 * Sun altitudes and row instants are computed once for the whole response; the
 * Moon illumination is the phase at local midnight and does not need the
 * rise/set search. Everything is local and pure, so changing the night never
 * requests data again.
 */
export function buildNightOptions(input: {
  observer: IObserver;
  forecast: IForecastResponse;
  timeZone: string;
  todayLocal: string;
}): INightSummary[] {
  const { observer, forecast, timeZone, todayLocal } = input;
  const dailySun = getDailySun(forecast.daily);
  const sunByDate = new Map(dailySun.map((day) => [day.date, day]));
  const allRows = indexHourly(forecast.hourly);
  const rowInstants = allRows.map((row) => parseLocalDateTime(row.time, timeZone));
  const sunAltitudes = new Map<number, number>();

  allRows.forEach((_, index) => {
    sunAltitudes.set(rowInstants[index], getSunPosition(observer, rowInstants[index]).altitudeDeg);
  });

  const range = getNightDateRange(todayLocal);
  const options: INightSummary[] = [];

  for (let date = range.min; date <= range.max; date = addDays(date, 1)) {
    const day = sunByDate.get(date);
    const nextDay = sunByDate.get(addDays(date, 1));
    const window = getNightWindow({
      date,
      sunset: day?.sunset ?? null,
      sunriseNext: nextDay?.sunrise ?? null,
      timeZone,
    });
    const rows: IHourlyRow[] = [];

    if (window.kind === 'available') {
      allRows.forEach((row, index) => {
        const rowStartMs = rowInstants[index];

        if (rowStartMs < window.endMs && rowStartMs + MS_PER_HOUR > window.startMs) {
          rows.push(row);
        }
      });
    }

    const moon = rows.length === 0 ? null : getMoonPhase(getLocalMidnightMs(date, timeZone));

    options.push(
      getNightSummary({
        date,
        hourly: rows,
        timeZone,
        sunAltitudes,
        moonAboveHorizonByInstant: (instantMs: number): boolean =>
          getMoonPosition(observer, instantMs).altitudeDeg >= 0,
        moonIlluminationPct: moon === null ? 0 : moon.illuminationFraction * 100,
      }),
    );
  }

  return options;
}
