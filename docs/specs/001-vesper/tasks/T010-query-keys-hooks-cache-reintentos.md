# T010 — Query keys, hooks, caché y reintentos

- **Fase:** F3
- **SPEC:** §7.3
- **Depende de:** T009
- **Desbloquea:** T011, T019, T020
- **Estado:** Pendiente

## Objetivo

Exponer los datos con TanStack Query respetando claves, frescura, refresco y política de reintentos.

## Resultado esperado

Hooks `useForecast`, `useCurrent` y `useGeocoding` con claves exactas, `staleTime`, `gcTime`, refresco de «ahora» y reintentos según el SPEC.

## Alcance

**Incluye**

- Fábrica de claves de `weather` y `location`.
- Hooks de consulta con `signal` y `cacheMode: 'client'`.
- `staleTime`: 1 h pronóstico, 30 min actual. `gcTime`: 24 h.
- `refetchInterval`: 30 min solo en «ahora».
- Política de reintentos: sin 4xx, 429 con espera creciente, sí red y 5xx.
- Sin invalidación global.

**No incluye**

- Prefetch ni `initialData` (es T011).
- Componentes que consuman los hooks (T020–T022).

## Archivos

### Crear

- `src/modules/weather/constants/weather.query-keys.ts`
  - `weatherKeys.all()`, `weatherKeys.forecast(lat, lon)`, `weatherKeys.current(lat, lon)`.
- `src/modules/location/constants/location.query-keys.ts`
  - `locationKeys.all()`, `locationKeys.geocoding(query)`.
- `src/modules/weather/hooks/use-forecast.ts` — `useForecast(coordinates: ICoordinates)`.
- `src/modules/weather/hooks/use-current.ts` — `useCurrent(coordinates: ICoordinates)`.
- `src/modules/location/hooks/use-geocoding.ts` — `useGeocoding(query: string | null)`.
- `src/lib/api/retry.ts` — `shouldRetry(failureCount: number, error: unknown): boolean`.
- `src/lib/api/retry.test.ts`

### Modificar

- Ninguno.

## Pasos detallados

1. Crear las fábricas:
   ```ts
   export const weatherKeys = {
     all: () => ['weather'] as const,
     forecast: (lat: number, lon: number) => ['forecast', lat, lon] as const,
     current: (lat: number, lon: number) => ['current', lat, lon] as const,
   };
   ```
   `locationKeys.geocoding(query)` usa `['geocoding', query]`.
2. Implementar `shouldRetry`: si `error instanceof ApiError` y `status` es 4xx distinto de 429 → no reintentar; si es 429 o 5xx → reintentar con `Math.min(1000 * 2 ** failureCount, 30000)`; red → reintentar.
3. Implementar `useForecast` con `queryFn: ({ signal }) => fetchForecast(coordinates, { signal, cacheMode: 'client' })`, `staleTime: 3600000`, `gcTime: 86400000`, `retry: shouldRetry`.
4. Implementar `useCurrent` con `staleTime: 1800000`, `gcTime: 86400000`, `refetchInterval: 1800000`, `retry: shouldRetry`.
5. Implementar `useGeocoding` con `enabled: query !== null && query.trim().length >= 3`, `staleTime` de sesión (usar `Infinity` o `gcTime` de 24 h) y sin reintentos de 4xx.
6. Escribir pruebas de `shouldRetry` y una prueba de que `useCurrent` no comparte clave con `useForecast`.
7. Ejecutar `pnpm test`.

## Criterios de aceptación

- [ ] Las claves son exactamente `['forecast', lat, lon]` y `['current', lat, lon]`.
- [ ] `useCurrent` refresca cada 30 min y `useForecast` no tiene `refetchInterval`.
- [ ] Un 404 no se reintenta; un 429 sí, con espera creciente.
- [ ] Ningún hook llama a `invalidateQueries` global.
- [ ] Los hooks pasan `{ signal, cacheMode: 'client' }`.

## Verificación

- `pnpm test src/lib/api` pasa.
- Con React Query Devtools, comprobar que `useCurrent` refetchea a los 30 min y `useForecast` no.

## Notas y bloqueos

- La geocodificación se cachea en memoria de la sesión; no se persiste.
