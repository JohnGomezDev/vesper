# SPEC: App de clima y observación astronómica - Vesper

Documento de especificación funcional y de arquitectura para agentes de IA. Define **qué** debe hacer la app y **qué decisiones están cerradas**. Las convenciones de código viven en otro archivo y no se repiten aquí.

Este documento es el alcance completo. No hay MVP, fases ni entregables parciales.

## 0. Cómo leer este documento

- **[CERRADO]**: decisión tomada. No reabrir ni reemplazar sin autorización explícita del dueño del proyecto. Preguntar en caso de inconsistencia, ambigüedad o mejor opción potencial.
- **[VERIFICADO]**: dato confirmado contra documentación oficial o fuentes durante el diseño.
- **[POR VERIFICAR]**: dato recordado de memoria o inferido. Comprobarlo contra la respuesta real de la API o la documentación antes de construir encima. Si resulta falso, avisar al dueño en vez de improvisar. La comprobación contra documentación oficial (Context7 u otra fuente primaria) sigue pendiente.
- **[ABIERTO]**: decisión pendiente. Preguntar al dueño o proponer una opción y dejarla marcada.
- **[EXPLICAR]**: decisión o feature que se debe revisar y el agente de IA debe explicar a qué hace referencia.
- Un agente **no debe inventar** coordenadas, altitudes, zonas horarias, nombres de campos de API ni valores de configuración. Debe obtenerlos de la API, de la documentación o preguntar.

---

## 1. Resumen

App web para aficionados a la astronomía que responde: **¿cómo está el cielo en este lugar, esta noche o en otra noche cercana, y qué objetos podría observar?**

Combina:

1. **Clima** (Open-Meteo): nubosidad por capas, visibilidad, humedad, viento, precipitación.
2. **Astronomía calculada localmente** (astronomy-engine): Sol, Luna, planetas, crepúsculos, ventanas de observación.

Es un proyecto personal y de portafolio. No es comercial, no se promociona y no tiene dominio propio. El SEO es importante pero no esencial.

Idioma de la interfaz: español. No se contempla internacionalización. **[CERRADO]**

Hosting: **Vercel**. **[CERRADO]**

---

## 2. Alcance

### 2.1 Dentro de alcance

- Vista de condiciones actuales del lugar.
- Vista de la noche, de una hora antes de la puesta a una hora después del amanecer, con datos horarios y ventanas de observación.
- Navegación entre noches: 3 pasadas, hoy y las futuras que cubra el pronóstico. Las noches pasadas se etiquetan como pronóstico archivado.
- Selección de ubicación: por IP al abrir, ciudades curadas y búsqueda por nombre.
- GPS del navegador, solo tras una acción explícita del usuario.
- Ciudades curadas con páginas pregeneradas.
- Fase lunar (8 fases), iluminación, posición de la Luna.
- Observabilidad de la Luna y los planetas. El Sol es contexto (día, noche y crepúsculos), no un objetivo.
- Umbral de altitud mínimo con valor por defecto y selector del usuario.
- Puntuación de calidad de la noche, de 0 a 100, con palabra (sección 8.6). **[CERRADO]**
- Páginas legales (términos, privacidad). La redacción la entrega el dueño. **[ABIERTO]**
- Atribución visible a Open-Meteo.

### 2.2 Fuera de alcance **[CERRADO]**

- **Bortle, contaminación lumínica, brillo del cielo (SQM).** Ni como API ni como dato fijo por lugar.
- Uso comercial: anuncios, suscripciones, monetización.
- Cuentas de usuario, backend propio, base de datos.
- Guardar el "último lugar visitado".
- Catálogo de estrellas u objetos de cielo profundo.
- Internacionalización.
- Mapa y selección de lugar sobre un mapa.
- Búsqueda o formulario de coordenadas manuales.
- Caché persistida en el navegador, PWA y modo sin conexión.
- Redirigir la IP a la ciudad curada más cercana.
- Enviar `elevation` a Open-Meteo.
- Favoritos y estimación de seeing.

---

## 3. Stack y decisiones de arquitectura **[CERRADO]**

| Pieza                            | Decisión                                                                                                                                                   |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework                        | Next.js, App Router. Se usa por enrutamiento, metadata y generación estática de ciudades curadas.                                                          |
| UI                               | React. La app interactiva vive en componentes de cliente.                                                                                                  |
| Caché del servidor               | Data Cache de Next.js: `'use cache'` + `cacheLife` en la función de datos **del servidor**. 3600 segundos.                                                 |
| Caché del navegador              | TanStack Query v5 **[VERIFICADO]**. Solo memoria de la pestaña. No hay persistencia en `localStorage` ni IndexedDB.                                        |
| Cliente HTTP                     | `fetch` nativo. **No axios.**                                                                                                                              |
| Astronomía                       | astronomy-engine, calculada localmente (sin red).                                                                                                          |
| Datos de clima y geocodificación | Open-Meteo, plan gratuito, sin API key.                                                                                                                    |
| Hosting                          | Vercel. Debe poder leer las cabeceras de IP del visitante. **No usar exportación estática pura** (`output: 'export'`), porque rompe la caché del servidor. |

### 3.1 Principio rector de la caché **[CERRADO]**

- **Ciudades curadas:** el servidor pide el pronóstico a Open-Meteo dentro de una función `'use cache'` con `cacheLife` de 3600 s y lo entrega incrustado en la página. 3600 s coincide con el `staleTime` del cliente, así que el HTML y la query envejecen al mismo ritmo. Un valor menor multiplica llamadas del servidor sin mejorar la hora ya mostrada; uno mayor desalinearía los dos relojes.
- **Ese `cacheLife` no aplica a ningún `fetch` del navegador.** La capa compartida debe separar dos caminos: un wrapper de servidor marcado `'use cache'` con `cacheLife`, que llama a la función común; y el camino de cliente con `cache: 'no-store'`. En el cliente la frescura la decide solo TanStack Query.
- **Todo lo demás** (lugares no curados, bloque "ahora", geocodificación): **solo desde el navegador**, para que cada usuario consuma su propio límite de Open-Meteo.
- La ruta `/` consulta las cabeceras de IP, pero **no llama a Open-Meteo**.

---

## 4. Conceptos de dominio

**Ubicación.** Entidad central de la que dependen clima, astronomía, zona horaria y claves de caché. Campos: nombre para mostrar, latitud, longitud, altitud (m), zona horaria (IANA).

**Coordenadas redondeadas.** Toda coordenada usada en URLs, claves de caché y peticiones se redondea a **2 decimales** (~1 km), mitad alejándose de cero. Mejora el reparto de caché y limita la exposición de privacidad. En la clave de TanStack Query se usan esos números ya redondeados, no la altitud.

**Noche D.** La noche que **empieza** en el día local D. Va de la puesta (`sunset`) de D al amanecer (`sunrise`) de D+1. Cruza la medianoche. Todo el modelo se organiza por noches, no por días calendario. `?date=` es ese día D en el calendario **del lugar**, no la fecha UTC ni la del dispositivo.

**Tira visible.** La noche D más una hora antes de la puesta y una hora después del amanecer. Esas dos horas de margen son contexto (el cielo aún claro o ya claro). No cambian qué noche es D.

**Noche actual.** Se determina con la hora local **del lugar** (no la del dispositivo):

