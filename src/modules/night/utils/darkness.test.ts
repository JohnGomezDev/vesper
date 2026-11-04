import { describe, expect, it } from 'vitest';
import { getDarknessLevel } from '@/modules/night/utils/darkness';

describe('getDarknessLevel', () => {
  it('uses the strict SPEC thresholds', () => {
    expect(getDarknessLevel(-5.99)).toBe('daylight');
    expect(getDarknessLevel(-6)).toBe('daylight');
    expect(getDarknessLevel(-6.01)).toBe('nautical-twilight');
    expect(getDarknessLevel(-12)).toBe('nautical-twilight');
    expect(getDarknessLevel(-12.01)).toBe('astronomical-twilight');
    expect(getDarknessLevel(-18)).toBe('astronomical-twilight');
    expect(getDarknessLevel(-18.01)).toBe('astronomical-night');
  });
});
