import type {
  IHorizontalPosition,
  INightSample,
  TPlanetId,
} from '@/modules/astronomy/types/astronomy.types';

/** Objects that can be sampled from a night series; the Sun is excluded. */
type TSampleObjectId = TPlanetId | 'moon';

type TAltitudePeak = {
  altitudeDeg: number;
  instantMs: number;
};

type TCulmination = {
  culminationMs: number;
  peakAltitudeDeg: number;
  approximate: true;
};

function getObjectPosition(sample: INightSample, objectId: TSampleObjectId): IHorizontalPosition {
  return objectId === 'moon' ? sample.moon : sample.planets[objectId];
}

/**
 * Highest altitude of one object in the series. Ties keep the first instant,
 * so the result is deterministic for a symmetrical series.
 */
export function findMaxAltitude(
  samples: INightSample[],
  objectId: TSampleObjectId,
): TAltitudePeak | null {
  let peak: TAltitudePeak | null = null;

  for (const sample of samples) {
    const altitudeDeg = getObjectPosition(sample, objectId).altitudeDeg;

    if (peak === null || altitudeDeg > peak.altitudeDeg) {
      peak = { altitudeDeg, instantMs: sample.instantMs };
    }
  }

  return peak;
}

/**
 * Approximate culmination from the sampled series. It always reports
 * `approximate: true` because the peak comes from the 10-minute grid, not from
 * the native `SearchHourAngle`. Returns `null` for an empty series.
 */
export function findCulmination(
  samples: INightSample[],
  objectId: TSampleObjectId,
): TCulmination | null {
  const peak = findMaxAltitude(samples, objectId);

  if (peak === null) {
    return null;
  }

  return {
    culminationMs: peak.instantMs,
    peakAltitudeDeg: peak.altitudeDeg,
    approximate: true,
  };
}