- Si la hora local es anterior al amanecer de hoy, la noche actual es la que empezó ayer.
- En cualquier otro caso, la noche actual es la de hoy.
- Si faltan `sunrise`/`sunset` para las fechas relevantes (sol de medianoche o noche polar), **no se declara noche actual**: se muestra el estado explícito de «sin noche astronómica» y el selector permite navegar por días locales. La fecha por defecto es el día local del lugar. **[CERRADO]**

**Noches disponibles.** Con `past_days=3` y `forecast_days=16` hay 19 días de datos (días −3 a +15 respecto a hoy). Como cada noche necesita el día siguiente, las noches completas son D = −3 a D = +14 (18 noches). **[CERRADO]**

**Pronóstico archivado.** Los días pedidos con `past_days` son pronósticos archivados del modelo, no observaciones de estación. Toda noche con D anterior a hoy se etiqueta en la interfaz como **«pronóstico archivado»**.

**Oscuridad.** Se define por la altitud del Sol calculada con astronomy-engine. Los tres niveles son acumulativos (un objeto que vale con el Sol a −6° también vale con el Sol más bajo):

- Sol < −18°: noche astronómica. Exigida para Urano y Neptuno (los objetos débiles).
- Sol < −12°: incluye el crepúsculo astronómico. Exigida para la Luna y los planetas brillantes.
- Sol < −6°: incluye el crepúsculo náutico. Permitida solo para Venus y Júpiter.

**Ventana de observación.** Intervalo continuo dentro de la tira visible en el que la Luna o un planeta cumple todos los filtros de la sección 8.5. El Sol no genera ventanas.

---

## 5. Fuentes de datos

### 5.1 Open-Meteo: pronóstico

Endpoint: `https://api.open-meteo.com/v1/forecast`

**Parámetros comunes**

| Parámetro               | Valor                                 |
| ----------------------- | ------------------------------------- |
| `latitude`, `longitude` | Coordenadas redondeadas a 2 decimales |
| `timezone`              | `auto`                                |
| `past_days`             | `3`                                   |
| `forecast_days`         | `16`                                  |

No se envía `elevation`. La altitud del observador para astronomy-engine es la `elevation` que devuelve la propia respuesta del pronóstico (altitud de la celda del modelo). **[CERRADO]**

**Dos peticiones distintas, con propósitos distintos:**

1. **Pronóstico** (`hourly` + `daily`, sin `current`). Servidor (ciudades curadas) y cliente.
2. **Ahora** (solo `current`, respuesta mínima). Solo cliente.

**Variables horarias (`hourly`)**

`cloud_cover`, `cloud_cover_low`, `cloud_cover_mid`, `cloud_cover_high`, `visibility`, `temperature_2m`, `relative_humidity_2m`, `dew_point_2m`, `wind_speed_10m`, `wind_gusts_10m`, `precipitation_probability`, `precipitation`, `is_day`

**Variables diarias (`daily`)**

`sunrise`, `sunset`.

Opcional, solo para verificación cruzada: `moon_phase` (fracción 0–1 de la lunación; nunca es fuente de la Luna). **[VERIFICADO]**

**Variables actuales (`current`)**

`temperature_2m`, `relative_humidity_2m`, `dew_point_2m`, `cloud_cover`, `wind_speed_10m`, `wind_gusts_10m`, `is_day`

**Estado de verificación de variables**

- **[VERIFICADO]** en la página oficial de documentación: nubosidad baja/media/alta, visibilidad, `sunrise`/`sunset`, `is_day`, `moonrise`/`moonset`/`moon_phase` (diarios), `cape`, `lifted_index`, `boundary_layer_height`, viento en niveles de presión, existencia del parámetro `elevation` (no se usa), rango de 16 días de `forecast_days` y hasta 92 días de `past_days`. Los nombres correctos son `past_days` y `forecast_days`.
- **[VERIFICADO]** contra la respuesta real (2026-10-19, Bogotá): las 13 variables horarias, las 7 actuales y `sunrise`/`sunset`/`moon_phase` existen con el nombre escrito y devuelven datos. `past_days=3` y `forecast_days=16` son válidos juntos y devuelven 19 días. `moon_phase` es una fracción 0–1 de la lunación (0 = Luna nueva, 0,5 = Luna llena), no un porcentaje ni un ángulo; solo se usa como verificación cruzada. Detalle en `verification-notes.md` §1–§3.
- Las unidades observadas son nubosidad y humedad en %, temperatura y punto de rocío en °C, viento y ráfagas en km/h, visibilidad en m, precipitación en mm, e `is_day` 0/1. **[VERIFICADO]**
- Si una variable no existe, la API responde 400 con el motivo en el cuerpo. Ese mensaje debe mostrarse en desarrollo.

**Ejemplo de referencia (Bogotá)**

```
https://api.open-meteo.com/v1/forecast?latitude=4.61&longitude=-74.08&current=temperature_2m,relative_humidity_2m,dew_point_2m,cloud_cover,wind_speed_10m,wind_gusts_10m,is_day&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,temperature_2m,relative_humidity_2m,dew_point_2m,wind_speed_10m,wind_gusts_10m,precipitation_probability,precipitation,is_day&daily=sunrise,sunset&timezone=auto&past_days=3&forecast_days=16
```

(Es la consulta combinada de referencia. En la app, `current` y `hourly`/`daily` van en peticiones separadas. Las coordenadas del ejemplo ilustran el redondeo; las de las ciudades curadas salen de la geocodificación, no de este texto.)

**Reglas de interpretación**

- Los arrays de `hourly` y `daily` son paralelos: el índice `i` de `time` corresponde al índice `i` de cada variable.
- Cada fila horaria está sellada con el inicio de esa hora en la zona resuelta (`18:00` cubre 18:00–19:00). Una fila entra en la tira si su intervalo de una hora **solapa** la tira visible.
- No asumir 24 filas por día. Un cambio de hora (en lugares buscados fuera de Colombia) produce días de 23 o 25 horas. Agrupar por la fecha del campo `time`.
- Los datos de `current` se interpolan a intervalos de 15 minutos (`current.interval: 900`) a partir de la serie del modelo; no es un comportamiento limitado a Europa central y Norteamérica. **[VERIFICADO]** Por eso no se espera variación fuerte entre refrescos. Detalle en `verification-notes.md` §1 y §11.
- La respuesta incluye la zona horaria y la altitud usadas. Esa zona horaria es la fuente de verdad para definir "hoy" y "esta noche". Esa altitud es la del observador astronómico.

### 5.2 Open-Meteo: geocodificación

Endpoint: `https://geocoding-api.open-meteo.com/v1/search`

| Parámetro  | Valor         |
| ---------- | ------------- |
| `name`     | Texto buscado |
| `count`    | `7`           |
| `language` | `es`          |

