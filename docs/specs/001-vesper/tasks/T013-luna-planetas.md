# T013 — Luna y planetas

- **Fase:** F4
- **SPEC:** §5.4, §8.4, §8.5
- **Depende de:** T012
- **Desbloquea:** T014
- **Estado:** Pendiente

## Objetivo

Calcular la Luna y los planetas con astronomy-engine como única fuente.

## Resultado esperado

`astronomy` expone fase e iluminación lunar, posición y salida/puesta de la Luna, y posición, magnitud, elongación, separación y culminación de los planetas.

## Alcance

**Incluye**

- Luna: ángulo de fase 0–360°, fracción iluminada 0–1, posición, salida y puesta.
- Planetas: Mercurio, Venus, Marte, Júpiter, Saturno, Urano y Neptuno.
- Magnitud aparente, elongación de Mercurio y Venus y separación angular Sol–planeta y Luna–planeta.
- Culminación nativa si existe; si no, se deja preparada para T014 y se marca `approximate`.
- Refracción activa.

**No incluye**

- Nombrar las fases ni pintar iconos (T015).
- Calcular ventanas (T016).

## Archivos

### Crear

- `src/modules/astronomy/types/astronomy.types.ts` (modificar)
  - `IMoonPhase { angleDeg: number; illuminationFraction: number }`
  - `IMoonInfo extends IMoonPhase { position: IHorizontalPosition; riseMs: number | null; setMs: number | null }`
  - `TPlanetId = 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune'`
  - `IPlanetInfo { id: TPlanetId; position: IHorizontalPosition; magnitude: number; elongationDeg: number | null; separationFromMoonDeg: number | null; culminationMs: number | null; culminationApproximate: boolean }`
- `src/modules/astronomy/services/moon.service.ts`
  - `getMoonPhase(instantMs: number): IMoonPhase`
  - `getMoonInfo(observer: IObserver, date: string, timeZone: string): IMoonInfo`
- `src/modules/astronomy/services/planets.service.ts`
  - `getPlanetInfo(observer: IObserver, planetId: TPlanetId, instantMs: number): IPlanetInfo`
  - `getAngularSeparation(a: IHorizontalPosition, b: IHorizontalPosition): number`
- `src/modules/astronomy/services/moon.service.test.ts`
- `src/modules/astronomy/services/planets.service.test.ts`

## Pasos detallados

1. Usar las funciones confirmadas en T002.
2. Implementar `getMoonPhase` normalizando el ángulo a `[0, 360)`.
3. Implementar `getMoonInfo` con posición y salida/puesta (con `null` si no ocurren).
4. Implementar `getPlanetInfo` para cada `TPlanetId`; la elongación solo es numérica para Mercurio y Venus, para el resto `null`.
5. Calcular `separationFromMoonDeg` en el instante dado.
6. Resolver la culminación: si T002 confirmó función de tránsito, usarla con `approximate: false`; si no, dejar `culminationMs: null` y `approximate: true` para que T014 lo complete.
7. Escribir pruebas de fase, iluminación, elongación y separación.
8. Ejecutar `pnpm test src/modules/astronomy`.

## Criterios de aceptación

- [ ] La Luna no usa `moon_phase` de Open-Meteo.
- [ ] `getMoonPhase` devuelve ángulo en `[0, 360)` e iluminación en `[0, 1]`.
- [ ] Mercurio y Venus devuelven elongación; el resto `null`.
- [ ] La culminación queda marcada como nativa o aproximada.

## Verificación

- `pnpm test src/modules/astronomy` pasa.
- Contrastar fase e iluminación con una fuente externa en una fecha conocida.

## Notas y bloqueos

- La altitud de la Luna se calcula con la `elevation` del pronóstico; si es `null`, se usa `0` y se anota.
