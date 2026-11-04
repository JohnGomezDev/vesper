import type { IObservationWindow } from '@/modules/night/types/night.types';

/**
 * Best window of the night (SPEC §8.2): lowest `nube`, then highest peak
 * altitude, then longest duration.
 *
 * A `null` cloud value is treated as the worst possible one; a tie keeps the
 * first window so the result is deterministic. Returns `null` without windows.
 */
export function pickBestWindow(
  windows: IObservationWindow[],
  cloudByWindow: (window: IObservationWindow) => number | null,
): IObservationWindow | null {
  let best: IObservationWindow | null = null;
  let bestCloud = Number.POSITIVE_INFINITY;
  let bestAltitude = Number.NEGATIVE_INFINITY;
  let bestDuration = Number.NEGATIVE_INFINITY;

  for (const window of windows) {
    const cloud = cloudByWindow(window);
    const cloudKey = cloud === null ? Number.POSITIVE_INFINITY : cloud;
    const altitude = window.peakAltitudeDeg;
    const duration = window.endMs - window.startMs;

    const isBetter =
      best === null ||
      cloudKey < bestCloud ||
      (cloudKey === bestCloud && altitude > bestAltitude) ||
      (cloudKey === bestCloud && altitude === bestAltitude && duration > bestDuration);

    if (isBetter) {
      best = window;
      bestCloud = cloudKey;
      bestAltitude = altitude;
      bestDuration = duration;
    }
  }

  return best;
}