- **[VERIFICADO]** Con 1 carácter devuelve vacío; con 2, solo coincidencias exactas; con 3 o más, búsqueda aproximada. La app **no busca con menos de 3 caracteres**, y solo al pulsar el botón de búsqueda. Matiz observado: con 2 caracteres, `Bo` devolvió `Bøur` (prefijo con diacríticos), así que «solo exactas» no es literal; no afecta porque la app exige 3.
- **[VERIFICADO]** Cada resultado trae `name`, `latitude`, `longitude`, `elevation`, `id`, `timezone` y la región administrativa (`admin1`, y `admin2`/`admin3` cuando existe). `country` puede faltar en registros aislados (p. ej. `Bøur`); la UI debe tolerar país o región ausentes. Detalle en `verification-notes.md` §6.
- El slug de un lugar buscado lleva las coordenadas del resultado (sección 6.2). No hace falta un endpoint por identificador para abrir el enlace.
- Limitación conocida: la geocodificación cubre localidades, no sitios de observación (páramos, miradores). Los desiertos y lagos curados viven en la lista fija, no dependen de que la búsqueda los encuentre.

### 5.3 Límites y términos de Open-Meteo **[VERIFICADO]**

Plan gratuito, solo uso no comercial:

| Periodo | Límite                   |
| ------- | ------------------------ |
| Minuto  | 600 llamadas             |
| Hora    | 5.000 llamadas           |
| Día     | menos de 10.000 llamadas |
| Mes     | 300.000 llamadas         |

- **[VERIFICADO]** Una petición grande contabiliza como más de una llamada. Peso oficial: `max(1, max(variables/10, variables/10 × días/14) × ubicaciones)`. La consulta combinada de T001 (23 variables, 19 días, 1 ubicación) suma **≈3,12 llamadas**. Las dos peticiones separadas de la app suman ≈2,04 (pronóstico sin `moon_phase`, 15 variables) + 1,00 («ahora») ≈ 3,04; si el pronóstico incluye `moon_phase` (16 variables), ≈2,17 + 1,00 ≈ 3,17. Detalle en `verification-notes.md` §5.
- Licencia de datos: CC-BY 4.0. **Atribución obligatoria** visible en la app (enlace a Open-Meteo).
- Uso no comercial: sin anuncios ni suscripciones.
- Open-Meteo se reserva el derecho de bloquear IPs o aplicaciones que abusen.
- Si el proyecto pasara a uso comercial, requeriría plan de pago y clave de API, y entonces la clave no debe viajar al navegador. Fuera de alcance hoy.

### 5.4 astronomy-engine: cálculos locales

**Observador:** latitud, longitud y altitud de la ubicación. La altitud es la `elevation` devuelta por el pronóstico. Siempre se pasa.

**Capacidades requeridas [VERIFICADO]** contra `astronomy-engine@2.1.19` (2026-10-19). Firmas exactas tomadas del `.d.ts` publicado y del README oficial; el detalle está en `verification-notes.md` (T002). `FlexibleDateTime` es un `Date` de JavaScript en UTC.

| Capacidad                                                                 | Función confirmada                                                                                                                                                                                                          |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fase lunar como ángulo (0 a 360°)                                         | `MoonPhase(date)`                                                                                                                                                                                                           |
| Fracción iluminada (0 a 1)                                                | `Illumination(body, date).phase_fraction`                                                                                                                                                                                   |
| Altitud y azimut de Sol, Luna y planetas para un instante y un observador | `Equator(body, date, observer, ofdate, aberration)` y después `Horizon(date, observer, ra, dec, refraction)`. El observador es `Observer(latitude, longitude, height)`, con `height` en metros (la altitud de la ubicación) |
| Salida y puesta de Sol y Luna                                             | `SearchRiseSet(body, observer, direction, dateStart, limitDays, metersAboveGround?)`. `direction` es `+1` (salida) o `-1` (puesta), no un enum                                                                              |
| Cruce del Sol por una altitud dada (crepúsculos)                          | `SearchAltitude(body, observer, direction, dateStart, limitDays, altitude)`, con `altitude` en `-6`, `-12` o `-18` grados                                                                                                   |
| Elongación de planetas respecto al Sol (Mercurio, Venus)                  | `Elongation(body, date)` → `elongation` en 0–180° y `visibility` (`"morning"`/`"evening"`; la app traduce a «de la mañana»/«de la tarde»)                                                                                   |
| Magnitud aparente de planetas                                             | `Illumination(body, date).mag`                                                                                                                                                                                              |
| Separación angular entre dos cuerpos                                      | **No existe función directa cuerpo–cuerpo.** Se usa `AngleBetween(a, b)` con los vectores `Equator(...).vec`. Para la separación Sol–cuerpo existe `AngleFromSun(body, date)`                                               |
| Culminación (tránsito por el meridiano)                                   | **Nativa:** `SearchHourAngle(body, observer, 0, dateStart)` → `HourAngleEvent` con `time` y `hor` (altitud máxima). No se usa el máximo de la serie muestreada                                                              |

**Refracción atmosférica.** No está activa por defecto en la librería: la app pasa la cadena `"normal"` a `Horizon` siempre que pide altitud y azimut. `SearchRiseSet` ya la aplica siempre (corrección fija de 34 minutos de arco). `SearchHourAngle` devuelve el `hor` con `"normal"`. `SearchAltitude` (crepúsculos) **no** la aplica, de forma intencionada: la oscuridad de la sección 4 se define por la altitud geométrica del Sol.

**Precisión declarada:** ±1 minuto de arco, contrastada por el autor contra NOVAS y JPL Horizons. Suficiente para el uso. Las horas de salida y puesta pueden diferir un par de minutos de la realidad por la refracción real. El horizonte físico (cerros, edificios) pesa más que cualquier error de la librería.

**Fuente única para la Luna [CERRADO]:** la librería es la fuente de verdad de fase, iluminación, posición, salida y puesta de la Luna. El `moon_phase` de Open-Meteo, si se pide, solo sirve como verificación cruzada. Nunca se mezclan ambas fuentes en la interfaz.

**Dónde se calcula:** localmente (sin red). En el cliente para todo lo que depende de "ahora" o del umbral de altitud elegido por el usuario. En el servidor, además, para el HTML de las ciudades curadas (sección 7), con el umbral por defecto.

---

## 6. Rutas y URL **[CERRADO]**

La URL es la **fuente de verdad** de la ubicación y de la noche visualizada.

| Ruta                       | Descripción                                                                                              |
| -------------------------- | -------------------------------------------------------------------------------------------------------- |
| `/`                        | Ruta de servidor, dinámica. Lee cabeceras de IP, redirige a `/clima/<slug>`. No muestra interfaz propia. |
| `/clima/[slug]`            | Plantilla única de la app. Acepta los slugs de la sección 6.2.                                           |
| `/terminos`, `/privacidad` | Páginas legales. Textos del dueño, pendientes.                                                           |

### 6.1 Redirección de `/`

1. Leer las cabeceras de ubicación aproximada por IP de Vercel. Los nombres exactos son `x-vercel-ip-latitude`, `x-vercel-ip-longitude`, `x-vercel-ip-city`, `x-vercel-ip-country`, `x-vercel-ip-country-region`, `x-vercel-ip-timezone`, `x-vercel-ip-postal-code` y `x-vercel-ip-continent`. Para la IP del cliente, Vercel documenta `x-forwarded-for`, `x-vercel-forwarded-for` y `x-real-ip`. **[VERIFICADO]** Detalle en `verification-notes.md` §7.
2. Redirigir al slug de coordenadas redondeadas de esa IP. **No** elegir una ciudad curada, aunque la IP caiga encima de una.
3. El nombre mostrado es «Ubicación aproximada», junto con las coordenadas redondeadas. No se le asigna el nombre de una ciudad.
4. Si no hay cabeceras (desarrollo local o IP sin datos), redirigir a la ciudad curada **Bogotá**.
5. La redirección es **temporal (307)**, nunca permanente, para que el navegador no la cachee.
6. Esta ruta **no puede ser estática**. No llama a Open-Meteo.

