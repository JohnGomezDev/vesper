import type { ICuratedCity } from '@/modules/location/types/location.types';

/**
 * Fixed curated list (SPEC §9).
 *
 * Bogotá, Guatavita and Villa de Leyva come from the Open-Meteo geocoding
 * response. The three non-geocoded entries were added after the owner
 * authorised researching their data (2026-11-03). Their centres come from
 * OpenStreetMap (ODbL) and were cross-checked with Wikipedia:
 *
 * - Desierto de la Tatacoa: OSM way 62753354, 3.25, -75.14, ~430 m.
 * - Desierto de Checua: OSM way 1560244120, 5.15, -73.86, ~2730 m.
 * - Lago de Tota: OSM relation 1764506, 5.54, -72.93, 3015 m.
 *
 * `elevationM` is a reference; at runtime the forecast `elevation` takes
 * precedence (SPEC §5.4). `description` is the owner's own «why observe here»
 * text and stays empty until delivered; `generateMetadata` uses a derived
 * fallback while it is empty.
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
  {
    slug: 'desierto-de-la-tatacoa',
    name: 'Desierto de la Tatacoa',
    coordinates: { latitude: 3.25, longitude: -75.14 },
    elevationM: 430,
    timeZone: 'America/Bogota',
    description: '',
    isCurated: true,
  },
  {
    slug: 'desierto-de-checua',
    name: 'Desierto de Checua',
    coordinates: { latitude: 5.15, longitude: -73.86 },
    elevationM: 2730,
    timeZone: 'America/Bogota',
    description: '',
    isCurated: true,
  },
  {
    slug: 'lago-de-tota',
    name: 'Lago de Tota',
    coordinates: { latitude: 5.54, longitude: -72.93 },
    elevationM: 3015,
    timeZone: 'America/Bogota',
    description: '',
    isCurated: true,
  },
];

export const CURATED_SLUGS: ReadonlySet<string> = new Set(CURATED_CITIES.map(({ slug }) => slug));

export function getCuratedCity(slug: string): ICuratedCity | null {
  return CURATED_CITIES.find((city) => city.slug === slug) ?? null;
}
