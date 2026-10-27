import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import { ApiError } from '@/lib/api/api-client';
import type { ICoordinates } from '@/modules/location/types/location.types';
import { fetchCurrent } from '@/modules/weather/services/current.service';
import { fetchForecast } from '@/modules/weather/services/forecast.service';
import type { IForecastResponse } from '@/modules/weather/types/weather.types';
import { getDailySun, indexHourly } from '@/modules/weather/utils/hourly';

const BOGOTA: ICoordinates = { latitude: 4.614, longitude: -74.085 };

const FORECAST_RESPONSE: IForecastResponse = {
  latitude: 4.61,
  longitude: -74.08,
  elevation: 2586,
  timezone: 'America/Bogota',
  hourly: {
    time: ['2026-10-19T18:00', '2026-10-19T19:00'],
    cloud_cover: [57, null],
    cloud_cover_low: [39, null],
    cloud_cover_mid: [0, null],
    cloud_cover_high: [30, null],
    visibility: [4080, null],
    temperature_2m: [11.9, null],
    relative_humidity_2m: [95, null],
    dew_point_2m: [11.1, null],
    wind_speed_10m: [8.1, null],
    wind_gusts_10m: [24.1, null],
    precipitation_probability: [3, null],
    precipitation: [0, null],
    is_day: [0, null],
  },
  daily: {
    time: ['2026-10-19', '2026-10-20'],
    sunrise: ['2026-10-19T05:45', null],
    sunset: ['2026-10-19T17:50', '2026-10-20T17:50'],
  },
};

const CURRENT_BLOCK = {
  time: '2026-10-19T15:30',
  interval: 900,
  temperature_2m: 18.3,
  relative_humidity_2m: 59,
  dew_point_2m: 10.2,
  cloud_cover: 100,
  wind_speed_10m: 7.7,
  wind_gusts_10m: 30.6,
  is_day: 1,
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function firstRequestUrl(fetchMock: Mock<typeof fetch>): URL {
  const input = fetchMock.mock.calls[0]?.[0];

  if (input === undefined) {
    throw new Error('fetch was not called.');
  }

  return new URL(String(input));
}

describe('fetchForecast', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requests hourly and daily data without elevation and with both day windows', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse(FORECAST_RESPONSE));
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchForecast(BOGOTA, { cacheMode: 'client' });

    expect(result).toEqual(FORECAST_RESPONSE);

    const url = firstRequestUrl(fetchMock);

    expect(url.origin + url.pathname).toBe('https://api.open-meteo.com/v1/forecast');
    expect(url.searchParams.get('latitude')).toBe('4.61');
    expect(url.searchParams.get('longitude')).toBe('-74.09');
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.get('past_days')).toBe('3');
    expect(url.searchParams.get('forecast_days')).toBe('16');
    expect(url.searchParams.get('daily')).toBe('sunrise,sunset');
    expect(url.searchParams.get('hourly')?.split(',')).toEqual([
      'cloud_cover',
      'cloud_cover_low',
      'cloud_cover_mid',
      'cloud_cover_high',
      'visibility',
      'temperature_2m',
      'relative_humidity_2m',
      'dew_point_2m',
      'wind_speed_10m',
      'wind_gusts_10m',
      'precipitation_probability',
      'precipitation',
      'is_day',
    ]);
    expect(url.searchParams.has('current')).toBe(false);
    expect(url.searchParams.has('elevation')).toBe(false);
  });

  it('throws ApiError with the Open-Meteo body on a 400', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('Invalid parameter: hourly=no_existe', { status: 400 }));
    vi.stubGlobal('fetch', fetchMock);

    const error: unknown = await fetchForecast(BOGOTA, { cacheMode: 'client' }).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);

    if (!(error instanceof ApiError)) {
      throw new Error('Expected an ApiError instance.');
    }

    expect(error.status).toBe(400);
    expect(error.body).toBe('Invalid parameter: hourly=no_existe');
  });

  it('throws ApiError with status 429 when Open-Meteo rate-limits the request', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('Minutely API request limit exceeded', { status: 429 }));
    vi.stubGlobal('fetch', fetchMock);

    const error: unknown = await fetchForecast(BOGOTA, { cacheMode: 'client' }).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);

    if (!(error instanceof ApiError)) {
      throw new Error('Expected an ApiError instance.');
    }

    expect(error.status).toBe(429);
    expect(error.body).toBe('Minutely API request limit exceeded');
  });

  it('throws ApiError with the status on a 5xx', async () => {
    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValue(new Response('Internal server error', { status: 503 }));
    vi.stubGlobal('fetch', fetchMock);

    const error: unknown = await fetchForecast(BOGOTA, { cacheMode: 'client' }).catch(
      (reason: unknown) => reason,
    );

    expect(error).toBeInstanceOf(ApiError);

    if (!(error instanceof ApiError)) {
      throw new Error('Expected an ApiError instance.');
    }

    expect(error.status).toBe(503);
    expect(error.body).toBe('Internal server error');
  });

  it('rejects a malformed successful response', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(jsonResponse({ timezone: 'UTC' }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchForecast(BOGOTA, { cacheMode: 'client' })).rejects.toThrow(
      'Invalid forecast response from Open-Meteo.',
    );
  });
});

