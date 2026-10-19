# T012 — Observador, conversión de tiempo y Sol

- **Fase:** F4
- **SPEC:** §4, §5.4
- **Depende de:** T006
- **Desbloquea:** T013
- **Estado:** Pendiente

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

- [ ] La refracción está activa en posición y en salida/puesta.
- [ ] En un lugar polar en junio, `TSunTimes` devuelve `null` sin lanzar.
- [ ] Las horas devueltas son epoch UTC y corresponden a la fecha local pedida.
- [ ] No hay ninguna llamada de red en el módulo.

## Verificación

- `pnpm test src/modules/astronomy` pasa.
- Comparar salida y puesta de Bogotá con Stellarium o Heavens Above: máximo uno o dos minutos de diferencia.

## Notas y bloqueos

- Si T002 cambia un nombre de función, se actualiza solo este archivo.
