import type { UseFormRegisterReturn, UseFormReturn } from 'react-hook-form';

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
 * One entry of the fixed curated list (SPEC §9). `description` is the owner's
 * own «why observe here» text; it stays empty until the owner delivers it.
 */
export interface ICuratedCity {
  slug: string;
  name: string;
  coordinates: ICoordinates;
  elevationM: number | null;
  timeZone: string;
  description: string;
  isCurated: true;
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

export interface ISearchFormValues {
  query: string;
}

export interface IUseSearchFormResult {
  form: UseFormReturn<ISearchFormValues>;
  registerQuery: UseFormRegisterReturn<'query'>;
  results: IGeocodingResult[];
  isSearching: boolean;
  isError: boolean;
  hasSearched: boolean;
  isResultsOpen: boolean;
  closeResults: () => void;
  onSubmit: (event?: React.BaseSyntheticEvent) => Promise<void>;
}

export interface IUseGpsLocationResult {
  requestLocation: () => Promise<void>;
  isRequesting: boolean;
  error: string | null;
}

export interface IUseLocationNameInput {
  slug: string;
  result: TSlugParseResult;
}
