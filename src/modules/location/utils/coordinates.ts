import type { ICoordinates } from '@/modules/location/types/location.types';

const COORDINATE_SCALE = 100;
const SIGNIFICANT_DIGITS = 15;

export function roundCoordinate(value: number): number {
  const sign = Math.sign(value);
  const scaled = Number((Math.abs(value) * COORDINATE_SCALE).toPrecision(SIGNIFICANT_DIGITS));
  const rounded = (sign * Math.round(scaled)) / COORDINATE_SCALE;

  return rounded === 0 ? 0 : rounded;
}

export function roundCoordinates(coordinates: ICoordinates): ICoordinates {
  return {
    latitude: roundCoordinate(coordinates.latitude),
    longitude: roundCoordinate(coordinates.longitude),
  };
}

export function isValidLatitude(value: number): boolean {
  return value >= -90 && value <= 90;
}

export function isValidLongitude(value: number): boolean {
  return value >= -180 && value <= 180;
}
