# T014 — Muestreo de 10 minutos y pruebas de humo

- **Fase:** F4
- **SPEC:** §5.4, §8.5
- **Depende de:** T013
- **Desbloquea:** T015, T016
- **Estado:** Terminada (2026-10-27)

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

- [x] Una tira de 10 horas produce 61 muestras.
- [x] El muestreo no se recalcula dos veces para el mismo rango dentro del mismo cálculo.
- [x] `findCulmination` marca siempre `approximate: true`.
- [x] No hay red.

## Verificación

- `pnpm test src/modules/astronomy` pasa.
- Comprobar que el tiempo de cálculo de una noche es del orden de milisegundos y no bloquea el render.

## Notas y bloqueos

- El muestreo se calcula solo cuando cambian observador, noche o umbral; nunca en cada render.

---

## Registro de ejecución (2026-10-27)

**Resultado.** Task ejecutada. El módulo `astronomy` expone `SAMPLE_STEP_MS`, `INightSample`, `sampleNight` y las utilidades de serie `findMaxAltitude`/`findCulmination`. Una tira de 10 horas produce 61 muestras con el Sol, la Luna y los siete planetas calculados una sola vez por instante.

**Archivos creados y modificados.**

- `src/modules/astronomy/constants/sampling.constants.ts` — `SAMPLE_STEP_MS = 600000`.
- `src/modules/astronomy/types/astronomy.types.ts` — ampliado con `INightSample`.
- `src/modules/astronomy/services/sampling.service.ts` — `sampleNight`.
- `src/modules/astronomy/utils/series.ts` — `findMaxAltitude`, `findCulmination`.
- `src/modules/astronomy/services/sampling.service.test.ts` — 5 pruebas.
- `src/modules/astronomy/utils/series.test.ts` — 5 pruebas.

**Decisiones y desviaciones.**

1. **Relleno de culminación aplazado a T016 (autorizado).** En F4 no existen ventanas ni un tipo de ventana. `findCulmination` queda implementado y documentado para que T016 rellene `culminationMs` cuando el valor nativo sea `null`. No se inventó un tipo de ventana ni se añadió un helper fuera de alcance.
2. **Rango inválido lanza `RangeError`.** La task no define `endMs < startMs` ni valores no finitos; se tratan como error de programación, igual que las utilidades de fecha de T006.
3. **Extremo no alineado con la rejilla.** Si `endMs` no cae en la rejilla, la última muestra es la anterior a `endMs`, manteniendo la fórmula `floor((endMs − startMs) / SAMPLE_STEP_MS) + 1`. Está documentado en el servicio y cubierto por prueba.
4. **Una sola pasada por instante.** `sampleNight` calcula Sol, Luna y los siete planetas una vez por instante; no se recalcula el mismo rango dentro de la llamada.
5. **Empates.** `findMaxAltitude` conserva el primer instante con la altitud máxima, tal como pide el paso 6.
6. **Dependencia de T013 (autorizada).** Para no repetir búsquedas caras, el muestreo usa `getSunPosition`, `getMoonPosition` y `getPlanetPosition`; los dos últimos se exportaron en T013 con autorización. No se usan `getMoonInfo`/`getPlanetInfo`, que harían varias búsquedas por muestra.
7. **Rendimiento medido.** La tira de 61 muestras × 9 cuerpos tarda 8–29 ms en la máquina de desarrollo. La prueba incluye una guarda de 500 ms para detectar regresiones patológicas sin volverse frágil.

**Verificación.**

- `pnpm test src/modules/astronomy` — 5 archivos y 42 pruebas pasan (10 de esta task).
- Tira de 10 h: 61 muestras; primer instante = `startMs`; último = `endMs` cuando cae en la rejilla.
- `pnpm test` — 16 archivos y 226 pruebas pasan.
- `pnpm typecheck` sin errores; `pnpm lint` con 0 errores (se mantiene el warning preexistente de `prettier.config.mjs`); `pnpm build` correcto.
- Sin red en `src/modules/astronomy`.
