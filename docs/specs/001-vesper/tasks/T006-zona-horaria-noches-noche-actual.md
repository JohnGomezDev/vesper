# T006 — Zona horaria, horas locales, noches y noche actual

- **Fase:** F2
- **SPEC:** §4, §6.3, §10
- **Depende de:** T005
- **Desbloquea:** T007, T012, T015, T019
- **Estado:** Terminada

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

- [x] `parseDateParam` devuelve `missing` con `null`, `invalid` con `2026-13-01` y `out-of-range` con `today+15`.
- [x] La noche de un cambio de hora de 23 o 25 horas no se corta en bloques de 24.
- [x] `getNightWindow` devuelve `no-astronomical-night` sin `sunset` o `sunriseNext`.
- [x] `getCurrentNightDate` devuelve la noche anterior a las 03:00 locales y la del día a las 15:00 locales.
- [x] Sin `sunrise` de hoy devuelve `no-current-night`.

## Verificación

- `pnpm test src/modules/location src/modules/night` pasa.
- Probar con `America/New_York` en el cambio de hora de noviembre y con `America/Santiago` en hemisferio sur.

## Notas y bloqueos

- Nunca usar `new Date().getMonth()` ni `getHours()` sobre la zona del dispositivo.

---

## Registro de ejecución y desviaciones (2026-10-20)

**Resultado.** Task ejecutada. El módulo `location` expone las utilidades de fecha y hora local, la validación de `?date=` y el rango de noches; el módulo `night` expone la ventana de noche, el filtrado de filas horarias y la noche actual. Todas las funciones reciben la zona horaria explícita y no consultan la zona del dispositivo. Los cinco criterios de aceptación quedaron verificados con pruebas unitarias.

**Archivos creados.**

- `src/modules/location/utils/datetime.ts` — `parseLocalDateTime`, `formatLocalDate`, `formatLocalTime`, `getTodayLocalDate`, `getLocalMidnightMs`, `addDays`, `isValidDateString`, `getNightDateRange` y `parseDateParam`.
- `src/modules/location/utils/datetime.test.ts` — 28 pruebas.
- `src/modules/night/types/night.types.ts` — `TNightWindow` y `TDailySun`.
- `src/modules/night/utils/night.ts` — `getNightWindow`, `filterHoursInWindow` y `getCurrentNightDate`.
- `src/modules/night/utils/night.test.ts` — 15 pruebas.

**Archivos modificados.**

- `src/modules/location/types/location.types.ts` — `TDateParamResult`.
- `docs/specs/001-vesper/tasks/T006-zona-horaria-noches-noche-actual.md` — estado, criterios y este registro.
- `docs/specs/001-vesper/tasks/README.md` — T006 marcada como «Terminada».

**Decisiones y puntos de revisión.**

1. **Entrada inválida en utilidades internas: `RangeError`.** La task no define el comportamiento ante valores mal formados en `parseLocalDateTime`, `addDays` o `getLocalMidnightMs`. Se lanza `RangeError` porque son errores de programación y no entradas de usuario; la validación de `?date=` sigue devolviendo la unión discriminada mediante `parseDateParam`. No se sustituye ningún valor por cero.
2. **Desambiguación de cambios de hora documentada.** Para una hora repetida (retroceso) se devuelve la primera ocurrencia; para una hora inexistente (adelanto) se devuelve el instante posterior, el criterio «compatible» habitual. En `America/Santiago`, la medianoche local del 2026-09-06 no existe y `getLocalMidnightMs` devuelve las 01:00 locales (04:00 UTC). Ambas reglas están documentadas en el comentario de `parseLocalDateTime` y cubiertas por pruebas.
3. **`filterHoursInWindow` devuelve índices, no instantes.** La firma de la task es `number[]` y describe «filas»; se devuelven los índices de `hourlyTimes` que solapan la tira. En el retroceso horario, Open-Meteo puede repetir una hora local (`01:00`): ambas filas se conservan porque el filtro trabaja por índice. Si T014 necesita remuestrear por instante, deberá tratar la hora repetida con su offset explícito; no se añadió esa lógica aquí porque queda fuera del alcance.
4. **`formatLocalTime` devuelve `HH:mm`.** La task no fija la precisión. Se omiten los segundos porque la tira horaria y el bloque «Ahora» muestran minutos. `formatLocalDate` devuelve siempre `YYYY-MM-DD`.
5. **El parámetro `date` de `getNightWindow` no se usa.** Se conserva en la firma pedida, pero el cálculo depende solo de `sunset`, `sunriseNext` y `timeZone`, tal como indica el paso 7. No se valida que `date` coincida con las fechas de las horas recibidas.
6. **Punto de revisión para T007/T019: `getCurrentNightDate` solo consulta el amanecer de hoy.** Se implementó literalmente el paso 9 y el criterio de aceptación. Si `nowMs` es anterior al amanecer y el día anterior no tuviera `sunset` (caso polar), la función devolvería igualmente la noche anterior. El SPEC §4 pide no declarar noche actual cuando faltan `sunrise`/`sunset` «para las fechas relevantes»; si T007 o T019 necesitan cubrir ese caso, habría que ampliar la entrada con el `sunset` de ayer y acordarlo antes. No se cambió el comportamiento sin autorización.
7. **`TDailySun` también aparece en T009.** T006 lo define en `src/modules/night/types/night.types.ts`, mientras T009 lo lista en `weather.types.ts`. Para evitar dos tipos con el mismo nombre y forma, T009 debería importarlo desde `night.types.ts` (o reexportarlo). No se tocó T009.

**Verificación.**

- `pnpm test src/modules/location src/modules/night` — 4 archivos y 71 pruebas pasan.
- `TZ=UTC pnpm test src/modules/location src/modules/night` — 71 pruebas pasan.
- `TZ=America/Bogota pnpm test src/modules/location src/modules/night` — 71 pruebas pasan.
- `pnpm test` — 5 archivos y 72 pruebas pasan.
- `pnpm typecheck` — sin errores.
- `pnpm lint` — 0 errores; se mantiene el warning preexistente de `prettier.config.mjs`.
- `pnpm exec prettier --check` sobre los seis archivos tocados — todos conformes.
- Comprobado con `America/New_York` en el cambio de hora de noviembre (noche de 25 horas) y de marzo (noche de 23 horas), y con `America/Santiago` en invierno austral y en el cambio de hora de septiembre.
