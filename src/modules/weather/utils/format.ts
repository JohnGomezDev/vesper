const decimalFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 1,
});

const integerFormatter = new Intl.NumberFormat('es-ES', {
  maximumFractionDigits: 0,
});

const MISSING_VALUE = '—';

/**
 * Formatting helpers of the weather blocks. Every missing measurement is
 * rendered as `—`, never as zero (SPEC §8.5, §8.7).
 */
export function formatTemperature(value: number | null): string {
  return value === null ? MISSING_VALUE : `${decimalFormatter.format(value)} °C`;
}

export function formatHumidity(value: number | null): string {
  return formatPercent(value);
}

export function formatPercent(value: number | null, fractionDigits = 0): string {
  if (value === null) {
    return MISSING_VALUE;
  }

  const formatter = fractionDigits === 0 ? integerFormatter : decimalFormatter;

  return `${formatter.format(value)} %`;
}

export function formatWindSpeed(value: number | null): string {
  return value === null ? MISSING_VALUE : `${decimalFormatter.format(value)} km/h`;
}

export function formatVisibility(valueM: number | null): string {
  if (valueM === null) {
    return MISSING_VALUE;
  }

  if (valueM < 1000) {
    return `${integerFormatter.format(valueM)} m`;
  }

  return `${decimalFormatter.format(valueM / 1000)} km`;
}

export function formatPrecipitation(valueMm: number | null): string {
  return valueMm === null ? MISSING_VALUE : `${decimalFormatter.format(valueMm)} mm`;
}

/** Temperature–dew-point spread, the useful part of the pair for observers. */
export function formatDewPointSpread(temperature: number | null, dewPoint: number | null): string {
  if (temperature === null || dewPoint === null) {
    return MISSING_VALUE;
  }

  return `${decimalFormatter.format(temperature - dewPoint)} °C`;
}

/** `2026-10-19T18:00` → `18:00`; Open-Meteo already sends the place wall clock. */
export function formatDataTime(localIso: string): string {
  const timePart = localIso.split('T')[1] ?? '';

  return timePart.slice(0, 5) || MISSING_VALUE;
}
