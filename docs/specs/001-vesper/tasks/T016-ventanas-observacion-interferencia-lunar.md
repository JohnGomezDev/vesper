# T016 — Ventanas de observación e interferencia lunar

- **Fase:** F5
- **SPEC:** §4, §8.5
- **Depende de:** T015
- **Desbloquea:** T017
- **Estado:** Terminada (2026-10-27)

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

---

## Registro de ejecución y desviaciones (2026-10-27)

**Resultado.** Task ejecutada. `night` expone `computeObservationWindows` con los filtros completos, `IObservationWindow`, `computeMoonInterferenceNotices` e `IMoonInterferenceNotice`. El Sol nunca genera ventana y las ventanas se agrupan tolerando un hueco aislado de una muestra.

**Archivos creados y modificados.**

- `src/modules/night/types/night.types.ts` — ampliado con `TBrightnessLabel`, `TRequiredDarkness`, `IObservationWindow` e `IMoonInterferenceNotice`.
- `src/modules/night/constants/object-filters.constants.ts` — `OBJECT_FILTERS`, `WINDOW_OBJECT_IDS` y umbrales de elongación e interferencia lunar.
- `src/modules/night/utils/windows.ts` — `computeObservationWindows`, `computeMoonInterferenceNotices`.
- `src/modules/night/utils/windows.test.ts` — 22 pruebas.

**Decisiones y desviaciones.**

1. **Entrada ampliada con `elongationByObject` (autorizado por el dueño).** La firma de la task no permitía cumplir el filtro de elongación ≥15° de Mercurio y Venus: `INightSample` solo contiene posiciones. Se añadió el parámetro obligatorio `elongationByObject(objectId, instantMs) => number | null`. `null` o un valor menor que 15° deja al objeto sin ventana. Es la única ampliación de la firma.
2. **`moonFree` solo para Urano y Neptuno (autorizado).** Para el resto de objetos siempre es `false`; así se cumple el criterio de que solo esos dos pueden tenerlo con destacado. Se marca cuando la iluminación lunar es menor que 10 % o cuando la Luna está bajo el horizonte en todas las muestras válidas de la ventana.
3. **Etiqueta de brillo estática (autorizado).** El mapa usa `naked-eye` para Luna, Mercurio, Venus, Marte, Júpiter y Saturno, y `telescope` para Urano y Neptuno. No se deriva de la magnitud aparente como describe SPEC §8.5.3 porque la task pide un mapa constante y la entrada no recibe magnitudes. Queda pendiente si el producto necesita esa precisión.
4. **Culminación aproximada.** `INightSample` no lleva la culminación nativa de `SearchHourAngle`; T013 la expone en `IPlanetInfo`, que no forma parte de la serie. Se usa `findCulmination` de T014 sobre las muestras válidas y se marca `culminationApproximate: true` siempre. La nota de T014 sobre rellenar un valor nativo `null` no aplica porque ese valor no viaja en la entrada.
5. **Peor nubosidad del intervalo.** Se calcula sobre todas las muestras entre el inicio y el fin de la ventana, incluido el hueco aislado tolerado, porque la task pide la peor clase «dentro del intervalo». `unknown` solo gana si ninguna muestra del intervalo tiene clase conocida.
6. **Nubosidad `unknown` no excluye.** Solo `poor` queda fuera de las ventanas (SPEC §8.5.6). Una hora desconocida puede entrar y se refleja en `worstCloudClass`.
7. **Avisos sin filtro de horizonte.** `computeMoonInterferenceNotices` usa la separación mínima de toda la serie, tal como pide la task. No se condiciona a que la Luna esté sobre el horizonte; T022 puede decidir ocultar el aviso en ese caso. La separación usa `getAngularSeparation`, la ley esférica de cosenos sobre coordenadas horizontales que T013 dejó documentada.
8. **Umbrales de oscuridad estrictos.** Se exige `Sol < −6`, `< −12` o `< −18`; un Sol exactamente en el umbral no pasa.

**Verificación.**

- `pnpm test src/modules/night` — 6 archivos y 150 pruebas pasan (22 de esta task).
- Criterios cubiertos: Luna y siete planetas con ventana, Sol ausente; Urano/Neptuno a −18°, Venus/Júpiter a −6°; hueco aislado que no parte y dos seguidos que sí; hora `poor` fuera de toda ventana; Mercurio/Venus sin elongación suficiente sin ventana; `moonFree` solo en Urano y Neptuno; aviso normal a 7° y fuerte a 2°.
- `pnpm test` — 21 archivos y 351 pruebas pasan; `pnpm typecheck`, `pnpm lint` y `pnpm build` correctos (se mantiene el warning preexistente de `prettier.config.mjs`).
