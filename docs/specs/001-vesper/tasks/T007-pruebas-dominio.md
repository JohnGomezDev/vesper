# T007 — Pruebas de dominio

- **Fase:** F2
- **SPEC:** §4, §6.2, §6.3, §10
- **Depende de:** T006
- **Desbloquea:** T018
- **Estado:** Pendiente

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

- [ ] Todos los casos límite del SPEC §10 tienen al menos una prueba.
- [ ] Ninguna prueba depende de la zona horaria de la máquina ni de la hora de ejecución.
- [ ] Una fila que termina justo al empezar la tira no entra.
- [ ] Un día de 23 o 25 horas produce el número correcto de horas.

## Verificación

- `pnpm test` pasa en una terminal con `TZ=UTC` y en otra con `TZ=America/Bogota`.

## Notas y bloqueos

- Si una prueba revela una regla ambigua, se detiene y se consulta al SPEC; no se ajusta la prueba para que pase.
