import { SAMPLE_STEP_MS } from '@/modules/astronomy/constants/sampling.constants';
import { getMoonPosition } from '@/modules/astronomy/services/moon.service';
import { getPlanetPosition } from '@/modules/astronomy/services/planets.service';
import { getSunPosition } from '@/modules/astronomy/services/sun.service';
import type { INightSample, IObserver } from '@/modules/astronomy/types/astronomy.types';

/**
 * Samples the Sun, the Moon and the seven planets every 10 minutes between
 * `startMs` and `endMs` (SPEC §8.5).
 *
 * The number of samples is `floor((endMs - startMs) / SAMPLE_STEP_MS) + 1`:
 * both endpoints are included when they fall on the grid, and a range that is
 * not a multiple of the step ends on the last sample before `endMs`. Each
 * instant is computed once for every object, so the same range is never
 * sampled twice inside one call.
 */
export function sampleNight(input: {
  observer: IObserver;
  startMs: number;
  endMs: number;
}): INightSample[] {
  const { observer, startMs, endMs } = input;

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs) {
    throw new RangeError(`Invalid sampling range: ${startMs}..${endMs}`);
  }

  const sampleCount = Math.floor((endMs - startMs) / SAMPLE_STEP_MS) + 1;
  const samples: INightSample[] = [];

  for (let index = 0; index < sampleCount; index += 1) {
    const instantMs = startMs + index * SAMPLE_STEP_MS;

    samples.push({
      instantMs,
      sun: getSunPosition(observer, instantMs),
      moon: getMoonPosition(observer, instantMs),
      planets: {
        mercury: getPlanetPosition(observer, 'mercury', instantMs),
        venus: getPlanetPosition(observer, 'venus', instantMs),
        mars: getPlanetPosition(observer, 'mars', instantMs),
        jupiter: getPlanetPosition(observer, 'jupiter', instantMs),
        saturn: getPlanetPosition(observer, 'saturn', instantMs),
        uranus: getPlanetPosition(observer, 'uranus', instantMs),
        neptune: getPlanetPosition(observer, 'neptune', instantMs),
      },
    });
  }

  return samples;
}