No existe un buscador de coordenadas. El slug de coordenadas solo lo producen esta redirección y el botón de GPS.

### 6.2 Tipos de slug en `/clima/[slug]`

Las únicas formas de elegir un lugar con nombre son la lista curada y el buscador. El slug guarda las coordenadas porque la respuesta de búsqueda ya las trae, y así el enlace compartido no depende de un segundo endpoint.

| Tipo          | Ejemplo de forma        | Resolución                                                         |
| ------------- | ----------------------- | ------------------------------------------------------------------ |
| Ciudad curada | `bogota`                | Lista de la sección 9. Página pregenerada. Coincidencia exacta.    |
| Lugar buscado | `zipaquira_5.02_-73.99` | El prefijo es etiqueta. Mandan latitud y longitud, ya redondeadas. |
| Coordenadas   | `4.61_-74.08`           | IP o GPS. No lleva nombre.                                         |

Reglas:

- Separador `_`. El prefijo va en minúsculas, sin tildes, con guiones internos (`villa-de-leyva`, `lago-de-tota`). El prefijo no usa `_`.
- Latitud y longitud llevan siempre 2 decimales. El número positivo no lleva `+`.
- **El carácter `-` se interpreta, y no es un separador.** En el nombre es un guion (`lago-de-tota`). En la coordenada es el signo menos (`-73.99`). Hay que conservarlo: si se omite, −74.08 se lee como 74.08 y el punto cae en Asia. Una latitud sur, igual, se leería al norte. No partir el slug por `-`, ni borrar los guiones del nombre.
- Parseo: si el slug entero está en la lista curada, es ciudad curada. Si no, partir **solo** por `_`. Los dos últimos tramos deben coincidir con `^-?\d+\.\d{2}$` y caer en rango (latitud −90 a 90, longitud −180 a 180). Un `parseFloat` basta para el signo; no hace falta otro parser. El resto, unido de nuevo por `_`, es la etiqueta (vacía en el slug de solo coordenadas). Cualquier otra cosa es **404**.
- Ejemplos válidos de forma: `villa-de-leyva_5.63_-73.52`, `ushuaia_-54.80_-68.30`, `4.61_-74.08`. El `-` no se codifica en la ruta.
- La etiqueta no se contrasta con la lista ni con la geocodificación. `zipaquira_4.61_-74.08` pide el clima de 4.61, −74.08 aunque el nombre no corresponda.
- Evitar en los slugs caracteres que se codifiquen distinto en la ruta (`@`, `,`).
- Slugs no curados **no se prerenderizan**. Llevan metadata no indexable. Los curados tienen título y descripción propios.
- Un slug bien formado y no curado responde 200 con el marco de la página. Si más adelante no hay pronóstico, el estado vacío vive en el cliente. El servidor no geocodifica para decidir el 404.
- Las coordenadas del ejemplo son de forma, no datos de una ciudad.

### 6.3 Parámetro de noche

- **`?date=YYYY-MM-DD`**: día local del lugar en el que empieza la noche. Único parámetro de fecha. No existe `days`.
- **Se lee exclusivamente en el cliente.** Si el componente de servidor leyera `searchParams`, Next.js trataría la página como dinámica y se perdería la generación estática de las ciudades curadas. Con `cacheComponents` activo, `useSearchParams` **siempre** exige un límite de `<Suspense>`; sin él, el build de producción falla. **[VERIFICADO]** Detalle en `verification-notes.md` §9.
- Sin `?date=`: se muestra la noche actual. Sin mensaje de error.
- `?date=` mal formada, o fuera de D = −3…+14: la página del lugar sigue disponible, con el selector de noches, y un mensaje descriptivo («La fecha no es válida» o «La fecha seleccionada está fuera del rango disponible»). No es un 404: el lugar sí existe.
- Cambiar la noche **no dispara ninguna petición**: una respuesta cubre las 18 noches y se filtra localmente.
- Al cambiar de noche en el selector, la URL se actualiza **reemplazando** la entrada del historial (no apilando), sin recargar. El botón atrás vuelve al lugar anterior, no a la noche anterior.

---

## 7. Datos y caché

### 7.1 Reparto servidor y cliente **[CERRADO]**

| Petición                                              | Quién la hace             | Se cuenta contra el límite de |
| ----------------------------------------------------- | ------------------------- | ----------------------------- |
| Pronóstico de ciudades curadas (build y regeneración) | Servidor                  | El servidor                   |
| Pronóstico de cualquier otro lugar                    | Navegador                 | Cada usuario                  |
| Bloque `current` (siempre)                            | Navegador                 | Cada usuario                  |
| Geocodificación (búsqueda)                            | Navegador                 | Cada usuario                  |
| Redirección de `/`                                    | Servidor (solo cabeceras) | Nadie                         |

**Garantías que el sistema debe cumplir:**

- La rama de servidor consulta Open-Meteo **solo si el slug pertenece a la lista curada**.
- La metadata (`generateMetadata`) se alimenta **solo** de la lista curada y del slug, nunca de Open-Meteo.
- El servidor **no** resuelve slugs de lugares buscados ni de coordenadas, ni llama a la geocodificación.
- El servidor **no** pide `current`.
- El servidor **no** envía `elevation`.

**Comprobaciones de aceptación:**

- En una ruta no curada, la pestaña de red del navegador muestra las llamadas a Open-Meteo y los registros del servidor no muestran ninguna.
- El número de peticiones del build coincide con el número de ciudades curadas.
- Una petición hecha en el navegador no lleva opción `revalidate` de Next.js.

### 7.2 Peticiones con `fetch`

- Una **única función** arma la URL y ejecuta la petición, compartida entre servidor y cliente.
- `fetch` no lanza error en respuestas 4xx y 5xx: la función debe comprobar `response.ok`, leer el cuerpo de error (Open-Meteo explica la causa) y lanzar un error que conserve el código de estado.
- En el servidor, un wrapper `'use cache'` con `cacheLife` de 3600 s llama a la función común; `next.revalidate` no es el mecanismo de caché con `cacheComponents`. En el cliente se pasa `cache: 'no-store'` y no se pasa `revalidate`.
- Las funciones de query reciben y propagan la señal de cancelación de TanStack Query.

### 7.3 Queries de TanStack Query

| Query      | Clave                    | Contenido                   | Frescura                                                 |
| ---------- | ------------------------ | --------------------------- | -------------------------------------------------------- |
| Pronóstico | `['forecast', lat, lon]` | `hourly` + `daily`, 19 días | `staleTime` 1 hora                                       |
| Ahora      | `['current', lat, lon]`  | `current`                   | `staleTime` 30 min y refresco automático cada **30 min** |

