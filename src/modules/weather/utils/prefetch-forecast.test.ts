import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { weatherKeys } from '@/modules/weather/constants/weather.query-keys';
import { useForecast } from '@/modules/weather/hooks/use-forecast';
import type { IForecastResponse } from '@/modules/weather/types/weather.types';
import { prefetchForecast } from '@/modules/weather/utils/prefetch-forecast';

const { fetchForecastMock, useQueryMock } = vi.hoisted(() => ({
  fetchForecastMock: vi.fn(),
  useQueryMock: vi.fn(),
}));

vi.mock('@/modules/weather/services/forecast.service', () => ({
  fetchForecast: fetchForecastMock,
}));

vi.mock('@tanstack/react-query', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@tanstack/react-query')>();

  return { ...actual, useQuery: useQueryMock };
});

const FORECAST: IForecastResponse = {
  latitude: 4.61,
  longitude: -74.09,
  elevation: 2586,
  timezone: 'America/Bogota',
  hourly: {
    time: ['2026-10-19T18:00'],
    cloud_cover: [57],
    cloud_cover_low: [39],
    cloud_cover_mid: [0],
    cloud_cover_high: [30],
    visibility: [4080],
    temperature_2m: [11.9],
    relative_humidity_2m: [95],
    dew_point_2m: [11.1],
    wind_speed_10m: [8.1],
    wind_gusts_10m: [24.1],
    precipitation_probability: [3],
    precipitation: [0],
    is_day: [0],
  },
  daily: {
    time: ['2026-10-19'],
    sunrise: ['2026-10-19T05:45'],
    sunset: ['2026-10-19T17:50'],
  },
};

const COORDINATES = { latitude: 4.614, longitude: -74.085 };
const ROUNDED_COORDINATES = { latitude: 4.61, longitude: -74.09 };
const FORECAST_KEY = weatherKeys.forecast(
  ROUNDED_COORDINATES.latitude,
  ROUNDED_COORDINATES.longitude,
);

beforeEach(() => {
  fetchForecastMock.mockReset();
  useQueryMock.mockReset();
});

describe('prefetchForecast', () => {
  it('prefetches with the canonical key, client cache mode and one-hour freshness', async () => {
    fetchForecastMock.mockResolvedValue(FORECAST);

    const queryClient = new QueryClient();
    const querySpy = vi.spyOn(queryClient, 'query');
    await prefetchForecast(queryClient, COORDINATES);

    expect(fetchForecastMock).toHaveBeenCalledWith(ROUNDED_COORDINATES, {
      cacheMode: 'client',
    });
    expect(queryClient.getQueryData(FORECAST_KEY)).toEqual(FORECAST);
    expect(querySpy).toHaveBeenCalledWith(
      expect.objectContaining({ queryKey: FORECAST_KEY, staleTime: 3_600_000 }),
    );
  });

  it('swallows prefetch failures so navigation is never blocked', async () => {
    fetchForecastMock.mockRejectedValue(new Error('network down'));

    const queryClient = new QueryClient();

    await expect(prefetchForecast(queryClient, COORDINATES)).resolves.toBeUndefined();
    expect(queryClient.getQueryData(FORECAST_KEY)).toBeUndefined();
  });

  it('does not request a forecast that is already fresh in the cache', async () => {
    fetchForecastMock.mockResolvedValue(FORECAST);

    const queryClient = new QueryClient();
    await prefetchForecast(queryClient, COORDINATES);
    await prefetchForecast(queryClient, COORDINATES);

    expect(fetchForecastMock).toHaveBeenCalledTimes(1);
  });
});

describe('useForecast', () => {
  it('passes initialData and its real fetch time to TanStack Query', () => {
    useQueryMock.mockReturnValue({});
    const fetchedAt = 1_700_000_000_000;

    useForecast(COORDINATES, { initialData: { forecast: FORECAST, fetchedAt } });

    const options: unknown = useQueryMock.mock.calls[0]?.[0];

    expect(options).toMatchObject({
      queryKey: FORECAST_KEY,
      initialData: FORECAST,
      initialDataUpdatedAt: fetchedAt,
      staleTime: 3_600_000,
      gcTime: 86_400_000,
    });
  });

  it('works without initial data', () => {
    useQueryMock.mockReturnValue({});

    expect(() => useForecast(COORDINATES)).not.toThrow();

    const options: unknown = useQueryMock.mock.calls[0]?.[0];

    expect(options).toMatchObject({
      queryKey: FORECAST_KEY,
      initialData: undefined,
      initialDataUpdatedAt: undefined,
      staleTime: 3_600_000,
    });
  });

  it('marks a two-hour-old initial forecast as stale and refetches on mount', async () => {
    const queryClient = new QueryClient();
    const queryFn = vi.fn<() => Promise<IForecastResponse>>().mockResolvedValue(FORECAST);
    const fetchedAt = Date.now() - 2 * 3_600_000;
    const observer = new QueryObserver(queryClient, {
      queryKey: FORECAST_KEY,
      queryFn,
      staleTime: 3_600_000,
      gcTime: 86_400_000,
      initialData: FORECAST,
      initialDataUpdatedAt: fetchedAt,
      retry: false,
    });

    expect(observer.getCurrentResult().isStale).toBe(true);

    const unsubscribe = observer.subscribe(() => {});

    await vi.waitFor(() => expect(queryFn).toHaveBeenCalledTimes(1));

    unsubscribe();
  });
});
