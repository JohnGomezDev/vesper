# T022 — Luna, ventanas y selectores

- **Fase:** F7
- **SPEC:** §8.2, §8.4, §8.5, §8.6
- **Depende de:** T021
- **Desbloquea:** T023
- **Diseño:** usar las imágenes de `docs/specs/001-vesper/design/` cuando estén disponibles.
- **Estado:** Pendiente

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

- [ ] Cambiar el umbral recalcula ventanas y mejor ventana sin petición nueva.
- [ ] Cambiar de noche no dispara peticiones.
- [ ] El Sol no aparece en ninguna lista de ventanas.
- [ ] Urano y Neptuno muestran la ventana sin Luna destacada.
- [ ] El selector muestra palabra, número, nubosidad media y lluvia probable.
- [ ] El umbral vuelve a 15 al cerrar y abrir la pestaña.

## Verificación

- `pnpm build` pasa.
- Con la pestaña de red abierta, cambiar umbral y noche y comprobar que no hay peticiones.
- Comparar con la imagen de referencia.

## Notas y bloqueos

- El selector de noches puede ser costoso; medir el tiempo de cálculo y, si supera 50 ms, memoizar por noche.
