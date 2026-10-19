# T014 — Muestreo de 10 minutos y pruebas de humo

- **Fase:** F4
- **SPEC:** §5.4, §8.5
- **Depende de:** T013
- **Desbloquea:** T015, T016
- **Estado:** Pendiente

## Objetivo

Producir la serie de posiciones que alimenta las ventanas de observación.

## Resultado esperado

Un generador de muestras cada 10 minutos a lo largo de la tira visible, con utilidades para máximos y culminación aproximada, más pruebas de humo de posiciones.

## Alcance

**Incluye**

- `SAMPLE_STEP_MS = 600000`.
- Muestreo de Sol, Luna y los siete planetas entre `startMs` y `endMs`.
- Utilidades de serie: máximo de altitud y culminación aproximada.
- Relleno de `culminationMs` cuando T013 lo dejó en `null`.
- Pruebas de humo de posiciones y horas.

**No incluye**

- Calcular ventanas ni aplicar filtros (T016).
- Nubosidad ni puntuación (T015, T017).

## Archivos

### Crear

- `src/modules/astronomy/constants/sampling.constants.ts`
  - `SAMPLE_STEP_MS = 600000`.
- `src/modules/astronomy/types/astronomy.types.ts` (modificar)
  - `INightSample { instantMs: number; sun: IHorizontalPosition; moon: IHorizontalPosition; planets: Record<TPlanetId, IHorizontalPosition> }`
- `src/modules/astronomy/services/sampling.service.ts`
  - `sampleNight(input: { observer: IObserver; startMs: number; endMs: number }): INightSample[]`
- `src/modules/astronomy/utils/series.ts`
  - `findMaxAltitude(samples: INightSample[], objectId: TPlanetId | 'moon'): { altitudeDeg: number; instantMs: number } | null`
  - `findCulmination(samples: INightSample[], objectId: TPlanetId | 'moon'): { culminationMs: number; peakAltitudeDeg: number; approximate: true } | null`
- `src/modules/astronomy/services/sampling.service.test.ts`
- `src/modules/astronomy/utils/series.test.ts`

## Pasos detallados

1. Implementar `sampleNight` iterando de `startMs` a `endMs` con paso `SAMPLE_STEP_MS`, incluyendo ambos extremos si caen en la rejilla.
2. Calcular por instante el Sol, la Luna y los siete planetas una sola vez.
3. Garantizar que el número de muestras es `floor((endMs - startMs) / SAMPLE_STEP_MS) + 1` y documentarlo.
4. Implementar `findMaxAltitude` y `findCulmination`; `findCulmination` devuelve siempre `approximate: true` porque sale del muestreo.
5. Usar `findCulmination` para rellenar las ventanas cuya culminación nativa sea `null`.
6. Escribir pruebas: número de muestras para una tira de 10 h, máximo de un objeto sintético y empate resuelto por el primer instante.
7. Ejecutar `pnpm test src/modules/astronomy`.

## Criterios de aceptación

- [ ] Una tira de 10 horas produce 61 muestras.
- [ ] El muestreo no se recalcula dos veces para el mismo rango dentro del mismo cálculo.
- [ ] `findCulmination` marca siempre `approximate: true`.
- [ ] No hay red.

## Verificación

- `pnpm test src/modules/astronomy` pasa.
- Comprobar que el tiempo de cálculo de una noche es del orden de milisegundos y no bloquea el render.

## Notas y bloqueos

- El muestreo se calcula solo cuando cambian observador, noche o umbral; nunca en cada render.
