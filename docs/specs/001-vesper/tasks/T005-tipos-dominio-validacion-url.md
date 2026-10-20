# T005 — Tipos de dominio y validación de la ubicación en la URL

- **Fase:** F2
- **SPEC:** §4, §6.2, §10, §11
- **Depende de:** T004
- **Desbloquea:** T006, T008, T018
- **Estado:** Terminada

## Objetivo

Modelar la ubicación y resolver el slug y las coordenadas de la URL. La validación de `?date=` se cubre en T006.

## Resultado esperado

Un módulo `location` con los tipos base, el redondeo de coordenadas y el parseo/construcción de los tres tipos de slug del SPEC §6.2, con pruebas unitarias propias.

## Alcance

**Incluye**

- Tipos `ICoordinates`, `ILocation`, `TSlugParseResult`.
- Redondeo a 2 decimales, mitad alejándose de cero, normalizando `-0` a `0`.
- Validación de rango: latitud −90…90, longitud −180…180.
- Construcción de slug de ciudad curada y de slug de coordenadas con etiqueta opcional.
- Parseo de slug: coincidencia exacta con la lista curada; si no, partir solo por `_`, validar los dos últimos tramos con `^-?\d+\.\d{2}$` y rango; el resto es etiqueta.
- `slugifyLabel`: minúsculas, sin tildes, espacios y signos a `-`, sin `_`.
- Devolver `{ kind: 'invalid' }` para cualquier forma que no cumpla.

**No incluye**

- Lista curada de ciudades (es T019).
- Validación de `?date=` ni zona horaria (es T006).
- Componentes, hooks ni peticiones de red.

## Archivos

### Crear

- `src/modules/location/types/location.types.ts`
  - `ICoordinates { latitude: number; longitude: number }`
  - `ILocation { slug, name, coordinates, elevationM: number | null, timeZone, isCurated }`
  - `TSlugParseResult` (unión discriminada de la convención común)
- `src/modules/location/utils/coordinates.ts`
  - `roundCoordinate(value: number): number`
  - `roundCoordinates(coordinates: ICoordinates): ICoordinates`
  - `isValidLatitude(value: number): boolean`
  - `isValidLongitude(value: number): boolean`
- `src/modules/location/utils/slug.ts`
  - `slugifyLabel(label: string): string`
  - `buildCuratedSlug(slug: string): string`
  - `buildCoordinatesSlug(label: string | null, coordinates: ICoordinates): string`
  - `parseSlug(slug: string, curatedSlugs: ReadonlySet<string>): TSlugParseResult`
- `src/modules/location/utils/coordinates.test.ts`
- `src/modules/location/utils/slug.test.ts`

## Pasos detallados

1. Definir los tipos de `location.types.ts` sin `any`.
2. Implementar `roundCoordinate`:
   ```ts
   const value = (Math.sign(input) * Math.round(Math.abs(input) * 100)) / 100;
   return value === 0 ? 0 : value;
   ```
3. Implementar validadores de rango con comparación estricta.
4. Implementar `slugifyLabel` con `normalize('NFD')`, eliminar diacríticos, reemplazar `[^a-z0-9]+` por `-`, recortar guiones.
5. Implementar `buildCoordinatesSlug` con `toFixed(2)`, sin `+` y conservando `-`.
6. Implementar `parseSlug`:
   - Si `curatedSlugs.has(slug)` → `{ kind: 'curated', slug }`.
   - Si no, `const parts = slug.split('_')`; si `parts.length < 2` → `invalid`.
   - Tomar los dos últimos, probar la regex y el rango; si fallan → `invalid`.
   - `label = parts.slice(0, -2).join('_')`; vacío → `null`.
   - Devolver `{ kind: 'coordinates', label, coordinates }`.
7. Escribir las pruebas con los ejemplos del SPEC §6.2 y los casos límite.
8. Ejecutar `pnpm test`.

## Criterios de aceptación

- [ ] `ushuaia_-54.80_-68.30` devuelve latitud negativa y longitud negativa.
- [ ] `villa-de-leyva_5.63_-73.52` conserva los guiones de la etiqueta.
- [ ] `4.61_-74.08` devuelve etiqueta `null`.
- [ ] `bogota` con lista curada devuelve `{ kind: 'curated' }`.
- [ ] `bogota_4.61_-74.08` devuelve `{ kind: 'coordinates', label: 'bogota' }` aunque la etiqueta no corresponda.
- [ ] `-74.08` sin latitud, `4.6_-74.08` o `91.00_0.00` devuelven `{ kind: 'invalid' }`.
- [ ] `roundCoordinate(-0.001)` devuelve `0`, no `-0`.

