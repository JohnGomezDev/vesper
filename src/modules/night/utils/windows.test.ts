import { describe, expect, it } from 'vitest';
import type { INightSample, TPlanetId } from '@/modules/astronomy/types/astronomy.types';
import type { TCloudClass } from '@/modules/night/types/night.types';
import {
  computeMoonInterferenceNotices,
  computeObservationWindows,
} from '@/modules/night/utils/windows';

const STEP_MS = 600_000;
const START_MS = Date.UTC(2026, 9, 20, 2, 0);
const MIN_ALTITUDE_DEG = 15;

type TSampleOptions = {
  sunAltitudeDeg?: number;
  moonAltitudeDeg?: number;
  moonAzimuthDeg?: number;
  planetAltitudeDeg?: number;
  planetAzimuthDeg?: number;
  planetAltitudes?: Partial<Record<TPlanetId, number>>;
};

function makeSample(index: number, options: TSampleOptions = {}): INightSample {
  const moonAltitudeDeg = options.moonAltitudeDeg ?? -30;
  const moonAzimuthDeg = options.moonAzimuthDeg ?? 180;
  const planetAltitudeDeg = options.planetAltitudeDeg ?? 40;
  const planetAzimuthDeg = options.planetAzimuthDeg ?? 180;
  const planetAltitudes = options.planetAltitudes ?? {};

  const planet = (id: TPlanetId): { altitudeDeg: number; azimuthDeg: number } => ({
    altitudeDeg: planetAltitudes[id] ?? planetAltitudeDeg,
    azimuthDeg: planetAzimuthDeg,
  });

  return {
    instantMs: START_MS + index * STEP_MS,
    sun: { altitudeDeg: options.sunAltitudeDeg ?? -20, azimuthDeg: 0 },
    moon: { altitudeDeg: moonAltitudeDeg, azimuthDeg: moonAzimuthDeg },
    planets: {
      mercury: planet('mercury'),
      venus: planet('venus'),
      mars: planet('mars'),
      jupiter: planet('jupiter'),
      saturn: planet('saturn'),
      uranus: planet('uranus'),
      neptune: planet('neptune'),
    },
  };
}

function cloudLookup(
  classes: ReadonlyArray<TCloudClass | 'unknown'>,
): (instantMs: number) => TCloudClass | 'unknown' {
  const byInstant = new Map<number, TCloudClass | 'unknown'>();

  classes.forEach((cloudClass, index) => {
    byInstant.set(START_MS + index * STEP_MS, cloudClass);
  });

  return (instantMs) => byInstant.get(instantMs) ?? 'unknown';
}

function elongationAlways(
  degrees: number,
): (objectId: TPlanetId, instantMs: number) => number | null {
  return () => degrees;
}

function windowsFor(
  samples: INightSample[],
  options: {
    cloudByInstant?: (instantMs: number) => TCloudClass | 'unknown';
    minAltitudeDeg?: number;
    moonIlluminationPct?: number;
    elongationByObject?: (objectId: TPlanetId, instantMs: number) => number | null;
  } = {},
) {
  return computeObservationWindows({
    samples,
    cloudByInstant: options.cloudByInstant ?? (() => 'ideal'),
    minAltitudeDeg: options.minAltitudeDeg ?? MIN_ALTITUDE_DEG,
    moonIlluminationPct: options.moonIlluminationPct ?? 0,
    elongationByObject: options.elongationByObject ?? elongationAlways(30),
  });
}

