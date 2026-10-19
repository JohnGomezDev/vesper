# T021 — Bloque «Ahora» y tira horaria

- **Fase:** F7
- **SPEC:** §8.2
- **Depende de:** T020
- **Desbloquea:** T022
- **Diseño:** usar las imágenes de `docs/specs/001-vesper/design/` cuando estén disponibles.
- **Estado:** Pendiente

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

- [ ] Día/noche y oscuridad son dos indicadores distintos.
- [ ] Una hora de margen no se ve como parte de la noche.
- [ ] Una capa nula muestra «—», no `0 %`.
- [ ] La hora del dato es siempre visible.
- [ ] La vista no se rompe en un ancho de 360 px.

## Verificación

- `pnpm build` pasa.
- Comparar la pantalla con la imagen de referencia en móvil y escritorio.

## Notas y bloqueos

- Si aún no llegan las imágenes, usar la base visual de T004 y dejar los ajustes finos para después sin bloquear la task.
