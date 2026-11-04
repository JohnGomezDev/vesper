# T013 — Luna y planetas

- **Fase:** F4
- **SPEC:** §5.4, §8.4, §8.5
- **Depende de:** T012
- **Desbloquea:** T014
- **Estado:** Terminada (2026-10-27)

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

- [x] La Luna no usa `moon_phase` de Open-Meteo.
- [x] `getMoonPhase` devuelve ángulo en `[0, 360)` e iluminación en `[0, 1]`.
- [x] Mercurio y Venus devuelven elongación; el resto `null`.
- [x] La culminación queda marcada como nativa o aproximada.

## Verificación

- `pnpm test src/modules/astronomy` pasa.
- Contrastar fase e iluminación con una fuente externa en una fecha conocida.

## Notas y bloqueos

- La altitud de la Luna se calcula con la `elevation` del pronóstico; si es `null`, se usa `0` y se anota.

---

## Registro de ejecución (2026-10-27)

**Resultado.** Task ejecutada. `astronomy` expone la fase e iluminación lunar, la posición y las horas de salida y puesta de la Luna, y la posición, magnitud, elongación, separación lunar y culminación nativa de los siete planetas. La Luna sale solo de astronomy-engine; no se importa `moon_phase` de Open-Meteo.

**Archivos modificados y creados.**

- `src/modules/astronomy/types/astronomy.types.ts` — ampliado con `IMoonPhase`, `IMoonInfo`, `TPlanetId` e `IPlanetInfo`.
- `src/modules/astronomy/services/moon.service.ts` — `getMoonPhase`, `getMoonPosition`, `getMoonInfo`.
- `src/modules/astronomy/services/planets.service.ts` — `getPlanetPosition`, `getAngularSeparation`, `getPlanetInfo`.
- `src/modules/astronomy/services/moon.service.test.ts` — 6 pruebas.
- `src/modules/astronomy/services/planets.service.test.ts` — 16 pruebas.

**Decisiones y desviaciones.**

1. **Posición de la Luna a medianoche local (autorizado).** `getMoonInfo` evalúa fase y posición en la medianoche local de `date`, coherente con SPEC §8.4; salida y puesta se buscan en esa fecha local y pueden ser `null`.
2. **Helpers de solo posición (autorizado).** Se exportan `getMoonPosition` y `getPlanetPosition` desde los servicios ya listados para que T014 muestree sin repetir búsquedas de salida, puesta y culminación. No son símbolos previstos en la lista de la task, pero no añaden archivos.
3. **Separación Luna–planeta y `getAngularSeparation` no son idénticas cerca del horizonte.** `separationFromMoonDeg` se calcula con `AngleBetween` sobre los vectores de `Equator`, como confirmó T002 y exige SPEC §5.4. La firma declarada de `getAngularSeparation` recibe `IHorizontalPosition`, no vectores, así que aplica la ley esférica de cosenos sobre esas mismas coordenadas. Con refracción y cuerpos bajos ambos valores pueden diferir algunas décimas de grado (en el instante de prueba, 158,12° frente a 158,83°). T016 debe usar `getAngularSeparation` solo si acepta esa diferencia o pedir la ampliación de la firma si necesita el valor ecuatorial exacto. No se cambió la firma sin autorización.
4. **Separación Sol–planeta (autorizado).** No se añadió campo a `IPlanetInfo`; la separación respecto al Sol queda disponible con `getAngularSeparation` o con `Elongation` cuando T016 lo necesite.
5. **Culminación nativa.** `SearchHourAngle(body, observer, 0, instant)` devuelve la siguiente culminación desde el instante pedido y `culminationApproximate: false`. Puede caer en el día UTC siguiente; T016 debe interpretarla dentro de la noche. El respaldo muestreado de T014 solo aplica si el valor nativo fuera `null`.
6. **Normalización defensiva.** `getMoonPhase` normaliza el ángulo a `[0, 360)`; la iluminación se devuelve tal como la entrega `Illumination(...).phase_fraction`, sin sustituirla ni redondearla.

**Verificación.**

- `pnpm test src/modules/astronomy` — 5 archivos y 42 pruebas pasan (22 de esta task).
- Luna llena conocida del 2026-10-25: `getMoonPhase` devuelve 179,99° y 0,998 de iluminación en 2026-10-26T04:11Z.
- Contraste con el USNO (AA) para Bogotá, 2026-10-19: `curphase` «Waxing Gibbous», salida de la Luna 12:55 y puesta 00:16 locales. La app devuelve 12:55 y 00:15. La iluminación de la app a medianoche local es 0,552; el 60 % del USNO corresponde a otro instante del día (la librería da 0,603 a las 18:00Z), no a una discrepancia.
- `pnpm test` — 226 pruebas pasan; `pnpm typecheck`, `pnpm lint` y `pnpm build` correctos.
- Sin red en el módulo.
