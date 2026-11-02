# T021 — Bloque «Ahora» y tira horaria

- **Fase:** F7
- **SPEC:** §8.2
- **Depende de:** T020
- **Desbloquea:** T022
- **Diseño:** usar las imágenes de `docs/specs/001-vesper/design/` cuando estén disponibles.
- **Estado:** Terminada (2026-11-02)

## Objetivo

Construir los dos primeros bloques visuales de la pantalla principal.

## Resultado esperado

La pantalla muestra el bloque «Ahora» con hora del dato y dos indicadores, y la tira horaria de la noche con margen, desglose de nubosidad y etiqueta de archivado.

## Alcance

**Incluye**

- Bloque «Ahora»: temperatura, humedad, punto de rocío, nubosidad, viento, ráfagas, hora del dato.
- Indicador día/noche por `is_day` y nivel de oscuridad por altitud del Sol, como dos indicadores separados.
- Tira horaria: barra de color de nubosidad con desglose baja/media/alta y clase.
- Visibilidad, humedad, diferencia temperatura/rocío, viento, ráfagas y precipitación por hora.
- Margen visual fuera del intervalo puesta–amanecer.
- Etiqueta «pronóstico archivado» si D es anterior a hoy.

**No incluye**

- Luna, ventanas y selectores (T022).
- Estados de error y esqueletos (T023).

## Archivos

### Crear

- `src/modules/weather/components/CurrentConditions.tsx`
  - Props: `ICurrentConditionsProps { current: ICurrentResponse; sunAltitudeDeg: number; fetchedAt: number; timeZone: string }`
- `src/modules/night/components/HourlyBar.tsx`
  - Props: `IHourlyBarProps { row: IHourlyRow; cloud: number | null; cloudClass: TCloudClass | 'unknown'; timeZone: string; isMargin: boolean }`
- `src/modules/night/components/NightStrip.tsx`
  - Props: `INightStripProps { rows: IHourlyRow[]; window: TNightWindow; timeZone: string; cloudByTime: ReadonlyMap<string, number | null>; classByTime: ReadonlyMap<string, TCloudClass | 'unknown'>; isArchived: boolean }`
- `src/modules/night/components/CloudLegend.tsx` — leyenda de clases.
- `src/modules/weather/components/CurrentConditions.test.tsx` (si se añade jsdom en T004; si no, probar la utilidad de formato)

### Modificar

- `src/modules/night/components/NightContainer.tsx` — insertar `<CurrentConditions />` y `<NightStrip />` en el `<main>`, con los datos de `use-night-analysis`.

## Pasos detallados

1. Implementar `CurrentConditions` con la hora del dato formateada en la zona del lugar y los dos indicadores separados.
2. Implementar `HourlyBar` como fila o columna según diseño, con la barra de nubosidad y el desglose de capas; si `cloud` es `null`, mostrar «—», nunca `0 %`.
3. Implementar `NightStrip` como contenedor desplazable horizontalmente; marcar las horas de margen con estilo atenuado y sin la clase de noche.
4. Filtrar en `NightContainer` las filas que solapan `window` (T006) antes de pasarlas.
5. Mostrar la etiqueta «pronóstico archivado» cuando `isArchived` sea verdadero.
6. Ajustar colores y tipografía a las imágenes de referencia; usar tokens, no colores sueltos.
7. Comprobar `prefers-reduced-motion` en cualquier transición.
8. Ejecutar `pnpm build` y `pnpm lint`.

## Criterios de aceptación

- [x] Día/noche y oscuridad son dos indicadores distintos.
- [x] Una hora de margen no se ve como parte de la noche.
- [x] Una capa nula muestra «—», no `0 %`.
- [x] La hora del dato es siempre visible.
- [x] La vista no se rompe en un ancho de 360 px.

## Verificación

- `pnpm build` pasa.
- Comparar la pantalla con la imagen de referencia en móvil y escritorio.

## Notas y bloqueos

- Si aún no llegan las imágenes, usar la base visual de T004 y dejar los ajustes finos para después sin bloquear la task.

## Registro de ejecución y desviaciones (2026-11-02)

**Resultado.** Task ejecutada. La pantalla muestra el bloque «Ahora» con la hora del dato, los dos indicadores separados (día/noche de Open-Meteo y oscuridad por altitud del Sol), la tira horaria con margen, desglose de nubosidad por capas, clase textual y etiqueta de «pronóstico archivado».