- Mismas claves para todos los tipos de slug. `lat` y `lon` son las coordenadas ya redondeadas.
- `gcTime` de **24 horas** en memoria. Es el tiempo que el dato sigue en memoria después de dejar de mirarlo, distinto de `staleTime`. Sirve para volver a un lugar ya visitado en la misma sesión sin pedir de nuevo, y para mostrar ese dato si la red falla a mitad de sesión. Al cerrar la pestaña desaparece. No se persiste.
- El cliente de TanStack se crea **una vez por sesión del navegador** y vive en el **layout raíz** (no en la página del lugar) para que la caché sobreviva a la navegación. No debe compartirse entre usuarios en el servidor.
- El refresco automático solo corre para queries con pantalla suscrita, y se pausa con la pestaña oculta (comportamiento por defecto, mantenerlo).
- **Nunca invalidar globalmente.** Si hace falta forzar refresco, por clave exacta.
- **Política de reintentos:** no reintentar errores 4xx (excepto 429, con espera creciente). Sí reintentar fallos de red y 5xx.
- Al cambiar de ubicación, mientras carga la nueva mostrar un esqueleto. Nunca mostrar datos de un lugar bajo el nombre de otro.
- Mostrar «Actualizado hace X min» y un indicador discreto durante el refresco en segundo plano (sin spinner a pantalla completa).
- La geocodificación de una búsqueda se guarda en memoria el resto de la sesión. No hace falta conservarla días: el slug ya trae las coordenadas.

### 7.4 Alinear los relojes de caché en ciudades curadas **[CERRADO]**

El HTML puede tener hasta 1 hora de antigüedad. Para que TanStack Query no crea que el dato es nuevo:

1. El servidor registra la **hora real de obtención** del pronóstico y la entrega junto con él.
2. El cliente usa el pronóstico como dato inicial **indicando esa hora de obtención** con `initialDataUpdatedAt` (TanStack Query v5), un timestamp de JavaScript en milisegundos. **[VERIFICADO]** Detalle en `verification-notes.md` §10.
3. Si el dato ya venció, TanStack lo refresca al montar. Resultado: la antigüedad máxima efectiva es 1 hora, no 2.

Con `cacheComponents: true` (Next.js 16.4.1, ya activo en `next.config.ts`), el export de segmento `export const revalidate` **no es compatible**: produce error. La revalidación de 3600 s se declara con `'use cache'` + `cacheLife`, por ejemplo `cacheLife('hours')` (perfil con `stale: 5 min`, `revalidate: 1 h`, `expire: 1 d`) o un perfil con `revalidate: 3600`. **[VERIFICADO]** `cacheLife` se aplica al ámbito cacheado, no a la ruta entera. El `fetch` del servidor se cachea al ejecutarse dentro de `'use cache'`; sus opciones `next.revalidate`/`next.tags` se sustituyen por `cacheLife`/`cacheTag`. El `fetch` del navegador sigue en `no-store`. Para lugares no curados, el servidor devuelve solo el marco sin pedir datos; con `partialPrefetching: true`, el App Shell se sirve y el resultado se actualiza y cachea en segundo plano. Detalle en `verification-notes.md` §8.

### 7.5 Si Open-Meteo falla en el servidor

- Durante el build: capturar el error, generar la página **sin datos iniciales** y dejar que el cliente los pida.
- Durante una regeneración: Next.js sigue sirviendo la última versión válida; el error no se guarda en caché y la regeneración se reintenta en la siguiente petición. **[VERIFICADO]** Detalle en `verification-notes.md` §8.

### 7.6 Qué va en el HTML estático y qué se calcula tras montar

- **HTML de ciudades curadas:** pronóstico, `sunrise`/`sunset`, fase y iluminación lunar de la noche destacada, ventanas de observación con el umbral de altitud por defecto.
- **Después de montar, solo en el cliente:** bloque «ahora», hora actual, cuál es la «noche actual», lectura de `?date=`, GPS, umbral de altitud elegido por el usuario. Evita errores de hidratación.
- Si la página se generó antes de la medianoche local del lugar, la «noche destacada» estática puede ser la de ayer. El cliente la recalcula al montar.

---

## 8. Funcionalidad

### 8.1 Selección y cambio de ubicación

**Orígenes de una ubicación:**

1. **IP** (al abrir `/`, ver 6.1). Sin permisos. Es aproximada. Se muestra como ubicación aproximada con coordenadas redondeadas, nunca sustituida por una ciudad curada.
2. **Ciudad curada**, elegida desde la lista.
3. **Búsqueda por nombre** (geocodificación).
4. **GPS del navegador**, solo tras el botón «Usar mi ubicación precisa». Nunca pedir permiso al cargar. Requiere HTTPS. Debe manejar rechazo, lentitud y fallo. Produce un slug de coordenadas, igual que la IP.

No hay formulario para escribir latitud y longitud, ni mapa.

**Búsqueda:**

- Mínimo 3 caracteres, con clic en botón de búsqueda. `count=7`.
- Cada resultado muestra nombre, región y país para desambiguar.
- Al elegir un resultado: se guarda en la caché de memoria de la sesión, se lanza la precarga del pronóstico (prefetch de `['forecast', lat, lon]`) y se navega al slug `etiqueta_lat_lon`. En esa navegación la página ya tiene las coordenadas en la URL; no vuelve a geocodificar para saber a quién pedir el clima. El nombre bonito (con región y país) sale de la caché de esa elección. En un enlace abierto en frío, el clima se pide con las coordenadas del slug y el nombre visible es la etiqueta del slug hasta que haya un nombre mejor; no bloquea la pantalla.

**Comportamiento al cambiar de lugar:** solo se navega a otro slug. Si ese lugar ya estaba en caché de memoria, se muestra al instante y se refresca en segundo plano si venció. Si es nuevo, hay un estado de carga breve. Las ciudades curadas cargan con el pronóstico ya incrustado.

**Astronomía:** al cambiar de lugar se recalcula todo con el nuevo observador (posiciones, salidas, puestas, crepúsculos, ventanas).

### 8.2 Pantalla principal

Tres bloques:

1. **Ahora.** Temperatura, humedad, punto de rocío, nubosidad, viento, ráfagas, hora del dato. Dos indicadores distintos: día/noche según `is_day` de Open-Meteo (puesta y salida), y el nivel de oscuridad según la altitud del Sol (sección 4).
2. **Esta noche** (o la noche seleccionada). Tira horaria desde una hora antes de la puesta hasta una hora después del amanecer:
   - Nubosidad hora a hora como barra de color, con desglose baja/media/alta y la clase de la sección 8.5.
   - Visibilidad, humedad y diferencia temperatura/punto de rocío, viento y ráfagas, probabilidad de precipitación.
   - Las horas fuera del intervalo puesta–amanecer se ven como margen, no como parte de la noche.
   - Si la noche es pasada (D anterior a hoy), la etiqueta **«pronóstico archivado»** es visible.
   - Resumen: «mejor ventana» entre las ventanas de observación de esa noche. Se elige por clase de nubosidad (menor `nube`), luego por mayor altitud máxima y luego por mayor duración. **[CERRADO]**
   - Información lunar de esa noche: fase (nombre completo e icono), porcentaje de iluminación, salida y puesta, altura durante la noche.
   - Ventanas de observación de la Luna y los planetas (sección 8.5). El Sol no aparece en esa lista.
3. **Selector de noches.** Fila horizontal desplazable: de −3 a +14. Cada elemento muestra la palabra y el número de la puntuación (8.6), la nubosidad media de las horas válidas de la nota y si hay lluvia probable. Hay lluvia probable cuando el máximo de `precipitation_probability` en esas horas válidas es **≥ 60 %**. Si esa noche no tiene nota, muestra «sin noche astronómica» y no marca lluvia. Tocar una noche cambia la vista sin cambiar de pantalla y actualiza `?date=`. **[CERRADO]**

