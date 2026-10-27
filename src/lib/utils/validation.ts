/**
 * Small structural guards shared by the Open-Meteo response validators.
 * They keep the module parsers free of repeated `typeof` checks.
 */
export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isNumberOrNull(value: unknown): boolean {
  return value === null || (typeof value === 'number' && Number.isFinite(value));
}

export function isOptionalString(value: unknown): boolean {
  return value === undefined || value === null || typeof value === 'string';
}

export function isOptionalNumber(value: unknown): boolean {
  return value === undefined || value === null || typeof value === 'number';
}

export function isNullableNumberArray(value: unknown): value is Array<number | null> {
  return Array.isArray(value) && value.every(isNumberOrNull);
}

export function isNullableStringArray(value: unknown): value is Array<string | null> {
  return Array.isArray(value) && value.every((item) => item === null || typeof item === 'string');
}

export function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}
