# T005 — Tipos de dominio y validación de la ubicación en la URL

- **Fase:** F2
- **SPEC:** §4, §6.2, §10, §11
- **Depende de:** T004
- **Desbloquea:** T006, T008, T018
- **Estado:** Pendiente

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
   const value = Math.sign(input) * Math.round(Math.abs(input) * 100) / 100;
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