**Reglas del selector:**

- Se deshabilita avanzar más allá de +14 y retroceder más allá de −3.
- No se muestra una marca de «tendencia» ni otro aviso de fiabilidad según lo lejana que sea la noche. Open-Meteo no entrega ese dato. El selector muestra la nubosidad media de las horas válidas de cada noche (las mismas horas que la nota, Sol < −18°). **[CERRADO]**
- La interfaz indica claramente la **zona horaria del lugar** («horas locales de [lugar]») cuando difiere de la del dispositivo.

### 8.3 Cálculo de la noche

Para una noche D:

1. Tomar `sunset` de D y `sunrise` de D+1 (de `daily`).
2. La tira visible es `[sunset − 1 h, sunrise + 1 h]`, recortada a las horas que el pronóstico realmente trae.
3. Las filas de `hourly` que solapan ese intervalo forman la tira. `is_day` sirve como apoyo para marcarlas.
4. Para la oscuridad real (crepúsculos) usar astronomy-engine, no `sunset`/`sunrise`.
5. Los datos de la noche D usan los días D y D+1 del pronóstico. La hora de margen anterior puede caer en D; la posterior, en D+1.

### 8.4 Luna

Ocho fases. El ángulo que publica el USNO es el **centro** de cada fase. Cada nombre cubre ±22,5° alrededor de ese centro. Los tramos son semiabiertos, así que el borde pertenece a una sola fase:

| Centro (USNO) | Tramo                       | Nombre           |
| ------------- | --------------------------- | ---------------- |
| 0°            | [337,5°, 360) ∪ [0°, 22,5°) | Luna nueva       |
| 45°           | [22,5°, 67,5°)              | Luna creciente   |
| 90°           | [67,5°, 112,5°)             | Cuarto creciente |
| 135°          | [112,5°, 157,5°)            | Gibosa creciente |
| 180°          | [157,5°, 202,5°)            | Luna llena       |
| 225°          | [202,5°, 247,5°)            | Gibosa menguante |
| 270°          | [247,5°, 292,5°)            | Cuarto menguante |
| 315°          | [292,5°, 337,5°)            | Luna menguante   |

- **Siempre mostrar el porcentaje de iluminación junto al nombre.**
- La fase de una noche se evalúa a la medianoche local del lugar.
- **Icono [CERRADO]:** disco con la porción iluminada que corresponde a esa fase y a ese porcentaje. Luna creciente y Luna menguante se distinguen entre sí por el nombre y por un dibujo convencional asociado a ese nombre. No se calcula ni se muestra el ángulo del limbo brillante, ni se rota el icono según la latitud. Esa orientación queda fuera de este documento.

### 8.5 Observabilidad de objetos

El Sol no es un objetivo. Se calcula para clasificar la oscuridad y para la elongación.

**Muestreo [CERRADO].** Para saber desde qué hora hasta qué hora se cumple todo a la vez, la app revisa el cielo cada **10 minutos** a lo largo de la tira visible. En cada instante calcula la posición del Sol, la Luna y los planetas y aplica los filtros. Los instantes seguidos que pasan se juntan en una ventana: el inicio es la primera muestra que pasa y el fin es la última. La hora mostrada queda así aproximada a unos 5 minutos. Diez minutos es el compromiso elegido: 15 minutos engorda ese error, y bajar de 10 multiplica cuentas que igual son locales y baratas (una noche larga son del orden de cien instantes por cuerpo).

La **culminación** (máxima altitud, cruce del meridiano) no sale de ese máximo muestreado si la librería puede calcular el tránsito. Si no puede, se usa la muestra más alta y se marca como aproximada.

Una ventana se muestra como: objeto, hora de inicio, hora de fin, altitud máxima y hora de la culminación (ej. «Júpiter, 21:10 a 03:40, máxima 62° a las 00:30»), más la peor clase de nubosidad dentro de la ventana.

**Filtros (todos deben cumplirse):**

1. **Altitud mínima.** Por defecto **15°**. El usuario puede elegir 10°, 15°, 20°, 25° o 30°. Al cambiar, se recalculan en local las ventanas y el resumen de la mejor ventana. No se vuelve a pedir el pronóstico ni el bloque «ahora». El valor vive en memoria de la sesión (estado de React en el layout); un cierre de pestaña vuelve a 15°. No se guarda en `localStorage` ni en la URL. Usar altitudes con refracción.
2. **Oscuridad suficiente**, acumulativa:
   - Urano y Neptuno: Sol < −18°.
   - Luna, Marte, Mercurio y Saturno: Sol < −12°.
   - Venus y Júpiter: Sol < −6°.
3. **Brillo (planetas).** Con la magnitud aparente se etiqueta el objeto como visible a simple vista, con binoculares o con telescopio, usando la referencia de cielo oscuro: hasta magnitud 5–6 a simple vista. Urano y Neptuno se etiquetan siempre como «requiere óptica». No se muestra un segundo umbral «de ciudad»: el producto no tiene un dato de contaminación lumínica.
4. **Elongación (Mercurio y Venus).** Por debajo de **15°** no hay ventana útil y el texto es «demasiado cerca del Sol». Si hay ventana, indicar «de la mañana» o «de la tarde» según el planeta esté al oeste o al este del Sol.
5. **Interferencia lunar.**
   - Como objetivo, a la Luna le basta la altitud mínima y su nivel de oscuridad.
   - La **ventana sin Luna** (oscuridad exigida por el objeto, y Luna bajo el horizonte o con iluminación < 10 %) se muestra destacada para Urano y Neptuno, los dos objetos etiquetados como «requiere óptica». **[CERRADO]**
   - Aviso si **ese** planeta está a menos de **10°** de una Luna con iluminación > 20 %. Aviso fuerte por debajo de **5°**. Es un aviso del objeto, no de la noche. No entra en la puntuación de 8.6.
6. **Nubosidad.** Cada hora se resume en un solo porcentaje, con las tres capas. La baja pesa más porque tapa; la alta pesa poco porque el cirro aún deja ver:

   `nube = 0,50·cloud_cover_low + 0,35·cloud_cover_mid + 0,15·cloud_cover_high`

   Si falta alguna capa, la hora es desconocida: no se sustituye por cero. El borde de cada clase pertenece a la clase mejor:

   | `nube` | Clase     |
   | ------ | --------- |
   | ≤ 10 % | Ideal     |
   | ≤ 20 % | Buena     |
   | ≤ 30 % | Aceptable |
   | ≤ 40 % | Regular   |
   | > 40 % | No óptima |

   Una hora «no óptima» permanece en la tira y **no** entra en ninguna ventana de observación. Un solo hueco de una muestra de 10 minutos no parte la ventana. El desglose de la tira sigue mostrando las tres capas por separado.

### 8.6 Puntuación de calidad de observación **[CERRADO]**

Una nota de 0 a 100 por noche, más una palabra. Sirve para comparar noches en el selector. No incluye contaminación lumínica, seeing ni visibilidad. No incluye el aviso de separación angular entre la Luna y un planeta (ese aviso es de cada objeto, sección 8.5).

