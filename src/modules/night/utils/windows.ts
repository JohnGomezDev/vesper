import { getAngularSeparation } from '@/modules/astronomy/services/planets.service';
import type {
  IHorizontalPosition,
  INightSample,
  TPlanetId,
} from '@/modules/astronomy/types/astronomy.types';
import { findCulmination } from '@/modules/astronomy/utils/series';
import {
  MIN_ELONGATION_DEG,
  MOON_FREE_MAX_ILLUMINATION_PCT,
  MOON_NOTICE_MIN_ILLUMINATION_PCT,
  MOON_NOTICE_SEPARATION_DEG,
  MOON_STRONG_NOTICE_SEPARATION_DEG,
  OBJECT_FILTERS,
  WINDOW_OBJECT_IDS,
} from '@/modules/night/constants/object-filters.constants';
import type { TWindowObjectId } from '@/modules/night/types/night.types';
import type {
  IObservationWindow,
  IMoonInterferenceNotice,
  TCloudClass,
} from '@/modules/night/types/night.types';

/** Seven planets, in the `TPlanetId` order. The Moon and the Sun are excluded. */
const PLANET_IDS: readonly TPlanetId[] = [
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
];

/** From better to worse; `unknown` is handled separately. */
const CLOUD_CLASS_RANK: Record<TCloudClass, number> = {
  ideal: 0,
  good: 1,
  acceptable: 2,
  fair: 3,
  poor: 4,
};

function getObjectPosition(sample: INightSample, objectId: TWindowObjectId): IHorizontalPosition {
  return objectId === 'moon' ? sample.moon : sample.planets[objectId];
}

function passesFilters(input: {
  sample: INightSample;
  objectId: TWindowObjectId;
  cloudByInstant: (instantMs: number) => TCloudClass | 'unknown';
  minAltitudeDeg: number;
  elongationByObject: (objectId: TPlanetId, instantMs: number) => number | null;
}): boolean {
  const { sample, objectId, cloudByInstant, minAltitudeDeg, elongationByObject } = input;
  const filter = OBJECT_FILTERS[objectId];

  // Cumulative darkness: the Sun must be strictly below the object threshold.
  if (sample.sun.altitudeDeg >= filter.requiredDarkness) {
    return false;
  }

  if (getObjectPosition(sample, objectId).altitudeDeg < minAltitudeDeg) {
    return false;
  }

  if (objectId === 'mercury' || objectId === 'venus') {
    const elongationDeg = elongationByObject(objectId, sample.instantMs);

    if (elongationDeg === null || elongationDeg < MIN_ELONGATION_DEG) {
      return false;
    }
  }

  // A "poor" hour stays in the strip but never enters a window (SPEC §8.5.6).
  if (cloudByInstant(sample.instantMs) === 'poor') {
    return false;
  }

  return true;
}

/**
 * Worst cloud class across the samples that fall inside the window interval.
 * `unknown` only wins when no sample of the interval has a known class.
 */
function computeWorstCloudClass(
  samples: INightSample[],
  cloudByInstant: (instantMs: number) => TCloudClass | 'unknown',
): TCloudClass | 'unknown' {
  let worst: TCloudClass | null = null;

  for (const sample of samples) {
    const cloudClass = cloudByInstant(sample.instantMs);

    if (cloudClass === 'unknown') {
      continue;
    }

    if (worst === null || CLOUD_CLASS_RANK[cloudClass] > CLOUD_CLASS_RANK[worst]) {
      worst = cloudClass;
    }
  }

  return worst ?? 'unknown';
}

/**
 * A window is Moon-free when the Moon illuminates less than 10 % or stays below
 * the horizon for every valid sample of the window (SPEC §8.5.5).
 */
function isMoonFree(samples: INightSample[], moonIlluminationPct: number): boolean {
  if (moonIlluminationPct < MOON_FREE_MAX_ILLUMINATION_PCT) {
    return true;
  }

  return samples.every((sample) => sample.moon.altitudeDeg < 0);
}