## Verificación

- `pnpm test src/modules/location` pasa.
- Revisar que ninguna prueba depende de la zona horaria de la máquina.

## Notas y bloqueos

- La etiqueta no se contrasta con la lista curada ni con geocodificación.

---

## Registro de ejecución y desviaciones (2026-10-20)

**Resultado.** Task ejecutada. Existe el módulo `location` con los tipos base, el redondeo de coordenadas, los validadores de rango y el parseo/construcción de los tres tipos de slug del SPEC §6.2, con pruebas unitarias propias. Todos los criterios de aceptación quedaron verificados.

**Archivos creados.**

- `src/modules/location/types/location.types.ts` — `ICoordinates`, `ILocation` y `TSlugParseResult`.
- `src/modules/location/utils/coordinates.ts` — `roundCoordinate`, `roundCoordinates`, `isValidLatitude` e `isValidLongitude`.
- `src/modules/location/utils/slug.ts` — `slugifyLabel`, `buildCuratedSlug`, `buildCoordinatesSlug` y `parseSlug`.
- `src/modules/location/utils/coordinates.test.ts` — 9 pruebas.
- `src/modules/location/utils/slug.test.ts` — 19 pruebas.

**Desviaciones y decisiones autorizadas.**

1. **Redondeo decimal robusto en lugar del pseudocódigo literal del paso 2 (autorizado por el dueño).** La fórmula literal `(Math.sign(input) * Math.round(Math.abs(input) * 100)) / 100` no cumple «mitad alejándose de cero» por la representación binaria: produce `1.005 → 1`, `-1.005 → -1` y `-74.085 → -74.08`. Como T007 exige probar exactamente esos valores, se mantuvo la firma y el comportamiento de 2 decimales, pero se normaliza la escala con `toPrecision(15)` antes de `Math.round`. Resultado: `1.005 → 1.01`, `-1.005 → -1.01`, `4.615 → 4.62`, `-74.085 → -74.09`, y `-0` se sigue normalizando a `0`.
2. **`buildCuratedSlug` normaliza con `slugifyLabel` (autorizado por el dueño).** La task no detallaba el comportamiento. Se devuelve `slugifyLabel(slug)` para cumplir las reglas del SPEC §6.2 (minúsculas, sin tildes, guiones internos y sin `_`), tanto si recibe un nombre como un slug casi normalizado.
3. **`buildCoordinatesSlug` redondea antes de aplicar `toFixed(2)`.** Se usa `roundCoordinates` para garantizar los 2 decimales y evitar `-0.00`; después se aplica `toFixed(2)`, se conserva el signo negativo y no se añade `+`.
4. **Límites de rango inclusivos.** `isValidLatitude` acepta `-90` y `90`, e `isValidLongitude` acepta `-180` y `180`, en línea con el SPEC §6.2 y §11. Se rechazan valores fuera del rango, `NaN` e infinitos.
5. **Sin dependencia de la zona horaria.** Las pruebas y utilidades no usan fechas ni `Intl`; se ejecutaron con `TZ=UTC` y `TZ=America/Bogota` con el mismo resultado.

**Archivos modificados (documentación, según lo pedido).**

- `docs/specs/001-vesper/tasks/README.md` — T005 marcada como «Terminada».
- `docs/specs/001-vesper/tasks/T005-tipos-dominio-validacion-url.md` — estado y este registro.

No se tocó ningún archivo fuera del alcance de la task.

**Verificación.**

- `pnpm test src/modules/location` — 2 archivos y 28 pruebas pasan.
- `pnpm test` — 3 archivos y 29 pruebas pasan.
- `TZ=UTC pnpm test src/modules/location` y `TZ=America/Bogota pnpm test src/modules/location` — 28 pruebas pasan en ambas zonas.
- `pnpm typecheck` — sin errores.
- `pnpm lint` — 0 errores; se mantiene el warning preexistente de `prettier.config.mjs`.
- `pnpm exec prettier --check` sobre los cinco archivos creados — todos conformes.
