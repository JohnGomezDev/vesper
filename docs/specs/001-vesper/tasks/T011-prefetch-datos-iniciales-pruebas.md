# T011 — Prefetch, datos iniciales y pruebas de datos

- **Fase:** F3
- **SPEC:** §7.3, §7.4, §8.1
- **Depende de:** T010
- **Desbloquea:** T019, T020
- **Estado:** Pendiente

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
3. Implementar `prefetchForecast` con `queryClient.prefetchQuery({ queryKey: weatherKeys.forecast(...), queryFn: ... , staleTime: 3600000 })`.
4. Probar que un `fetchedAt` de hace 2 horas provoca `isStale: true` y refresco al montar.
5. Probar que un 429 se reintenta y un 400 no.
6. Ejecutar `pnpm test`.

## Criterios de aceptación

- [ ] La antigüedad máxima efectiva es 1 hora, no 2.
- [ ] `useForecast` funciona con y sin `initialData`.
- [ ] El prefetch deja el pronóstico en caché antes de navegar.
- [ ] Un `fetchedAt` viejo no evita el refresco.

## Verificación

- `pnpm test src/modules/weather` pasa.
- Prueba manual: prefetch y navegación sin esqueleto perceptible.

## Notas y bloqueos

- El nombre exacto de la opción de hora inicial se confirma en T001; si cambia, se ajusta solo aquí.
