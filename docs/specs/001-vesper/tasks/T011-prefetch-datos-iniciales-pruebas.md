# T011 — Prefetch, datos iniciales y pruebas de datos

- **Fase:** F3
- **SPEC:** §7.3, §7.4, §8.1
- **Depende de:** T010
- **Desbloquea:** T019, T020
- **Estado:** Terminada

## Objetivo

Alinear los relojes de caché entre servidor y cliente y dejar el pronóstico listo antes de navegar a un lugar buscado.

## Resultado esperado

Un contrato `IInitialForecast { forecast, fetchedAt }` que el servidor entrega y el cliente inyecta con `initialData` e `initialDataUpdatedAt`, más un prefetch reutilizable.

## Alcance

**Incluye**

- Tipo `IInitialForecast`.
- Prefetch de `weatherKeys.forecast(lat, lon)` al elegir un resultado de búsqueda.
- Inyección de `initialData` con la hora real de obtención.
- Refresco al montar si el dato ya venció.
- Pruebas de datos: URL, errores 4xx/5xx/429 y ramas de caché.

**No incluye**

- La página de servidor (T019).
- El buscador (T020).

## Archivos

### Crear

- `src/modules/weather/utils/prefetch-forecast.ts`
  - `prefetchForecast(queryClient: QueryClient, coordinates: ICoordinates): Promise<void>`
- `src/modules/weather/services/forecast.service.test.ts` (ampliar con casos de error)
- `src/modules/weather/utils/prefetch-forecast.test.ts`

### Modificar

- `src/modules/weather/types/weather.types.ts` — añadir `IInitialForecast`.
- `src/modules/weather/hooks/use-forecast.ts` — aceptar `{ initialData?: IInitialForecast }` y usar `initialDataUpdatedAt`.

## Pasos detallados

1. Definir `IInitialForecast { forecast: IForecastResponse; fetchedAt: number }`.
2. Ampliar `useForecast(coordinates, options?: { initialData?: IInitialForecast })`:
   ```ts
   initialData: options?.initialData?.forecast,
   initialDataUpdatedAt: options?.initialData?.fetchedAt,
   ```
   Debe ser opcional y no romper el uso sin datos iniciales.
3. Implementar `prefetchForecast` con `queryClient.query({ queryKey: weatherKeys.forecast(...), queryFn: ... , staleTime: 3600000 }).catch(noop)` (sustituye al obsoleto `prefetchQuery` de TanStack Query v5).
4. Probar que un `fetchedAt` de hace 2 horas provoca `isStale: true` y refresco al montar.
5. Probar que un 429 se reintenta y un 400 no.
6. Ejecutar `pnpm test`.

## Criterios de aceptación

- [x] La antigüedad máxima efectiva es 1 hora, no 2.
- [x] `useForecast` funciona con y sin `initialData`.
- [x] El prefetch deja el pronóstico en caché antes de navegar.
- [x] Un `fetchedAt` viejo no evita el refresco.

## Verificación

- `pnpm test src/modules/weather` pasa.
- Prueba manual: prefetch y navegación sin esqueleto perceptible.

## Notas y bloqueos

- El nombre exacto de la opción de hora inicial se confirma en T001; si cambia, se ajusta solo aquí.

---

## Registro de ejecución y desviaciones (2026-10-27)

**Resultado.** Task ejecutada. `useForecast` acepta `{ initialData?: IInitialForecast }`, pasa `initialData` e `initialDataUpdatedAt` a TanStack Query y sigue funcionando sin datos iniciales. `prefetchForecast` calienta `['forecast', lat, lon]` con `staleTime` de 1 hora y `cacheMode: 'client'` antes de navegar. Las pruebas cubren la URL y los errores 4xx/429/5xx del pronóstico, el prefetch, la reutilización de caché fresca y el refresco al montar cuando el `fetchedAt` tiene 2 horas.

**Archivos creados.**

