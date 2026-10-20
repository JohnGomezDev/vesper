# T007 — Pruebas de dominio

- **Fase:** F2
- **SPEC:** §4, §6.2, §6.3, §10
- **Depende de:** T006
- **Desbloquea:** T018
- **Estado:** Terminada

## Objetivo

Blindar la lógica pura de F2 con pruebas de tabla antes de construir datos y UI encima.

## Resultado esperado

Suite de pruebas de dominio que cubre los casos límite del SPEC §10 y falla si alguna regla se rompe.

## Alcance

**Incluye**

- Ampliar las pruebas de T005 y T006 con una matriz de casos límite.
- Casos de tabla de slug, redondeo, fecha, tira visible, noche actual y hora local.
- Pruebas deterministas: fechas fijas y zona horaria explícita.

**No incluye**

- Pruebas de componentes, de red o end-to-end.
- Pruebas de cálculos astronómicos (son T014).

## Archivos

### Modificar

- `src/modules/location/utils/coordinates.test.ts`
- `src/modules/location/utils/slug.test.ts`
- `src/modules/location/utils/datetime.test.ts`
- `src/modules/night/utils/night.test.ts`

### Crear

- `src/modules/location/utils/__fixtures__/domain-fixtures.ts` — fechas, zonas y casos compartidos.

## Pasos detallados

1. Crear las fixtures: `America/Bogota`, `America/New_York` (cambio de hora), `America/Santiago` (sur), un lugar polar (`Europe/Oslo` en junio).
2. Añadir a `coordinates.test.ts`: `0`, `-0`, `1.005`, `-1.005`, `4.615`, `-74.085`.
3. Añadir a `slug.test.ts`: los ejemplos válidos del §6.2 y los inválidos del §10.
4. Añadir a `datetime.test.ts`: `parseLocalDateTime` con y sin horario de verano, `addDays` cruzando fin de mes y año, `parseDateParam` en sus cuatro resultados.
5. Añadir a `night.test.ts`: solape exacto en el borde, fila anterior y posterior a la tira, noche de 23/25 horas, noche del sur, y `getCurrentNightDate` antes y después del amanecer y sin amanecer.
6. Ejecutar `pnpm test` y corregir hasta que pase.

## Criterios de aceptación

- [x] Todos los casos límite del SPEC §10 tienen al menos una prueba.
- [x] Ninguna prueba depende de la zona horaria de la máquina ni de la hora de ejecución.
- [x] Una fila que termina justo al empezar la tira no entra.
- [x] Un día de 23 o 25 horas produce el número correcto de horas.

## Verificación

- `pnpm test` pasa en una terminal con `TZ=UTC` y en otra con `TZ=America/Bogota`.

## Notas y bloqueos

- Si una prueba revela una regla ambigua, se detiene y se consulta al SPEC; no se ajusta la prueba para que pase.

---

## Registro de ejecución y desviaciones (2026-10-20)

**Resultado.** Task ejecutada. Las pruebas de dominio de T005 y T006 se ampliaron con matrices de casos límite compartidas. La suite cubre redondeo de coordenadas, slugs válidos e inválidos del SPEC §6.2, conversión de hora local con y sin horario de verano, suma de días, las cuatro ramas de `parseDateParam`, ventanas de noche, tira visible, noches de 23 y 25 horas, hemisferio sur, latitudes polares y noche actual antes/después del amanecer. Todas las pruebas usan fechas fijas y zonas explícitas.

**Archivos creados.**

- `src/modules/location/utils/__fixtures__/domain-fixtures.ts` — zonas fijas (`America/Bogota`, `America/New_York`, `America/Santiago`, `Europe/Oslo`, `Asia/Tokyo`), fechas fijas, helper `utc` y matrices de casos de redondeo, slug, conversión local, `addDays`, `parseDateParam` y ventanas de noche.

**Archivos modificados.**

- `src/modules/location/utils/coordinates.test.ts` — matriz `roundCoordinate edge-case matrix` con `0`, `-0`, `1.005`, `-1.005`, `4.615`, `-74.085` y los casos de signo de T005.
- `src/modules/location/utils/slug.test.ts` — matrices `parseSlug valid matrix` y `parseSlug invalid matrix`; la lista inválida local se sustituyó por la fixture compartida.
- `src/modules/location/utils/datetime.test.ts` — matrices de `parseLocalDateTime`, `addDays` y `parseDateParam`; prueba explícita de que la noche D = +15 no se ofrece.
- `src/modules/night/utils/night.test.ts` — matriz de `getNightWindow`, fila y noche del sur, noche polar, y recálculo de la noche actual al cruzar medianoche y amanecer.
- `docs/specs/001-vesper/tasks/README.md` — T007 marcada como «Terminada».
- `docs/specs/001-vesper/tasks/T007-pruebas-dominio.md` — estado, criterios y este registro.

**Desviaciones y decisiones autorizadas.**

1. **«Inválidos del §10» no existen en el SPEC (autorizado por el dueño).** El paso 3 pide los slugs inválidos del §10, pero §10 no contiene ejemplos de slug: las reglas están en §6.2 y los casos inválidos ya usados en T005. Se construyó la matriz inválida con las reglas de §6.2: partes insuficientes, formato distinto de `^-?\d+\.\d{2}$`, signo `+`, coordenadas fuera de rango y tramos extra. Se registra aquí como desviación documental de la task.
2. **Caso polar de `getCurrentNightDate` sin tocar `night.ts` (autorizado por el dueño).** T006 dejó anotado que la función solo consulta el amanecer de hoy; si es de madrugada y el día anterior no tuvo `sunset`, podría declarar una noche anterior que el SPEC §4 no debería declarar. Como `night.ts` queda fuera del scope de T007, se probaron los casos del paso 5 (antes/después del amanecer, sin amanecer y día polar sin noche actual) y se mantuvo la implementación intacta. La limitación queda pendiente para T019 o para una task que autorice modificar la firma/implementación.
3. **Se conservaron las pruebas de T005 y T006 y se añadieron matrices encima.** No se debilitó ni se eliminó ninguna aserción existente; solo se movieron listas compartidas a la fixture. La lista inválida de slug sigue cubriendo los mismos casos y añade otros.
4. **La altitud de la celda no tiene prueba de dominio.** El SPEC §10 la acepta como decisión de producto y no existe lógica pura que la corrija o la use en este alcance; no se inventó una prueba artificial. Los demás casos límite de §10 sí tienen cobertura.
5. **Formato.** Se ejecutó Prettier sobre los archivos tocados; `prettier.config.mjs` mantiene el warning preexistente de ESLint (`import/no-anonymous-default-export`), sin errores.

**Verificación.**

- `pnpm test src/modules/location src/modules/night` — 4 archivos y 148 pruebas pasan.
- `pnpm test` — 5 archivos y 149 pruebas pasan.
- `TZ=UTC pnpm test` — 149 pruebas pasan.
- `TZ=America/Bogota pnpm test` — 149 pruebas pasan.
- `pnpm typecheck` — sin errores.
- `pnpm lint` — 0 errores; se mantiene el warning preexistente de `prettier.config.mjs`.
- `pnpm exec prettier --check` sobre los cinco archivos de prueba/fixtures — todos conformes.

No se tocó ningún archivo de producción ni ningún archivo fuera del alcance de la task.
