# T017 — Mejor ventana, puntuación y pruebas

- **Fase:** F5
- **SPEC:** §8.2, §8.6
- **Depende de:** T016
- **Desbloquea:** T019, T022
- **Estado:** Terminada (2026-10-27)

## Objetivo

Producir el resumen de la mejor ventana y la puntuación de calidad de cada noche.

## Resultado esperado

`night` expone `pickBestWindow`, `computeHourlyScore`, `computeNightScore` y `getNightSummary`, con los escalones y los dos ejemplos del SPEC como pruebas.

## Alcance

**Incluye**

- Mejor ventana: menor `nube`, luego mayor altitud máxima, luego mayor duración.
- Nota horaria `0,55 nube + 0,20 viento + 0,15 humedad + 0,10 lluvia`.
- Escalones con el borde en el escalón mejor.
- Horas válidas solo con Sol < −18°; nulos fuera de la media.
- Nota nocturna con resta lunar `35 × (iluminación/100)^0,7 × solape`, recorte a 0 y palabra.
- Selector: media de `nube` y lluvia probable con máximo de `precipitation_probability` ≥ 60 % en horas válidas.
- «Sin noche astronómica» si no hay horas válidas.
- Palabras: Excelente ≥80, Buena ≥65, Regular ≥50, Mala <50.

**No incluye**

- Render del selector (T022).
- Nubosidad por capas (T015).

## Archivos

### Crear

- `src/modules/night/constants/score.constants.ts`
  - Tablas de puntos de nube, viento, humedad y lluvia; pesos; umbral de lluvia 60; umbrales de palabra.
