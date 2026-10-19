# T006 — Zona horaria, horas locales, noches y noche actual

- **Fase:** F2
- **SPEC:** §4, §6.3, §10
- **Depende de:** T005
- **Desbloquea:** T007, T012, T015, T019
- **Estado:** Pendiente

## Objetivo

Implementar el modelo temporal completo: hora local del lugar, rango de noches, tira visible y noche actual.

## Resultado esperado

Utilidades de fecha y un modelo de noche con pruebas unitarias. Ninguna función decide fechas con la zona del dispositivo.

## Alcance

**Incluye**

- Conversión de hora local de Open-Meteo (`2026-10-19T18:00`) a epoch UTC.
- Formateo de epoch a fecha y hora local del lugar.
- Medianoche local, suma de días de calendario, «hoy» del lugar.
- Validación estricta `YYYY-MM-DD` y rango D = −3…+14 relativo al «hoy» del lugar, con resultado discriminado.
- Modelo de noche D: `sunset` de D, `sunrise` de D+1 y tira visible de `sunset − 1 h` a `sunrise + 1 h`.
- Filas `hourly` cuyo intervalo `[t, t+1 h)` solapa la tira.
- Noche actual, incluida la madrugada.
- Caso sin `sunrise`/`sunset`: `{ kind: 'no-current-night' }` y sin noche declarada.

**No incluye**

- Peticiones de red (T009).
- Cálculos astronómicos (T012).
- Componentes de interfaz (T021).

## Archivos

### Crear

- `src/modules/location/utils/datetime.ts`
  - `parseLocalDateTime(localIso: string, timeZone: string): number`
  - `formatLocalDate(instantMs: number, timeZone: string): string`
  - `formatLocalTime(instantMs: number, timeZone: string): string`
  - `getTodayLocalDate(nowMs: number, timeZone: string): string`
  - `getLocalMidnightMs(date: string, timeZone: string): number`
  - `addDays(date: string, delta: number): string`
  - `isValidDateString(value: string): boolean`
  - `getNightDateRange(todayLocal: string): { min: string; max: string }`
  - `parseDateParam(value: string | null, todayLocal: string): TDateParamResult`
- `src/modules/location/types/location.types.ts` (modificar)
  - `TDateParamResult = { kind: 'valid'; date: string } | { kind: 'missing' } | { kind: 'invalid' } | { kind: 'out-of-range' }`
- `src/modules/night/types/night.types.ts`
  - `TNightWindow = { kind: 'available'; startMs: number; endMs: number } | { kind: 'no-astronomical-night' }`
  - `TDailySun = { date: string; sunrise: string | null; sunset: string | null }`
- `src/modules/night/utils/night.ts`
  - `getNightWindow(input: { date: string; sunset: string | null; sunriseNext: string | null; timeZone: string }): TNightWindow`
  - `filterHoursInWindow(hourlyTimes: string[], window: TNightWindow, timeZone: string): number[]`
  - `getCurrentNightDate(input: { nowMs: number; timeZone: string; sunriseByDate: ReadonlyMap<string, string | null> }): { kind: 'night'; date: string } | { kind: 'no-current-night' }`
- `src/modules/location/utils/datetime.test.ts`
- `src/modules/night/utils/night.test.ts`

## Pasos detallados

1. Implementar `parseLocalDateTime` usando `Intl.DateTimeFormat` con `timeZone` para calcular el offset del instante local; documentar el algoritmo en un comentario.
2. Implementar el formateo local con `Intl`.
3. Implementar `addDays` con aritmética de calendario sobre la cadena, sin `Date` en zona local del dispositivo.
4. Implementar `isValidDateString` con regex `^\d{4}-\d{2}-\d{2}$` más validación de día real por mes.
5. Implementar `getNightDateRange` sumando −3 y +14 con `addDays`.
6. Implementar `parseDateParam` con la distinción faltante/inválida/fuera de rango.
7. Implementar `getNightWindow`: si falta `sunset` o `sunriseNext` → `no-astronomical-night`; si no, `startMs = sunset − 3600000`, `endMs = sunriseNext + 3600000`.
8. Implementar `filterHoursInWindow` con solape `[t, t + 3600000) ∩ [start, end) ≠ ∅`.
9. Implementar `getCurrentNightDate`: obtener `todayLocal`; si `sunriseByDate.get(todayLocal)` es `null` o no existe → `no-current-night`; si `nowMs < parseLocalDateTime(sunrise, tz)` → `addDays(todayLocal, -1)`; si no → `todayLocal`.
10. Escribir las pruebas y ejecutarlas.

## Criterios de aceptación

- [ ] `parseDateParam` devuelve `missing` con `null`, `invalid` con `2026-13-01` y `out-of-range` con `today+15`.
- [ ] La noche de un cambio de hora de 23 o 25 horas no se corta en bloques de 24.
- [ ] `getNightWindow` devuelve `no-astronomical-night` sin `sunset` o `sunriseNext`.
- [ ] `getCurrentNightDate` devuelve la noche anterior a las 03:00 locales y la del día a las 15:00 locales.
- [ ] Sin `sunrise` de hoy devuelve `no-current-night`.

## Verificación

- `pnpm test src/modules/location src/modules/night` pasa.
- Probar con `America/New_York` en el cambio de hora de noviembre y con `America/Santiago` en hemisferio sur.

## Notas y bloqueos

- Nunca usar `new Date().getMonth()` ni `getHours()` sobre la zona del dispositivo.
