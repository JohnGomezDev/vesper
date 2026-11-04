/**
 * Client clock sampling interval; also recalculates the night at midnight.
 */
export const NOW_TICK_MS = 15 * 60_000;

export const MS_PER_HOUR = 3_600_000;

/** Only hours with the Sun below −18° enter the score (SPEC §8.6). */
export const ASTRONOMICAL_NIGHT_MAX_SUN_ALTITUDE_DEG = -18;

/** User-facing messages of the night screen states (SPEC §8.7). */
export const NIGHT_MESSAGES = {
  invalidDate: 'La fecha no es válida.',
  outOfRange: 'La fecha seleccionada está fuera del rango disponible.',
  noAstronomicalNight: 'Sin noche astronómica este día. Puedes elegir otra noche en el selector.',
  emptyForecast: 'No hay datos de pronóstico para este lugar. Busca otro lugar para ver su noche.',
  forecastError:
    'No se pudo cargar el pronóstico de este lugar. Comprueba tu conexión y reintenta.',
  rateLimit:
    'Open-Meteo ha limitado las peticiones. Espera un momento antes de volver a intentarlo.',
  currentError: 'No se pudieron cargar las condiciones actuales.',
  staleForecast: 'No se pudo actualizar el pronóstico; se muestra el último dato disponible.',
} as const;
