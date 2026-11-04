# T015 — Nubosidad ponderada y fases lunares

- **Fase:** F5
- **SPEC:** §8.4, §8.5
- **Depende de:** T006, T014
- **Desbloquea:** T016
- **Estado:** Terminada (2026-10-27)

## Objetivo

Convertir las tres capas de nubosidad en un valor y una clase, y nombrar las ocho fases lunares.

## Resultado esperado

`night` expone `computeCloudCover`, `classifyCloudCover`, `getMoonPhaseName` y `getMoonPhaseIconKey` con pruebas de todos los bordes.

## Alcance

**Incluye**

- `nube = 0,50·low + 0,35·mid + 0,15·high` con redondeo al porcentaje.
- Capa faltante → `null` (hora desconocida), nunca `0`.
- Clases con el borde en la clase mejor: ideal ≤10, buena ≤20, aceptable ≤30, regular ≤40, no óptima >40.
- Ocho fases con tramos semiabiertos de 45° centrados en los valores del USNO.
- Fase evaluada a la medianoche local.
- Nombre en español e identificador de icono por fase.

**No incluye**

- Componentes ni iconos renderizados (T022).
- Ventanas ni puntuación (T016, T017).

## Archivos

### Crear

- `src/modules/night/types/night.types.ts` (modificar)
  - `TCloudClass = 'ideal' | 'good' | 'acceptable' | 'fair' | 'poor'`
  - `TMoonPhase = 'new-moon' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full-moon' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent'`
  - `TMoonIconKey = TMoonPhase`
- `src/modules/night/utils/cloud.ts`
  - `computeCloudCover(low: number | null, mid: number | null, high: number | null): number | null`
  - `classifyCloudCover(value: number): TCloudClass`
- `src/modules/night/constants/moon-phase.constants.ts`
  - `MOON_PHASE_LABELS_ES: Record<TMoonPhase, string>`
  - `MOON_PHASE_RANGES` con los tramos semiabiertos.
- `src/modules/night/utils/moon-phase.ts`
  - `getMoonPhaseName(angleDeg: number): TMoonPhase`
  - `getMoonPhaseIconKey(phase: TMoonPhase): TMoonIconKey`
- `src/modules/night/utils/cloud.test.ts`
- `src/modules/night/utils/moon-phase.test.ts`

## Pasos detallados

1. Implementar `computeCloudCover` devolviendo `null` si cualquiera de las tres capas es `null`.
2. Implementar `classifyCloudCover` con `<=` en los cortes 10, 20, 30 y 40.
3. Definir los nombres en español: «Luna nueva», «Luna creciente», «Cuarto creciente», «Gibosa creciente», «Luna llena», «Gibosa menguante», «Cuarto menguante», «Luna menguante».
4. Implementar `getMoonPhaseName` normalizando el ángulo a `[0, 360)` y aplicando los tramos `[337.5, 360) ∪ [0, 22.5)` para luna nueva, etc.
5. Implementar `getMoonPhaseIconKey` como identidad por ahora, para que T022 lo sustituya por el dibujo convencional.
6. Escribir pruebas de todos los bordes de nube y de fase, incluido el ángulo exacto 22.5.
7. Ejecutar `pnpm test src/modules/night`.

## Criterios de aceptación

- [ ] `computeCloudCover(10, 10, 10)` devuelve 10 y `classifyCloudCover(10)` devuelve `ideal`.
- [ ] `computeCloudCover(11, 0, 0)` devuelve 5.5 y `classifyCloudCover(11)` devuelve `good`.
- [ ] `computeCloudCover(null, 0, 0)` devuelve `null`.
- [ ] `getMoonPhaseName(22.5)` devuelve `waxing-crescent` y `getMoonPhaseName(22.49)` devuelve `new-moon`.
- [ ] Los ocho nombres están en español y coinciden con el SPEC.

## Verificación

- `pnpm test src/modules/night` pasa.
- Repasar la tabla de pruebas contra la tabla del SPEC §8.4 y §8.5.

## Notas y bloqueos

- No se calcula ni se muestra el ángulo del limbo brillante ni se rota el icono.

---

## Registro de ejecución y desviaciones (2026-10-27)

**Resultado.** Task ejecutada. `night` expone la nubosidad ponderada y su clase, las ocho fases lunares con nombre en español y el identificador de icono. Las pruebas cubren todos los cortes de nubosidad y los bordes de 22,5° de cada fase.

**Archivos creados y modificados.**

- `src/modules/night/types/night.types.ts` — ampliado con `TCloudClass`, `TMoonPhase` y `TMoonIconKey`.
- `src/modules/night/utils/cloud.ts` — `computeCloudCover`, `classifyCloudCover`.
- `src/modules/night/constants/moon-phase.constants.ts` — `MOON_PHASE_LABELS_ES`, `MOON_PHASE_RANGES`.
- `src/modules/night/utils/moon-phase.ts` — `getMoonPhaseName`, `getMoonPhaseIconKey`.
- `src/modules/night/utils/cloud.test.ts` — 14 pruebas.
- `src/modules/night/utils/moon-phase.test.ts` — 24 pruebas.

**Decisiones y desviaciones.**

1. **Redondeo de nubosidad a un decimal (autorizado por el dueño).** La task se contradecía: el alcance pedía «redondeo al porcentaje» y el criterio exige `computeCloudCover(11, 0, 0) === 5.5`. Redondear al entero daría 6. Se acordó redondear a un decimal: 5.5 se conserva y se elimina el ruido de coma flotante. Queda documentado en el JSDoc de `computeCloudCover`.
2. **Forma de `MOON_PHASE_RANGES` no definida en la task.** Se implementó como tabla de tramos semiabiertos `{ phase, startDeg, endDeg }`. La luna nueva aparece dos veces, `[0, 22.5)` y `[337.5, 360)`, para representar el cruce por 0° sin lógica especial en el consumidor. Los tramos cubren `[0, 360)` sin huecos ni solapes.
3. **Fallback inalcanzable.** `getMoonPhaseName` devuelve `new-moon` al final del recorrido como salvaguarda de tipos; la tabla cubre todo el círculo. No se usa `as` ni una aserción no nula.
4. **La fase no se evalúa a medianoche aquí.** La task asigna al consumidor calcular el ángulo a la medianoche local; estas utilidades solo nombran el ángulo recibido. La evaluación a medianoche ya vive en `getMoonInfo` (T013).
5. **Icono como identidad.** `getMoonPhaseIconKey` devuelve la propia fase, tal como ordena el paso 5, para que T022 lo sustituya por el dibujo convencional.

**Verificación.**

- `pnpm test src/modules/night` — 6 archivos y 150 pruebas pasan (38 de esta task).
- Cortes de nube comprobados: 10/20/30/40 y sus inmediatamente superiores. Bordes de fase comprobados: 22,49/22,5, 67,49/67,5, 112,49/112,5, 157,49/157,5, 202,49/202,5, 247,49/247,5, 292,49/292,5 y 337,49/337,5.
- Ángulos negativos y mayores de 360° normalizados correctamente.
- `pnpm test` — 21 archivos y 351 pruebas pasan; `pnpm typecheck`, `pnpm lint` y `pnpm build` correctos (se mantiene el warning preexistente de `prettier.config.mjs`).
