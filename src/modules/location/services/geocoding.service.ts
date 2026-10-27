import { fetchOpenMeteo } from '@/lib/api/api-client';
import type { IFetchOptions } from '@/lib/api/api-client';
import type { IGeocodingResult } from '@/modules/location/types/location.types';
import {
  buildGeocodingUrl,
  isGeocodingResponse,
  MIN_QUERY_LENGTH,
  normalizeGeocodingQuery,
} from '@/modules/location/utils/geocoding';

export async function searchLocations(
  query: string,
  options: IFetchOptions,
): Promise<IGeocodingResult[]> {
  const trimmedQuery = normalizeGeocodingQuery(query);

  if (trimmedQuery.length < MIN_QUERY_LENGTH) {
    throw new Error('Geocoding queries must contain at least 3 characters.');
  }

  const data = await fetchOpenMeteo<unknown>(buildGeocodingUrl(trimmedQuery), options);

  if (!isGeocodingResponse(data)) {
    throw new Error('Invalid geocoding response from Open-Meteo.');
  }

  return data.results ?? [];
}
