import { describe, expect, it } from 'vitest';
import type { IObservationWindow } from '@/modules/night/types/night.types';
import { pickBestWindow } from '@/modules/night/utils/best-window';

const HOUR_MS = 3_600_000;

function makeWindow(overrides: Partial<IObservationWindow> = {}): IObservationWindow {
  return {
    objectId: 'jupiter',
    startMs: 0,
    endMs: HOUR_MS,
    peakAltitudeDeg: 40,
    culminationMs: 0,
    culminationApproximate: true,
    worstCloudClass: 'ideal',
    moonFree: false,
    brightnessLabel: 'naked-eye',
    ...overrides,
  };
}

function bestOf(
  windows: IObservationWindow[],
  clouds: ReadonlyArray<number | null>,
): IObservationWindow | null {
  const cloudByWindow = new Map<IObservationWindow, number | null>();

  windows.forEach((window, index) => {
    cloudByWindow.set(window, clouds[index] ?? null);
  });

  return pickBestWindow(windows, (window) => cloudByWindow.get(window) ?? null);
}

describe('pickBestWindow', () => {
  it('returns null without windows', () => {
    expect(bestOf([], [])).toBeNull();
  });

  it('prefers the lowest cloud over altitude and duration', () => {
    const highAndLong = makeWindow({
      objectId: 'saturn',
      peakAltitudeDeg: 80,
      endMs: 8 * HOUR_MS,
    });
    const lowCloud = makeWindow({ objectId: 'venus', peakAltitudeDeg: 20, endMs: HOUR_MS });

    expect(bestOf([highAndLong, lowCloud], [30, 10])).toBe(lowCloud);
  });

  it('breaks a cloud tie with the highest peak altitude', () => {
    const lower = makeWindow({ objectId: 'mars', peakAltitudeDeg: 30, endMs: 8 * HOUR_MS });
    const higher = makeWindow({ objectId: 'jupiter', peakAltitudeDeg: 60, endMs: HOUR_MS });

    expect(bestOf([lower, higher], [10, 10])).toBe(higher);
  });

  it('breaks a cloud and altitude tie with the longest duration', () => {
    const shorter = makeWindow({ objectId: 'mars', startMs: 0, endMs: 2 * HOUR_MS });
    const longer = makeWindow({ objectId: 'jupiter', startMs: 0, endMs: 5 * HOUR_MS });

    expect(bestOf([shorter, longer], [10, 10])).toBe(longer);
  });

  it('keeps the first window on a complete tie', () => {
    const first = makeWindow({ objectId: 'mars' });
    const second = makeWindow({ objectId: 'jupiter' });

    expect(bestOf([first, second], [10, 10])).toBe(first);
  });

  it('treats a null cloud as the worst value', () => {
    const unknown = makeWindow({ objectId: 'saturn', peakAltitudeDeg: 80, endMs: 8 * HOUR_MS });
    const known = makeWindow({ objectId: 'venus', peakAltitudeDeg: 20, endMs: HOUR_MS });

    expect(bestOf([unknown, known], [null, 100])).toBe(known);
  });

  it('still returns a window when every cloud value is unknown', () => {
    const lower = makeWindow({ objectId: 'mars', peakAltitudeDeg: 30 });
    const higher = makeWindow({ objectId: 'jupiter', peakAltitudeDeg: 60 });

    expect(bestOf([lower, higher], [null, null])).toBe(higher);
  });

  it('does not mutate the input windows', () => {
    const windows = [makeWindow(), makeWindow({ objectId: 'venus' })];
    const snapshot = windows.map((window) => ({ ...window }));

    bestOf(windows, [20, 10]);

    expect(windows).toEqual(snapshot);
  });
});