- `src/modules/night/types/night.types.ts` (modificar)
  - `TScoreLabel = 'excellent' | 'good' | 'fair' | 'bad'`
  - `INightSummary { date: string; score: number | null; label: TScoreLabel | null; cloudAverage: number | null; rainLikely: boolean; }
  - `IHourlyScore { instantMs: number; score: number | null }`
- `src/modules/night/utils/score.ts`
  - `computeHourlyScore(input: { cloud: number | null; windKmh: number | null; humidityPct: number | null; precipitationProbabilityPct: number | null }): number | null`
  - `computeNightScore(input: { hourlyScores: IHourlyScore[]; moonIlluminationPct: number; moonAboveHorizonByInstant: (instantMs: number) => boolean; validInstantMs: number[] }): { score: number | null; label: TScoreLabel | null }`
- `src/modules/night/utils/best-window.ts`
  - `pickBestWindow(windows: IObservationWindow[], cloudByWindow: (window: IObservationWindow) => number | null): IObservationWindow | null`
- `src/modules/night/utils/night-summary.ts`
  - `getNightSummary(input: { date: string; hourly: IHourlyRow[]; timeZone: string; sunAltitudes: Map<number, number>; moonAboveHorizonByInstant: (instantMs: number) => boolean; moonIlluminationPct: number }): INightSummary`
- `src/modules/night/utils/score.test.ts`
- `src/modules/night/utils/best-window.test.ts`

## Pasos detallados

1. Volcar las tablas de escalones y pesos en `score.constants.ts` tal como están en el SPEC.
2. Implementar `computeHourlyScore` devolviendo `null` si falta cualquiera de las cuatro variables.
3. Implementar `computeNightScore`: filtrar horas válidas, media, solape (fracción de horas válidas con Luna sobre el horizonte), resta y recorte.
4. Implementar `pickBestWindow` con el orden nube → altitud → duración.
5. Implementar `getNightSummary`: calcular `cloudAverage` sobre horas válidas, `rainLikely` con el máximo de probabilidad, y etiquetar «sin noche astronómica» con `score: null`.
6. Escribir pruebas de todos los cortes y de los dos ejemplos: cielo cubierto perfecto → 45 «Mala»; noche perfecta con Luna llena toda la noche → 65 «Buena».
7. Ejecutar `pnpm test src/modules/night`.

## Criterios de aceptación

- [ ] El borde pertenece al escalón mejor en las cuatro tablas.
- [ ] Un valor nulo en una variable deja la hora fuera de la media.
- [ ] `computeNightScore` recorta a 0 si la resta deja la nota negativa.
- [ ] Sin horas bajo −18° el resultado es `{ score: null, label: null }`.
- [ ] `rainLikely` es verdadero con probabilidad máxima 60 y falso con 59.
- [ ] Los dos ejemplos del SPEC dan 45 y 65.

## Verificación

- `pnpm test src/modules/night` pasa.
- Revisar que `pickBestWindow` devuelve `null` si no hay ventanas.

## Notas y bloqueos

- No se incluye en la cuenta el punto de rocío, las ráfagas ni la visibilidad.

---

## Registro de ejecución y desviaciones (2026-10-27)

**Resultado.** Task ejecutada. `night` expone `pickBestWindow`, `computeHourlyScore`, `computeNightScore` y `getNightSummary`, con las cuatro tablas de puntos, los pesos, el umbral de lluvia y los cortes de palabra. Los dos ejemplos del SPEC dan 45 «Mala» y 65 «Buena».

**Archivos creados y modificados.**

- `src/modules/night/constants/score.constants.ts` — tablas de nube, viento, humedad y lluvia; pesos; umbral de lluvia; umbrales de palabra; parámetros de la resta lunar.
- `src/modules/night/types/night.types.ts` — ampliado con `TScoreLabel`, `INightSummary` e `IHourlyScore`.
- `src/modules/night/utils/score.ts` — `computeHourlyScore`, `computeNightScore`.
- `src/modules/night/utils/best-window.ts` — `pickBestWindow`.
- `src/modules/night/utils/night-summary.ts` — `getNightSummary`.
- `src/modules/night/utils/score.test.ts` — 57 pruebas (incluye `getNightSummary`).
- `src/modules/night/utils/best-window.test.ts` — 8 pruebas.

**Decisiones y desviaciones.**

1. **Sin redondeo de nota (autorizado por el dueño).** La nota horaria y la nocturna conservan sus decimales; solo se aplica una normalización a 10⁻⁶ para limpiar el ruido binario de los pesos (`100` en vez de `100.00000000000001`). No es redondeo de presentación y los ejemplos del SPEC quedan exactos.
2. **Horas válidas y solape lunar.** `validInstantMs` es la lista de horas con Sol < −18°. La media solo usa las horas con nota no nula; el solape lunar divide entre todas las horas válidas, incluidas las de nota nula, porque el SPEC define el solape como fracción de «las horas válidas». Sin horas válidas, o si todas tienen nota nula, el resultado es `{ score: null, label: null }`.
3. **Contrato de `sunAltitudes`.** El mapa se indexa por el instante de cada fila horaria, calculado con `parseLocalDateTime(row.time, timeZone)`. Una fila sin entrada se considera desconocida y queda fuera de las horas válidas. Se documentó en el JSDoc para que T019/T021 construyan el mapa con esas claves.
4. **`cloudAverage` sin redondear.** Se promedia la nubosidad ponderada de las horas válidas con valor conocido; las horas con capa faltante no se sustituyen por cero. La task no fija redondeo para la media.
5. **`rainLikely` y noches sin nota.** Se usa el máximo de `precipitationProbability` de las horas válidas (≥ 60). Sin horas válidas no hay nota y `rainLikely` es `false`, coherente con «no marca lluvia».
6. **`pickBestWindow` con nubosidad desconocida.** Un `null` se trata como el peor valor; si todas son `null` sigue aplicando el desempate por altitud y duración. Los empates completos conservan la primera ventana para que el resultado sea determinista.
7. **Pruebas de `getNightSummary` en `score.test.ts`.** La task solo lista `score.test.ts` y `best-window.test.ts`; no se creó un archivo de prueba adicional fuera del alcance para el resumen.

**Verificación.**

- `pnpm test src/modules/night` — 6 archivos y 150 pruebas pasan (65 de esta task).
- Cortes comprobados en las cuatro tablas, incluidos los valores inmediatamente superiores. Palabras comprobadas en 80/79,9, 65/64,9 y 50/49,9.
- Ejemplos del SPEC: cielo cubierto con el resto perfecto → 45 «Mala»; noche perfecta con Luna llena toda la noche → 65 «Buena». Recorte a 0 comprobado.
- `rainLikely` verdadero con 60 y falso con 59; sin horas bajo −18° no hay nota ni lluvia.
- `pickBestWindow` devuelve `null` sin ventanas y respeta el orden nube → altitud → duración.
- `pnpm test` — 21 archivos y 351 pruebas pasan; `pnpm typecheck`, `pnpm lint` y `pnpm build` correctos (se mantiene el warning preexistente de `prettier.config.mjs`).
