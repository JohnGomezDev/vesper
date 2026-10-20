import type { ICoordinates, TSlugParseResult } from '@/modules/location/types/location.types';
import {
  isValidLatitude,
  isValidLongitude,
  roundCoordinates,
} from '@/modules/location/utils/coordinates';

const COORDINATE_PATTERN = /^-?\d+\.\d{2}$/;
const DIACRITICS_PATTERN = /[\u0300-\u036f]/g;
const NON_SLUG_CHARACTERS_PATTERN = /[^a-z0-9]+/g;
const EDGE_HYPHENS_PATTERN = /^-+|-+$/g;

export function slugifyLabel(label: string): string {
  return label
    .normalize('NFD')
    .replace(DIACRITICS_PATTERN, '')
    .toLowerCase()
    .replace(NON_SLUG_CHARACTERS_PATTERN, '-')
    .replace(EDGE_HYPHENS_PATTERN, '');
}

export function buildCuratedSlug(slug: string): string {
  return slugifyLabel(slug);
}

export function buildCoordinatesSlug(label: string | null, coordinates: ICoordinates): string {
  const rounded = roundCoordinates(coordinates);
  const coordinatePart = `${rounded.latitude.toFixed(2)}_${rounded.longitude.toFixed(2)}`;
  const labelPart = label === null ? '' : slugifyLabel(label);

  return labelPart === '' ? coordinatePart : `${labelPart}_${coordinatePart}`;
}

export function parseSlug(slug: string, curatedSlugs: ReadonlySet<string>): TSlugParseResult {
  if (curatedSlugs.has(slug)) {
    return { kind: 'curated', slug };
  }

  const parts = slug.split('_');

  if (parts.length < 2) {
    return { kind: 'invalid' };
  }

  const latitudePart = parts[parts.length - 2];
  const longitudePart = parts[parts.length - 1];

  if (!COORDINATE_PATTERN.test(latitudePart) || !COORDINATE_PATTERN.test(longitudePart)) {
    return { kind: 'invalid' };
  }

  const latitude = Number.parseFloat(latitudePart);
  const longitude = Number.parseFloat(longitudePart);

  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
    return { kind: 'invalid' };
  }

  const labelPart = parts.slice(0, -2).join('_');

  return {
    kind: 'coordinates',
    label: labelPart === '' ? null : labelPart,
    coordinates: { latitude, longitude },
  };
}
