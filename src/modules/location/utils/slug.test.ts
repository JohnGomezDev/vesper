import { describe, expect, it } from 'vitest';
import {
  buildCoordinatesSlug,
  buildCuratedSlug,
  parseSlug,
  slugifyLabel,
} from '@/modules/location/utils/slug';

const CURATED_SLUGS = new Set(['bogota', 'ushuaia', 'villa-de-leyva']);

describe('slugifyLabel', () => {
  it('lowercases and replaces spaces with hyphens', () => {
    expect(slugifyLabel('Villa de Leyva')).toBe('villa-de-leyva');
  });

  it('removes diacritics', () => {
    expect(slugifyLabel('Zipaquirá')).toBe('zipaquira');
    expect(slugifyLabel('Ñandú')).toBe('nandu');
  });

  it('replaces underscores and signs with hyphens', () => {
    expect(slugifyLabel('Lago_de Tota')).toBe('lago-de-tota');
    expect(slugifyLabel('  Bogotá, D.C.  ')).toBe('bogota-d-c');
  });

  it('trims edge hyphens and collapses consecutive separators', () => {
    expect(slugifyLabel('--a__b--')).toBe('a-b');
    expect(slugifyLabel('   ')).toBe('');
  });
});

describe('buildCuratedSlug', () => {
  it('normalizes a curated city name into its slug', () => {
    expect(buildCuratedSlug('Villa de Leyva')).toBe('villa-de-leyva');
    expect(buildCuratedSlug('Bogotá')).toBe('bogota');
  });
});

describe('buildCoordinatesSlug', () => {
  it('builds a coordinates-only slug when the label is null', () => {
    expect(buildCoordinatesSlug(null, { latitude: 4.61, longitude: -74.08 })).toBe('4.61_-74.08');
  });

  it('keeps the negative sign and two decimals in both coordinates', () => {
    expect(buildCoordinatesSlug('Ushuaia', { latitude: -54.8, longitude: -68.3 })).toBe(
      'ushuaia_-54.80_-68.30',
    );
  });

  it('slugifies the label and preserves its internal hyphens', () => {
    expect(buildCoordinatesSlug('Villa de Leyva', { latitude: 5.63, longitude: -73.52 })).toBe(
      'villa-de-leyva_5.63_-73.52',
    );
  });

  it('rounds coordinates before writing them', () => {
    expect(buildCoordinatesSlug('Bogotá', { latitude: 4.6149, longitude: -74.0849 })).toBe(
      'bogota_4.61_-74.08',
    );
  });

  it('normalizes negative zero in coordinates', () => {
    expect(buildCoordinatesSlug(null, { latitude: -0.001, longitude: 0.001 })).toBe('0.00_0.00');
  });

  it('omits the prefix when the label slugifies to an empty string', () => {
    expect(buildCoordinatesSlug('   ', { latitude: 4.61, longitude: -74.08 })).toBe('4.61_-74.08');
  });
});

describe('parseSlug', () => {
  it('returns a curated result on an exact curated match', () => {
    expect(parseSlug('bogota', CURATED_SLUGS)).toEqual({ kind: 'curated', slug: 'bogota' });
  });

  it('returns a coordinates result with a null label when there is no prefix', () => {
    expect(parseSlug('4.61_-74.08', CURATED_SLUGS)).toEqual({
      kind: 'coordinates',
      label: null,
      coordinates: { latitude: 4.61, longitude: -74.08 },
    });
  });

  it('parses southern and western coordinates with negative signs', () => {
    expect(parseSlug('ushuaia_-54.80_-68.30', CURATED_SLUGS)).toEqual({
      kind: 'coordinates',
      label: 'ushuaia',
      coordinates: { latitude: -54.8, longitude: -68.3 },
    });
  });

  it('preserves hyphens inside the label', () => {
    expect(parseSlug('villa-de-leyva_5.63_-73.52', CURATED_SLUGS)).toEqual({
      kind: 'coordinates',
      label: 'villa-de-leyva',
      coordinates: { latitude: 5.63, longitude: -73.52 },
    });
  });

  it('does not validate the label against the curated list', () => {
    expect(parseSlug('bogota_4.61_-74.08', CURATED_SLUGS)).toEqual({
      kind: 'coordinates',
      label: 'bogota',
      coordinates: { latitude: 4.61, longitude: -74.08 },
    });
  });

  it('joins every part before the coordinates as the label', () => {
    expect(parseSlug('lago_de_tota_5.00_-73.00', CURATED_SLUGS)).toEqual({
      kind: 'coordinates',
      label: 'lago_de_tota',
      coordinates: { latitude: 5, longitude: -73 },
    });
  });

  it('accepts the inclusive coordinate boundaries', () => {
    expect(parseSlug('-90.00_-180.00', CURATED_SLUGS)).toEqual({
      kind: 'coordinates',
      label: null,
      coordinates: { latitude: -90, longitude: -180 },
    });
    expect(parseSlug('90.00_180.00', CURATED_SLUGS)).toEqual({
      kind: 'coordinates',
      label: null,
      coordinates: { latitude: 90, longitude: 180 },
    });
  });

  it('returns invalid for malformed or out-of-range slugs', () => {
    const invalidSlugs = [
      '',
      'zipaquira',
      '-74.08',
      '4.6_-74.08',
      '4.610_-74.08',
      '4_-74.08',
      '.61_-74.08',
      '+4.61_-74.08',
      '4.61_+74.08',
      '91.00_0.00',
      '-91.00_0.00',
      '0.00_180.01',
      '0.00_-180.01',
      '4.61_-74.08_',
      '4.61_-74.08_extra',
    ];

    for (const slug of invalidSlugs) {
      expect(parseSlug(slug, CURATED_SLUGS)).toEqual({ kind: 'invalid' });
    }
  });
});