La forma sigue la metodología publicada por ClearSkys, con estas adaptaciones: la misma `nube` de 8.5, viento medio (no ráfagas), humedad relativa (no el punto de rocío) y palabras propias. Las ráfagas, el punto de rocío y la visibilidad se muestran en la tira y no entran en la cuenta.

**Horas que entran.** Solo aquellas con el Sol por debajo de −18°. Si no hay ninguna, el texto es «sin noche astronómica» y no hay número. No se sustituye por una nota de crepúsculo en latitudes altas. Una hora con algún dato nulo de las variables de abajo queda fuera de la media; el nulo no se cambia por cero.

**Nota de cada hora**, de 0 a 100. Los pesos suman 1:

```
hora = 0,55·puntosNube + 0,20·puntosViento + 0,15·puntosHumedad + 0,10·puntosLluvia
```

Cada `puntos*` vale de 0 a 100. El borde del escalón pertenece al escalón mejor (el de más puntos).

| `nube` (8.5) | Puntos de nube |
| ------------ | -------------- |
| ≤ 15 %       | 100            |
| ≤ 30 %       | 85             |
| ≤ 50 %       | 60             |
| ≤ 70 %       | 30             |
| ≤ 85 %       | 10             |
| > 85 %       | 0              |

| `wind_speed_10m` | Puntos de viento |
| ---------------- | ---------------- |
| ≤ 5 km/h         | 100              |
| ≤ 10 km/h        | 80               |
| ≤ 15 km/h        | 50               |
| ≤ 20 km/h        | 20               |
| > 20 km/h        | 0                |

| `relative_humidity_2m` | Puntos de humedad |
| ---------------------- | ----------------- |
| ≤ 70 %                 | 100               |
| ≤ 80 %                 | 70                |
| ≤ 90 %                 | 40                |
| > 90 %                 | 10                |

| `precipitation_probability` | Puntos de lluvia |
| --------------------------- | ---------------- |
| ≤ 10 %                      | 100              |
| ≤ 30 %                      | 70               |
| ≤ 60 %                      | 30               |
| > 60 %                      | 0                |

**Nota de la noche.** Media de las horas válidas, menos la Luna:

```
resta = 35 × (iluminación / 100)^0,7 × solape
nota  = media de las horas − resta
```

La iluminación es la de la medianoche local de esa noche (0 a 100). El solape es la fracción de las horas válidas en las que la Luna está sobre el horizonte. Luna bajo el horizonte toda la noche: solape 0 y resta 0. La nota se recorta a 0 si la resta la deja negativa.

**Palabra.** El borde pertenece a la palabra mejor:

| Nota | Palabra   |
| ---- | --------- |
| ≥ 80 | Excelente |
| ≥ 65 | Buena     |
| ≥ 50 | Regular   |
| < 50 | Mala      |

Se muestran la palabra y el número. 65 es el corte de «buena» de la fuente; 80 y 50 son de esta app. Un cielo cubierto (puntos de nube 0) con el resto perfecto suma 45 y queda en Mala. Una noche de tiempo perfecto con Luna llena toda la noche resta 35 y queda en 65, Buena.

### 8.7 Estados de la interfaz

- **Cargando:** esqueletos del tamaño final (evitar saltos de diseño).
- **Error de red o de la API:** mensaje claro, con reintento. Si la caché en memoria aún tiene el pronóstico de esta sesión, mostrarlo con aviso de antigüedad.
- **Pestaña recién abierta y sin red:** el clima no está disponible, con mensaje claro. En una ciudad curada puede verse el pronóstico que ya venía en el HTML. La astronomía de un lugar cuyas coordenadas están en la URL o en la lista curada sigue calculándose. No hay modo sin conexión ni cola offline.
- **Datos viejos:** indicar la hora del dato siempre.
- **Fecha ausente:** noche actual.
- **Fecha inválida o fuera de rango:** mensaje descriptivo y selector usable (sección 6.3).
- **Slug inválido:** 404.
- **Lugar sin datos de pronóstico:** estado vacío con acceso al buscador.
- **Límite de peticiones (429):** mensaje específico y espera antes de reintentar.
- **Latitudes altas / sin puesta ni salida:** no romper. Mensaje explícito («sin noche astronómica este día» o el equivalente que corresponda).

---

## 9. Ciudades curadas

Lista fija mantenida en el repositorio. Cada entrada contiene:

| Campo               | Notas                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `slug`              | Único, estable, minúsculas y guiones                                                                                    |
| Nombre para mostrar |                                                                                                                         |
| Latitud, longitud   | Redondeadas a 2 decimales. Fuente de verdad: el JSON de la lista. No inventarlas.                                       |
| Altitud (m)         | La que escriba el dueño, como referencia. En ejecución, astronomy-engine usa la `elevation` que devuelve el pronóstico. |
| Zona horaria (IANA) | La del JSON, o la de la respuesta del pronóstico si el JSON aún no la trae.                                             |
| Texto breve propio  | «Por qué observar aquí». Lo escribe el dueño. **[ABIERTO]** No rellenar con datos de contaminación lumínica.            |

**Lista inicial [CERRADO]**, ampliable por el dueño:

| Slug                     | Nombre                 |
| ------------------------ | ---------------------- |
| `bogota`                 | Bogotá                 |
| `guatavita`              | Guatavita              |
| `villa-de-leyva`         | Villa de Leyva         |
| `desierto-de-la-tatacoa` | Desierto de la Tatacoa |
| `desierto-de-checua`     | Desierto de Checua     |
| `lago-de-tota`           | Lago de Tota           |

**De dónde salen las coordenadas [CERRADO].** El pronóstico de Open-Meteo acepta cualquier latitud y longitud. La geocodificación, no: indexa localidades. Comprobado en `https://geocoding-api.open-meteo.com/v1/search` (octubre 2026): «Desierto de la Tatacoa», «Tatacoa», «Desierto de Checua» y «Lago de Tota» no devuelven resultados. «Checua» devuelve un poblado de Cundinamarca y «Tota» devuelve el pueblo Tota (Boyacá). Esos dos resultados **no** son el desierto ni el lago, y no se usan.

Esas tres fichas (Tatacoa, Checua, Lago de Tota) las completa el dueño en el JSON, con coordenadas buscadas fuera de la API. El agente no las completa ni las aproxima con un homónimo.

Bogotá, Guatavita y Villa de Leyva sí aparecen como localidades en Colombia. Se pueden rellenar desde esa respuesta, eligiendo el resultado en Colombia, o escribirlas el dueño. En los dos casos el JSON es el que manda.

- Alimentan: `generateStaticParams`, el sitemap, la metadata y el texto de cada página. No alimentan la redirección de `/`.
- Revalidación de cada página: 3600 segundos mediante `cacheLife` (perfil `hours` o `revalidate: 3600`); no con `export const revalidate`, incompatible con `cacheComponents`.
- Generación bajo demanda permitida para slugs fuera de la lista: no se responde 404 a un slug válido no curado.
- Máximo teórico de regeneraciones: 24 por ciudad por día.

---

## 10. Zonas horarias y casos límite

**Zonas horarias**

- «Hoy», «esta noche» y todas las horas mostradas se calculan en la zona horaria **del lugar observado**, tomada de la respuesta de Open-Meteo (`timezone=auto`). Nunca la del dispositivo.
- astronomy-engine trabaja con instantes en UTC; las conversiones a hora local son responsabilidad de la app.
- Si la app permanece abierta pasada la medianoche local, «hoy» cambia: la noche actual se recalcula con un temporizador local, no por consulta.
- Una noche puede tener fecha distinta para el dispositivo y para el lugar.
- `?date=` es el día local de la puesta en esa zona.

