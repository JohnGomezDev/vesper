import { describe, expect, it } from 'vitest';
import { COORDINATE_ROUNDING_CASES } from '@/modules/location/utils/__fixtures__/domain-fixtures';
import {
  isValidLatitude,
  isValidLongitude,
  roundCoordinate,
  roundCoordinates,
} from '@/modules/location/utils/coordinates';

describe('roundCoordinate edge-case matrix', () => {
  it.each(COORDINATE_ROUNDING_CASES)('rounds $input to $expected', ({ input, expected }) => {
    const rounded = roundCoordinate(input);

    expect(rounded).toBe(expected);
    expect(Object.is(rounded, expected)).toBe(true);
  });
});

describe('roundCoordinate', () => {
  it('rounds to two decimals', () => {
    expect(roundCoordinate(4.614)).toBe(4.61);
    expect(roundCoordinate(4.616)).toBe(4.62);
    expect(roundCoordinate(-54.804)).toBe(-54.8);
    expect(roundCoordinate(-68.296)).toBe(-68.3);
  });

  it('rounds halfway values away from zero', () => {
    expect(roundCoordinate(1.005)).toBe(1.01);
    expect(roundCoordinate(-1.005)).toBe(-1.01);
    expect(roundCoordinate(4.615)).toBe(4.62);
    expect(roundCoordinate(-74.085)).toBe(-74.09);
  });

  it('normalizes negative zero to zero', () => {
    expect(roundCoordinate(-0.001)).toBe(0);
    expect(roundCoordinate(-0)).toBe(0);
    expect(Object.is(roundCoordinate(-0.001), -0)).toBe(false);
    expect(Object.is(roundCoordinate(-0), -0)).toBe(false);
  });
});

describe('roundCoordinates', () => {
  it('rounds latitude and longitude independently', () => {
    expect(roundCoordinates({ latitude: -54.804, longitude: -68.296 })).toEqual({
      latitude: -54.8,
      longitude: -68.3,
    });
  });

  it('normalizes negative zero in both axes', () => {
    expect(roundCoordinates({ latitude: -0.001, longitude: -0.004 })).toEqual({
      latitude: 0,
      longitude: 0,
    });
  });
});

describe('isValidLatitude', () => {
  it('accepts values within the inclusive range', () => {
    expect(isValidLatitude(-90)).toBe(true);
    expect(isValidLatitude(0)).toBe(true);
    expect(isValidLatitude(90)).toBe(true);
  });

  it('rejects values outside the range', () => {
    expect(isValidLatitude(-90.01)).toBe(false);
    expect(isValidLatitude(90.01)).toBe(false);
    expect(isValidLatitude(Number.NaN)).toBe(false);
    expect(isValidLatitude(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidLatitude(Number.NEGATIVE_INFINITY)).toBe(false);
  });
});

describe('isValidLongitude', () => {
  it('accepts values within the inclusive range', () => {
    expect(isValidLongitude(-180)).toBe(true);
    expect(isValidLongitude(0)).toBe(true);
    expect(isValidLongitude(180)).toBe(true);
  });

  it('rejects values outside the range', () => {
    expect(isValidLongitude(-180.01)).toBe(false);
    expect(isValidLongitude(180.01)).toBe(false);
    expect(isValidLongitude(Number.NaN)).toBe(false);
    expect(isValidLongitude(Number.POSITIVE_INFINITY)).toBe(false);
    expect(isValidLongitude(Number.NEGATIVE_INFINITY)).toBe(false);
  });
});