describe('computeObservationWindows', () => {
  it('creates a window for the Moon and the seven planets but never for the Sun', () => {
    const samples = Array.from({ length: 5 }, (_, index) =>
      makeSample(index, { moonAltitudeDeg: 40 }),
    );
    const windows = windowsFor(samples);

    const objectIds = windows.map((window) => window.objectId);

    expect(windows).toHaveLength(8);
    expect(objectIds).not.toContain('sun');
    expect(objectIds).toEqual([
      'moon',
      'mercury',
      'venus',
      'mars',
      'jupiter',
      'saturn',
      'uranus',
      'neptune',
    ]);
  });

  it('computes start, end, peak altitude and an approximate culmination', () => {
    const samples = Array.from({ length: 5 }, (_, index) => makeSample(index));
    const jupiter = windowsFor(samples).find((window) => window.objectId === 'jupiter');

    expect(jupiter).toEqual({
      objectId: 'jupiter',
      startMs: START_MS,
      endMs: START_MS + 4 * STEP_MS,
      peakAltitudeDeg: 40,
      culminationMs: START_MS,
      culminationApproximate: true,
      worstCloudClass: 'ideal',
      moonFree: false,
      brightnessLabel: 'naked-eye',
    });
  });

  it('does not create a window when the object stays below the minimum altitude', () => {
    const samples = Array.from({ length: 4 }, (_, index) =>
      makeSample(index, { planetAltitudeDeg: 5, moonAltitudeDeg: 5 }),
    );

    expect(windowsFor(samples)).toEqual([]);
  });

  it('uses the configured minimum altitude locally', () => {
    const samples = Array.from({ length: 2 }, (_, index) =>
      makeSample(index, { planetAltitudeDeg: 12, moonAltitudeDeg: -30 }),
    );

    expect(windowsFor(samples, { minAltitudeDeg: 10 })).toHaveLength(7);
    expect(windowsFor(samples, { minAltitudeDeg: 15 })).toHaveLength(0);
  });

  it('applies cumulative darkness per object', () => {
    const samples = Array.from({ length: 2 }, (_, index) =>
      makeSample(index, { sunAltitudeDeg: -12.1 }),
    );
    const windows = windowsFor(samples);

    expect(windows.some((window) => window.objectId === 'uranus')).toBe(false);
    expect(windows.some((window) => window.objectId === 'neptune')).toBe(false);
    expect(windows.some((window) => window.objectId === 'jupiter')).toBe(true);
    expect(windows.some((window) => window.objectId === 'mercury')).toBe(true);
    expect(windows.some((window) => window.objectId === 'moon')).toBe(false);
  });

  it('opens the weak objects only below −18°', () => {
    const samples = Array.from({ length: 2 }, (_, index) =>
      makeSample(index, { sunAltitudeDeg: -18.1 }),
    );
    const windows = windowsFor(samples);

    expect(windows.some((window) => window.objectId === 'uranus')).toBe(true);
    expect(windows.some((window) => window.objectId === 'neptune')).toBe(true);
  });

  it('tolerates one isolated gap without splitting the window', () => {
    const altitudes = [40, 40, 40, 5, 40, 40];
    const samples = altitudes.map((planetAltitudeDeg, index) =>
      makeSample(index, { planetAltitudeDeg }),
    );
    const jupiterWindows = windowsFor(samples).filter((window) => window.objectId === 'jupiter');

    expect(jupiterWindows).toHaveLength(1);
    expect(jupiterWindows[0].startMs).toBe(START_MS);
    expect(jupiterWindows[0].endMs).toBe(START_MS + 5 * STEP_MS);
    expect(jupiterWindows[0].peakAltitudeDeg).toBe(40);
  });

  it('splits the window after two consecutive gaps', () => {
    const altitudes = [40, 40, 5, 5, 40];
    const samples = altitudes.map((planetAltitudeDeg, index) =>
      makeSample(index, { planetAltitudeDeg }),
    );
    const jupiterWindows = windowsFor(samples).filter((window) => window.objectId === 'jupiter');

    expect(jupiterWindows).toHaveLength(2);
    expect(jupiterWindows[0].startMs).toBe(START_MS);
    expect(jupiterWindows[0].endMs).toBe(START_MS + STEP_MS);
    expect(jupiterWindows[1].startMs).toBe(START_MS + 4 * STEP_MS);
    expect(jupiterWindows[1].endMs).toBe(START_MS + 4 * STEP_MS);
  });

  it('keeps a poor cloud hour out of every window', () => {
    const samples = Array.from({ length: 4 }, (_, index) => makeSample(index));
    const windows = windowsFor(samples, {
      cloudByInstant: cloudLookup(['poor', 'poor', 'poor', 'poor']),
    });

    expect(windows).toEqual([]);
  });

  it('tolerates an isolated poor hour but reports it as the worst class', () => {
    const samples = Array.from({ length: 4 }, (_, index) => makeSample(index));
    const jupiterWindows = windowsFor(samples, {
      cloudByInstant: cloudLookup(['ideal', 'ideal', 'poor', 'ideal']),
    }).filter((window) => window.objectId === 'jupiter');

    expect(jupiterWindows).toHaveLength(1);
    expect(jupiterWindows[0].startMs).toBe(START_MS);
    expect(jupiterWindows[0].endMs).toBe(START_MS + 3 * STEP_MS);
    expect(jupiterWindows[0].worstCloudClass).toBe('poor');
  });

  it('reports unknown cloud only when no sample of the interval is known', () => {
    const samples = Array.from({ length: 2 }, (_, index) => makeSample(index));

    const allUnknown = windowsFor(samples, {
      cloudByInstant: cloudLookup(['unknown', 'unknown']),
    }).find((window) => window.objectId === 'jupiter');

    const oneKnown = windowsFor(samples, {
      cloudByInstant: cloudLookup(['unknown', 'ideal']),
    }).find((window) => window.objectId === 'jupiter');

    expect(allUnknown?.worstCloudClass).toBe('unknown');
    expect(oneKnown?.worstCloudClass).toBe('ideal');
  });

  it('requires 15° of elongation for Mercury and Venus', () => {
    const samples = Array.from({ length: 2 }, (_, index) => makeSample(index));
    const windows = windowsFor(samples, {
      elongationByObject: (objectId) => (objectId === 'mercury' ? 14.9 : 15),
    });

    expect(windows.some((window) => window.objectId === 'mercury')).toBe(false);
    expect(windows.some((window) => window.objectId === 'venus')).toBe(true);
  });

  it('treats a missing elongation as no window for Mercury and Venus', () => {
    const samples = Array.from({ length: 2 }, (_, index) => makeSample(index));
    const windows = windowsFor(samples, { elongationByObject: () => null });

    expect(windows.some((window) => window.objectId === 'mercury')).toBe(false);
    expect(windows.some((window) => window.objectId === 'venus')).toBe(false);
    expect(windows.some((window) => window.objectId === 'jupiter')).toBe(true);
  });

  describe('moonFree', () => {
    it('marks it only for Uranus and Neptune', () => {
      const samples = Array.from({ length: 2 }, (_, index) => makeSample(index));
      const windows = windowsFor(samples, { moonIlluminationPct: 50 });

      expect(windows.find((window) => window.objectId === 'uranus')?.moonFree).toBe(true);
      expect(windows.find((window) => window.objectId === 'neptune')?.moonFree).toBe(true);
      expect(windows.find((window) => window.objectId === 'jupiter')?.moonFree).toBe(false);
    });

    it('does not mark it when the Moon is above the horizon', () => {
      const samples = Array.from({ length: 2 }, (_, index) =>
        makeSample(index, { moonAltitudeDeg: 40 }),
      );
      const windows = windowsFor(samples, { moonIlluminationPct: 50 });
      const uranus = windows.find((window) => window.objectId === 'uranus');
      const moon = windows.find((window) => window.objectId === 'moon');

      expect(uranus?.moonFree).toBe(false);
      expect(moon?.moonFree).toBe(false);
    });

    it('marks it with a Moon illuminated below 10 %', () => {
      const samples = Array.from({ length: 2 }, (_, index) =>
        makeSample(index, { moonAltitudeDeg: 40 }),
      );
      const uranus = windowsFor(samples, { moonIlluminationPct: 9.9 }).find(
        (window) => window.objectId === 'uranus',
      );

      expect(uranus?.moonFree).toBe(true);
    });

    it('requires the Moon to stay below the horizon for the whole window', () => {
      const moonAltitudes = [-10, -10, 40];
      const samples = moonAltitudes.map((moonAltitudeDeg, index) =>
        makeSample(index, { moonAltitudeDeg }),
      );
      const uranus = windowsFor(samples, { moonIlluminationPct: 50 }).find(
        (window) => window.objectId === 'uranus',
      );

      expect(uranus?.moonFree).toBe(false);
    });
  });
});