- `src/modules/weather/utils/prefetch-forecast.ts` — `prefetchForecast`.
- `src/modules/weather/utils/prefetch-forecast.test.ts` — prefetch, caché fresca, `initialData` con y sin datos y refresco al montar.

**Archivos modificados.**

- `src/modules/weather/hooks/use-forecast.ts` — opciones `{ initialData?: IInitialForecast }`, `initialData` e `initialDataUpdatedAt`.
- `src/modules/weather/services/forecast.service.test.ts` — casos de 429 y 5xx añadidos a los de 400 y respuesta malformada.
- `docs/specs/001-vesper/tasks/T011-prefetch-datos-iniciales-pruebas.md` — estado, criterios y este registro.
- `docs/specs/001-vesper/tasks/README.md` — T011 marcada como «Terminada».

**Decisiones y desviaciones.**

1. **`IInitialForecast` ya existía.** T009 lo definió en `src/modules/weather/types/weather.types.ts` porque su lista de archivos lo incluía. T011 lo consume sin volver a declararlo; por eso no hubo una modificación adicional de `weather.types.ts`. El contrato final es `{ forecast: IForecastResponse; fetchedAt: number }`.
2. **Pruebas de hooks sin jsdom ni Testing Library (autorizado por el dueño).** T004 dejó Vitest en entorno `node` y no hay dependencias de render. Para comprobar el wiring de `useForecast` se mockea `useQuery` y se inspeccionan las opciones recibidas. Para comprobar que un `fetchedAt` de hace 2 horas marca `isStale` y dispara el refresco al montar se usa `QueryObserver` real de TanStack Query, que aplica la misma lógica que `useQuery` sin necesidad de DOM.
3. **Prueba de 429 y 400 en dos niveles.** `retry.test.ts` prueba la política y la espera creciente con temporizadores falsos; `forecast.service.test.ts` prueba que un 429 y un 5xx conservan estado y cuerpo en `ApiError`. Así T011 cubre también los casos de error que pedía sin duplicar la lógica de reintentos.
4. **`prefetchForecast` sin `AbortSignal`.** El prefetch se lanza al elegir un resultado de búsqueda y debe sobrevivir a la navegación; no se pasa la señal de un componente que se desmonta. La petición usa `cacheMode: 'client'` y el `QueryClient` del layout raíz, que aporta el `gcTime` de 24 horas.
5. **Verificación manual de prefetch y navegación no ejecutada.** No existe todavía la pantalla de búsqueda (T020) ni la ruta de clima (T019). La prueba unitaria confirma que el pronóstico queda en la caché con la clave canónica y que un dato fresco no se vuelve a pedir; la comprobación visual «sin esqueleto perceptible» queda para T020–T021.
6. **Redondeo en el prefetch.** Igual que en los hooks de T010, `prefetchForecast` redondea las coordenadas antes de construir la clave y la petición, para que el prefetch y `useForecast` coincidan aunque el resultado de geocodificación traiga más decimales.
7. **`prefetchQuery` sustituido por `query` (ajuste solicitado por el dueño).** TanStack Query 5.104.5 marca `prefetchQuery` como obsoleto y lo reemplaza por `queryClient.query(options).catch(noop)`. La nueva implementación conserva el comportamiento de mejor esfuerzo: el prefetch no bloquea la navegación y, si falla, `useForecast` reintenta al montar. La prueba añadida verifica que un fallo del prefetch se traga y no deja datos en caché.

**Verificación.**

- `pnpm test src/modules/weather` — 3 archivos y 18 pruebas pasan.
- `pnpm test` — 11 archivos y 184 pruebas pasan.
- `pnpm typecheck` — sin errores.
- `pnpm lint` — 0 errores; se mantiene el warning preexistente de `prettier.config.mjs`.
- `pnpm build` — compila y prerenderiza `/` y `/_not-found`.
- `QueryObserver` con `initialDataUpdatedAt` de hace 2 horas: `isStale: true` y `queryFn` llamado al suscribirse.
