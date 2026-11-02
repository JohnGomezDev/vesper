import { describe, expect, it } from 'vitest';
import {
  formatDegrees,
  formatDuration,
  formatHourLabel,
  formatNightDateLabel,
} from '@/modules/night/utils/format';

describe('night format helpers', () => {
  it('shows the local hour of an Open-Meteo row', () => {
    expect(formatHourLabel('2026-10-19T18:00')).toBe('18:00');
    expect(formatHourLabel('2026-10-20T00:00')).toBe('00:00');
  });

  it('formats degrees and missing degrees', () => {
    expect(formatDegrees(62.4)).toBe('62°');
    expect(formatDegrees(-8.7)).toBe('-9°');
    expect(formatDegrees(null)).toBe('—');
  });

  it('formats a local date without using the device zone', () => {
    expect(formatNightDateLabel('2026-10-19')).toContain('19');
    expect(formatNightDateLabel('no-date')).toBe('no-date');
  });

  it('formats window durations', () => {
    expect(formatDuration(20 * 60_000)).toBe('20 min');
    expect(formatDuration(2 * 3_600_000)).toBe('2 h');
    expect(formatDuration(4 * 3_600_000 + 2 * 60_000)).toBe('4 h 2 min');
  });
});
