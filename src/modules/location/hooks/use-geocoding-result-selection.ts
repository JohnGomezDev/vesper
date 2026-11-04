'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes.constants';
import { resetSearch } from '@/modules/location/hooks/use-search-reset';
import type { IGeocodingResult } from '@/modules/location/types/location.types';
import { roundCoordinates } from '@/modules/location/utils/coordinates';
import { formatGeocodingResultName } from '@/modules/location/utils/geocoding';
import { rememberLocationName } from '@/modules/location/utils/name-cache';
import { buildCoordinatesSlug } from '@/modules/location/utils/slug';
import { prefetchForecast } from '@/modules/weather/utils/prefetch-forecast';

/**
 * Side effects of choosing a geocoding result (SPEC §8.1): remember its display
 * name, warm the forecast cache, clear every search form and navigate to the
 * coordinate slug.
 */
export function useGeocodingResultSelection(): (result: IGeocodingResult) => void {
  const router = useRouter();
  const queryClient = useQueryClient();

  return (result: IGeocodingResult): void => {
    const coordinates = roundCoordinates({
      latitude: result.latitude,
      longitude: result.longitude,
    });

    resetSearch();
    rememberLocationName(coordinates, formatGeocodingResultName(result));
    void prefetchForecast(queryClient, coordinates);
    router.push(ROUTES.clima.detail(buildCoordinatesSlug(result.name, coordinates)));
  };
}
