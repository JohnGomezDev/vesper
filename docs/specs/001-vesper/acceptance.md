# Aceptación — Vesper (SPEC §12)

- **Fecha de ejecución:** 2026-11-04
- **Commit verificado:** `1f1845c` (`feat: add seo legal pages attribution and curated cities`)
- **Entorno:** Linux, Node `v24.19.0`, pnpm `11.21.0`, Next.js `16.4.1`, Chrome headless `155.0.8059.84`.
- **Servidor usado:** build de producción local (`pnpm build` + `pnpm start --port 3100`) y navegador con Chrome DevTools Protocol.
- **Alcance:** criterios §12 del SPEC, reparto de red §7.1 y casos límite/contraste astronómico de T028.
- **URL de producción:** https://vesper-sandy-seven.vercel.app/ (desplegada el 2026-11-04).

## Método y evidencia

- Los criterios de interfaz se comprobaron sobre el build de producción, no sobre `next dev`.
- Para los criterios de hora local se fijó `Date.now()` en el navegador:
  - `2026-11-04T08:00:00Z` = 03:00 locales en Bogotá.
  - `2026-11-04T20:00:00Z` = 15:00 locales en Bogotá.
- Para el criterio 5 se aceleró el `setInterval` del navegador (máximo 1,5 s) para no esperar los 30 minutos reales. El intervalo real del código sigue siendo `1 800 000 ms`.
- Para el criterio 16 se probaron dos escenarios: recarga con red completamente desconectada y recarga con solo Open-Meteo bloqueado.
- Los casos de error (429 y valores nulos) se forzaron interceptando las respuestas de Open-Meteo en el navegador.
- La instrumentación de `fetch` para el servidor se hizo fuera del repositorio; no se modificó código de la app.
- Los contrastes de Luna usan JPL Horizons (NASA/JPL), cuerpo `301` (Luna), centro geodésico en las coordenadas del lugar, `R_T_S_ONLY=YES`, `STEP_SIZE='1m TVH'` y `QUANTITIES='10,24'`.

## Criterios del SPEC §12

