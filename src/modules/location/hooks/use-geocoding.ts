'use client';

import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { shouldRetry } from '@/lib/api/retry';
import { QUERY_GC_TIME_MS } from '@/lib/constants/query.constants';
import {
  GEOCODING_STALE_TIME_MS,
  MIN_QUERY_LENGTH,
} from '@/modules/location/constants/location.constants';
import { locationKeys } from '@/modules/location/constants/location.query-keys';
import { searchLocations } from '@/modules/location/services/geocoding.service';
import type { IGeocodingResult } from '@/modules/location/types/location.types';
import { normalizeGeocodingQuery } from '@/modules/location/utils/geocoding';

export function useGeocoding(query: string | null): UseQueryResult<IGeocodingResult[], Error> {
  const normalizedQuery = normalizeGeocodingQuery(query);

  return useQuery<IGeocodingResult[], Error>({
    queryKey: locationKeys.geocoding(normalizedQuery),
    queryFn: ({ signal }) => searchLocations(normalizedQuery, { signal, cacheMode: 'client' }),
    enabled: normalizedQuery.length >= MIN_QUERY_LENGTH,
    staleTime: GEOCODING_STALE_TIME_MS,
    gcTime: QUERY_GC_TIME_MS,
    retry: shouldRetry,
  });
}
