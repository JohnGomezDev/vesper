'use client';

import { useMemo } from 'react';
import { getMoonInfo, getMoonPosition } from '@/modules/astronomy/services/moon.service';
import { createObserver } from '@/modules/astronomy/services/observer.service';
import { getPlanetElongation } from '@/modules/astronomy/services/planets.service';
import { sampleNight } from '@/modules/astronomy/services/sampling.service';
import { getSunPosition } from '@/modules/astronomy/services/sun.service';
import type { INightSample, TPlanetId } from '@/modules/astronomy/types/astronomy.types';
import { CURATED_SLUGS, getCuratedCity } from '@/modules/location/constants/curated-cities';
import type { ICoordinates, ILocation } from '@/modules/location/types/location.types';
import {
  addDays,
  getDeviceTimeZone,
  getTodayLocalDate,
  parseDateParam,
  parseLocalDateTime,
} from '@/modules/location/utils/datetime';
import { parseSlug } from '@/modules/location/utils/slug';
import { MS_PER_HOUR } from '@/modules/night/constants/night.constants';
import type {
  INightAnalysis,
  IUseNightAnalysisInput,
  TCloudClass,
} from '@/modules/night/types/night.types';
import { pickBestWindow } from '@/modules/night/utils/best-window';
import { classifyCloudCover, computeCloudCover } from '@/modules/night/utils/cloud';
import {
  createEmptyAnalysis,
  filterHoursInWindow,
  findHourIndex,
  getCurrentNightDate,
  getNightWindow,
} from '@/modules/night/utils/night';
import { getNightSummary } from '@/modules/night/utils/night-summary';
import {
  computeMoonInterferenceNotices,
  computeObservationWindows,
} from '@/modules/night/utils/windows';
import { getDailySun, indexHourly } from '@/modules/weather/utils/hourly';

/**
 * Night analysis for the selected date (SPEC §8.2–§8.6): strip rows, the
 * sunset→sunrise window, 10-minute observation windows, the best window, the
 * Moon and the night summary.
 *
 * Everything is computed locally with `useMemo`; changing the night or the
 * altitude threshold never triggers a request. The current night is resolved
 * on the client, so the server render never disagrees with the device clock.
 */
