import { describe, expect, it } from 'vitest';
import { readApproximateLocation } from '@/modules/location/utils/ip-location';

function headers(latitude: string | null, longitude: string | null): Headers {
  const headerList = new Headers();

  if (latitude !== null) {
    headerList.set('x-vercel-ip-latitude', latitude);
  }

  if (longitude !== null) {
    headerList.set('x-vercel-ip-longitude', longitude);
  }

  return headerList;
}

describe('readApproximateLocation', () => {
  it('returns the rounded coordinates when both headers are valid', () => {
    expect(readApproximateLocation(headers('4.615', '-74.085'))).toEqual({
      latitude: 4.62,
      longitude: -74.09,
    });
  });

  it('keeps the coordinate sign', () => {
    expect(readApproximateLocation(headers('-54.804', '-68.296'))).toEqual({
      latitude: -54.8,
      longitude: -68.3,
    });
  });

  it('returns null when the latitude header is missing', () => {
    expect(readApproximateLocation(headers(null, '-74.08'))).toBeNull();
  });

  it('returns null when the longitude header is missing', () => {
    expect(readApproximateLocation(headers('4.61', null))).toBeNull();
  });

  it('returns null when both headers are missing', () => {
    expect(readApproximateLocation(new Headers())).toBeNull();
  });

  it('returns null with a non-numeric latitude', () => {
    expect(readApproximateLocation(headers('norte', '-74.08'))).toBeNull();
  });

  it('returns null with a non-numeric longitude', () => {
    expect(readApproximateLocation(headers('4.61', 'oeste'))).toBeNull();
  });

  it('returns null with an empty header', () => {
    expect(readApproximateLocation(headers('', '-74.08'))).toBeNull();
  });

  it('returns null when the latitude is out of range', () => {
    expect(readApproximateLocation(headers('91.00', '-74.08'))).toBeNull();
    expect(readApproximateLocation(headers('-91.00', '-74.08'))).toBeNull();
  });

  it('returns null when the longitude is out of range', () => {
    expect(readApproximateLocation(headers('4.61', '180.01'))).toBeNull();
    expect(readApproximateLocation(headers('4.61', '-180.01'))).toBeNull();
  });

  it('accepts the inclusive coordinate boundaries', () => {
    expect(readApproximateLocation(headers('-90', '-180'))).toEqual({
      latitude: -90,
      longitude: -180,
    });
    expect(readApproximateLocation(headers('90', '180'))).toEqual({
      latitude: 90,
      longitude: 180,
    });
  });
});
