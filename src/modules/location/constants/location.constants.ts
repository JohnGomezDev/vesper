/** Minimum non-blank characters required before calling the geocoding API. */
export const MIN_QUERY_LENGTH = 3;

export const SEARCH_REQUIRED_MESSAGE = 'Escribe un lugar.';
export const SEARCH_MIN_LENGTH_MESSAGE = `Escribe al menos ${MIN_QUERY_LENGTH} caracteres.`;

/** Geocoding results are stable for the whole browser session. */
export const GEOCODING_STALE_TIME_MS = Infinity;

export const GPS_TIMEOUT_MS = 10_000;
export const GPS_NAME = 'Mi ubicación';

/** Geolocation error codes from the W3C API. */
const PERMISSION_DENIED = 1;
const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

export const GPS_ERROR_MESSAGES: Record<number, string> = {
  [PERMISSION_DENIED]:
    'No diste permiso para usar tu ubicación. Puedes buscar el lugar manualmente.',
  [POSITION_UNAVAILABLE]:
    'No se pudo obtener tu ubicación. Revisa la conexión o busca el lugar manualmente.',
  [TIMEOUT]: 'La ubicación tardó demasiado. Inténtalo de nuevo o busca el lugar manualmente.',
};

export const GPS_UNKNOWN_ERROR_MESSAGE =
  'No se pudo usar tu ubicación. Busca el lugar manualmente.';
