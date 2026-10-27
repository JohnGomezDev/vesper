export const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
export const OPEN_METEO_GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';

/**
 * Server-side cache lifetime. The server wrapper declares it with
 * `'use cache'` + `cacheLife` (SPEC §7.2 and §7.4); it is never passed as
 * `next.revalidate` from `fetchOpenMeteo`.
 */
export const SERVER_REVALIDATE_SECONDS = 3600;
