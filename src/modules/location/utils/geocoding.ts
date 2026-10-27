import { OPEN_METEO_GEOCODING_URL } from '@/lib/constants/api.constants';
import { isOptionalNumber, isOptionalString, isRecord } from '@/lib/utils/validation';
import type { IGeocodingResponse, IGeocodingResult } from '@/modules/location/types/location.types';

export const MIN_QUERY_LENGTH = 3;

const RESULT_COUNT = 7;

export function normalizeGeocodingQuery(query: string | null): string {
  return query?.trim() ?? '';
}

function isGeocodingResult(value: unknown): value is IGeocodingResult {
  if (!isRecord(value)) {
    return false;
  }

  if (
    typeof value.id !== 'number' ||
    typeof value.name !== 'string' ||
    typeof value.latitude !== 'number' ||
    typeof value.longitude !== 'number'
  ) {
    return false;
  }

  return (
    isOptionalNumber(value.elevation) &&
    isOptionalString(value.timezone) &&
    isOptionalString(value.country) &&
    isOptionalString(value.admin1) &&
    isOptionalString(value.admin2) &&
    isOptionalString(value.admin3)
  );
}

export function isGeocodingResponse(value: unknown): value is IGeocodingResponse {
  if (!isRecord(value)) {
    return false;
  }

  if (value.results === undefined) {
    return true;
  }

  return Array.isArray(value.results) && value.results.every(isGeocodingResult);
}

export function buildGeocodingUrl(query: string): string {
  const params = new URLSearchParams({
    name: query,
    count: String(RESULT_COUNT),
    language: 'es',
  });

  return `${OPEN_METEO_GEOCODING_URL}?${params.toString()}`;
}