| #   | Criterio                                                                                               | Resultado         | Evidencia                                                                                                                                                                                                                                                                                                                                           |
| --- | ------------------------------------------------------------------------------------------------------ | ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `/clima/bogota` muestra «ahora», noche actual, tira con margen a cada lado y selector                  | Pasa              | Texto observado: «Ahora · Condiciones actuales», «Noche seleccionada · MIÉ, 4 NOV», «Tira horaria detallada», filas con etiqueta «Margen» a 16:00/17:00 y 06:00/07:00, y 18 botones en el selector.                                                                                                                                                 |
| 2   | La noche actual es correcta a cualquier hora, incluida la madrugada                                    | Pasa              | Con reloj fijado a las 03:00 locales la noche seleccionada fue «MAR, 3 NOV»; a las 15:00 locales fue «MIÉ, 4 NOV». Ambas con el mismo pronóstico y sin recarga.                                                                                                                                                                                     |
| 3   | Cambiar de noche actualiza vista y `?date=` sin nuevas peticiones                                      | Pasa              | Se pulsó una noche no seleccionada: la URL pasó a `?date=2026-11-01`, la vista cambió a «DOM, 1 NOV» y el contador de peticiones a Open-Meteo siguió en 1 (solo el bloque «ahora»).                                                                                                                                                                 |
| 4   | Sin `?date=` se ve la noche actual; fecha mal formada o fuera de −3…+14 muestra mensaje y lugar usable | Pasa              | Sin parámetro: noche actual. `?date=foo`: «La fecha no es válida.». `?date=2026-12-31`: «La fecha seleccionada está fuera del rango disponible.». En ambos casos el pronóstico, la tira y el selector siguen visibles.                                                                                                                              |
| 5   | «Ahora» se refresca solo, sin invalidar el pronóstico ni volver a pedir la tira                        | Pasa              | Con el intervalo acelerado: 1 petición de pronóstico (`hourly=`) y 6 de «ahora» (`current=`). El pronóstico no se volvió a pedir. El intervalo real es 30 min.                                                                                                                                                                                      |
| 6   | Fase, iluminación y salida/puesta de la Luna coinciden con fuente externa para Bogotá y otro lugar     | Pasa con salvedad | Contraste con JPL Horizons para Bogotá y Madrid. Iluminación y nombre de fase coinciden; salida/puesta difieren ≤2 min con el horizonte geométrico de JPL. Con la altitud real del sitio la diferencia es 7–9 min en Bogotá (depresión del horizonte no modelada). Detalle en [Contraste astronómico](#contraste-astronómico-t028) y desviación D2. |
| 7   | Las horas se muestran en la zona horaria del lugar, también con zona distinta de la del dispositivo    | Pasa              | Tokio (`Asia/Tokyo`): aviso «Zona horaria del lugar · Asia/Tokyo», «Puesta 16:43 · Amanecer 06:06» y datos horarios locales. Madrid (`Europe/Madrid`) también mostró su hora local.                                                                                                                                                                 |
| 8   | No hay errores de hidratación                                                                          | Pasa              | En todas las rutas y escenarios (Bogotá, Tokio, Madrid, Nueva York, Tromsø, Longyearbyen, Antártida, página legal) la consola no registró errores ni warnings de hidratación.                                                                                                                                                                       |
| 9   | Una noche pasada muestra «pronóstico archivado»                                                        | Pasa              | `?date=2026-11-03` mostró la etiqueta «PRONÓSTICO ARCHIVADO» en la cabecera de la tira.                                                                                                                                                                                                                                                             |
| 10  | La atribución a Open-Meteo es visible                                                                  | Pasa              | El pie muestra «Datos de clima de Open-Meteo (CC-BY 4.0)» con enlace a `https://open-meteo.com` en todas las páginas.                                                                                                                                                                                                                               |
| 11  | `/` con cabeceras de IP redirige al slug de coordenadas; sin cabeceras redirige a Bogotá               | Pasa              | Sin cabeceras: `307` a `/clima/bogota`. Con `x-vercel-ip-latitude: 6.2442` y `x-vercel-ip-longitude: -75.5812`: `307` a `/clima/6.24_-75.58` (no a una ciudad curada). Cabeceras inválidas: cae a Bogotá.                                                                                                                                           |
| 12  | En un slug no curado el servidor no llama a Open-Meteo; el navegador no usa `revalidate`               | Pasa              | `/clima/medellin_6.24_-75.58` generó 2 peticiones desde el navegador (pronóstico + «ahora») y **0** desde el servidor (el log instrumentado de `fetch` no se creó). El cliente usa `cache: 'no-store'` y nunca `revalidate`; cubierto por `src/lib/api/api-client.test.ts`.                                                                         |
| 13  | El Sol no aparece como objetivo con ventana                                                            | Pasa              | La sección de ventanas de Bogotá listó Luna, Marte, Júpiter, Saturno, Urano y Neptuno. La comprobación textual de «Sol» dentro de la sección de ventanas dio `false`.                                                                                                                                                                               |
| 14  | Cambiar el umbral de altitud recalcula las ventanas sin una petición nueva                             | Pasa              | De 15° a 30° cambiaron las ventanas (desapareció la de la Luna y se acortaron las demás) y el contador de Open-Meteo siguió en 1.                                                                                                                                                                                                                   |
| 15  | Un slug de formato inválido responde 404                                                               | Pasa              | `curl` a `/clima/slug.invalido` devolvió `404`; también `/clima/95.00_-74.08` (latitud fuera de rango) devolvió `404`.                                                                                                                                                                                                                              |
| 16  | Abrir una pestaña nueva sin red no muestra un pronóstico guardado, salvo el HTML de una ciudad curada  | Pasa              | Sin red real, la recarga no carga la app (error del navegador), por lo que no se muestra ningún dato guardado. Bloqueando solo Open-Meteo: Bogotá mostró el pronóstico incrustado en su HTML; Medellín mostró el estado de error. `localStorage`, `sessionStorage`, IndexedDB, Cache Storage y service workers quedaron vacíos.                     |

## Reparto de red §7.1

### Build

- `pnpm build` termina con código `0`.
- Salida de rutas: 15 páginas estáticas generadas; 6 ciudades curadas (`bogota`, `guatavita`, `villa-de-leyva`, `desierto-de-la-tatacoa`, `desierto-de-checua`, `lago-de-tota`).
- Peticiones a Open-Meteo durante el build: **12** (2 por cada ciudad curada). Se guardaron 6 entradas en `.next/cache/fetch-cache`.
- Las peticiones son solo de pronóstico (`hourly` + `daily`), nunca de `current`, y no envían `elevation`.
- El reparto «solo ciudades curadas» se cumple; el conteo literal «una petición por ciudad» no. Ver desviación D1.

### Navegador y servidor

| Ruta                                      | Peticiones del navegador   | Peticiones del servidor           |
| ----------------------------------------- | -------------------------- | --------------------------------- |
| `/clima/bogota` (curada)                  | 1 (`current`)              | 0 en la petición; datos del build |
| `/clima/medellin_6.24_-75.58` (no curada) | 2 (`forecast` + `current`) | 0                                 |
| `/clima/tokyo_35.68_139.69` (no curada)   | 2 (`forecast` + `current`) | 0                                 |

- El log instrumentado del servidor no registró ninguna llamada a Open-Meteo para las rutas no curadas.
- Las peticiones del navegador no llevan opción `revalidate`; la rama de cliente usa `cache: 'no-store'` (`src/lib/api/api-client.ts`).
- La metadata de slugs no curados no consulta Open-Meteo.

## Casos límite (T028)

| Caso                                        | Método                                                                  | Resultado                                                                                                                                                       |
| ------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Zona horaria distinta de la del dispositivo | Tokio y Madrid en el navegador                                          | Horas locales del lugar y aviso de zona horaria. Sin desajustes de hidratación.                                                                                 |
| Cambio de hora con día de 25 horas          | Nueva York, noche D = 2026-11-01                                        | Tira continua de 17 filas, desde margen 15:00 hasta margen 07:00; no se corta al cruzar el cambio de hora. Sin warnings de claves duplicadas.                   |
| Cambio de hora con día de 23 horas          | Pruebas de dominio de `night.test.ts` y `datetime.test.ts`              | Las noches de 23 y 25 horas se cubren sin partir el array por 24.                                                                                               |
| Latitud alta con noche polar                | Longyearbyen `78.22, 15.65` el 2026-11-04                               | «Sin noche astronómica este día»; sin horas en la tira, sin ventanas y sin romper la app.                                                                       |
| Latitud alta con sol de medianoche          | Antártida `-78.22, 15.65` el 2026-11-04 y caso sintético del 2026-06-21 | «Sin noche astronómica este día»; `getNightWindow` devuelve `no-astronomical-night` para `sunrise`/`sunset` nulos y para el caso `00:00`–`00:00`.               |
| Noche pasada                                | `?date=2026-11-03`                                                      | Etiqueta «PRONÓSTICO ARCHIVADO».                                                                                                                                |
| Último día del pronóstico                   | `?date=2026-11-18` (D = +14)                                            | Se ofrece y se muestra completa; «Siguiente» queda deshabilitado.                                                                                               |
| D = +15                                     | `?date=2026-11-19`                                                      | «La fecha seleccionada está fuera del rango disponible»; `parseDateParam` devuelve `out-of-range`.                                                              |
| Valores nulos en el pronóstico              | Respuesta interceptada con capas de nubosidad nulas entre 16:00 y 18:00 | La hora muestra «SIN DATOS» y «—»; no se sustituye por cero. El resto de la noche sigue calculándose.                                                           |
| Error 429                                   | Todas las respuestas de Open-Meteo interceptadas con 429                | Mensaje «Open-Meteo ha limitado las peticiones…» y botón «Reintentar». Se respeta la política de reintentos; no hay pantalla rota.                              |
| Sin red / sin Open-Meteo                    | Recarga real sin red y bloqueo selectivo de Open-Meteo                  | Sin red la app no carga (error del navegador). Con Open-Meteo bloqueado, la ciudad curada conserva su HTML y la no curada muestra error. Sin caché persistente. |
| Selector de noches                          | 18 botones; extremos −3 y +14                                           | 18 noches. En −3 «Anterior» está deshabilitado; en +14 «Siguiente» está deshabilitado.                                                                          |

## Contraste astronómico (T028)

**Fuente externa:** JPL Horizons, sistema Horizons On-Line Ephemeris (NASA/JPL), cuerpo `301` (Luna), observador geodésico en las coordenadas indicadas. Para salida/puesta se usó `R_T_S_ONLY='YES'` y `STEP_SIZE='1m TVH'` (horizonte visual verdadero, resolución de 1 minuto). Para iluminación y ángulo de fase se usó `QUANTITIES='10,24'`.

### Bogotá — noche D = 2026-11-04

- Medianoche local usada por la app: `2026-11-04T05:00:00Z`.
- App: ángulo `299.706°`, iluminación `25.326 %`, fase **Luna menguante** (rango `[292.5°, 337.5°)`).
- JPL Horizons a `2026-11-04 05:00 UT`: iluminación `24.69732 %`, S-T-O `120.3984°`.
- App: salida `01:55`, puesta `14:17` (hora local).
- JPL con altitud 0 m: salida `01:55`, puesta `14:19` → diferencia `0` y `2` minutos.
- JPL con altitud 2582 m: salida `01:48`, puesta `14:26` → diferencia `7` y `9` minutos (depresión del horizonte; ver D2).

### Madrid — noche D = 2026-11-04

- Medianoche local usada por la app: `2026-11-03T23:00:00Z`.
- App: ángulo `296.614°`, iluminación `27.707 %`, fase **Luna menguante**.
- JPL Horizons a `2026-11-03 23:00 UT`: iluminación `27.13606 %`, S-T-O `117.2090°`.
- App: salida `02:41`, puesta `15:39` (hora local).
- JPL con altitud 0 m: salida `02:42`, puesta `15:40` → diferencia `1` y `1` minuto.
- JPL con altitud 650 m: salida `02:38`, puesta `15:45` → diferencia `3` y `6` minutos.

### Nombre de fase

| Ángulo de la app | Tramo §8.4         | Nombre mostrado | Coincide |
| ---------------- | ------------------ | --------------- | -------- |
| `299.706°`       | `[292.5°, 337.5°)` | Luna menguante  | Sí       |
| `296.614°`       | `[292.5°, 337.5°)` | Luna menguante  | Sí       |

La iluminación de JPL disminuye entre el 3 y el 5 de noviembre, lo que confirma que la Luna está menguante. El porcentaje de la app y el de JPL difieren menos de 0,7 puntos porcentuales.

## Comandos de calidad

| Comando          | Resultado | Detalle                                                                                    |
| ---------------- | --------- | ------------------------------------------------------------------------------------------ |
| `pnpm lint`      | `0`       | Sin errores; 1 warning preexistente en `prettier.config.mjs`.                              |
| `pnpm typecheck` | `0`       | `tsc --noEmit` sin salida.                                                                 |
| `pnpm test`      | `0`       | 26 archivos, 376 pruebas aprobadas.                                                        |
| `pnpm build`     | `0`       | Build de producción correcto; 15 páginas estáticas, 6 curadas, 12 peticiones a Open-Meteo. |

> El build también se ejecutó mientras Open-Meteo agotaba el tiempo de conexión y falló. Ese comportamiento se registra como desviación D4 y queda escalado; la ejecución final con red sana terminó en `0`.

## Producción (T029)

- **URL:** https://vesper-sandy-seven.vercel.app/
- **Fecha de verificación:** 2026-11-04
- **Cliente de pruebas:** `curl` y Chrome headless sobre HTTPS.

| Comprobación                    | Resultado                                                                                                                                                                                                                                    |
| ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/` responde `307`              | Sí. `location: /clima/4.61_-74.08`; `cache-control: public, max-age=0, must-revalidate`; `server: Vercel`.                                                                                                                                   |
| Cabeceras de IP reales          | Sí. La redirección usa las coordenadas de la IP del visitante, no una ciudad curada. Vercel sobrescribe las cabeceras `x-vercel-ip-*` enviadas por el cliente, así que no se puede simular la ausencia de cabeceras contra el edge.          |
| Sin cabeceras redirige a Bogotá | Verificado en local (`pnpm start` sin cabeceras → `/clima/bogota`) y en las pruebas de `ip-location.test.ts`. En producción el edge siempre añade las cabeceras.                                                                             |
| `/clima/bogota`                 | `200`; `x-vercel-cache: PRERENDER`; `x-nextjs-prerender: 1`; `x-nextjs-stale-time: 300`; pronóstico incrustado (`fetchedAt`) y 1 petición de navegador (`current`).                                                                          |
| Slug no curado                  | `200`; shell genérica (`x-matched-path: /clima/[slug]`); `noindex, nofollow`; 2 peticiones de navegador (`forecast` + `current`).                                                                                                            |
| Slug inválido                   | `404`.                                                                                                                                                                                                                                       |
| Atribución                      | Visible en producción: «Datos de clima de Open-Meteo (CC-BY 4.0)».                                                                                                                                                                           |
| GPS por HTTPS                   | `window.isSecureContext === true`; clic en «Usar mi ubicación precisa» con geolocalización simulada en `6.2442, -75.5812` navega a `/clima/6.24_-75.58`, sin error.                                                                          |
| Hidratación                     | Sin errores ni warnings de consola en `/clima/bogota`, slug no curado, `/` y flujo GPS.                                                                                                                                                      |
| Metadata                        | `canonical` y `sitemap.xml` usan `https://vesper-sandy-seven.vercel.app`; `robots.txt` apunta al sitemap de producción.                                                                                                                      |
| Regeneración 3600 s             | El código declara `cacheLife('hours')` (revalidate 1 h) y el edge devuelve `x-nextjs-stale-time: 300`. No se esperó una hora para observar la regeneración; queda como verificación por configuración y cabeceras, no por medición temporal. |
| Logs del servidor               | No accesibles desde el entorno. La comprobación de que el servidor no llama a Open-Meteo en slugs no curados se hizo en local en T027; en producción la respuesta usa la shell genérica.                                                     |

## Desviaciones y escalaciones

### D1 — El build hace 2 peticiones por ciudad curada (12, no 6)

- **Observado:** 12 peticiones a Open-Meteo, 2 por cada una de las 6 ciudades; 6 entradas en la caché de fetch.
- **Qué se cumple:** solo se piden pronósticos de ciudades curadas; nunca de slugs no curados, nunca `current`, nunca `elevation`.
- **Qué no se cumple literalmente:** «el número de peticiones del build coincide con las ciudades curadas».
- **Causa probable:** Next.js 16 con `cacheComponents` + `partialPrefetching` renderiza cada ruta prerenderizada más de una vez (HTML/RSC) y las escrituras de caché no se deduplican entre workers. No se confirmó como defecto de la app.
- **Decisión:** documentar y escalar al dueño. No se cambió código ni configuración de build.

### D2 — Salida/puesta lunar y depresión del horizonte

- **Observado:** con el horizonte geométrico a 0 m, la diferencia con JPL es ≤2 min. Con la altitud real del sitio, JPL aplica depresión del horizonte y la diferencia es 7–9 min en Bogotá y 3–6 min en Madrid.
- **Causa:** `SearchRiseSet` usa una corrección fija de refracción y no recibe `metersAboveGround`; la app no modela la depresión del horizonte.
- **Decisión:** documentar y escalar. No se añadieron constantes ni se cambió la firma de `SearchRiseSet` sin autorización.

### D3 — El panel lunar muestra eventos del día local, no de la noche

- **Observado:** para Bogotá D = 2026-11-04 el panel muestra salida `01:55` y puesta `14:17`, ambas antes de la puesta del Sol (`17:38`). La salida que ocurre dentro de la noche es la del `2026-11-05` a las `02:35` (JPL: `07:35 UT`).
- **Causa:** `getMoonInfo` busca salida y puesta desde la medianoche de D y descarta los eventos cuya fecha local no sea D.
- **Decisión:** documentar y escalar. El criterio 6 se cumple si se compara contra los eventos del día D, pero el texto «Luna de esta noche» puede inducir a error. No se cambió el comportamiento sin autorización.

### D4 — El build falla si Open-Meteo agota el tiempo de conexión

- **Observado:** el 2026-11-04, con timeouts intermitentes de Open-Meteo (`UND_ERR_CONNECT_TIMEOUT`), `pnpm build` falló al prerenderizar `lago-de-tota` y `desierto-de-la-tatacoa` con código `1`. Un reintento con red sana terminó en `0`.
- **Qué exige el SPEC §7.5:** capturar el error durante el build, generar la página sin datos iniciales y dejar que el cliente los pida; el error no debe guardarse en caché.
- **Situación:** el `try/catch` de `CuratedNight` no evita que el fallo de escritura de la caché de `'use cache'` aborte el build. No se modificó código.
- **Decisión:** documentar y escalar. Requiere una corrección autorizada (por ejemplo, revisar el manejo de errores de la función cacheada o la configuración de prerenderizado).

### D5 — Verificación de producción (T029)

- **Resuelto:** la app está desplegada en https://vesper-sandy-seven.vercel.app/ y se verificaron `307` con cabeceras reales, GPS por HTTPS, atribución, metadata y ausencia de errores de hidratación.
- **Salvedad:** no se esperó una hora para medir la regeneración; se comprobó `cacheLife('hours')` en el código y `x-nextjs-stale-time: 300` en el edge. Los logs del servidor de producción no son accesibles desde el entorno.
- **Decisión:** T029 se considera terminada con esa salvedad documentada.
