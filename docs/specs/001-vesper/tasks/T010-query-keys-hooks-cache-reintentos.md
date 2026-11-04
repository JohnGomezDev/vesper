# T010 — Query keys, hooks, caché y reintentos

- **Fase:** F3
- **SPEC:** §7.3
- **Depende de:** T009
- **Desbloquea:** T011, T019, T020
- **Estado:** Terminada

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
- `src/modules/weather/constants/weather.query-keys.test.ts` — claves exactas y separación entre `forecast` y `current`.

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
2. Implementar `shouldRetry`: si `error instanceof ApiError` y `status` es 4xx distinto de 429 → no reintentar; si es 429, 5xx o un fallo de red → reintentar. `shouldRetry` devuelve un booleano; la espera creciente la aplica el `retryDelay` por defecto de TanStack (`Math.min(1000 * 2 ** failureCount, 30000)`). Limitar a 3 reintentos (`failureCount < 3`), porque una función `retry` no tiene tope propio y sin él los 5xx/red se reintentarían indefinidamente.
3. Implementar `useForecast` con `queryFn: ({ signal }) => fetchForecast(coordinates, { signal, cacheMode: 'client' })`, `staleTime: 3600000`, `gcTime: 86400000`, `retry: shouldRetry`.
4. Implementar `useCurrent` con `staleTime: 1800000`, `gcTime: 86400000`, `refetchInterval: 1800000`, `retry: shouldRetry`.
5. Implementar `useGeocoding` con `enabled: query !== null && query.trim().length >= 3`, `staleTime` de sesión (usar `Infinity` o `gcTime` de 24 h) y sin reintentos de 4xx.
6. Escribir pruebas de `shouldRetry` y una prueba de que `useCurrent` no comparte clave con `useForecast`.
7. Ejecutar `pnpm test`.

## Criterios de aceptación

- [x] Las claves son exactamente `['forecast', lat, lon]` y `['current', lat, lon]`.
- [x] `useCurrent` refresca cada 30 min y `useForecast` no tiene `refetchInterval`.
- [x] Un 404 no se reintenta; un 429 sí, con espera creciente.
- [x] Ningún hook llama a `invalidateQueries` global.
- [x] Los hooks pasan `{ signal, cacheMode: 'client' }`.

## Verificación

- `pnpm test src/lib/api` pasa.
- Con React Query Devtools, comprobar que `useCurrent` refetchea a los 30 min y `useForecast` no.

## Notas y bloqueos

- La geocodificación se cachea en memoria de la sesión; no se persiste.

---

## Registro de ejecución y desviaciones (2026-10-27)

**Resultado.** Task ejecutada. `weather` y `location` tienen sus fábricas de claves y sus hooks de TanStack Query. `useForecast` usa `staleTime` de 1 hora y `gcTime` de 24 horas; `useCurrent` usa `staleTime` de 30 minutos, `gcTime` de 24 horas y `refetchInterval` de 30 minutos; `useGeocoding` solo se habilita con 3 caracteres, cachea la búsqueda durante la sesión (`staleTime: Infinity`) y usa `gcTime` de 24 horas. Los tres hooks pasan `{ signal, cacheMode: 'client' }` y `retry: shouldRetry`. No se usa `invalidateQueries` en ningún punto.

**Archivos creados.**

- `src/modules/weather/constants/weather.query-keys.ts` — `weatherKeys`.
- `src/modules/location/constants/location.query-keys.ts` — `locationKeys`.
- `src/modules/weather/hooks/use-forecast.ts` — `useForecast`.
- `src/modules/weather/hooks/use-current.ts` — `useCurrent`.
- `src/modules/location/hooks/use-geocoding.ts` — `useGeocoding`.
- `src/lib/api/retry.ts` — `shouldRetry`.
- `src/lib/api/retry.test.ts` — política de reintentos y espera creciente.
- `src/modules/weather/constants/weather.query-keys.test.ts` — claves exactas y separación `forecast`/`current`.

**Archivos modificados.**

- `src/modules/weather/hooks/use-forecast.ts` — ampliado después por T011 con `initialData`.
- `docs/specs/001-vesper/tasks/T010-query-keys-hooks-cache-reintentos.md` — estado, paso 2, archivos, criterios y este registro.
- `docs/specs/001-vesper/tasks/README.md` — T010 marcada como «Terminada».

**Decisiones y desviaciones.**

1. **Tope de 3 reintentos (autorizado por el dueño).** `shouldRetry` devuelve `false` cuando `failureCount >= 3`. Sin ese tope, al usar una función en `retry`, TanStack Query no aplica su máximo por defecto y los 5xx/red se reintentarían indefinidamente, impidiendo el estado de error del SPEC §8.7.
2. **Espera creciente delegada al `retryDelay` por defecto (autorizado por el dueño).** `shouldRetry` solo decide si se reintenta; no puede devolver un retraso. Se comprobó en `@tanstack/query-core@5.104.5` que el `retryDelay` por defecto es exactamente `Math.min(1000 * 2 ** failureCount, 30000)`. La prueba con temporizadores falsos verifica esperas de 1 s, 2 s y 4 s antes de agotar los 3 reintentos. Desde el ajuste de deprecaciones, la prueba usa `queryClient.query(...)` en lugar del obsoleto `fetchQuery`.
3. **Archivo de prueba de claves añadido (autorizado por el dueño).** La task exigía probar que `useCurrent` no comparte clave con `useForecast`, pero no listaba un archivo para ello. Se añadió `weather.query-keys.test.ts`, que comprueba las claves exactas y su separación. No se renderizan hooks porque Vitest sigue en entorno `node` y T004 no instaló jsdom ni Testing Library.
4. **Redondeo defensivo de coordenadas en los hooks.** Las claves deben usar coordenadas ya redondeadas (SPEC §4 y §7.3). Los hooks aplican `roundCoordinates` antes de construir la clave y de llamar al servicio, de modo que un llamador con más decimales no crea entradas de caché distintas para el mismo lugar. T020 puede seguir pasando coordenadas ya redondeadas.
5. **`useGeocoding` normaliza la consulta.** La clave y la petición usan `query.trim()`. Con `null` o menos de 3 caracteres la query queda deshabilitada y no se llama al servicio. Desde el ajuste de `utils/`, tanto el hook como el servicio reutilizan `normalizeGeocodingQuery` y `MIN_QUERY_LENGTH` de `src/modules/location/utils/geocoding.ts`, así que el mínimo de 3 caracteres ya no está duplicado.
6. **Verificación con React Query Devtools no ejecutada.** Todavía no existe una pantalla que monte `useCurrent`/`useForecast` (llega en T019–T022). El refresco y la separación de claves se cubren con pruebas de configuración y de `QueryObserver` en T011. Queda pendiente la comprobación visual cuando exista la pantalla.
7. **Sin invalidación global.** No se añadió `invalidateQueries` ni `queryClient.clear()`; el refresco de «ahora» lo hace solo `refetchInterval`.

**Verificación.**

- `pnpm test src/lib/api` — 2 archivos y 12 pruebas pasan.
- `pnpm test src/modules/weather/constants` — 1 archivo y 3 pruebas pasan.
- `pnpm test` — 11 archivos y 183 pruebas pasan.
- `pnpm typecheck` — sin errores.
- `pnpm lint` — 0 errores; se mantiene el warning preexistente de `prettier.config.mjs`.
- `pnpm build` — compila y prerenderiza `/` y `/_not-found`.
