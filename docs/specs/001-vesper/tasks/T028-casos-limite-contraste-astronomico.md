# T028 — Casos límite, zonas horarias y contraste astronómico

- **Fase:** F9
- **SPEC:** §10, §12
- **Depende de:** T027
- **Desbloquea:** T029
- **Estado:** Terminada (2026-11-04; con desviaciones escaladas)

## Objetivo

Probar los casos que suelen romper la app y contrastar la astronomía con una fuente externa.

## Resultado esperado

Sección de casos límite y de contraste en `acceptance.md`, con la fuente usada y la diferencia observada. Sin fallos abiertos.

## Alcance

**Incluye**

- Zona horaria distinta de la del dispositivo.
- Cambio de hora con días de 23 o 25 horas.
- Latitudes altas con sol de medianoche o noche polar.
- Noche pasada y último día del pronóstico.
- Datos nulos y error 429.
- Contraste de fase, iluminación, salida y puesta de la Luna con Stellarium, Heavens Above o JPL Horizons para Bogotá y otro lugar.

**No incluye**

- Despliegue (T029).
- Nuevas funcionalidades.

## Archivos

### Modificar

- `docs/specs/001-vesper/acceptance.md` — añadir las secciones de casos límite y contraste.
- Archivos puntuales si aparece un fallo, sin cambiar el alcance.

## Pasos detallados

1. Consultar un lugar con zona horaria distinta y comprobar que las horas mostradas son locales del lugar.
2. Simular el cambio de hora de `America/New_York` en noviembre y comprobar que la noche no se corta.
3. Consultar un lugar polar en junio y verificar el mensaje «sin noche astronómica» y que la app no se rompe.
4. Abrir una noche pasada y comprobar «pronóstico archivado».
5. Intentar abrir D = +15 y comprobar que no se ofrece.
6. Forzar valores nulos y un 429 y comprobar los estados.
7. Comparar Luna de Bogotá con la fuente externa: fase, iluminación, salida y puesta.
8. Repetir el contraste con un segundo lugar de otra zona horaria.
9. Anotar diferencias; si superan uno o dos minutos, investigar antes de cerrar.

## Criterios de aceptación

- [x] Ningún caso límite rompe la app.
- [x] Las horas difieren como máximo uno o dos minutos de la fuente externa (con el horizonte geométrico a 0 m; ver D2).
- [x] El nombre de la fase coincide con la tabla del §8.4.
- [x] Un lugar sin puesta ni salida muestra el estado explícito.

## Verificación

- `acceptance.md` con cada caso, la fuente y el resultado.
- Comparativa reproducible con fecha, lugar y hora anotadas.

## Notas y bloqueos

- Si el contraste revela un error de la librería, se documenta y se avisa al dueño; no se compensa con constantes inventadas.

## Registro de ejecución y desviaciones (2026-11-04)

**Resultado.** Task ejecutada. Los casos límite y el contraste astronómico quedaron registrados en `docs/specs/001-vesper/acceptance.md`. No se modificó código de la aplicación.

### Casos límite comprobados

- **Zona horaria distinta:** Tokio (`Asia/Tokyo`) y Madrid (`Europe/Madrid`) muestran horas locales y el aviso de zona horaria. Tokio mostró «Puesta 16:43 · Amanecer 06:06»; Madrid, «Puesta 18:08 · Amanecer 07:48».
- **Cambio de hora de 25 horas:** Nueva York, noche D = 2026-11-01. La tira fue continua, de 15:00 (margen) a 07:00 (margen), 17 filas, sin cortes ni warnings de claves duplicadas.
- **Cambio de hora de 23 horas:** cubierto por `src/modules/night/utils/night.test.ts` y `src/modules/location/utils/datetime.test.ts`.
- **Noche polar:** Longyearbyen `78.22, 15.65` el 2026-11-04 mostró «Sin noche astronómica este día», sin horas en la tira y sin ventanas.
- **Sol de medianoche:** Antártida `-78.22, 15.65` el 2026-11-04 mostró el mismo estado. El caso sintético del 2026-06-21 devuelve `no-astronomical-night` para `sunrise`/`sunset` nulos y para el caso `00:00`–`00:00`.
- **Noche pasada:** `?date=2026-11-03` mostró «PRONÓSTICO ARCHIVADO».
- **Último día:** D = +14 (`2026-11-18`) se ofrece completo; D = +15 (`2026-11-19`) queda fuera de rango.
- **Nulos:** con las capas de nubosidad nulas entre 16:00 y 18:00, la hora mostró «SIN DATOS» y «—»; no se sustituyó por cero.
- **429:** con todas las respuestas interceptadas como 429, se mostró el mensaje de límite de peticiones y el botón de reintento, sin romper la pantalla.
- **Selector:** 18 noches; «Anterior» deshabilitado en −3 y «Siguiente» en +14.

### Contraste con fuente externa

Fuente: JPL Horizons (NASA/JPL), Luna (`301`), observador geodésico, `R_T_S_ONLY='YES'`, `STEP_SIZE='1m TVH'`, `QUANTITIES='10,24'`.

| Lugar  | Fecha local | Iluminación app | Iluminación JPL | Fase app       | Salida/puesta app | JPL a 0 m     | Diferencia |
| ------ | ----------- | --------------- | --------------- | -------------- | ----------------- | ------------- | ---------- |
| Bogotá | 2026-11-04  | 25,326 %        | 24,697 %        | Luna menguante | 01:55 / 14:17     | 01:55 / 14:19 | 0 / 2 min  |
| Madrid | 2026-11-04  | 27,707 %        | 27,136 %        | Luna menguante | 02:41 / 15:39     | 02:42 / 15:40 | 1 / 1 min  |

- Los ángulos de la app fueron `299.706°` (Bogotá) y `296.614°` (Madrid), ambos dentro del tramo `[292.5°, 337.5°)` de «Luna menguante» de la tabla §8.4.
- La iluminación de JPL disminuye del 3 al 5 de noviembre, lo que confirma que la fase es menguante.
- Con la altitud real del sitio, JPL aplica depresión del horizonte y la diferencia es 7–9 min en Bogotá (2582 m) y 3–6 min en Madrid (650 m). La app no modela esa depresión; se documenta como D2.

### Desviaciones

1. **D2 — depresión del horizonte.** El criterio de 1–2 minutos se cumple con el horizonte geométrico a 0 m; con la altitud real la diferencia es mayor. Se documenta y se escala, sin cambios de código.
2. **D3 — panel lunar.** El panel muestra salida/puesta del día local D, no las que ocurren dentro de la noche. Para Bogotá D = 2026-11-04 muestra salida 01:55 y puesta 14:17 (antes de la puesta del Sol); la salida dentro de la noche es 02:35 del 2026-11-05. Se documenta y se escala, sin cambios de código.
3. **Método del caso polar de junio.** Open-Meteo no permite consultar junio de 2026 en el pronóstico actual; el caso se cubrió con una prueba de dominio sintética (`getNightWindow`) y con un lugar polar real en noviembre (Antártida).
4. **Contraste a 0 m.** Para comparar con el modelo de `SearchRiseSet` se usó la altitud 0 m de JPL; la comparación con la altitud real se registra aparte para no ocultar la diferencia física.
