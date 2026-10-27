import { describe, expect, it } from 'vitest';
import { classifyCloudCover, computeCloudCover } from '@/modules/night/utils/cloud';

describe('computeCloudCover', () => {
  it('returns the weighted value when every layer exists', () => {
    expect(computeCloudCover(10, 10, 10)).toBe(10);
    expect(computeCloudCover(0, 0, 0)).toBe(0);
    expect(computeCloudCover(100, 100, 100)).toBe(100);
    expect(computeCloudCover(50, 50, 50)).toBe(50);
  });

  it('applies the 0.50/0.35/0.15 weights', () => {
    expect(computeCloudCover(11, 0, 0)).toBe(5.5);
    expect(computeCloudCover(0, 20, 0)).toBe(7);
    expect(computeCloudCover(0, 0, 40)).toBe(6);
  });

  it('rounds to one decimal without losing the half value', () => {
    expect(computeCloudCover(37, 12, 55)).toBe(31);
    expect(computeCloudCover(1, 1, 1)).toBe(1);
    expect(computeCloudCover(11, 11, 11)).toBe(11);
  });

  it('returns null when any layer is missing', () => {
    expect(computeCloudCover(null, 0, 0)).toBeNull();
    expect(computeCloudCover(0, null, 0)).toBeNull();
    expect(computeCloudCover(0, 0, null)).toBeNull();
    expect(computeCloudCover(null, null, null)).toBeNull();
  });
});

describe('classifyCloudCover', () => {
  it.each([
    { value: 0, expected: 'ideal' },
    { value: 10, expected: 'ideal' },
    { value: 10.1, expected: 'good' },
    { value: 20, expected: 'good' },
    { value: 20.1, expected: 'acceptable' },
    { value: 30, expected: 'acceptable' },
    { value: 30.1, expected: 'fair' },
    { value: 40, expected: 'fair' },
    { value: 40.1, expected: 'poor' },
    { value: 100, expected: 'poor' },
  ] as const)('classifies $value as $expected', ({ value, expected }) => {
    expect(classifyCloudCover(value)).toBe(expected);
  });
});
