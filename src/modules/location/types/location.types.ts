export interface ICoordinates {
  latitude: number;
  longitude: number;
}

export interface ILocation {
  slug: string;
  name: string;
  coordinates: ICoordinates;
  elevationM: number | null;
  timeZone: string;
  isCurated: boolean;
}

/**
 * One geocoding result. `country`, the administrative regions and `timezone`
 * can be absent in isolated records (SPEC §5.2), so they stay optional.
 */
export interface IGeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number | null;
  timezone?: string | null;
  country?: string | null;
  admin1?: string | null;
  admin2?: string | null;
  admin3?: string | null;
}

/**
 * Geocoding response. `results` is absent when the name is too short or has no
 * matches, so callers must fall back to an empty array.
 */
export interface IGeocodingResponse {
  generationtime_ms?: number;
  results?: IGeocodingResult[];
}

export type TSlugParseResult =
  | { kind: 'curated'; slug: string }
  | { kind: 'coordinates'; label: string | null; coordinates: ICoordinates }
  | { kind: 'invalid' };

export type TDateParamResult =
  | { kind: 'valid'; date: string }
  | { kind: 'missing' }
  | { kind: 'invalid' }
  | { kind: 'out-of-range' };
