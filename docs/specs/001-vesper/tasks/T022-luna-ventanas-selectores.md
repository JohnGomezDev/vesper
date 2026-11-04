# T022 — Luna, ventanas y selectores

- **Fase:** F7
- **SPEC:** §8.2, §8.4, §8.5, §8.6
- **Depende de:** T021
- **Desbloquea:** T023
- **Diseño:** usar las imágenes de `docs/specs/001-vesper/design/` cuando estén disponibles.
- **Estado:** Terminada (2026-11-02)

## Objetivo

Completar la información astronómica y los controles de la noche.

## Resultado esperado

La pantalla muestra el panel lunar, la lista de ventanas, el resumen de mejor ventana, el selector de noches con nota y nubosidad, y el selector de umbral de altitud que recalcula en local.

## Alcance

**Incluye**

- Panel lunar: nombre de fase, icono, iluminación, salida, puesta y altura durante la noche.
- Lista de ventanas de la Luna y los planetas con inicio, fin, altitud máxima, culminación y peor nubosidad.
- Resumen de «mejor ventana» con el criterio nube → altitud → duración.
- Selector horizontal de noches −3…+14 con palabra, número, nubosidad media y lluvia probable.
- Elemento «sin noche astronómica» cuando no hay horas válidas.
- Bloqueo de avance/retroceso en los extremos.
- Selector de umbral 10/15/20/25/30 con estado de sesión en el layout.

**No incluye**

- El Sol como objetivo.
- Estados de error y accesibilidad (T023).

## Archivos

### Crear

- `src/lib/providers/AltitudeThresholdProvider.tsx`
  - `AltitudeThresholdProvider`, `useAltitudeThreshold()` con `{ value, setValue }`, por defecto 15.
- `src/modules/night/hooks/use-night-options.ts`
  - Resúmenes de las 18 noches para el selector con `useMemo`.
- `src/modules/astronomy/components/MoonPanel.tsx`
  - Props: `IMoonPanelProps { moon: IMoonInfo | null; phase: TMoonPhase; iconKey: TMoonIconKey; illuminationPct: number; timeZone: string; nightStartMs: number; nightEndMs: number }`
- `src/modules/night/components/ObservationWindows.tsx`
  - Props: `IObservationWindowsProps { windows: IObservationWindow[]; notices: IMoonInterferenceNotice[]; timeZone: string }`
- `src/modules/night/components/BestWindowSummary.tsx`
  - Props: `IBestWindowSummaryProps { window: IObservationWindow | null; timeZone: string }`
- `src/modules/night/components/NightSelector.tsx`
  - Props: `INightSelectorProps { options: INightSummary[]; selectedDate: string; onSelect: (date: string) => void }`
- `src/modules/night/components/AltitudeThresholdSelect.tsx`
  - Props: `IAltitudeThresholdSelectProps { value: number; onChange: (value: number) => void }`

### Modificar

- `src/app/layout.tsx` — montar `AltitudeThresholdProvider` dentro de `Providers`.
- `src/modules/night/components/NightContainer.tsx` — usar el umbral del contexto, renderizar los cuatro componentes y conectar `onSelect` con `router.replace`.

## Pasos detallados

1. Crear el contexto del umbral con `useState<number>(15)` y los valores permitidos `[10, 15, 20, 25, 30]`; sin `localStorage` ni URL.
2. Montar el provider en el layout raíz para que el valor sobreviva a la navegación.
3. Implementar `use-night-options` reutilizando `getNightSummary` para las 18 noches, con `useMemo` sobre `[forecast, timeZone]`.
4. Implementar `MoonPanel` con el icono según `iconKey` y la iluminación; si `moon` es `null`, mostrar «Sin datos de Luna».
5. Implementar `ObservationWindows`: nunca incluir el Sol; destacar `moonFree` en Urano y Neptuno; mostrar los avisos de interferencia.
6. Implementar `BestWindowSummary` con el criterio del SPEC; si `null`, mostrar «Sin ventana esta noche».
7. Implementar `NightSelector` con scroll horizontal, bloqueo en `options[0]` y `options[options.length - 1]`, y `aria-label` por noche.
8. Implementar `AltitudeThresholdSelect` conectado al contexto.
9. En `NightContainer`, sustituir el umbral local por `useAltitudeThreshold()` y pasar `windows`, `bestWindow`, `moon` y `options`.
10. Ejecutar `pnpm build`, `pnpm lint` y `pnpm test`.

## Criterios de aceptación

- [x] Cambiar el umbral recalcula ventanas y mejor ventana sin petición nueva.
- [x] Cambiar de noche no dispara peticiones.
- [x] El Sol no aparece en ninguna lista de ventanas.
- [x] Urano y Neptuno muestran la ventana sin Luna destacada.
- [x] El selector muestra palabra, número, nubosidad media y lluvia probable.
- [x] El umbral vuelve a 15 al cerrar y abrir la pestaña.

## Verificación

- `pnpm build` pasa.
- Con la pestaña de red abierta, cambiar umbral y noche y comprobar que no hay peticiones.
- Comparar con la imagen de referencia.

## Notas y bloqueos

- El selector de noches puede ser costoso; medir el tiempo de cálculo y, si supera 50 ms, memoizar por noche.

## Registro de ejecución y desviaciones (2026-11-02)

**Resultado.** Task ejecutada. La pantalla muestra el panel lunar, la mejor ventana, la lista de ventanas con avisos de proximidad lunar, el selector de umbral y el selector horizontal de las 18 noches con palabra, número, nubosidad media y lluvia probable.

### Archivos creados

