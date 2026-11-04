import { describe, expect, it } from 'vitest';
import { locationKeys } from '@/modules/location/constants/location.query-keys';
import { weatherKeys } from '@/modules/weather/constants/weather.query-keys';

describe('weatherKeys', () => {
  it('uses the exact forecast and current keys', () => {
    expect(weatherKeys.forecast(4.61, -74.08)).toEqual(['forecast', 4.61, -74.08]);
    expect(weatherKeys.current(4.61, -74.08)).toEqual(['current', 4.61, -74.08]);
  });

  it('does not share a key between forecast and current', () => {
    expect(weatherKeys.current(4.61, -74.08)).not.toEqual(weatherKeys.forecast(4.61, -74.08));
  });
});

describe('locationKeys', () => {
  it('uses the exact geocoding key', () => {
    expect(locationKeys.geocoding('bogota')).toEqual(['geocoding', 'bogota']);
  });
});