**Casos límite**

- **Latitudes altas / sol de medianoche / noche polar:** `sunrise` y `sunset` pueden faltar. La app no debe romperse: estado explícito («sin noche astronómica este día» o equivalente). En ese caso no se declara «noche actual»; la fecha por defecto es el día local del lugar y el selector sigue navegable. **[CERRADO]**
- **Datos faltantes** en el pronóstico (valores nulos en algunas horas): tratarlos como desconocidos, sin asumir cero.
- **Último día del pronóstico:** la noche D = +15 no es completa. No se ofrece.
- **Consulta de madrugada:** «esta noche» es la que empezó el día anterior (sección 4).
- **Lugares cercanos:** coordenadas redondeadas. Dos lugares a menos de ~1 km pueden colapsar en la misma clave. Es intencionado.
- **Días de 23 o 25 horas** por cambio de hora: no partir el array de a 24.
- **Altitud de la celda distinta de la real:** se acepta. No se intenta corregir con `elevation`.

---

## 11. Privacidad, legal y seguridad

- **Atribución a Open-Meteo** visible y con enlace (CC-BY 4.0). **[VERIFICADO como requisito]**
- No incluir anuncios ni suscripciones. **[CERRADO]**
- Las coordenadas viajan a Open-Meteo desde el navegador del usuario, y desde el servidor en el caso de ciudades curadas. Dejarlo explícito en la página de privacidad. Open-Meteo conserva registros de servidor (que pueden incluir coordenadas) durante 90 días, según sus términos.
- Un slug de coordenadas expone la zona de quien comparte el enlace, redondeada a ~1 km.
- No almacenar ubicaciones en servidores propios. No persistir la caché de pronóstico en el navegador más allá de la memoria de la pestaña.
- La geolocalización por IP y por GPS solo se usa para elegir el lugar a mostrar, sin registrarla.
- Páginas `/terminos` y `/privacidad`. Redacción **[ABIERTO]**; la entrega el dueño. Hasta entonces las rutas existen y no se inventa el texto legal.
- Marcar como no indexables las páginas no curadas.
- Validar y acotar toda entrada que viaje en la URL: `slug` (sección 6.2), coordenadas dentro de rango (latitud −90 a 90, longitud −180 a 180) y `date` (sección 6.3).
- Si algún día se usara una API key, nunca en el código del navegador (ver 5.3).

---

## 12. Criterios de aceptación

1. Abrir `/clima/bogota` muestra el bloque «ahora», la noche actual, la tira (con una hora de margen a cada lado) y el selector de noches.
2. La noche actual es correcta a cualquier hora, incluida la madrugada, según la hora local del lugar.
3. Cambiar de noche actualiza la vista y `?date=` sin nuevas peticiones a Open-Meteo.
4. Sin `?date=`, se ve la noche actual. Con una fecha mal formada o fuera de −3…+14, se ve un mensaje descriptivo y el lugar sigue usable.
5. El bloque «ahora» se refresca solo, sin invalidar el pronóstico ni volver a pedir la tira horaria.
6. La fase lunar, la iluminación y las horas de salida y puesta coinciden, con diferencia de uno o dos minutos, con una fuente externa independiente (Stellarium, Heavens Above o JPL Horizons) para Bogotá y al menos otro lugar. El nombre de la fase es el de la tabla 8.4.
7. Las horas mostradas corresponden a la zona horaria del lugar, también al consultar un lugar con zona distinta de la del dispositivo.
8. No hay errores de hidratación.
9. Una noche pasada muestra la etiqueta «pronóstico archivado».
10. La atribución a Open-Meteo es visible.
11. `/` con cabeceras de IP redirige al slug de coordenadas redondeadas y no a una ciudad curada. Sin cabeceras, redirige a Bogotá.
12. En un slug no curado, el servidor no llama a Open-Meteo. El `fetch` del navegador no usa `revalidate`.
13. El Sol no aparece como objetivo con ventana de observación.
14. Cambiar el umbral de altitud recalcula las ventanas sin una petición nueva.
15. Un slug de formato inválido responde 404.
16. Cerrar la pestaña y volver a abrirla sin red no pretende mostrar un pronóstico guardado, salvo el HTML que la ciudad curada ya traía.

---

## 13. Estado de las verificaciones

Comprobado contra respuestas reales o documentación oficial. El detalle, las consultas y las respuestas literales están en `verification-notes.md`.

**Verificado en T001 (2026-10-19):**

- **[VERIFICADO]** Existencia de `dew_point_2m`, `relative_humidity_2m`, `wind_gusts_10m` y `precipitation_probability` en `hourly` y `current`; y del resto de variables de §5.1.
- **[VERIFICADO]** Validez conjunta de `past_days=3` y `forecast_days=16`: 19 días.
- **[VERIFICADO]** Formato y escala de `moon_phase`: fracción 0–1 de la lunación; solo verificación cruzada.
- **[VERIFICADO]** Peso real de la consulta: ≈3,12 llamadas para la consulta combinada; ≈2,04 + 1,00 (sin `moon_phase`) o ≈2,17 + 1,00 (con `moon_phase`) para las peticiones separadas.
- **[VERIFICADO]** Campos exactos de la respuesta de geocodificación.
- **[VERIFICADO]** Nombres de las cabeceras de IP de Vercel.
- **[VERIFICADO]** Nombre exacto de la opción de TanStack Query v5: `initialDataUpdatedAt` (milisegundos). El paquete aún no está instalado.
- **[VERIFICADO]** `revalidate` en Next.js 16.4.1 con `cacheComponents`: no se usa el export de ruta; se usa `'use cache'` + `cacheLife`. Una regeneración fallida sirve la última versión válida y se reintenta.
- **[VERIFICADO]** `useSearchParams` exige `<Suspense>` con `cacheComponents`.

**Verificado en T002 (2026-10-19):**

- **[VERIFICADO]** Firmas exactas de todas las capacidades de §5.4 en `astronomy-engine@2.1.19`: `MoonPhase`, `Illumination` (`phase_fraction`, `mag`), `Equator` + `Horizon`, `SearchRiseSet`, `SearchAltitude`, `Elongation`, `AngleBetween` (sustituto de la separación angular entre dos cuerpos) y `Observer`.
- **[VERIFICADO]** La culminación es nativa: `SearchHourAngle(body, observer, 0, dateStart)`. No se usa el plan B del máximo muestreado.
- **[VERIFICADO]** La refracción no está activa por defecto: la app pasa `"normal"`; `SearchRiseSet` la aplica siempre y `SearchAltitude` la omite por convención.

**Sigue pendiente (fuera de T001 y T002):**

- Coordenadas, altitud (`elevationM`) y zona horaria (`timeZone`) de Desierto de la Tatacoa, Desierto de Checua y Lago de Tota, que entrega el dueño. Campos por ciudad: `slug`, `name`, `latitude`, `longitude`, `elevationM`, `timeZone`, `description` (ver `verification-notes.md`, T002 §15).
- Textos de «por qué observar aquí» y de las páginas legales `/terminos` y `/privacidad`, que entrega el dueño.