- `src/lib/providers/AltitudeThresholdProvider.tsx`
- `src/lib/types/altitude-threshold.types.ts`
- `src/modules/night/hooks/use-night-options.ts`
- `src/modules/night/utils/night-options.ts`
- `src/modules/night/utils/night-selector.ts`
- `src/modules/night/utils/moon-icon.ts`
- `src/modules/night/utils/moon-icon.test.ts`
- `src/modules/night/constants/altitude-threshold.constants.ts`
- `src/modules/night/constants/object-labels.constants.ts`
- `src/modules/night/components/MoonPanel.tsx`
- `src/modules/night/components/ObservationWindows.tsx`
- `src/modules/night/components/BestWindowSummary.tsx`
- `src/modules/night/components/NightSelector.tsx`
- `src/modules/night/components/AltitudeThresholdSelect.tsx`

### Archivos modificados

- `src/app/layout.tsx` — `AltitudeThresholdProvider` montado dentro de `Providers`.
- `src/modules/night/components/NightContainer.tsx` — umbral del contexto, panel lunar, mejor ventana, ventanas, selector y `router.replace` de la noche.
- `src/modules/night/types/night.types.ts` — `IUseNightOptionsInput`, avisos, altura máxima lunar y mapas de nubosidad.
- `src/modules/night/hooks/use-night-analysis.ts` — `notices`, `moonPeakAltitudeDeg` y `moonPeakMs`.
- `src/modules/night/constants/night.constants.ts` — retirada del umbral temporal.
- `src/modules/night/components/NightSelector.tsx` — extremos seleccionables y bloqueo en la navegación del encabezado.

### Decisiones y desviaciones

1. **Archivos auxiliares autorizados.** Constantes, utilidades, tipos y pruebas necesarios para respetar `module-structure`; no se dejaron etiquetas ni cálculos dentro de los componentes.
2. **Avisos de interferencia lunar.** `ObservationWindows` exige `notices`, pero `useNightAnalysis` no los calculaba. Se añadió `computeMoonInterferenceNotices` al análisis y `notices` a `INightAnalysis`, reutilizando la utilidad ya probada en T016. Sin este cambio el prop no tenía fuente.
3. **Altura de la Luna.** `IMoonInfo` solo trae la posición a medianoche. Se ampliaron los props de `MoonPanel` con `peakAltitudeDeg` y `peakMs`, calculados con el muestreo de 10 minutos dentro de sunset→sunrise. También se admiten `nightStartMs`/`nightEndMs` nulos para mostrar «Sin noche astronómica este día» en latitudes polares en vez de «00:00 a 00:00».
4. **Dependencias de `use-night-options`.** Además de `forecast` y `timeZone`, el `useMemo` depende de `slug` y `todayLocal`: sin ellos no se pueden resolver el observador ni el rango −3…+14. El cálculo sigue sin ejecutarse al cambiar de noche o de umbral.
5. **Extremos del selector (corrección autorizada).** T022 pedía deshabilitar `options[0]` y `options[último]`, pero el SPEC §8.2 solo bloquea avanzar más allá de +14 y retroceder más allá de −3. Los 18 botones son seleccionables; «Anterior/Siguiente» se deshabilitan en los extremos. Verificado: −3 deshabilita «Anterior» y +14 deshabilita «Siguiente».
6. **Rendimiento del selector (nota de la task).** La primera implementación tardaba 75–108 ms en desarrollo porque `filterHoursInWindow` recalculaba `parseLocalDateTime` para las 19 fechas en cada noche. Se precalcularon los instantes de las filas una sola vez; el cálculo bajó a **8–12 ms** en desarrollo, por debajo de los 50 ms que la task usa como umbral. No hizo falta memoizar por noche; se mantiene `useMemo`.
7. **Icono lunar.** Se dibuja con una ruta SVG calculada a partir del `iconKey` y la iluminación. No se rota el icono ni se muestra el ángulo del limbo brillante, conforme al SPEC §8.4.
8. **Selector de umbral.** Se implementó con `<select>` nativo, etiquetado y con objetivos táctiles de 44 px. El estado vive en el provider del layout, sin `localStorage` ni URL; al recargar vuelve a 15 (verificado).
9. **Fecha visible en el selector.** Además de palabra, número, nubosidad media y lluvia, cada opción muestra la fecha abreviada para facilitar la orientación; no sustituye a ninguno de los datos exigidos.
10. **El Sol no entra en las listas.** `computeObservationWindows` ya excluye al Sol; `ObservationWindows` solo pinta `windows` y `notices`. Verificado en la interfaz.

### Verificación

- `pnpm typecheck`, `pnpm lint` (solo el warning preexistente de `prettier.config.mjs`), `pnpm test` (26 archivos, 377 pruebas) y `pnpm build`: correctos.
- Cambiar el umbral de 15° a 30° recalcula las ventanas y la mejor ventana: comprobado en navegador con el texto de la sección antes/después y **sin peticiones nuevas** a Open-Meteo.
- Cambiar de noche actualiza `?date=` con `replace` y **no dispara peticiones**: contador de red de Open-Meteo idéntico antes y después.
- Selector: 18 opciones, sin deshabilitadas, con etiquetas accesibles del tipo «Noche del lun, 2 nov: Excelente, 83 puntos, nubosidad media 9 %».
- Extremos: −3 y +14 seleccionables; «Anterior» deshabilitado en −3 y «Siguiente» en +14.
- Umbral tras recarga: `15 → 30 → recarga → 15`.
- Panel lunar verificado con Bogotá: fase, icono, iluminación, salida, puesta, altura máxima y altura a medianoche.
- Latitudes altas: en `85.00, 0.00` no aparecen ventanas ni horas y el panel lunar indica «Sin noche astronómica este día».
- Captura comparada con la imagen de referencia en móvil y escritorio.