### Archivos creados

- `src/modules/weather/components/CurrentConditions.tsx`
- `src/modules/weather/utils/format.ts`
- `src/modules/weather/utils/format.test.ts`
- `src/modules/night/components/HourlyBar.tsx`
- `src/modules/night/components/NightStrip.tsx`
- `src/modules/night/components/CloudLegend.tsx`
- `src/modules/night/constants/cloud.constants.ts`
- `src/modules/night/constants/darkness.constants.ts`
- `src/modules/night/utils/darkness.ts`
- `src/modules/night/utils/darkness.test.ts`
- `src/modules/night/utils/format.ts`
- `src/modules/night/utils/format.test.ts`

### Archivos modificados

- `src/modules/night/components/NightContainer.tsx` — inserción de `CurrentConditions` y `NightStrip`, mapas de nubosidad y datos de análisis.
- `src/modules/night/types/night.types.ts` — `TDarknessLevel`, `currentSunAltitudeDeg`, `cloudByTime`, `cloudClassByTime` y campos de Luna/avisos usados por T022.
- `src/modules/night/hooks/use-night-analysis.ts` — altitud solar actual, mapas de nubosidad por hora, alturas lunares y avisos.
- `src/modules/night/utils/night.ts` — nuevos campos en `createEmptyAnalysis`.
- `src/app/globals.css` — tokens de nubosidad, aviso y Luna.
- `src/modules/night/constants/night.constants.ts` — mensaje de estado y retirada del umbral temporal.

### Decisiones y desviaciones

1. **Archivos auxiliares autorizados.** Se crearon constantes, utilidades y pruebas que no figuraban en la lista de T021 para respetar `module-structure` (nada de constantes ni helpers dentro de componentes).
2. **Hora del dato.** `CurrentConditions` muestra `current.time` como «Datos de las HH:mm» y `fetchedAt` como «recibido a las HH:mm». El prop pedido se conserva y la hora real de la observación no se pierde.
3. **Filas de la tira.** `NightContainer` pasa `analysis.rows`, que ya viene filtrado por `useNightAnalysis` con `filterHoursInWindow`. No se volvió a filtrar para no duplicar la lógica ni el coste.
4. **Prueba de componente.** No existe jsdom en T004, así que no se creó `CurrentConditions.test.tsx`; se probó la utilidad de formato, tal como permite la task. Se cubren nulos como «—», porcentajes, visibilidad, viento, lluvia, rocío y hora del dato.
5. **Altitud solar actual.** `useNightAnalysis` calcula `currentSunAltitudeDeg` con `getSunPosition` en el instante del reloj del cliente. Se añadió al análisis para que el componente no llame a servicios.
6. **Desbordamiento horizontal a 360 px.** La tira y el selector usan contenedores `overflow-x-auto`, pero Chrome arrastraba su contenido al ancho del documento. Se añadió `overflow-x-hidden [contain:paint]` al `<main>`; las dos tiras siguen desplazándose internamente y el documento ya no se desplaza. Verificado con CDP.
7. **Imagen de referencia.** Se omitieron los elementos que el SPEC no pide o prohíbe: presión barométrica, SQM, seeing, Bortle, calificación general y «ventana sin Luna» para Júpiter. La imagen no se incrusta en producción.
8. **Margen.** Una fila se marca como margen cuando su inicio cae antes de la puesta o a partir del amanecer. Las filas que solapan el intervalo entran en la tira; las primeras y últimas llevan la etiqueta visible «Margen».

### Verificación

- `pnpm typecheck`, `pnpm lint` (solo el warning preexistente de `prettier.config.mjs`), `pnpm test` (26 archivos, 377 pruebas) y `pnpm build`: correctos.
- Navegador real con CDP y capturas a 360, 768 y 1280 px. A 360 px `documentElement.scrollWidth === 360`; no hay desbordamiento del documento.
- Comprobado en `/clima/bogota`: bloque «Ahora» con datos de las 15:45 y recibido a las 15:56; indicadores «Día» y «Cielo claro» separados; tira con filas «Margen» y barra/desglose por capas; etiqueta «Pronóstico archivado» visible en `?date=2026-10-30`.
- Los datos nulos se muestran como «—»; no se sustituyen por cero.
- La tira de Bogotá se comparó visualmente con la imagen de referencia en móvil y escritorio; la estructura y la jerarquía se mantienen.
