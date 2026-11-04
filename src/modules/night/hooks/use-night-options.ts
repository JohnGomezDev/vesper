'use client';

import { useMemo } from 'react';
import { createObserver } from '@/modules/astronomy/services/observer.service';
import { CURATED_SLUGS, getCuratedCity } from '@/modules/location/constants/curated-cities';
import type { ICoordinates, ILocation } from '@/modules/location/types/location.types';
import { parseSlug } from '@/modules/location/utils/slug';
import type { INightSummary, IUseNightOptionsInput } from '@/modules/night/types/night.types';
import { buildNightOptions } from '@/modules/night/utils/night-options';

/**
 * Summaries of the 18 selectable nights for the night selector (SPEC §8.2).
 *
 * It is memoized over the forecast and the resolved place zone; changing the
 * selected night or the altitude threshold never recomputes it.
 */
export function useNightOptions({
  slug,
  forecast,
  timeZone,
  todayLocal,
}: IUseNightOptionsInput): INightSummary[] {
  return useMemo(() => {
    if (forecast === undefined || timeZone === null || todayLocal === null) {
      return [];
    }

    const parsedSlug = parseSlug(slug, CURATED_SLUGS);

    if (parsedSlug.kind === 'invalid') {
      return [];
    }

    const curatedCity = parsedSlug.kind === 'curated' ? getCuratedCity(parsedSlug.slug) : null;
    const coordinates: ICoordinates =
      parsedSlug.kind === 'coordinates'
        ? parsedSlug.coordinates
        : (curatedCity?.coordinates ?? { latitude: 0, longitude: 0 });
    const location: ILocation = {
      slug,
      name: curatedCity?.name ?? slug,
      coordinates,
      elevationM: curatedCity?.elevationM ?? null,
      timeZone,
      isCurated: parsedSlug.kind === 'curated',
    };
    const observer = createObserver(location, forecast.elevation);

    return buildNightOptions({ observer, forecast, timeZone, todayLocal });
  }, [slug, forecast, timeZone, todayLocal]);
}