describe('fetchCurrent', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('requests only the current block and returns it', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        latitude: 4.61,
        longitude: -74.08,
        elevation: 2586,
        timezone: 'America/Bogota',
        current: CURRENT_BLOCK,
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchCurrent(BOGOTA, { cacheMode: 'client' });

    expect(result).toEqual(CURRENT_BLOCK);

    const url = firstRequestUrl(fetchMock);

    expect(url.searchParams.get('current')?.split(',')).toEqual([
      'temperature_2m',
      'relative_humidity_2m',
      'dew_point_2m',
      'cloud_cover',
      'wind_speed_10m',
      'wind_gusts_10m',
      'is_day',
    ]);
    expect(url.searchParams.get('timezone')).toBe('auto');
    expect(url.searchParams.has('hourly')).toBe(false);
    expect(url.searchParams.has('daily')).toBe(false);
    expect(url.searchParams.has('elevation')).toBe(false);
  });

  it('keeps a missing current measurement as null', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      jsonResponse({
        timezone: 'America/Bogota',
        current: { ...CURRENT_BLOCK, cloud_cover: null },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const result = await fetchCurrent(BOGOTA, { cacheMode: 'client' });

    expect(result.cloud_cover).toBeNull();
  });
});

describe('indexHourly', () => {
  it('turns parallel arrays into rows and keeps missing values as null', () => {
    const rows = indexHourly(FORECAST_RESPONSE.hourly);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toEqual({
      time: '2026-10-19T18:00',
      cloudCover: 57,
      cloudCoverLow: 39,
      cloudCoverMid: 0,
      cloudCoverHigh: 30,
      visibility: 4080,
      temperature: 11.9,
      relativeHumidity: 95,
      dewPoint: 11.1,
      windSpeed: 8.1,
      windGusts: 24.1,
      precipitationProbability: 3,
      precipitation: 0,
      isDay: 0,
    });
    expect(rows[1]?.cloudCover).toBeNull();
    expect(rows[1]?.cloudCoverLow).toBeNull();
    expect(rows[1]?.isDay).toBeNull();
  });
});

describe('getDailySun', () => {
  it('pairs each date with its sunrise and sunset, keeping nulls', () => {
    expect(getDailySun(FORECAST_RESPONSE.daily)).toEqual([
      { date: '2026-10-19', sunrise: '2026-10-19T05:45', sunset: '2026-10-19T17:50' },
      { date: '2026-10-20', sunrise: null, sunset: '2026-10-20T17:50' },
    ]);
  });
});
