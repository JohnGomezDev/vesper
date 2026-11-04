# T027 — Aceptación §12 y comprobaciones de red

- **Fase:** F9
- **SPEC:** §7.1, §12
- **Depende de:** T023, T024, T025, T026
- **Desbloquea:** T028, T029
- **Estado:** Terminada (2026-11-04; con desviaciones escaladas)

## Objetivo

Demostrar que la app cumple los criterios de aceptación y el reparto servidor/cliente.

## Resultado esperado

`docs/specs/001-vesper/acceptance.md` con los 16 criterios del SPEC §12 marcados con su evidencia, y los comandos de calidad en verde.

## Alcance

**Incluye**

- Ejecutar y registrar cada criterio del §12.
- Comprobar el reparto de red del §7.1.
- Comprobar que el número de peticiones del build coincide con las ciudades curadas.
- Ejecutar `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build`.
- Corregir los fallos detectados.

**No incluye**

- El contraste astronómico externo (T028).
- El despliegue (T029).

## Archivos

### Crear

- `docs/specs/001-vesper/acceptance.md` — tabla criterio → resultado → evidencia.

### Modificar

- Los archivos que hagan falta para corregir fallos, sin cambiar el alcance.

## Pasos detallados

1. Crear `acceptance.md` con las filas 1–16 del SPEC §12.
2. Criterio 1: abrir `/clima/bogota` y ver blocos «ahora», noche actual, tira y selector.
3. Criterio 2: probar a las 03:00 locales y a las 15:00 locales con reloj simulado.
4. Criterio 3: cambiar de noche y comprobar que no hay peticiones nuevas.
5. Criterio 4: probar sin `?date=`, con fecha mal formada y fuera de −3…+14.
6. Criterio 5: verificar el refresco de «ahora» sin invalidar el pronóstico.
7. Criterio 6: contrastar Luna con fuente externa (se completa en T028, dejar constancia).
8. Criterio 7: consultar un lugar de otra zona horaria.
9. Criterio 8: revisar la consola en busca de hidratación.
10. Criterio 9: abrir una noche D anterior a hoy y ver «pronóstico archivado».
11. Criterio 10: comprobar la atribución visible.
12. Criterio 11: `curl -I /` con y sin cabeceras de IP.
13. Criterio 12: en un slug no curado, revisar red del navegador y registros del servidor.
14. Criterio 13: comprobar que el Sol no aparece como ventana.
15. Criterio 14: cambiar el umbral y comprobar que no hay petición.
16. Criterio 15: `/clima/slug.invalido` responde 404.
17. Criterio 16: abrir una pestaña nueva sin red y comprobar que no se pretende mostrar caché inexistente.
18. Ejecutar los cuatro comandos de calidad y anotar el resultado.

## Criterios de aceptación

- [x] Los 16 criterios están registrados con resultado.
- [x] Cualquier criterio que falle queda corregido o escalado al dueño con motivo (D1, D2, D3 y D4 en `acceptance.md`).
- [x] No hay peticiones de servidor fuera de ciudades curadas.
- [x] Las peticiones del navegador no llevan `revalidate`.
- [x] `pnpm lint`, `pnpm typecheck`, `pnpm test` y `pnpm build` pasan en la ejecución final con red sana.

## Verificación

- `acceptance.md` completo.
- `pnpm build` y revisión de la salida con el número de rutas prerenderizadas.

## Notas y bloqueos

- Si un criterio depende de datos del dueño (textos, ciudades), se marca como bloqueado, no como fallo.

## Registro de ejecución y desviaciones (2026-11-04)

**Resultado.** Task ejecutada. Se creó `docs/specs/001-vesper/acceptance.md` con los 16 criterios del SPEC §12, el reparto de red del §7.1, los casos límite de T028 y el contraste astronómico. No se modificó código de la aplicación.

### Archivos tocados

- `docs/specs/001-vesper/acceptance.md` — creado.
- `docs/specs/001-vesper/tasks/T027-aceptacion-red.md` — estado, criterios y este registro.
- `docs/specs/001-vesper/tasks/README.md` — índice actualizado.
- `README.md` — estado y guía de despliegue (preparación de T029).

### Resultado por criterio

- **1–5:** pasan. El bloque «ahora», la noche actual, la tira con márgenes y el selector están presentes; a las 03:00 locales la noche es la del día anterior y a las 15:00 la del mismo día; cambiar de noche actualiza `?date=` sin peticiones; las fechas inválidas o fuera de rango muestran mensaje y dejan el lugar usable; «ahora» se refresca sin volver a pedir el pronóstico (1 petición de pronóstico y 6 de «ahora» con el intervalo acelerado).
- **6:** pasa con salvedad metodológica. Contraste con JPL Horizons para Bogotá y Madrid: iluminación y fase coinciden; salida/puesta difieren ≤2 min con el horizonte geométrico a 0 m. Con la altitud real del sitio la diferencia es 7–9 min en Bogotá por la depresión del horizonte (D2).
- **7–10:** pasan. Tokio y Madrid muestran hora local y aviso de zona; no hay errores de hidratación en consola; una noche pasada muestra «pronóstico archivado»; la atribución es visible con enlace y CC-BY 4.0.
- **11–12:** pasan. `/` responde `307` con y sin cabeceras (`/clima/bogota` sin ellas, `/clima/6.24_-75.58` con ellas) y no elige una ciudad curada. En un slug no curado el navegador hizo 2 peticiones y el servidor 0. Las peticiones del navegador usan `cache: 'no-store'` y no `revalidate`.
- **13–15:** pasan. El Sol no aparece en ventanas; cambiar el umbral de 15° a 30° recalcula sin peticiones; `/clima/slug.invalido` y coordenadas fuera de rango responden `404`.
- **16:** pasa. Sin red real la app no carga y no muestra datos guardados; con Open-Meteo bloqueado, la ciudad curada conserva su HTML y la no curada muestra error. No hay `localStorage`, `sessionStorage`, IndexedDB, Cache Storage ni service workers.

### Comandos de calidad

- `pnpm lint` → `0` (1 warning preexistente en `prettier.config.mjs`).
- `pnpm typecheck` → `0`.
- `pnpm test` → 26 archivos, 376 pruebas.
- `pnpm build` → `0`; 15 páginas estáticas, 6 curadas, 12 peticiones a Open-Meteo.

### Desviaciones

1. **D1 — 12 peticiones de build, no 6.** Son 2 por ciudad curada. El reparto «solo curadas» se cumple; el conteo literal no. Se documenta y se escala, sin cambios de código.
2. **D2 — depresión del horizonte.** La salida/puesta lunar coincide con JPL a 0 m dentro de 2 min; con la altitud real difiere 7–9 min. Se documenta y se escala, sin cambios de código.
3. **D3 — panel lunar.** Muestra salida/puesta del día local D, no las que ocurren dentro de la noche. Se documenta y se escala, sin cambios de código.
4. **D4 — build bajo timeout de Open-Meteo.** Con timeouts intermitentes, el build falló aunque `CuratedNight` captura el error. Un reintento con red sana terminó en `0`. Se documenta y se escala; requiere corrección autorizada.
5. **Método del criterio 5.** Para no esperar 30 minutos se aceleró el `setInterval` del navegador; el intervalo real del código sigue siendo 1 800 000 ms.
6. **Método del criterio 16.** Se probaron recarga sin red real y bloqueo selectivo de Open-Meteo; ambos confirman que no hay pronóstico persistido.
