# T009 — Servicios de Open-Meteo y geocodificación

- **Fase:** F3
- **SPEC:** §5.1, §5.2
- **Depende de:** T008
- **Desbloquea:** T010, T019
- **Estado:** Pendiente

## Objetivo

Implementar los tres servicios de datos con sus tipos, guardas y utilidades de indexado.

## Resultado esperado

`weather` y `location` exponen `fetchForecast`, `fetchCurrent` y `searchLocations`, con tipos de respuesta y sin `any`. La URL de pronóstico no lleva `elevation`.

## Alcance

**Incluye**

- Pronóstico: `hourly` + `daily`, sin `current`, con `past_days=3` y `forecast_days=16`.
- Actual: solo `current`, respuesta mínima.
- Geocodificación: `name`, `count=7`, `language=es`.
- Tipos de respuesta y guardas manuales (sin Zod).
- `indexHourly` para pasar de arrays paralelos a filas.
- `getDailySun` para obtener `{ date, sunrise, sunset }` por día.
- Tratamiento de valores nulos como desconocidos.

**No incluye**

- Hooks de TanStack Query (T010).
- Prefetch (T011).

## Archivos

### Crear

- `src/modules/weather/types/weather.types.ts`
  - `IHourlyData`, `IDailyData`, `IForecastResponse`, `ICurrentResponse`, `IHourlyRow`, `TDailySun`, `IInitialForecast`.
- `src/modules/weather/services/forecast.service.ts`
  - `fetchForecast(coordinates: ICoordinates, options: IFetchOptions): Promise<IForecastResponse>`
- `src/modules/weather/services/current.service.ts`
  - `fetchCurrent(coordinates: ICoordinates, options: IFetchOptions): Promise<ICurrentResponse>`
- `src/modules/weather/utils/hourly.ts`
  - `indexHourly(hourly: IHourlyData): IHourlyRow[]`
  - `getDailySun(daily: IDailyData): TDailySun[]`
- `src/modules/location/services/geocoding.service.ts`
  - `searchLocations(query: string, options: IFetchOptions): Promise<IGeocodingResult[]>`
- `src/modules/location/types/location.types.ts` (modificar)
  - `IGeocodingResult`, `IGeocodingResponse`
- `src/modules/weather/services/forecast.service.test.ts`
- `src/modules/location/services/geocoding.service.test.ts`

## Pasos detallados

1. Definir los tipos con las variables exactas confirmadas en T001.
2. Escribir guardas `isForecastResponse`, `isCurrentResponse`, `isGeocodingResponse` que comprueben la presencia de arrays y campos obligatorios.
3. Implementar `fetchForecast` con `URLSearchParams`:
   `latitude`, `longitude`, `hourly`, `daily`, `timezone=auto`, `past_days=3`, `forecast_days=16`.
   No incluir `elevation`.
4. Implementar `fetchCurrent` solo con `current` y `timezone=auto`.
5. Implementar `searchLocations` con `name`, `count=7`, `language=es`; devolver `results ?? []`.
6. Implementar `indexHourly` mapeando cada índice de `time` a una `IHourlyRow`; si falta una variable, `null`.
7. Implementar `getDailySun` con `daily.time`, `daily.sunrise` y `daily.sunset`.
8. Escribir pruebas con respuestas de ejemplo y con una respuesta 400; comprobar que `fetchForecast` no incluye `elevation`.
9. Ejecutar `pnpm test`.

## Criterios de aceptación

- [ ] La URL de pronóstico contiene `past_days=3` y `forecast_days=16`.
- [ ] Ninguna URL contiene `elevation`.
- [ ] `fetchCurrent` no pide variables `hourly`.
- [ ] `searchLocations` con 2 caracteres se rechaza antes de llamar (la UI lo garantiza; el servicio acepta solo `query.trim().length >= 3` y lanza error de programación si no).
- [ ] Una variable ausente produce `null`, no `0`.

## Verificación

- `pnpm test src/modules` pasa.
- Ejecutar `fetchForecast` contra la API real en desarrollo y comprobar `response.elevation`.

## Notas y bloqueos

- Si T001 detecta que una variable no existe, se ajusta el SPEC y esta task antes de continuar.
