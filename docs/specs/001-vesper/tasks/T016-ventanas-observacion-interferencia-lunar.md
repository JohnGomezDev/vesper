# T016 — Ventanas de observación e interferencia lunar

- **Fase:** F5
- **SPEC:** §4, §8.5
- **Depende de:** T015
- **Desbloquea:** T017
- **Estado:** Pendiente

## Objetivo

Calcular las ventanas continuas en las que cada objeto cumple todos los filtros.

## Resultado esperado

`night` expone `computeObservationWindows` con filtros completos y `IObservationWindow` como salida, más las utilidades de interferencia lunar.

## Alcance

**Incluye**

- Objetos: Luna y los siete planetas. El Sol no genera ventana.
- Altitud mínima configurable (10/15/20/25/30, por defecto 15) con refracción.
- Oscuridad acumulativa: Urano y Neptuno −18°, Luna/Marte/Mercurio/Saturno −12°, Venus/Júpiter −6°.
- Etiqueta de brillo: simple vista, binoculares, telescopio; Urano y Neptuno «requiere óptica».
- Elongación ≥15° para Mercurio y Venus; si no, «demasiado cerca del Sol».
- Nubosidad: hora «no óptima» no entra en ninguna ventana.
- Tolerancia de un hueco de una muestra sin partir la ventana.
- Avisos Luna–planeta: aviso a <10° con Luna >20 % iluminada; aviso fuerte a <5°.
- Ventana sin Luna destacada solo para Urano y Neptuno.
- Peor clase de nubosidad y culminación dentro de la ventana.

**No incluye**

- Puntuación ni mejor ventana (T017).
- Render de la lista (T022).

## Archivos

### Crear

- `src/modules/night/types/night.types.ts` (modificar)
  - `TBrightnessLabel = 'naked-eye' | 'binoculars' | 'telescope'`
  - `TRequiredDarkness = -6 | -12 | -18`
  - `IObservationWindow { objectId: TPlanetId | 'moon'; startMs: number; endMs: number; peakAltitudeDeg: number; culminationMs: number; culminationApproximate: boolean; worstCloudClass: TCloudClass | 'unknown'; moonFree: boolean; brightnessLabel: TBrightnessLabel }`
  - `IMoonInterferenceNotice { objectId: TPlanetId; separationDeg: number; strong: boolean }`
- `src/modules/night/constants/object-filters.constants.ts`
  - Mapa por objeto con `requiredDarkness`, `brightnessLabel` y `requiresMoonFreeHighlight`.
- `src/modules/night/utils/windows.ts`
  - `computeObservationWindows(input: { samples: INightSample[]; cloudByInstant: (instantMs: number) => TCloudClass | 'unknown'; minAltitudeDeg: number; moonIlluminationPct: number }): IObservationWindow[]`
  - `computeMoonInterferenceNotices(input: { samples: INightSample[]; moonIlluminationPct: number }): IMoonInterferenceNotice[]`
- `src/modules/night/utils/windows.test.ts`

## Pasos detallados

1. Crear el mapa de filtros por objeto con los valores exactos del SPEC.
2. Para cada objeto, recorrer las muestras y marcar las que pasan todos los filtros.
3. Agrupar instantes consecutivos; permitir un único hueco de una muestra sin cerrar la ventana.
4. Calcular inicio (primera muestra válida), fin (última muestra válida), altitud máxima y culminación.
5. Calcular la peor clase de nubosidad dentro del intervalo; si algún instante es `unknown`, la ventana es `unknown` solo si no hay ningún instante conocido.
6. Marcar `moonFree` cuando la Luna está bajo el horizonte o su iluminación es <10 %.
7. Aplicar el destacado de ventana sin Luna solo a Urano y Neptuno.
8. Calcular los avisos de separación Luna–planeta con los umbrales 10° y 5°.
9. Escribir pruebas con series sintéticas: pasa todo, falla oscuridad, falla altitud, falla nubosidad, un hueco aislado, elongación corta y aviso fuerte.
10. Ejecutar `pnpm test src/modules/night`.

## Criterios de aceptación

- [ ] El Sol nunca aparece en `IObservationWindow`.
- [ ] Urano y Neptuno exigen −18°; Venus y Júpiter, −6°.
- [ ] Un hueco de una muestra no parte la ventana; dos seguidos sí.
- [ ] Una hora «no óptima» no entra en ninguna ventana.
- [ ] Mercurio y Venus con elongación <15° no generan ventana.
- [ ] Solo Urano y Neptuno pueden tener `moonFree: true` con destacado.

## Verificación

- `pnpm test src/modules/night` pasa.
- Contrastar una noche real con la lista mostrada en la app en T022.

## Notas y bloqueos

- El umbral de altitud no cambia la petición de datos: solo recalcula en local.
