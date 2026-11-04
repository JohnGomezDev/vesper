import { cacheLife } from 'next/cache';
import type { ICoordinates } from '@/modules/location/types/location.types';
import { fetchForecast } from '@/modules/weather/services/forecast.service';
import type { IInitialForecast } from '@/modules/weather/types/weather.types';

/**
 * Server forecast for a curated city, cached for one hour. `cacheComponents`
 * does not support `export const revalidate`; the 3600 s lifetime is declared
 * with `cacheLife('hours')`, whose `revalidate` is exactly one hour (SPEC §7.4,
 * T019 authorized adjustment). The real fetch instant travels with the data so
 * the client can align TanStack Query with `initialDataUpdatedAt`.
 */
export async function fetchInitialForecast(coordinates: ICoordinates): Promise<IInitialForecast> {
  'use cache';
  cacheLife('hours');

  const forecast = await fetchForecast(coordinates, { cacheMode: 'server' });

  return { forecast, fetchedAt: Date.now() };
}
