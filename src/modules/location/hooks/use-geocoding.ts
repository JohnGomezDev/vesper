'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { shouldRetry } from '@/lib/api/retry';
import { locationKeys } from '@/modules/location/constants/location.query-keys';
import { searchLocations } from '@/modules/location/services/geocoding.service';
import type { IGeocodingResult } from '@/modules/location/types/location.types';
import { MIN_QUERY_LENGTH, normalizeGeocodingQuery } from '@/modules/location/utils/geocoding';

const GEOCODING_SESSION_STALE_TIME_MS = Infinity;
const GC_TIME_MS = 86_400_000;

export function useGeocoding(query: string | null): UseQueryResult<IGeocodingResult[], Error> {
  const normalizedQuery = normalizeGeocodingQuery(query);

  return useQuery<IGeocodingResult[], Error>({
    queryKey: locationKeys.geocoding(normalizedQuery),
    queryFn: ({ signal }) => searchLocations(normalizedQuery, { signal, cacheMode: 'client' }),
    enabled: normalizedQuery.length >= MIN_QUERY_LENGTH,
    staleTime: GEOCODING_SESSION_STALE_TIME_MS,
    gcTime: GC_TIME_MS,
    retry: shouldRetry,
  });
}
