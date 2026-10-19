# T017 — Mejor ventana, puntuación y pruebas

- **Fase:** F5
- **SPEC:** §8.2, §8.6
- **Depende de:** T016
- **Desbloquea:** T019, T022
- **Estado:** Pendiente

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
