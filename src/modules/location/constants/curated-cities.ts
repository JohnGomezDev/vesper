import type { ICuratedCity } from '@/modules/location/types/location.types';

/**
 * Fixed curated list (SPEC §9).
 *
 * Coordinates, elevation and time zone come from the Open-Meteo geocoding
 * response for each Colombian locality. Tatacoa, Checua and Lago de Tota are
 * intentionally absent: they are not indexed by the geocoding API and the
 * owner's data is still pending, so their coordinates must not be invented.
 *
 * `description` is the owner's own «why observe here» text. It stays empty
 * until the owner delivers it, and `generateMetadata` omits the description in
 * that case.
 */
export const CURATED_CITIES: readonly ICuratedCity[] = [
  {
    slug: 'bogota',
    name: 'Bogotá',
    coordinates: { latitude: 4.61, longitude: -74.08 },
    elevationM: 2582,
    timeZone: 'America/Bogota',
    description: '',
    isCurated: true,
  },
  {
    slug: 'guatavita',
    name: 'Guatavita',
    coordinates: { latitude: 4.94, longitude: -73.83 },
    elevationM: 2700,
    timeZone: 'America/Bogota',
    description: '',
    isCurated: true,
  },
  {
    slug: 'villa-de-leyva',
    name: 'Villa de Leyva',
    coordinates: { latitude: 5.63, longitude: -73.52 },
    elevationM: 2139,
    timeZone: 'America/Bogota',
    description: '',
    isCurated: true,
  },
];

export const CURATED_SLUGS: ReadonlySet<string> = new Set(CURATED_CITIES.map(({ slug }) => slug));

export function getCuratedCity(slug: string): ICuratedCity | null {
  return CURATED_CITIES.find((city) => city.slug === slug) ?? null;
}
