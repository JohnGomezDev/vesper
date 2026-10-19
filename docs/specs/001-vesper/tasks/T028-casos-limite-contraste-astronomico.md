# T028 — Casos límite, zonas horarias y contraste astronómico

- **Fase:** F9
- **SPEC:** §10, §12
- **Depende de:** T027
- **Desbloquea:** T029
- **Estado:** Pendiente

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

- [ ] Ningún caso límite rompe la app.
- [ ] Las horas difieren como máximo uno o dos minutos de la fuente externa.
- [ ] El nombre de la fase coincide con la tabla del §8.4.
- [ ] Un lugar sin puesta ni salida muestra el estado explícito.

## Verificación

- `acceptance.md` con cada caso, la fuente y el resultado.
- Comparativa reproducible con fecha, lugar y hora anotadas.

## Notas y bloqueos

- Si el contraste revela un error de la librería, se documenta y se avisa al dueño; no se compensa con constantes inventadas.
