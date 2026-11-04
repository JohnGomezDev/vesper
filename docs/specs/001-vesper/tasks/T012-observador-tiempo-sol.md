# T012 — Observador, conversión de tiempo y Sol

- **Fase:** F4
- **SPEC:** §4, §5.4
- **Depende de:** T006
- **Desbloquea:** T013
- **Estado:** Terminada (2026-10-27)

## Objetivo

Encapsular astronomy-engine y calcular todo lo relacionado con el observador y el Sol.

## Resultado esperado

`astronomy` expone un observador reutilizable, la conversión UTC/lugar y las posiciones, salida/puesta y crepúsculos del Sol. Sin red.

## Alcance

**Incluye**

- Observador con latitud, longitud y altitud (la `elevation` que devuelve el pronóstico).
- Conversión explícita UTC ↔ hora local.
- Altitud y azimut del Sol con refracción.
- Salida y puesta del Sol para una fecha local, con `null` si no ocurren.
- Cruces de altitud del Sol a −6°, −12° y −18°.

**No incluye**

- Luna y planetas (T013).
- Muestreo de la tira (T014).
- Formateo para la interfaz (T021).

## Archivos

### Crear

- `src/modules/astronomy/types/astronomy.types.ts`
  - `IObserver { latitude: number; longitude: number; elevationM: number }`
  - `IHorizontalPosition { altitudeDeg: number; azimuthDeg: number }`
  - `TSunTimes { sunriseMs: number | null; sunsetMs: number | null }`
  - `ITwilightTimes { dusk6Ms: number | null; dawn6Ms: number | null; dusk12Ms: number | null; dawn12Ms: number | null; dusk18Ms: number | null; dawn18Ms: number | null }`
- `src/modules/astronomy/services/observer.service.ts`
  - `createObserver(location: ILocation, elevationM: number): IObserver`
- `src/modules/astronomy/services/sun.service.ts`
  - `getSunPosition(observer: IObserver, instantMs: number): IHorizontalPosition`
  - `getSunTimes(observer: IObserver, date: string, timeZone: string): TSunTimes`
  - `getTwilightTimes(observer: IObserver, date: string, timeZone: string): ITwilightTimes`
- `src/modules/astronomy/services/sun.service.test.ts`

## Pasos detallados

1. Usar los nombres de función confirmados en T002; dejarlos en un único archivo de servicios para poder cambiarlos si T002 los corrige.
2. `createObserver` debe recibir la altitud ya resuelta: si `location.elevationM` es `null`, usar `0` y registrar que es desconocida.
3. Implementar `getSunPosition` con refracción activa (usar la opción por defecto o `true`).
4. Implementar `getSunTimes`: buscar la salida y la puesta en la fecha local; si no hay, devolver `null` en ese campo.
5. Implementar `getTwilightTimes`: buscar los cruces de −6°, −12° y −18°; cada uno puede ser `null`.
6. Escribir pruebas con Bogotá y con `America/New_York` en cambio de hora.
7. Ejecutar `pnpm test src/modules/astronomy`.

## Criterios de aceptación

- [x] La refracción está activa en posición y en salida/puesta.
- [x] En un lugar polar en junio, `TSunTimes` devuelve `null` sin lanzar.
- [x] Las horas devueltas son epoch UTC y corresponden a la fecha local pedida.
- [x] No hay ninguna llamada de red en el módulo.

## Verificación

- `pnpm test src/modules/astronomy` pasa.
- Comparar salida y puesta de Bogotá con Stellarium o Heavens Above: máximo uno o dos minutos de diferencia.

## Notas y bloqueos

- Si T002 cambia un nombre de función, se actualiza solo este archivo.

---

## Registro de ejecución (2026-10-27)

**Resultado.** Task ejecutada. El módulo `astronomy` expone el observador reutilizable, la posición del Sol con refracción, las horas de salida y puesta y los cruces de crepúsculo de −6°, −12° y −18°, siempre en epoch UTC y con la zona horaria del lugar explícita. Los cuatro criterios de aceptación quedaron verificados.

**Archivos creados.**

- `src/modules/astronomy/types/astronomy.types.ts` — `IObserver`, `IHorizontalPosition`, `TSunTimes`, `ITwilightTimes` (ampliado después por T013 y T014).
- `src/modules/astronomy/services/observer.service.ts` — `createObserver`.
- `src/modules/astronomy/services/sun.service.ts` — `getSunPosition`, `getSunTimes`, `getTwilightTimes`.
- `src/modules/astronomy/services/sun.service.test.ts` — 10 pruebas.

**Decisiones y desviaciones.**

1. **Altitud del observador (autorizado).** `elevationM` es autoritativo y viene ya resuelto por el llamador. `location.elevationM` solo actúa como respaldo si el valor recibido no es finito; si tampoco existe, se usa `0` y se registra con `console.warn`. Un dato desconocido no se disfraza de medición.
2. **Conversión UTC ↔ hora local.** No se crearon funciones nuevas: T006 ya las expone en `location/utils/datetime.ts` y aquí se consumen con `timeZone` explícito (`getLocalMidnightMs`, `formatLocalDate`). Ningún servicio usa la zona del dispositivo.
3. **Validación de la fecha local.** Un evento de `SearchRiseSet`/`SearchAltitude` que cae fuera de la fecha local pedida se devuelve como `null`. Así se cumple «las horas corresponden a la fecha local pedida» también en latitudes altas.
4. **Refracción.** `Horizon(..., 'normal')` en posición. `SearchRiseSet` aplica siempre su corrección fija y `SearchAltitude` no la aplica, por convención de crepúsculos (SPEC §5.4 y T002).
5. **Ventana de búsqueda.** Cada evento se busca desde la medianoche local con un límite de un día. Es la interpretación directa de «salida y puesta para una fecha local»; en día o noche polar devuelve `null` sin lanzar.
6. **Hora de los crepúsculos.** `dawn*` es el cruce ascendente y `dusk*` el descendente, ambos dentro de la fecha local solicitada; cada campo es independiente y puede ser `null`.
7. **Fuente del contraste externo.** La comparación se hizo con la API del USNO (Astronomical Applications Department), una fuente oficial e independiente, en lugar de la interfaz de Stellarium o Heavens Above, que exige sesión o formulario. Los valores coinciden dentro de un minuto, que es el margen que pide la task.

**Verificación.**

- `pnpm test src/modules/astronomy` — 5 archivos y 42 pruebas pasan (10 de esta task).
- `pnpm test` — 16 archivos y 226 pruebas pasan.
- `pnpm typecheck` sin errores; `pnpm lint` con 0 errores (se mantiene el warning preexistente de `prettier.config.mjs`); `pnpm build` correcto.
- Contraste externo con el USNO (AA) para Bogotá, 2026-10-19: salida 05:41 y puesta 17:41 locales; crepúsculos civil 05:20/18:02, náutico 04:55/18:26 y astronómico 04:31/18:51. La app devuelve esos mismos valores dentro de un minuto.
- Contraste externo con el USNO para Nueva York, 2026-11-01 (fin del horario de verano): salida 06:26 y puesta 16:52 locales; coinciden dentro de un minuto.
- Sin red en `src/modules/astronomy`: no hay `fetch`, URLs ni cliente HTTP.