function computeWindowsForObject(input: {
  samples: INightSample[];
  objectId: TWindowObjectId;
  cloudByInstant: (instantMs: number) => TCloudClass | 'unknown';
  minAltitudeDeg: number;
  moonIlluminationPct: number;
  elongationByObject: (objectId: TPlanetId, instantMs: number) => number | null;
}): IObservationWindow[] {
  const { samples, objectId, cloudByInstant, minAltitudeDeg, moonIlluminationPct } = input;
  const filter = OBJECT_FILTERS[objectId];
  const passes = samples.map((sample) =>
    passesFilters({
      sample,
      objectId,
      cloudByInstant,
      minAltitudeDeg,
      elongationByObject: input.elongationByObject,
    }),
  );
  const windows: IObservationWindow[] = [];

  let index = 0;

  while (index < samples.length) {
    if (!passes[index]) {
      index += 1;
      continue;
    }

    let lastValid = index;
    let cursor = index + 1;

    while (cursor < samples.length) {
      if (passes[cursor]) {
        lastValid = cursor;
        cursor += 1;
        continue;
      }

      // One isolated failing sample is tolerated; two in a row close the window.
      if (cursor + 1 < samples.length && passes[cursor + 1]) {
        cursor += 1;
        continue;
      }

      break;
    }

    const intervalSamples = samples.slice(index, lastValid + 1);
    const validSamples = intervalSamples.filter((_, offset) => passes[index + offset]);
    const culmination = findCulmination(validSamples, objectId);

    if (culmination !== null) {
      windows.push({
        objectId,
        startMs: validSamples[0].instantMs,
        endMs: validSamples[validSamples.length - 1].instantMs,
        peakAltitudeDeg: culmination.peakAltitudeDeg,
        culminationMs: culmination.culminationMs,
        culminationApproximate: culmination.approximate,
        worstCloudClass: computeWorstCloudClass(intervalSamples, cloudByInstant),
        moonFree: filter.requiresMoonFreeHighlight
          ? isMoonFree(validSamples, moonIlluminationPct)
          : false,
        brightnessLabel: filter.brightnessLabel,
      });
    }

    index = lastValid + 1;
  }

  return windows;
}

/**
 * Continuous observation windows for the Moon and the seven planets
 * (SPEC §8.5). The Sun never generates a window.
 *
 * `elongationByObject` supplies the Mercury and Venus elongation; `null` or an
 * angle below 15° leaves them without a window. The input was extended with
 * this accessor because `INightSample` carries positions only (T016 authorized
 * deviation).
 */
export function computeObservationWindows(input: {
  samples: INightSample[];
  cloudByInstant: (instantMs: number) => TCloudClass | 'unknown';
  minAltitudeDeg: number;
  moonIlluminationPct: number;
  elongationByObject: (objectId: TPlanetId, instantMs: number) => number | null;
}): IObservationWindow[] {
  return WINDOW_OBJECT_IDS.flatMap((objectId) =>
    computeWindowsForObject({
      samples: input.samples,
      objectId,
      cloudByInstant: input.cloudByInstant,
      minAltitudeDeg: input.minAltitudeDeg,
      moonIlluminationPct: input.moonIlluminationPct,
      elongationByObject: input.elongationByObject,
    }),
  );
}

/**
 * Moon–planet proximity warnings (SPEC §8.5.5). A warning is reported when the
 * closest separation in the series is below 10° and the Moon is illuminated
 * over 20 %; it is strong below 5°.
 */
export function computeMoonInterferenceNotices(input: {
  samples: INightSample[];
  moonIlluminationPct: number;
}): IMoonInterferenceNotice[] {
  if (input.samples.length === 0 || input.moonIlluminationPct <= MOON_NOTICE_MIN_ILLUMINATION_PCT) {
    return [];
  }

  const notices: IMoonInterferenceNotice[] = [];

  for (const planetId of PLANET_IDS) {
    let minSeparationDeg = Number.POSITIVE_INFINITY;

    for (const sample of input.samples) {
      const separationDeg = getAngularSeparation(sample.moon, sample.planets[planetId]);

      if (separationDeg < minSeparationDeg) {
        minSeparationDeg = separationDeg;
      }
    }

    if (minSeparationDeg < MOON_NOTICE_SEPARATION_DEG) {
      notices.push({
        objectId: planetId,
        separationDeg: minSeparationDeg,
        strong: minSeparationDeg < MOON_STRONG_NOTICE_SEPARATION_DEG,
      });
    }
  }

  return notices;
}