describe('computeMoonInterferenceNotices', () => {
  it('warns below 10° of a Moon illuminated over 20 %', () => {
    const samples = Array.from({ length: 2 }, (_, index) =>
      makeSample(index, { moonAltitudeDeg: 47, moonAzimuthDeg: 180, planetAzimuthDeg: 180 }),
    );
    const notices = computeMoonInterferenceNotices({ samples, moonIlluminationPct: 50 });
    const venus = notices.find((notice) => notice.objectId === 'venus');

    expect(venus?.separationDeg).toBeCloseTo(7);
    expect(venus?.strong).toBe(false);
  });

  it('marks a strong warning below 5°', () => {
    const samples = Array.from({ length: 2 }, (_, index) =>
      makeSample(index, { moonAltitudeDeg: 42 }),
    );
    const notices = computeMoonInterferenceNotices({ samples, moonIlluminationPct: 50 });
    const venus = notices.find((notice) => notice.objectId === 'venus');

    expect(venus?.separationDeg).toBeCloseTo(2);
    expect(venus?.strong).toBe(true);
  });

  it('does not warn with a Moon illuminated at 20 % or less', () => {
    const samples = Array.from({ length: 2 }, (_, index) =>
      makeSample(index, { moonAltitudeDeg: 42 }),
    );

    expect(computeMoonInterferenceNotices({ samples, moonIlluminationPct: 20 })).toEqual([]);
  });

  it('does not warn at 10° or more', () => {
    const samples = Array.from({ length: 2 }, (_, index) =>
      makeSample(index, { moonAltitudeDeg: 52 }),
    );

    expect(computeMoonInterferenceNotices({ samples, moonIlluminationPct: 50 })).toEqual([]);
  });

  it('returns no notices without samples', () => {
    expect(computeMoonInterferenceNotices({ samples: [], moonIlluminationPct: 50 })).toEqual([]);
  });
});
