# T015 — Nubosidad ponderada y fases lunares

- **Fase:** F5
- **SPEC:** §8.4, §8.5
- **Depende de:** T006, T014
- **Desbloquea:** T016
- **Estado:** Pendiente

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