export function useNightAnalysis({
  slug,
  date,
  threshold,
  forecast,
  nowMs,
}: IUseNightAnalysisInput): INightAnalysis {
  return useMemo(() => {
    if (nowMs === null) {
      return createEmptyAnalysis('');
    }

    const parsedSlug = parseSlug(slug, CURATED_SLUGS);

    if (parsedSlug.kind === 'invalid') {
      return createEmptyAnalysis(getTodayLocalDate(nowMs, getDeviceTimeZone()));
    }

    const curatedCity = parsedSlug.kind === 'curated' ? getCuratedCity(parsedSlug.slug) : null;
    const coordinates: ICoordinates =
      parsedSlug.kind === 'coordinates'
        ? parsedSlug.coordinates
        : (curatedCity?.coordinates ?? { latitude: 0, longitude: 0 });
    const timeZone = forecast?.timezone ?? curatedCity?.timeZone ?? getDeviceTimeZone();
    const dailySun = forecast === undefined ? [] : getDailySun(forecast.daily);
    const sunriseByDate = new Map(dailySun.map((day) => [day.date, day.sunrise]));
    const todayLocal = getTodayLocalDate(nowMs, timeZone);

    let currentNightDate = todayLocal;

    if (forecast !== undefined) {
      const currentNight = getCurrentNightDate({ nowMs, timeZone, sunriseByDate });

      if (currentNight.kind === 'night') {
        currentNightDate = currentNight.date;
      }
    }

    const parsedDate = parseDateParam(date, todayLocal);
    const nightDate = parsedDate.kind === 'valid' ? parsedDate.date : currentNightDate;
    const isArchived = nightDate < currentNightDate;

    const daySun = dailySun.find((day) => day.date === nightDate);
    const nextSun = dailySun.find((day) => day.date === addDays(nightDate, 1));
    const window = getNightWindow({
      date: nightDate,
      sunset: daySun?.sunset ?? null,
      sunriseNext: nextSun?.sunrise ?? null,
      timeZone,
    });

    const location: ILocation = {
      slug,
      name: curatedCity?.name ?? slug,
      coordinates,
      elevationM: curatedCity?.elevationM ?? null,
      timeZone,
      isCurated: parsedSlug.kind === 'curated',
    };
    const observer = createObserver(location, forecast?.elevation ?? curatedCity?.elevationM ?? 0);
    const allRows = forecast === undefined ? [] : indexHourly(forecast.hourly);
    const rowInstants = allRows.map((row) => parseLocalDateTime(row.time, timeZone));
    const visibleIndexes =
      window.kind === 'available' && forecast !== undefined
        ? filterHoursInWindow(forecast.hourly.time, window, timeZone)
        : [];
    const rows = visibleIndexes.map((index) => allRows[index]);

    const sunAltitudes = new Map<number, number>();

    allRows.forEach((_, index) => {
      const instantMs = rowInstants[index];

      sunAltitudes.set(instantMs, getSunPosition(observer, instantMs).altitudeDeg);
    });

    const moon = getMoonInfo(observer, nightDate, timeZone);
    const moonIlluminationPct = moon.illuminationFraction * 100;

    const hourlyCloud = allRows.map((row) => {
      const value = computeCloudCover(row.cloudCoverLow, row.cloudCoverMid, row.cloudCoverHigh);

      return value === null ? null : classifyCloudCover(value);
    });

    const cloudByInstant = (instantMs: number): TCloudClass | 'unknown' => {
      const index = findHourIndex(rowInstants, instantMs);

      if (index === -1) {
        return 'unknown';
      }

      return hourlyCloud[index] ?? 'unknown';
    };

    const elongationByObject = (planetId: TPlanetId, instantMs: number): number | null =>
      getPlanetElongation(planetId, instantMs);

    const samples: INightSample[] =
      window.kind === 'available' && window.endMs >= window.startMs
        ? sampleNight({ observer, startMs: window.startMs, endMs: window.endMs })
        : [];

    const windows =
      samples.length === 0
        ? []
        : computeObservationWindows({
            samples,
            cloudByInstant,
            minAltitudeDeg: threshold,
            moonIlluminationPct,
            elongationByObject,
          });

    const notices =
      samples.length === 0 ? [] : computeMoonInterferenceNotices({ samples, moonIlluminationPct });

    const nightStartMs = window.kind === 'available' ? window.startMs + MS_PER_HOUR : null;
    const nightEndMs = window.kind === 'available' ? window.endMs - MS_PER_HOUR : null;
    let moonPeakAltitudeDeg: number | null = null;
    let moonPeakMs: number | null = null;

    if (nightStartMs !== null && nightEndMs !== null) {
      for (const sample of samples) {
        if (sample.instantMs < nightStartMs || sample.instantMs > nightEndMs) {
          continue;
        }

        if (moonPeakAltitudeDeg === null || sample.moon.altitudeDeg > moonPeakAltitudeDeg) {
          moonPeakAltitudeDeg = sample.moon.altitudeDeg;
          moonPeakMs = sample.instantMs;
        }
      }
    }

    const cloudByTime = new Map<string, number | null>();
    const cloudClassByTime = new Map<string, TCloudClass | 'unknown'>();

    rows.forEach((row) => {
      const value = computeCloudCover(row.cloudCoverLow, row.cloudCoverMid, row.cloudCoverHigh);

      cloudByTime.set(row.time, value);
      cloudClassByTime.set(row.time, value === null ? 'unknown' : classifyCloudCover(value));
    });

    const bestWindow = pickBestWindow(windows, (candidate) => {
      const cloudValues: number[] = [];

      allRows.forEach((row, index) => {
        const instantMs = rowInstants[index];

        if (instantMs + MS_PER_HOUR <= candidate.startMs || instantMs >= candidate.endMs) {
          return;
        }

        const value = computeCloudCover(row.cloudCoverLow, row.cloudCoverMid, row.cloudCoverHigh);

        if (value !== null) {
          cloudValues.push(value);
        }
      });

      if (cloudValues.length === 0) {
        return null;
      }

      return cloudValues.reduce((total, value) => total + value, 0) / cloudValues.length;
    });

    const moonAboveHorizonByInstant = (instantMs: number): boolean =>
      getMoonPosition(observer, instantMs).altitudeDeg >= 0;

    const summary =
      forecast === undefined
        ? null
        : getNightSummary({
            date: nightDate,
            hourly: rows,
            timeZone,
            sunAltitudes,
            moonAboveHorizonByInstant,
            moonIlluminationPct,
          });

    return {
      nightDate,
      isArchived,
      rows,
      window,
      windows,
      bestWindow,
      notices,
      moon,
      moonPeakAltitudeDeg,
      moonPeakMs,
      currentSunAltitudeDeg: getSunPosition(observer, nowMs).altitudeDeg,
      summary,
      sunAltitudes,
      cloudByTime,
      cloudClassByTime,
    };
  }, [slug, date, threshold, forecast, nowMs]);
}
