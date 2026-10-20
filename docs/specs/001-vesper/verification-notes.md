# Notas de verificación

Índice de secciones:

- [Verificación T001 — Open-Meteo, Vercel y stack de caché](#verificación-t001--open-meteo-vercel-y-stack-de-caché)
- [Verificación T002 — astronomy-engine y datos del dueño](#verificación-t002--astronomy-engine-y-datos-del-dueño)

---

# Verificación T001 — Open-Meteo, Vercel y stack de caché

- **Fecha de ejecución:** 2026-10-19
- **Entorno:** Linux, Node `v24.19.0`, pnpm `11.21.0`
- **Next.js instalado:** `16.4.1`
- **TanStack Query:** **no instalado** en el proyecto. `pnpm list @tanstack/react-query --depth 0` no devuelve ninguna dependencia y `package.json` no lo incluye. La verificación de su API se hizo contra la documentación de TanStack Query v5 (Context7), no contra una versión instalada.
- **Configuración relevante:** `next.config.ts` tiene `cacheComponents: true` y `partialPrefetching: true`.
- **Evidencia temporal:** las respuestas crudas se guardaron en `/tmp/opencode/t001/` durante la verificación. La respuesta grande se reproduce íntegra en el apéndice A.

Convención: cada sección indica la suposición, el método, el resultado observado y la conclusión. Las respuestas JSON se transcriben literalmente, sin reformatear los valores.

---

## 1. Existencia y nombres exactos de las variables de `hourly` y `current`

**Suposición del SPEC (§5.1, §13):** existen `cloud_cover`, `cloud_cover_low`, `cloud_cover_mid`, `cloud_cover_high`, `visibility`, `temperature_2m`, `relative_humidity_2m`, `dew_point_2m`, `wind_speed_10m`, `wind_gusts_10m`, `precipitation_probability`, `precipitation`, `is_day` (horarias); `sunrise`, `sunset` (diarias); y `temperature_2m`, `relative_humidity_2m`, `dew_point_2m`, `cloud_cover`, `wind_speed_10m`, `wind_gusts_10m`, `is_day` (actuales).

**Método.** Consulta ejecutada:

```bash
curl -sS -D /tmp/opencode/t001/big.headers -o /tmp/opencode/t001/big.json \
  'https://api.open-meteo.com/v1/forecast?latitude=4.61&longitude=-74.08&hourly=cloud_cover,cloud_cover_low,cloud_cover_mid,cloud_cover_high,visibility,temperature_2m,relative_humidity_2m,dew_point_2m,wind_speed_10m,wind_gusts_10m,precipitation_probability,precipitation,is_day&daily=sunrise,sunset,moon_phase&current=temperature_2m,relative_humidity_2m,dew_point_2m,cloud_cover,wind_speed_10m,wind_gusts_10m,is_day&timezone=auto&past_days=3&forecast_days=16'
```

**Resultado observado.** `HTTP/1.1 200 OK`, `Content-Type: application/json; charset=utf-8`, 34.776 bytes. Las claves de primer nivel fueron:

```json
[
  "latitude",
  "longitude",
  "generationtime_ms",
  "utc_offset_seconds",
  "timezone",
  "timezone_abbreviation",
  "elevation",
  "current_units",
  "current",
  "hourly_units",
  "hourly",
  "daily_units",
  "daily"
]
```

Metadatos y unidades literales:

```json
{
  "latitude": 4.6045694,
  "longitude": -74.05252,
  "utc_offset_seconds": -18000,
  "timezone": "America/Bogota",
  "timezone_abbreviation": "GMT-5",
  "elevation": 2586,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "dew_point_2m": "°C",
    "cloud_cover": "%",
    "wind_speed_10m": "km/h",
    "wind_gusts_10m": "km/h",
    "is_day": ""
  }
}
```

Respuesta de `current` literal:

```json
{
  "time": "2026-10-19T15:30",
  "interval": 900,
  "temperature_2m": 18.3,
  "relative_humidity_2m": 59,
  "dew_point_2m": 10.2,
  "cloud_cover": 100,
  "wind_speed_10m": 7.7,
  "wind_gusts_10m": 30.6,
  "is_day": 1
}
```

Claves de `hourly` y primera fila literal:

```json
{
  "hourly_keys": [
    "time",
    "cloud_cover",
    "cloud_cover_low",
    "cloud_cover_mid",
    "cloud_cover_high",
    "visibility",
    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "wind_speed_10m",
    "wind_gusts_10m",
    "precipitation_probability",
    "precipitation",
    "is_day"
  ],
  "first_row": {
    "time": "2026-10-16T00:00",
    "cloud_cover": 57,
    "cloud_cover_low": 39,
    "cloud_cover_mid": 0,
    "cloud_cover_high": 30,
    "visibility": 4080,
    "temperature_2m": 11.9,
    "relative_humidity_2m": 95,
    "dew_point_2m": 11.1,
    "wind_speed_10m": 8.1,
    "wind_gusts_10m": 24.1,
    "precipitation_probability": 3,
    "precipitation": 0,
    "is_day": 0
  }
}
```

Conteo de valores nulos por variable horaria: **0 en todas**. Claves diarias: `["time","sunrise","sunset","moon_phase"]`; `daily_units.moon_phase` es `"fraction"`.

**Conclusión.** Todas las variables del SPEC existen con el nombre escrito, en `hourly`, `daily` y `current`. Las unidades observadas son coherentes con la app: nubosidad y humedad en %, temperatura y punto de rocío en °C, viento y ráfagas en km/h, visibilidad en m, precipitación en mm, `is_day` 0/1. `cloud_cover` se repite en `hourly` y `current` (la API lo cuenta dos veces para el peso; ver §5).

---

## 2. Validez conjunta de `past_days=3` y `forecast_days=16`

**Suposición del SPEC (§4, §5.1):** ambos parámetros conviven y devuelven 19 días (de −3 a +15 respecto a hoy).

**Método.** La misma consulta de §1.

**Resultado observado.** `daily.time` tiene **19** elementos:

```json
[
  "2026-10-16",
  "2026-10-17",
  "2026-10-18",
  "2026-10-19",
  "2026-10-20",
  "2026-10-21",
  "2026-10-22",
  "2026-10-23",
  "2026-10-24",
  "2026-10-25",
  "2026-10-26",
  "2026-10-27",
  "2026-10-28",
  "2026-10-29",
  "2026-10-30",
  "2026-10-31",
  "2026-11-01",
  "2026-11-02",
  "2026-11-03"
]
```

`hourly.time` tiene **456** filas, desde `2026-10-16T00:00` hasta `2026-11-03T23:00` (19 × 24). `sunrise`, `sunset` y `moon_phase` tienen 19 valores cada uno. La zona resuelta es `America/Bogota`, `utc_offset_seconds: -18000`.

**Conclusión.** `past_days=3` y `forecast_days=16` son válidos juntos y devuelven exactamente 19 días (días −3 a +15). Esto confirma las 18 noches completas D = −3…+14 del SPEC. La consulta se hizo el 2026-10-19; el primer día devuelto es el 16 y el último el 3 de noviembre.

---

## 3. Formato y escala de `moon_phase`

**Suposición del SPEC (§5.1, §13):** el formato y la escala de `moon_phase` están por verificar; solo se usa como verificación cruzada, nunca como fuente de la Luna.

**Método.** La misma consulta de §1, con `daily=moon_phase`. Verificación cruzada con las fases publicadas por timeanddate.com para Bogotá (octubre de 2026).

**Resultado observado.** `daily_units.moon_phase` es `"fraction"`. Valores literales:

```json
[
  0.191, 0.221, 0.251, 0.282, 0.313, 0.344, 0.377, 0.411, 0.446, 0.483, 0.52, 0.558, 0.596, 0.634,
  0.671, 0.708, 0.745, 0.78, 0.815
]
```

Correspondencia con las fechas: `2026-10-18 → 0.251` (×360 = 90,4°), `2026-10-25 → 0.483` (×360 = 173,9°), `2026-10-26 → 0.52` (×360 = 187,2°). timeanddate.com indica para Bogotá: cuarto creciente el **18 de octubre de 2026 a las 11:12** y Luna llena el **25 de octubre de 2026 a las 23:11**. La secuencia es creciente y continua; el valor 0,5 cae entre el 25 y el 26, justo después de la Luna llena del 25 por la noche.

**Conclusión.** `moon_phase` es una **fracción de la lunación en el rango 0–1**, no un porcentaje ni un ángulo: 0 = Luna nueva, 0,25 = cuarto creciente, 0,5 = Luna llena, 0,75 = cuarto menguante. Para convertirlo a ángulo se multiplica por 360. La verificación cruzada con timeanddate es consistente. Se mantiene la decisión del SPEC: astronomy-engine es la fuente única de la Luna; `moon_phase` solo sirve como contraste y no se mezcla en la interfaz.

---

## 4. Cuerpo y código de una respuesta 400 y de una 429

### 4.1 Respuesta 400

**Método.** Consulta con una variable inexistente:

```bash
curl -sS -o /tmp/opencode/t001/err400.json -w "HTTP:%{http_code}\n" \
  'https://api.open-meteo.com/v1/forecast?latitude=4.61&longitude=-74.08&hourly=no_existe&timezone=auto&past_days=3&forecast_days=16'
```

**Resultado observado.** `HTTP:400`. Cuerpo literal:

```json
{
  "error": true,
  "reason": "Invalid value: Cannot initialize SurfacePressureAndHeightVariable<VariableAndPreviousDay, VariableOrSpread<ForecastPressureVariable>, ForecastHeightVariable> from invalid String value no_existe"
}
```

**Conclusión.** La API responde **400** con JSON `{"error":true,"reason":"..."}`. El `reason` explica la causa, aunque incluye nombres internos de tipos. La app debe comprobar `response.ok`, leer el cuerpo y mostrar el `reason` en desarrollo, como pide el SPEC.

### 4.2 Respuesta 429

**Método.** No se provocó una 429 real: hacerlo exige superar el límite de 600 llamadas por minuto desde la misma IP, lo que sería abuso y podría afectar a otros usuarios de la misma IP/NAT. Se verificó el comportamiento en el código fuente oficial del servidor de Open-Meteo (`open-meteo/open-meteo`, `Sources/App/Helper/Vapor/RateLimiter.swift` y `Sources/App/configure.swift`).

**Resultado observado en el código fuente.**

- `RateLimitError` devuelve `HTTPResponseStatus.tooManyRequests` (429) para `dailyExceeded`, `hourlyExceeded`, `minutelyExceeded` y `tooManyConcurrentRequests`. `serviceOverloaded` devuelve 503.
- Los motivos literales son:
  - `"Daily API request limit exceeded. Please try again tomorrow."`
  - `"Hourly API request limit exceeded. Please try again in the next hour."`
  - `"Minutely API request limit exceeded. Please try again in one minute."`
  - `"Too many concurrent requests"`
  - `"The service is overloaded"` (503)
- El middleware de errores serializa `ErrorResponse2 { error: Bool, reason: String }`.

Cuerpo esperado, por ejemplo:

```json
{ "error": true, "reason": "Minutely API request limit exceeded. Please try again in one minute." }
```

**Conclusión.** La 429 es JSON `{"error":true,"reason":"..."}`; el texto exacto depende del límite superado (minuto, hora o día). No se ejecutó una 429 en vivo; queda documentado como desviación en §11. La app debe tratar 429 como reintentable con espera creciente, según el SPEC.

---

## 5. Peso real de la consulta en el contador de Open-Meteo

**Suposición del SPEC (§5.3, §13):** una petición grande puede contar como más de una llamada; hay que medirlo.

**Método.** Se usó la fórmula oficial publicada en el código del servidor de Open-Meteo, `ForecastApiResult.calculateQueryWeight()`:

```swift
let referenceDays = 14
let referenceVariables = 10
let nDays = $1.time.range.durationSeconds / 86400
let timeFraction = Float(nDays) / Float(referenceDays)
let variablesFraction = Float(nVariablesTimesDomains) / Float(referenceVariables)
let weight = max(variablesFraction, timeFraction * variablesFraction)
return $0 + max(1, weight)
```

Y el conteo de variables de `ForecastapiController.swift`:

```swift
let nVariables = (nParamsHourly + nParamsMinutely + nParamsCurrent + nParamsDaily) * domains.reduce(0, { $0 + $1.countEnsembleMember }) + nVariableNonEnsemble
```

Para `best_match` (sin `models`) `countEnsembleMember` es 1.

**Cálculo para la consulta combinada del paso 4.**

- Variables: 13 horarias + 7 actuales + 3 diarias = **23**.
- Días: **19**.
- `variablesFraction = 23 / 10 = 2,3`.
- `timeFraction = 19 / 14 = 1,357142857`.
- `weight = max(2,3; 1,357142857 × 2,3) = 3,121428571`.
- Resultado: **≈ 3,12 llamadas** por ubicación.

Para las dos peticiones separadas que usará la app:

- Pronóstico sin `moon_phase` (`hourly` 13 + `daily` 2 = 15 variables, 19 días): `max(1,5; 1,357142857 × 1,5) = 2,035714286` → **≈ 2,04 llamadas**.
- Pronóstico con `moon_phase` (`hourly` 13 + `daily` 3 = 16 variables, 19 días): `max(1,6; 1,357142857 × 1,6) = 2,171428571` → **≈ 2,17 llamadas**.
- «Ahora» (`current` 7 variables): `max(0,7; …) = 0,7`, y el mínimo por petición es 1 → **1,00 llamada**.
- Total de una carga completa: **≈ 3,04 llamadas** sin `moon_phase` y **≈ 3,17 llamadas** con `moon_phase`.

**Conclusión.** La consulta grande de T001 (con `moon_phase`) **no cuenta como 1 llamada**: suma ≈ 3,12. El formulario interactivo de la página de precios no se pudo operar desde la terminal; el número se calculó con la fórmula oficial y el conteo del código fuente. La página de precios confirma el escalado lineal con los ejemplos publicados (15 variables y 2 semanas = 1,5 llamadas; 4 semanas = 3,0). Queda como desviación en §11.

---

## 6. Campos exactos de la geocodificación

**Suposición del SPEC (§5.2, §13):** con 1 carácter devuelve vacío; con 2, solo coincidencias exactas; con 3 o más, búsqueda aproximada. Cada resultado trae al menos nombre, país y zona horaria; latitud, longitud, altitud, identificador y región administrativa están por verificar.

**Método.** Tres consultas con `count=7&language=es&format=json`:

```bash
curl -sS 'https://geocoding-api.open-meteo.com/v1/search?name=B&count=7&language=es&format=json'
curl -sS 'https://geocoding-api.open-meteo.com/v1/search?name=Bo&count=7&language=es&format=json'
curl -sS 'https://geocoding-api.open-meteo.com/v1/search?name=Bog&count=7&language=es&format=json'
```

**Resultado con 1 carácter (`name=B`).** `HTTP 200`. Cuerpo literal:

```json
{ "generationtime_ms": 0.088214874 }
```

No hay clave `results`: devuelve vacío.

**Resultado con 2 caracteres (`name=Bo`).** `HTTP 200`, 7 resultados. Los nombres fueron `Bo` (Sierra Leona), `Bo` (Vietnam), `Bø` (Noruega), `Bő` (Hungría), `Bøur` (Feroe), `Bò` (Italia) y `Bo` (República Democrática del Congo). El primero, literal:

```json
{
  "id": 2410048,
  "name": "Bo",
  "latitude": 7.96472,
  "longitude": -11.73833,
  "elevation": 104,
  "feature_code": "PPLA",
  "country_code": "SL",
  "admin1_id": 2403745,
  "timezone": "Africa/Freetown",
  "population": 233684,
  "country_id": 2403846,
  "country": "Sierra Leona",
  "admin1": "Provincia del Sur"
}
```

Observación: el resultado `Bøur` (Feroe) **no** es una coincidencia exacta, sino un prefijo con diacríticos; además, ese registro no trae `country_id` ni `country`, solo `country_code`, `admin1`, `admin1_id` y `timezone`. Es un dato real de la respuesta, no un fallo de la consulta.

**Resultado con 3 caracteres (`name=Bog`).** `HTTP 200`, 7 resultados; el primero es Bogotá. Objeto literal completo:

```json
{
  "id": 3688689,
  "name": "Bogotá",
  "latitude": 4.60971,
  "longitude": -74.08175,
  "elevation": 2582,
  "feature_code": "PPLC",
  "country_code": "CO",
  "admin1_id": 3688685,
  "admin2_id": 9609540,
  "timezone": "America/Bogota",
  "population": 7674366,
  "country_id": 3686110,
  "country": "Colombia",
  "admin1": "Bogotá D.C.",
  "admin2": "Bogotá, D.C."
}
```

Claves posibles observadas en los resultados: `id`, `name`, `latitude`, `longitude`, `elevation`, `feature_code`, `country_code`, `admin1_id`, `admin2_id`, `admin3_id`, `timezone`, `population`, `country_id`, `country`, `admin1`, `admin2`, `admin3`.

**Conclusión.** La respuesta trae **latitud, longitud, altitud, identificador, zona horaria y región administrativa** (normalmente `admin1` y, si existe, `admin2`/`admin3`). El SPEC puede marcar esos campos como verificados. Matices que conviene anotar en §5.2:

- Con 2 caracteres no siempre son coincidencias exactas: `Bo` devolvió `Bøur`. La app no busca con menos de 3, así que no afecta al flujo.
- `country` puede faltar en registros aislados (`Bøur`); la UI debe tolerar país o región ausentes y no asumir que siempre están.
- Con 3 caracteres sí hay búsqueda aproximada (`Bog` devuelve `Bogor`, entre otros).

---

## 7. Nombres exactos de las cabeceras de IP de Vercel

**Suposición del SPEC (§6.1, §13):** los nombres exactos son `x-vercel-ip-latitude`, `x-vercel-ip-longitude` y afines.

**Método.** Documentación oficial de Vercel, «Request headers»: <https://vercel.com/docs/headers/request-headers> (página actualizada el 2025-12-13), con ejemplos de lectura mediante `request.headers.get(...)`.

**Resultado observado.** Cabeceras de geolocalización por IP documentadas:

- `x-vercel-ip-continent`
- `x-vercel-ip-country`
- `x-vercel-ip-country-region`
- `x-vercel-ip-city`
- `x-vercel-ip-latitude`
- `x-vercel-ip-longitude`
- `x-vercel-ip-timezone`
- `x-vercel-ip-postal-code`

Cabeceras de IP del cliente:

- `x-forwarded-for`
- `x-vercel-forwarded-for` (idéntica a `x-forwarded-for`, pero no la sobrescribe un proxy externo)
- `x-real-ip` (idéntica a `x-forwarded-for`)

Notas literales de la documentación: `x-vercel-ip-latitude` es una latitud como `37.7749`; `x-vercel-ip-longitude` como `-122.4194`; `x-vercel-ip-city` codifica los caracteres no ASCII según RFC 3986; `x-vercel-ip-timezone` usa el nombre IANA, por ejemplo `America/Chicago`.

**Conclusión.** Los nombres del SPEC son correctos: `x-vercel-ip-latitude`, `x-vercel-ip-longitude`, `x-vercel-ip-city`, `x-vercel-ip-country`, `x-vercel-ip-country-region`, `x-vercel-ip-timezone`, `x-vercel-ip-postal-code` y `x-vercel-ip-continent`. La app debe leerlos como cadenas, validar que existan y redondear las coordenadas a 2 decimales; si faltan, aplica el fallback a Bogotá.

---

## 8. `revalidate` en Next.js 16.4.1 con `cacheComponents` y `partialPrefetching`

**Suposición del SPEC (§7.4, §7.5, §13):** `revalidate` se declara como literal en el archivo de la ruta, se aplica a la ruta completa, convive con `generateStaticParams` y, si falla una regeneración, Next.js sigue sirviendo la última versión válida.

**Método.**

1. Versión instalada: `node -e "console.log(require('next/package.json').version)"` → `16.4.1`.
2. Documentación incluida en el paquete instalado (`node_modules/next/dist/docs/`) y Context7 (`/vercel/next.js`).
3. Inspección de `next.config.ts`, que ya declara `cacheComponents: true` y `partialPrefetching: true`.

**Resultado observado.**

- La guía `migrating-to-cache-components.md` dice literalmente: «After enabling the flag, route segments that still export `dynamic`, `revalidate`, or `fetchCache` will error.» Es decir, **`export const revalidate = 3600` en la página no es válido con `cacheComponents: true`**.
- La misma guía, sección `revalidate`: «Replace revalidation times greater than zero with `cacheLife`. ... place `use cache` around the data or UI that should be cached, then set its lifetime with `cacheLife`.» Ejemplo oficial:

```tsx
import { cacheLife } from 'next/cache';

export default async function Page() {
  'use cache';
  cacheLife('hours');
  return <div>...</div>;
}
```

- Perfiles de `cacheLife` (documentación de la versión instalada): `hours` = `stale: 5m`, `revalidate: 1h`, `expire: 1d`. Para un valor exacto de 3600 s se puede usar `cacheLife({ revalidate: 3600, expire: ... })` o definir un perfil propio en `next.config.ts`. `stale` es la caché del router en el cliente; `revalidate` es la regeneración en el servidor; `expire` es el máximo antes de regenerar de forma síncrona.
- `cacheLife` se aplica al **ámbito cacheado** (`use cache`), no a «la ruta completa» como el antiguo `export const revalidate`.
- Las opciones de caché del `fetch` también cambian. La sección `fetch cache options` de la misma guía dice: «Move `cache` and `next` options to `use cache`. ... Fetches inside that scope are cached automatically, and `revalidate` and `tags` become `cacheLife` and `cacheTag`.» Y la sección `fetchCache` remata: «With Cache Components, fetches are uncached unless they run inside a `use cache` scope.» Por tanto, `next: { revalidate: 3600 }` por sí solo **no cachea** con `cacheComponents`. La frase introductoria «Your existing `fetch` and `unstable_cache` caching keeps working» no describe el mecanismo; la sección específica de opciones de `fetch` sí lo hace y es la que se aplica.
- `generateStaticParams` con `cacheComponents`:
  - Debe devolver al menos un parámetro; un array vacío produce el error `empty-generate-static-params`.
  - Los paths devueltos se prerenderizan completos en el build.
  - Los paths no devueltos se sirven en request time. Con `partialPrefetching: true`, Next.js sirve el App Shell y luego actualiza y cachea el resultado; con `partialPrefetching: false`, la primera petición espera el render y se crea la entrada ISR.
  - `dynamicParams` no está soportado con `cacheComponents`; hay que borrarlo.
- Si falla una regeneración: la guía de ISR dice literalmente: «If an error is thrown while attempting to revalidate data, the last successfully generated data will continue to be served from the cache. On the next subsequent request, Next.js will retry revalidating the data.» El error no se guarda en caché. Esto responde a la duda de §7.5.

**Conclusión.** Hay una **contradicción real** entre el SPEC §7.4/§9 y la configuración instalada: con `cacheComponents: true`, `export const revalidate` en la ruta produce error. La forma correcta es `'use cache'` + `cacheLife('hours')` (o un perfil equivalente con `revalidate: 3600`) en la página o en la función de datos cacheada. El `fetch` del servidor se cachea al ejecutarse dentro de `'use cache'`; `next.revalidate` no es el mecanismo bajo `cacheComponents`. La regeneración fallida sirve la última versión válida y se reintenta en la siguiente petición. La corrección del SPEC fue autorizada por el dueño y aplicada (ver §11).

---

## 9. `useSearchParams` y `<Suspense>`

**Suposición del SPEC (§6.3, §13):** leer `?date=` con `useSearchParams` en un componente cliente puede exigir un límite de Suspense.

**Método.** Documentación de Next.js 16.4.1 incluida en el paquete (`use-search-params.md`) y Context7 (`/vercel/next.js`).

**Resultado observado.**

- En producción, una página estática que llama a `useSearchParams` desde un componente cliente **debe** estar envuelta en un límite de `Suspense`; si no, el build falla con el error `Missing Suspense boundary with useSearchParams`.
- Con `cacheComponents` habilitado, la guía de migración es más tajante: «The `useSearchParams` hook always needs a `<Suspense>` boundary, since search params are only known at request time.»
- En desarrollo puede parecer que funciona sin `Suspense` porque las rutas se renderizan on-demand, pero el build de producción falla.

**Conclusión.** **Sí**: el componente cliente que lea `?date=` debe ir dentro de `<Suspense>`. En las páginas curadas, que son estáticas, esto es obligatorio para no romper el build y para que el resto de la página se prerenderice. El `fallback` debe ser un esqueleto coherente con el tamaño final (SPEC §8.7).

---

## 10. Nombre exacto de la opción de TanStack Query para la hora del dato inicial

**Suposición del SPEC (§7.4, §13):** la opción se llama `initialDataUpdatedAt`.

**Método.** `pnpm list @tanstack/react-query --depth 0` (sin resultados: no instalado) y documentación de TanStack Query v5 vía Context7 (`/tanstack/query`).

**Resultado observado.** La opción existe en v5 con este nombre y firma:

```ts
initialDataUpdatedAt?: number | (() => number | undefined)
```

Es un timestamp de JavaScript **en milisegundos** (como `Date.now()`), no un timestamp Unix en segundos. Si se omite, `initialData` se trata como totalmente fresco. Si se pasa, TanStack compara esa marca con `staleTime`: si el dato inicial es más viejo que `staleTime`, vuelve a pedir al montar. Ejemplo oficial:

```tsx
const result = useQuery({
  queryKey: ['todos'],
  queryFn: () => fetch('/todos'),
  initialData: initialTodos,
  staleTime: 60 * 1000,
  initialDataUpdatedAt: initialTodosUpdatedTimestamp, // ms
});
```

**Conclusión.** El nombre previsto, `initialDataUpdatedAt`, es correcto en TanStack Query v5. La marca debe ser la hora real de obtención del pronóstico, en milisegundos. **No se pudo verificar contra la versión instalada porque el paquete no está instalado**; la conclusión se basa en la documentación de v5. No se añadió la dependencia en esta tarea.

---

## 11. Desviaciones, límites y puntos que requieren decisión

1. **`revalidate` de ruta incompatible con `cacheComponents` (corregido).** Es la única contradicción funcional encontrada. El SPEC §7.4 decía que la directiva se escribe como literal en el archivo de la ruta; con la configuración instalada eso produce error. El dueño autorizó mantener `cacheComponents` + `partialPrefetching` y corregir el SPEC. La corrección se aplicó en §3, §3.1, §7.2, §7.4, §7.5 y §9: la caché del servidor se declara con `'use cache'` + `cacheLife`, y el `fetch` del servidor se cachea por ejecutarse dentro de ese ámbito, no por `next.revalidate`. Quedan referencias al mecanismo antiguo en `PLAN.md`, `tasks/README.md` y `T008`, fuera del alcance de T001 (ver el registro de la task).
2. **429 no ejecutada en vivo.** Se documentó desde el código fuente oficial para no superar deliberadamente el límite de 600 llamadas/minuto. El código y el cuerpo están verificados en la fuente; no hay una respuesta HTTP real capturada.
3. **Peso de la consulta calculado con la fórmula oficial, no con el formulario web.** El formulario interactivo de precios no se pudo operar desde la terminal. El resultado (≈3,12 llamadas para la consulta combinada) usa la fórmula del servidor y el conteo de variables del código fuente, y coincide con los ejemplos publicados por Open-Meteo.
4. **TanStack Query no está instalado.** No existe una «versión instalada» que verificar. La API `initialDataUpdatedAt` se verificó contra la documentación de v5.
5. **Matices de geocodificación.** Con 2 caracteres, `Bo` devolvió `Bøur` (prefijo, no coincidencia exacta). Un registro (`Bøur`) no trae `country`. La app usa mínimo 3 caracteres, así que no afecta al flujo, pero conviene anotarlo en §5.2 y tolerar país/región ausentes en la UI.
6. **Interpolación de `current`.** La respuesta trae `current.interval: 900` y el código fuente usa `dtSeconds: 900` cuando se pide `current`; la interpolación a 15 minutos no es exclusiva de «fuera de Europa central y Norteamérica», como sugiere §5.1. Conviene matizar la frase del SPEC.
7. **Puntos de §13 fuera del alcance de T001.** Siguen pendientes las funciones exactas de astronomy-engine (incluida refracción y culminación) y las coordenadas/altitud/zona horaria de las ciudades curadas. No se tocaron.

---

## Apéndice A — Respuesta literal completa de la consulta grande

Consulta de §1, respuesta `200` completa (34.776 bytes), sin reformatear los valores:

```json
{
  "latitude": 4.6045694,
  "longitude": -74.05252,
  "generationtime_ms": 41.69118404388428,
  "utc_offset_seconds": -18000,
  "timezone": "America/Bogota",
  "timezone_abbreviation": "GMT-5",
  "elevation": 2586.0,
  "current_units": {
    "time": "iso8601",
    "interval": "seconds",
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "dew_point_2m": "°C",
    "cloud_cover": "%",
    "wind_speed_10m": "km/h",
    "wind_gusts_10m": "km/h",
    "is_day": ""
  },
  "current": {
    "time": "2026-10-19T15:30",
    "interval": 900,
    "temperature_2m": 18.3,
    "relative_humidity_2m": 59,
    "dew_point_2m": 10.2,
    "cloud_cover": 100,
    "wind_speed_10m": 7.7,
    "wind_gusts_10m": 30.6,
    "is_day": 1
  },
  "hourly_units": {
    "time": "iso8601",
    "cloud_cover": "%",
    "cloud_cover_low": "%",
    "cloud_cover_mid": "%",
    "cloud_cover_high": "%",
    "visibility": "m",
    "temperature_2m": "°C",
    "relative_humidity_2m": "%",
    "dew_point_2m": "°C",
    "wind_speed_10m": "km/h",
    "wind_gusts_10m": "km/h",
    "precipitation_probability": "%",
    "precipitation": "mm",
    "is_day": ""
  },
  "hourly": {
    "time": [
      "2026-10-16T00:00",
      "2026-10-16T01:00",
      "2026-10-16T02:00",
      "2026-10-16T03:00",
      "2026-10-16T04:00",
      "2026-10-16T05:00",
      "2026-10-16T06:00",
      "2026-10-16T07:00",
      "2026-10-16T08:00",
      "2026-10-16T09:00",
      "2026-10-16T10:00",
      "2026-10-16T11:00",
      "2026-10-16T12:00",
      "2026-10-16T13:00",
      "2026-10-16T14:00",
      "2026-10-16T15:00",
      "2026-10-16T16:00",
      "2026-10-16T17:00",
      "2026-10-16T18:00",
      "2026-10-16T19:00",
      "2026-10-16T20:00",
      "2026-10-16T21:00",
      "2026-10-16T22:00",
      "2026-10-16T23:00",
      "2026-10-17T00:00",
      "2026-10-17T01:00",
      "2026-10-17T02:00",
      "2026-10-17T03:00",
      "2026-10-17T04:00",
      "2026-10-17T05:00",
      "2026-10-17T06:00",
      "2026-10-17T07:00",
      "2026-10-17T08:00",
      "2026-10-17T09:00",
      "2026-10-17T10:00",
      "2026-10-17T11:00",
      "2026-10-17T12:00",
      "2026-10-17T13:00",
      "2026-10-17T14:00",
      "2026-10-17T15:00",
      "2026-10-17T16:00",
      "2026-10-17T17:00",
      "2026-10-17T18:00",
      "2026-10-17T19:00",
      "2026-10-17T20:00",
      "2026-10-17T21:00",
      "2026-10-17T22:00",
      "2026-10-17T23:00",
      "2026-10-18T00:00",
      "2026-10-18T01:00",
      "2026-10-18T02:00",
      "2026-10-18T03:00",
      "2026-10-18T04:00",
      "2026-10-18T05:00",
      "2026-10-18T06:00",
      "2026-10-18T07:00",
      "2026-10-18T08:00",
      "2026-10-18T09:00",
      "2026-10-18T10:00",
      "2026-10-18T11:00",
      "2026-10-18T12:00",
      "2026-10-18T13:00",
      "2026-10-18T14:00",
      "2026-10-18T15:00",
      "2026-10-18T16:00",
      "2026-10-18T17:00",
      "2026-10-18T18:00",
      "2026-10-18T19:00",
      "2026-10-18T20:00",
      "2026-10-18T21:00",
      "2026-10-18T22:00",
      "2026-10-18T23:00",
      "2026-10-19T00:00",
      "2026-10-19T01:00",
      "2026-10-19T02:00",
      "2026-10-19T03:00",
      "2026-10-19T04:00",
      "2026-10-19T05:00",
      "2026-10-19T06:00",
      "2026-10-19T07:00",
      "2026-10-19T08:00",
      "2026-10-19T09:00",
      "2026-10-19T10:00",
      "2026-10-19T11:00",
      "2026-10-19T12:00",
      "2026-10-19T13:00",
      "2026-10-19T14:00",
      "2026-10-19T15:00",
      "2026-10-19T16:00",
      "2026-10-19T17:00",
      "2026-10-19T18:00",
      "2026-10-19T19:00",
      "2026-10-19T20:00",
      "2026-10-19T21:00",
      "2026-10-19T22:00",
      "2026-10-19T23:00",
      "2026-10-20T00:00",
      "2026-10-20T01:00",
      "2026-10-20T02:00",
      "2026-10-20T03:00",
      "2026-10-20T04:00",
      "2026-10-20T05:00",
      "2026-10-20T06:00",
      "2026-10-20T07:00",
      "2026-10-20T08:00",
      "2026-10-20T09:00",
      "2026-10-20T10:00",
      "2026-10-20T11:00",
      "2026-10-20T12:00",
      "2026-10-20T13:00",
      "2026-10-20T14:00",
      "2026-10-20T15:00",
      "2026-10-20T16:00",
      "2026-10-20T17:00",
      "2026-10-20T18:00",
      "2026-10-20T19:00",
      "2026-10-20T20:00",
      "2026-10-20T21:00",
      "2026-10-20T22:00",
      "2026-10-20T23:00",
      "2026-10-21T00:00",
      "2026-10-21T01:00",
      "2026-10-21T02:00",
      "2026-10-21T03:00",
      "2026-10-21T04:00",
      "2026-10-21T05:00",
      "2026-10-21T06:00",
      "2026-10-21T07:00",
      "2026-10-21T08:00",
      "2026-10-21T09:00",
      "2026-10-21T10:00",
      "2026-10-21T11:00",
      "2026-10-21T12:00",
      "2026-10-21T13:00",
      "2026-10-21T14:00",
      "2026-10-21T15:00",
      "2026-10-21T16:00",
      "2026-10-21T17:00",
      "2026-10-21T18:00",
      "2026-10-21T19:00",
      "2026-10-21T20:00",
      "2026-10-21T21:00",
      "2026-10-21T22:00",
      "2026-10-21T23:00",
      "2026-10-22T00:00",
      "2026-10-22T01:00",
      "2026-10-22T02:00",
      "2026-10-22T03:00",
      "2026-10-22T04:00",
      "2026-10-22T05:00",
      "2026-10-22T06:00",
      "2026-10-22T07:00",
      "2026-10-22T08:00",
      "2026-10-22T09:00",
      "2026-10-22T10:00",
      "2026-10-22T11:00",
      "2026-10-22T12:00",
      "2026-10-22T13:00",
      "2026-10-22T14:00",
      "2026-10-22T15:00",
      "2026-10-22T16:00",
      "2026-10-22T17:00",
      "2026-10-22T18:00",
      "2026-10-22T19:00",
      "2026-10-22T20:00",
      "2026-10-22T21:00",
      "2026-10-22T22:00",
      "2026-10-22T23:00",
      "2026-10-23T00:00",
      "2026-10-23T01:00",
      "2026-10-23T02:00",
      "2026-10-23T03:00",
      "2026-10-23T04:00",
      "2026-10-23T05:00",
      "2026-10-23T06:00",
      "2026-10-23T07:00",
      "2026-10-23T08:00",
      "2026-10-23T09:00",
      "2026-10-23T10:00",
      "2026-10-23T11:00",
      "2026-10-23T12:00",
      "2026-10-23T13:00",
      "2026-10-23T14:00",
      "2026-10-23T15:00",
      "2026-10-23T16:00",
      "2026-10-23T17:00",
      "2026-10-23T18:00",
      "2026-10-23T19:00",
      "2026-10-23T20:00",
      "2026-10-23T21:00",
      "2026-10-23T22:00",
      "2026-10-23T23:00",
      "2026-10-24T00:00",
      "2026-10-24T01:00",
      "2026-10-24T02:00",
      "2026-10-24T03:00",
      "2026-10-24T04:00",
      "2026-10-24T05:00",
      "2026-10-24T06:00",
      "2026-10-24T07:00",
      "2026-10-24T08:00",
      "2026-10-24T09:00",
      "2026-10-24T10:00",
      "2026-10-24T11:00",
      "2026-10-24T12:00",
      "2026-10-24T13:00",
      "2026-10-24T14:00",
      "2026-10-24T15:00",
      "2026-10-24T16:00",
      "2026-10-24T17:00",
      "2026-10-24T18:00",
      "2026-10-24T19:00",
      "2026-10-24T20:00",
      "2026-10-24T21:00",
      "2026-10-24T22:00",
      "2026-10-24T23:00",
      "2026-10-25T00:00",
      "2026-10-25T01:00",
      "2026-10-25T02:00",
      "2026-10-25T03:00",
      "2026-10-25T04:00",
      "2026-10-25T05:00",
      "2026-10-25T06:00",
      "2026-10-25T07:00",
      "2026-10-25T08:00",
      "2026-10-25T09:00",
      "2026-10-25T10:00",
      "2026-10-25T11:00",
      "2026-10-25T12:00",
      "2026-10-25T13:00",
      "2026-10-25T14:00",
      "2026-10-25T15:00",
      "2026-10-25T16:00",
      "2026-10-25T17:00",
      "2026-10-25T18:00",
      "2026-10-25T19:00",
      "2026-10-25T20:00",
      "2026-10-25T21:00",
      "2026-10-25T22:00",
      "2026-10-25T23:00",
      "2026-10-26T00:00",
      "2026-10-26T01:00",
      "2026-10-26T02:00",
      "2026-10-26T03:00",
      "2026-10-26T04:00",
      "2026-10-26T05:00",
      "2026-10-26T06:00",
      "2026-10-26T07:00",
      "2026-10-26T08:00",
      "2026-10-26T09:00",
      "2026-10-26T10:00",
      "2026-10-26T11:00",
      "2026-10-26T12:00",
      "2026-10-26T13:00",
      "2026-10-26T14:00",
      "2026-10-26T15:00",
      "2026-10-26T16:00",
      "2026-10-26T17:00",
      "2026-10-26T18:00",
      "2026-10-26T19:00",
      "2026-10-26T20:00",
      "2026-10-26T21:00",
      "2026-10-26T22:00",
      "2026-10-26T23:00",
      "2026-10-27T00:00",
      "2026-10-27T01:00",
      "2026-10-27T02:00",
      "2026-10-27T03:00",
      "2026-10-27T04:00",
      "2026-10-27T05:00",
      "2026-10-27T06:00",
      "2026-10-27T07:00",
      "2026-10-27T08:00",
      "2026-10-27T09:00",
      "2026-10-27T10:00",
      "2026-10-27T11:00",
      "2026-10-27T12:00",
      "2026-10-27T13:00",
      "2026-10-27T14:00",
      "2026-10-27T15:00",
      "2026-10-27T16:00",
      "2026-10-27T17:00",
      "2026-10-27T18:00",
      "2026-10-27T19:00",
      "2026-10-27T20:00",
      "2026-10-27T21:00",
      "2026-10-27T22:00",
      "2026-10-27T23:00",
      "2026-10-28T00:00",
      "2026-10-28T01:00",
      "2026-10-28T02:00",
      "2026-10-28T03:00",
      "2026-10-28T04:00",
      "2026-10-28T05:00",
      "2026-10-28T06:00",
      "2026-10-28T07:00",
      "2026-10-28T08:00",
      "2026-10-28T09:00",
      "2026-10-28T10:00",
      "2026-10-28T11:00",
      "2026-10-28T12:00",
      "2026-10-28T13:00",
      "2026-10-28T14:00",
      "2026-10-28T15:00",
      "2026-10-28T16:00",
      "2026-10-28T17:00",
      "2026-10-28T18:00",
      "2026-10-28T19:00",
      "2026-10-28T20:00",
      "2026-10-28T21:00",
      "2026-10-28T22:00",
      "2026-10-28T23:00",
      "2026-10-29T00:00",
      "2026-10-29T01:00",
      "2026-10-29T02:00",
      "2026-10-29T03:00",
      "2026-10-29T04:00",
      "2026-10-29T05:00",
      "2026-10-29T06:00",
      "2026-10-29T07:00",
      "2026-10-29T08:00",
      "2026-10-29T09:00",
      "2026-10-29T10:00",
      "2026-10-29T11:00",
      "2026-10-29T12:00",
      "2026-10-29T13:00",
      "2026-10-29T14:00",
      "2026-10-29T15:00",
      "2026-10-29T16:00",
      "2026-10-29T17:00",
      "2026-10-29T18:00",
      "2026-10-29T19:00",
      "2026-10-29T20:00",
      "2026-10-29T21:00",
      "2026-10-29T22:00",
      "2026-10-29T23:00",
      "2026-10-30T00:00",
      "2026-10-30T01:00",
      "2026-10-30T02:00",
      "2026-10-30T03:00",
      "2026-10-30T04:00",
      "2026-10-30T05:00",
      "2026-10-30T06:00",
      "2026-10-30T07:00",
      "2026-10-30T08:00",
      "2026-10-30T09:00",
      "2026-10-30T10:00",
      "2026-10-30T11:00",
      "2026-10-30T12:00",
      "2026-10-30T13:00",
      "2026-10-30T14:00",
      "2026-10-30T15:00",
      "2026-10-30T16:00",
      "2026-10-30T17:00",
      "2026-10-30T18:00",
      "2026-10-30T19:00",
      "2026-10-30T20:00",
      "2026-10-30T21:00",
      "2026-10-30T22:00",
      "2026-10-30T23:00",
      "2026-10-31T00:00",
      "2026-10-31T01:00",
      "2026-10-31T02:00",
      "2026-10-31T03:00",
      "2026-10-31T04:00",
      "2026-10-31T05:00",
      "2026-10-31T06:00",
      "2026-10-31T07:00",
      "2026-10-31T08:00",
      "2026-10-31T09:00",
      "2026-10-31T10:00",
      "2026-10-31T11:00",
      "2026-10-31T12:00",
      "2026-10-31T13:00",
      "2026-10-31T14:00",
      "2026-10-31T15:00",
      "2026-10-31T16:00",
      "2026-10-31T17:00",
      "2026-10-31T18:00",
      "2026-10-31T19:00",
      "2026-10-31T20:00",
      "2026-10-31T21:00",
      "2026-10-31T22:00",
      "2026-10-31T23:00",
      "2026-11-01T00:00",
      "2026-11-01T01:00",
      "2026-11-01T02:00",
      "2026-11-01T03:00",
      "2026-11-01T04:00",
      "2026-11-01T05:00",
      "2026-11-01T06:00",
      "2026-11-01T07:00",
      "2026-11-01T08:00",
      "2026-11-01T09:00",
      "2026-11-01T10:00",
      "2026-11-01T11:00",
      "2026-11-01T12:00",
      "2026-11-01T13:00",
      "2026-11-01T14:00",
      "2026-11-01T15:00",
      "2026-11-01T16:00",
      "2026-11-01T17:00",
      "2026-11-01T18:00",
      "2026-11-01T19:00",
      "2026-11-01T20:00",
      "2026-11-01T21:00",
      "2026-11-01T22:00",
      "2026-11-01T23:00",
      "2026-11-02T00:00",
      "2026-11-02T01:00",
      "2026-11-02T02:00",
      "2026-11-02T03:00",
      "2026-11-02T04:00",
      "2026-11-02T05:00",
      "2026-11-02T06:00",
      "2026-11-02T07:00",
      "2026-11-02T08:00",
      "2026-11-02T09:00",
      "2026-11-02T10:00",
      "2026-11-02T11:00",
      "2026-11-02T12:00",
      "2026-11-02T13:00",
      "2026-11-02T14:00",
      "2026-11-02T15:00",
      "2026-11-02T16:00",
      "2026-11-02T17:00",
      "2026-11-02T18:00",
      "2026-11-02T19:00",
      "2026-11-02T20:00",
      "2026-11-02T21:00",
      "2026-11-02T22:00",
      "2026-11-02T23:00",
      "2026-11-03T00:00",
      "2026-11-03T01:00",
      "2026-11-03T02:00",
      "2026-11-03T03:00",
      "2026-11-03T04:00",
      "2026-11-03T05:00",
      "2026-11-03T06:00",
      "2026-11-03T07:00",
      "2026-11-03T08:00",
      "2026-11-03T09:00",
      "2026-11-03T10:00",
      "2026-11-03T11:00",
      "2026-11-03T12:00",
      "2026-11-03T13:00",
      "2026-11-03T14:00",
      "2026-11-03T15:00",
      "2026-11-03T16:00",
      "2026-11-03T17:00",
      "2026-11-03T18:00",
      "2026-11-03T19:00",
      "2026-11-03T20:00",
      "2026-11-03T21:00",
      "2026-11-03T22:00",
      "2026-11-03T23:00"
    ],
    "cloud_cover": [
      57, 50, 96, 100, 100, 99, 100, 99, 98, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 99,
      100, 100, 100, 99, 73, 22, 46, 94, 78, 76, 94, 95, 95, 95, 94, 95, 75, 99, 97, 100, 98, 96,
      95, 97, 96, 100, 100, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 84, 91, 79,
      87, 92, 82, 77, 50, 36, 38, 54, 84, 51, 37, 21, 28, 29, 33, 45, 53, 99, 100, 99, 100, 96, 98,
      100, 100, 100, 100, 99, 98, 100, 100, 100, 100, 98, 95, 94, 63, 55, 62, 62, 47, 47, 70, 95,
      66, 20, 73, 77, 88, 71, 85, 92, 96, 99, 98, 100, 100, 100, 100, 88, 100, 99, 100, 100, 98, 98,
      95, 88, 43, 89, 42, 65, 45, 29, 59, 100, 99, 100, 100, 100, 100, 99, 100, 100, 100, 100, 100,
      100, 99, 98, 99, 95, 53, 57, 24, 30, 44, 56, 95, 71, 99, 97, 98, 98, 98, 77, 97, 58, 61, 71,
      76, 70, 59, 54, 63, 78, 83, 69, 46, 29, 25, 28, 34, 43, 55, 63, 61, 56, 54, 62, 74, 84, 91,
      96, 99, 100, 100, 97, 86, 70, 55, 39, 23, 15, 20, 33, 46, 56, 67, 76, 85, 94, 99, 99, 95, 93,
      94, 95, 96, 93, 92, 91, 89, 85, 81, 78, 76, 75, 77, 81, 85, 91, 95, 98, 99, 100, 100, 100, 99,
      99, 100, 100, 100, 100, 100, 98, 91, 81, 70, 59, 51, 48, 51, 59, 70, 82, 92, 99, 100, 100,
      100, 100, 100, 99, 99, 100, 100, 100, 100, 100, 99, 98, 97, 96, 95, 94, 94, 94, 94, 95, 96,
      96, 97, 97, 98, 98, 99, 99, 99, 99, 98, 98, 97, 96, 95, 93, 91, 89, 88, 88, 89, 91, 94, 96,
      98, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 100, 94, 85, 75, 65, 57, 52,
      51, 53, 56, 60, 64, 66, 67, 68, 68, 68, 67, 67, 67, 66, 65, 64, 62, 60, 56, 49, 42, 36, 32,
      32, 37, 46, 58, 70, 80, 88, 93, 97, 100, 100, 100, 98, 91, 79, 65, 52, 42, 38, 41, 49, 60, 72,
      83, 90, 94, 96, 97, 98, 98, 98, 99, 100, 100, 100, 100, 98, 90, 79, 66, 53, 42, 34, 30, 28,
      27, 28, 31, 34, 39, 46, 54, 63, 71, 77, 82, 87, 91, 94, 97, 99, 100, 100, 100, 99, 97, 95, 92,
      88, 83, 79, 75, 74, 75, 77, 81, 85, 89, 92, 94, 97, 100, 100, 100, 100, 95, 88, 80, 78, 82,
      89, 98, 96, 94, 91, 89, 88, 91, 96, 100, 100, 99, 98, 98, 99, 100, 100
    ],
    "cloud_cover_low": [
      39, 16, 62, 88, 98, 84, 81, 16, 23, 20, 16, 14, 23, 27, 2, 4, 2, 2, 1, 0, 9, 12, 7, 3, 5, 9,
      15, 25, 17, 7, 2, 5, 2, 1, 2, 13, 10, 20, 6, 3, 9, 2, 12, 5, 5, 39, 58, 41, 93, 98, 100, 77,
      58, 98, 100, 46, 29, 23, 16, 10, 16, 12, 9, 13, 5, 3, 5, 2, 2, 6, 5, 3, 2, 1, 3, 8, 16, 19,
      18, 17, 8, 1, 2, 2, 2, 13, 20, 14, 13, 17, 33, 12, 24, 71, 52, 34, 43, 30, 31, 33, 30, 23, 18,
      10, 9, 5, 2, 9, 9, 2, 3, 3, 8, 20, 35, 4, 7, 16, 16, 18, 15, 11, 27, 16, 30, 98, 72, 44, 5, 5,
      12, 20, 8, 11, 5, 2, 8, 7, 6, 5, 7, 9, 30, 16, 51, 98, 73, 53, 19, 16, 16, 3, 12, 5, 13, 13,
      20, 7, 8, 5, 9, 6, 6, 4, 3, 2, 2, 2, 27, 31, 32, 30, 28, 27, 26, 25, 23, 20, 17, 16, 15, 13,
      10, 6, 4, 5, 7, 8, 7, 4, 2, 0, 0, 1, 8, 18, 23, 18, 8, 0, 0, 0, 0, 0, 1, 2, 4, 6, 9, 11, 13,
      16, 22, 30, 34, 32, 27, 22, 20, 19, 17, 11, 9, 7, 7, 7, 9, 10, 11, 12, 12, 13, 13, 13, 13, 12,
      10, 5, 1, 0, 0, 2, 14, 33, 55, 76, 92, 98, 92, 78, 58, 37, 18, 7, 3, 4, 8, 13, 17, 20, 20, 18,
      15, 14, 15, 19, 30, 46, 65, 83, 96, 100, 93, 78, 58, 37, 19, 7, 2, 1, 4, 7, 11, 13, 15, 17,
      19, 21, 23, 24, 24, 24, 24, 23, 22, 22, 22, 22, 23, 23, 23, 23, 23, 22, 22, 21, 20, 18, 16,
      13, 10, 7, 4, 2, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 4, 6, 9, 13, 18, 22, 25, 27, 27, 25, 22, 19,
      16, 13, 11, 8, 5, 3, 1, 1, 3, 6, 10, 14, 18, 20, 21, 21, 20, 20, 19, 19, 20, 21, 23, 25, 25,
      25, 23, 20, 17, 13, 10, 7, 5, 4, 3, 2, 2, 2, 3, 4, 6, 8, 10, 12, 14, 17, 20, 23, 25, 25, 23,
      20, 15, 11, 7, 5, 5, 6, 8, 10, 13, 14, 15, 15, 16, 16, 16, 17, 18, 20, 21, 22, 23, 23, 22, 19,
      16, 13, 11, 9, 8, 8, 9, 9, 10, 10, 9, 8, 7, 6, 6, 9, 15, 25, 36, 47, 54, 57, 54, 45, 35, 17,
      7, 2, 1, 2, 3, 3, 4, 7, 18, 32, 38, 28, 11, 3, 13, 32, 46, 48
    ],
    "cloud_cover_mid": [
      0, 0, 2, 4, 2, 9, 3, 1, 2, 2, 16, 20, 38, 4, 12, 13, 9, 5, 2, 1, 8, 25, 14, 7, 4, 10, 11, 11,
      12, 5, 2, 0, 1, 5, 17, 17, 21, 29, 19, 13, 29, 15, 25, 12, 22, 100, 100, 27, 75, 100, 97, 84,
      48, 70, 45, 95, 95, 98, 38, 20, 22, 32, 37, 48, 11, 21, 20, 12, 16, 30, 73, 29, 8, 5, 0, 1, 2,
      5, 9, 15, 27, 0, 0, 5, 2, 20, 31, 32, 95, 67, 41, 97, 100, 47, 100, 55, 45, 49, 28, 16, 27,
      20, 12, 30, 66, 72, 51, 8, 45, 14, 10, 10, 10, 26, 55, 41, 48, 100, 88, 27, 50, 28, 64, 37,
      88, 95, 80, 37, 16, 26, 9, 84, 25, 57, 41, 9, 31, 100, 43, 95, 91, 91, 44, 59, 59, 55, 58, 98,
      87, 88, 24, 25, 91, 8, 15, 16, 14, 5, 18, 40, 93, 20, 94, 2, 28, 13, 23, 30, 78, 16, 24, 35,
      41, 35, 24, 15, 14, 15, 16, 14, 10, 8, 7, 7, 7, 9, 11, 13, 13, 11, 9, 6, 3, 1, 0, 0, 0, 0, 0,
      0, 1, 2, 3, 5, 8, 10, 9, 6, 6, 13, 22, 27, 21, 10, 2, 0, 0, 1, 1, 1, 1, 0, 0, 1, 6, 14, 22,
      31, 37, 41, 41, 38, 34, 29, 24, 20, 17, 13, 10, 7, 4, 2, 0, 0, 0, 0, 0, 0, 3, 8, 14, 20, 25,
      29, 31, 33, 34, 34, 33, 32, 30, 27, 23, 19, 16, 13, 11, 8, 6, 5, 6, 9, 16, 26, 38, 50, 59, 63,
      60, 52, 41, 31, 23, 20, 25, 35, 47, 60, 70, 75, 73, 67, 59, 49, 41, 35, 31, 28, 25, 24, 25,
      29, 37, 48, 62, 76, 87, 95, 99, 100, 100, 100, 97, 91, 81, 66, 49, 32, 17, 8, 5, 5, 9, 13, 18,
      20, 21, 21, 21, 21, 20, 19, 17, 15, 12, 9, 7, 5, 4, 2, 2, 1, 1, 1, 2, 3, 5, 7, 9, 10, 11, 11,
      11, 11, 10, 10, 9, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 5, 5, 4,
      3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 3, 6, 11, 15, 19, 22, 24, 25, 25, 25, 24, 23, 21, 18, 15, 12, 8,
      6, 4, 3, 2, 1, 0, 0, 0, 1, 3, 4, 6, 7, 8, 8, 8, 8, 9, 12, 17, 25, 34, 42, 47, 49, 45, 38, 27,
      33, 51, 74, 81, 53, 37, 46, 68, 86, 95, 99, 100, 94, 84, 79, 84, 93, 100, 100
    ],
    "cloud_cover_high": [
      30, 41, 91, 98, 99, 93, 100, 99, 98, 99, 100, 100, 100, 100, 100, 100, 100, 100, 100, 99, 99,
      100, 100, 99, 70, 3, 29, 90, 70, 73, 93, 95, 95, 95, 92, 93, 66, 99, 96, 100, 98, 95, 94, 96,
      95, 99, 99, 99, 98, 95, 94, 98, 98, 99, 98, 99, 98, 97, 100, 77, 86, 67, 80, 84, 79, 70, 34,
      27, 24, 29, 40, 29, 30, 16, 25, 22, 19, 28, 38, 99, 100, 99, 100, 96, 98, 100, 100, 100, 99,
      98, 95, 88, 98, 100, 95, 95, 86, 84, 26, 20, 34, 38, 26, 16, 7, 80, 30, 8, 45, 73, 86, 68, 83,
      88, 90, 98, 97, 99, 100, 100, 100, 83, 99, 99, 99, 90, 65, 97, 95, 84, 30, 16, 17, 9, 2, 20,
      38, 62, 98, 98, 98, 100, 100, 98, 99, 98, 98, 98, 99, 98, 99, 98, 91, 95, 39, 42, 3, 21, 27,
      25, 45, 64, 88, 97, 97, 98, 98, 67, 80, 30, 30, 39, 45, 39, 30, 28, 44, 66, 77, 62, 35, 16,
      14, 19, 27, 37, 48, 56, 54, 49, 48, 58, 72, 84, 91, 96, 99, 100, 100, 97, 86, 70, 54, 35, 15,
      5, 10, 25, 39, 48, 56, 65, 77, 90, 98, 98, 94, 91, 92, 94, 95, 94, 93, 90, 85, 77, 68, 60, 54,
      52, 55, 63, 73, 83, 92, 98, 100, 100, 100, 100, 100, 99, 88, 72, 53, 34, 18, 8, 4, 3, 5, 10,
      16, 23, 33, 46, 61, 76, 89, 98, 100, 100, 100, 100, 100, 98, 92, 83, 73, 63, 56, 52, 53, 58,
      64, 72, 79, 84, 87, 90, 92, 93, 94, 95, 96, 96, 96, 96, 95, 95, 95, 95, 94, 94, 93, 92, 90,
      88, 85, 82, 81, 80, 81, 83, 87, 90, 93, 95, 96, 97, 97, 97, 97, 97, 98, 100, 100, 100, 100,
      100, 92, 81, 68, 54, 43, 36, 33, 33, 35, 38, 41, 44, 46, 49, 52, 55, 57, 59, 60, 62, 63, 63,
      62, 59, 52, 42, 30, 20, 13, 11, 17, 29, 44, 60, 74, 84, 91, 96, 100, 100, 100, 98, 90, 78, 63,
      49, 38, 33, 36, 44, 56, 69, 81, 89, 93, 96, 97, 97, 98, 98, 99, 100, 100, 100, 100, 98, 90,
      79, 65, 51, 39, 29, 21, 14, 8, 3, 2, 3, 9, 19, 31, 44, 56, 66, 74, 81, 87, 92, 96, 99, 100,
      100, 100, 98, 96, 94, 91, 86, 81, 76, 73, 71, 72, 75, 79, 83, 87, 90, 93, 96, 98, 100, 100,
      99, 94, 87, 78, 75, 72, 71, 80, 89, 89, 69, 42, 28, 45, 75, 93, 83, 60, 43, 40, 43, 46, 43
    ],
    "visibility": [
      4080.0, 28100.0, 540.0, 260.0, 280.0, 460.0, 620.0, 8060.0, 9820.0, 19100.0, 11640.0, 15160.0,
      8640.0, 45760.0, 52860.0, 33080.0, 18740.0, 26520.0, 33180.0, 55660.0, 55540.0, 51060.0,
      47020.0, 39720.0, 38300.0, 36720.0, 37100.0, 36580.0, 33780.0, 28820.0, 29100.0, 51100.0,
      55460.0, 55460.0, 17480.0, 6240.0, 12140.0, 8300.0, 21380.0, 59940.0, 41240.0, 41780.0,
      41340.0, 41660.0, 32680.0, 20020.0, 5700.0, 14040.0, 3740.0, 2620.0, 1120.0, 1020.0, 1120.0,
      700.0, 780.0, 7700.0, 11100.0, 14720.0, 18100.0, 15960.0, 10520.0, 17160.0, 17760.0, 12500.0,
      24800.0, 51500.0, 41500.0, 42180.0, 42080.0, 41500.0, 42040.0, 42120.0, 42200.0, 42240.0,
      43800.0, 14580.0, 3860.0, 2000.0, 1400.0, 51440.0, 28300.0, 59760.0, 59800.0, 66040.0,
      66160.0, 12120.0, 9740.0, 27980.0, 56280.0, 56220.0, 51720.0, 51660.0, 17100.0, 4240.0,
      4380.0, 2760.0, 1920.0, 2960.0, 2680.0, 2680.0, 5480.0, 12500.0, 35240.0, 43180.0, 49580.0,
      44900.0, 55940.0, 32140.0, 11960.0, 38440.0, 35440.0, 36300.0, 31320.0, 51980.0, 7760.0,
      8000.0, 23620.0, 29900.0, 29960.0, 26340.0, 29720.0, 15600.0, 19220.0, 19160.0, 17800.0,
      12840.0, 5900.0, 9400.0, 43200.0, 55960.0, 20860.0, 8080.0, 19280.0, 14960.0, 18420.0,
      60500.0, 21420.0, 56360.0, 51860.0, 46720.0, 42400.0, 37400.0, 29840.0, 26300.0, 1280.0,
      1460.0, 2440.0, 5860.0, 11340.0, 12860.0, 29500.0, 42460.0, 51600.0, 35660.0, 18000.0,
      17340.0, 11920.0, 17520.0, 28960.0, 54460.0, 56380.0, 25740.0, 46920.0, 42620.0, 41820.0,
      37540.0, 37520.0, 37540.0, 1760.0, 1760.0, 1640.0, 1520.0, 1400.0, 5300.0, 9180.0, 13080.0,
      15980.0, 18860.0, 21760.0, 19260.0, 16760.0, 14260.0, 23360.0, 32460.0, 41560.0, 42040.0,
      42500.0, 42980.0, 42840.0, 42720.0, 42580.0, 41000.0, 39420.0, 37840.0, 25360.0, 12880.0,
      400.0, 15920.0, 31460.0, 46980.0, 51400.0, 55840.0, 60260.0, 50920.0, 41560.0, 32220.0,
      37780.0, 43320.0, 48880.0, 42440.0, 35980.0, 29540.0, 32260.0, 34960.0, 37680.0, 37500.0,
      37340.0, 37160.0, 25740.0, 14340.0, 2920.0, 17680.0, 32420.0, 47180.0, 40760.0, 34360.0,
      27940.0, 21520.0, 15120.0, 8700.0, 14160.0, 19600.0, 25060.0, 30500.0, 35960.0, 41400.0,
      38860.0, 36320.0, 33800.0, 31260.0, 28720.0, 26180.0, 21840.0, 17500.0, 13180.0, 8840.0,
      4500.0, 160.0, 1260.0, 2340.0, 3440.0, 4540.0, 5620.0, 6720.0, 6600.0, 6500.0, 6380.0, 6260.0,
      6160.0, 6040.0, 7620.0, 9180.0, 10760.0, 12320.0, 13900.0, 15460.0, 12900.0, 10360.0, 7800.0,
      5240.0, 2700.0, 140.0, 740.0, 1320.0, 1920.0, 2500.0, 3080.0, 3680.0, 4240.0, 4800.0, 5360.0,
      5900.0, 6460.0, 7020.0, 6160.0, 5300.0, 4460.0, 3600.0, 2740.0, 1880.0, 3020.0, 4160.0,
      5320.0, 6460.0, 7600.0, 8740.0, 8560.0, 8400.0, 8220.0, 8040.0, 7880.0, 7700.0, 7220.0,
      6740.0, 6260.0, 5780.0, 5300.0, 4820.0, 8840.0, 12860.0, 16900.0, 20920.0, 24940.0, 28960.0,
      31220.0, 33500.0, 35760.0, 38020.0, 40300.0, 42560.0, 37280.0, 32000.0, 26720.0, 21440.0,
      16160.0, 10880.0, 11220.0, 11540.0, 11880.0, 12220.0, 12540.0, 12880.0, 12940.0, 13000.0,
      13060.0, 13100.0, 13160.0, 13220.0, 17460.0, 21700.0, 25960.0, 30200.0, 34440.0, 38680.0,
      33500.0, 28320.0, 23140.0, 17940.0, 12760.0, 7580.0, 8260.0, 8940.0, 9620.0, 10280.0, 10960.0,
      11640.0, 13980.0, 16320.0, 18660.0, 21000.0, 23340.0, 25680.0, 30260.0, 34840.0, 39420.0,
      43980.0, 48560.0, 53140.0, 54580.0, 56000.0, 57440.0, 58860.0, 60300.0, 61720.0, 56900.0,
      52080.0, 47260.0, 42440.0, 37620.0, 32800.0, 32020.0, 31220.0, 30440.0, 29660.0, 28860.0,
      28080.0, 30900.0, 33720.0, 36540.0, 39360.0, 42180.0, 45000.0, 38820.0, 32620.0, 26440.0,
      20260.0, 14060.0, 7880.0, 8920.0, 9960.0, 11020.0, 12060.0, 13100.0, 14140.0, 16260.0,
      18400.0, 20520.0, 22640.0, 24780.0, 26900.0, 24080.0, 21280.0, 18460.0, 15640.0, 12840.0,
      10020.0, 11220.0, 12420.0, 13620.0, 14820.0, 16020.0, 17220.0, 16720.0, 16200.0, 15700.0,
      15200.0, 14680.0, 14180.0, 11960.0, 9740.0, 7540.0, 5320.0, 3100.0, 880.0, 7540.0, 14180.0,
      20840.0, 26660.0, 29140.0, 28305.0, 22540.0, 20960.0, 19360.0, 18760.0, 18160.0, 17560.0,
      16300.0, 15020.0, 13760.0, 9960.0, 6140.0, 2340.0, 5180.0, 8020.0, 10860.0, 15280.0
    ],
    "temperature_2m": [
      11.9, 11.6, 10.9, 11.3, 11.6, 11.5, 11.4, 13.0, 14.8, 16.5, 17.5, 17.7, 17.8, 17.7, 17.5,
      18.0, 17.6, 16.2, 14.0, 14.1, 13.5, 13.2, 12.7, 12.1, 11.6, 11.8, 11.0, 11.0, 11.1, 10.6,
      10.6, 14.1, 16.2, 17.9, 19.0, 18.3, 19.2, 20.5, 18.8, 19.4, 18.0, 16.5, 14.3, 13.4, 12.7,
      12.3, 12.7, 12.7, 12.2, 12.1, 11.8, 11.9, 11.7, 11.4, 11.5, 12.5, 12.9, 13.9, 15.9, 17.7,
      18.2, 17.6, 17.2, 16.6, 15.8, 14.9, 13.0, 12.4, 11.8, 11.8, 11.6, 11.8, 11.0, 10.7, 10.0, 9.8,
      9.6, 9.5, 9.5, 12.8, 15.0, 16.9, 18.6, 19.3, 20.0, 20.0, 19.9, 19.0, 17.6, 16.4, 15.0, 14.9,
      14.2, 13.1, 12.5, 12.6, 12.2, 12.0, 11.4, 11.0, 11.0, 10.8, 10.9, 13.5, 15.3, 16.5, 17.5,
      18.0, 19.6, 18.8, 19.4, 19.0, 17.7, 16.1, 14.5, 13.8, 13.3, 13.1, 13.2, 12.9, 12.5, 12.4,
      11.9, 11.8, 11.5, 11.5, 11.7, 12.9, 14.9, 17.3, 18.5, 19.1, 18.0, 19.1, 19.0, 18.4, 18.0,
      16.5, 15.3, 14.0, 13.9, 13.2, 12.7, 12.2, 11.9, 12.0, 11.8, 11.5, 11.6, 11.3, 11.2, 13.4,
      15.5, 16.3, 17.8, 18.6, 18.8, 18.7, 19.0, 18.6, 17.2, 16.2, 14.5, 14.4, 13.2, 12.9, 12.2,
      11.7, 11.2, 11.7, 11.1, 10.5, 10.3, 10.8, 11.8, 13.0, 14.5, 16.2, 17.5, 18.4, 19.0, 19.2,
      18.9, 18.3, 17.3, 16.0, 14.3, 13.0, 12.4, 12.1, 11.7, 11.3, 10.8, 10.3, 9.6, 8.9, 8.8, 9.6,
      10.9, 12.6, 14.8, 17.3, 19.3, 20.4, 21.0, 21.1, 20.8, 20.0, 18.8, 17.2, 15.2, 13.7, 13.1,
      12.9, 12.7, 12.4, 12.1, 11.8, 11.3, 10.7, 10.6, 12.6, 13.1, 13.7, 14.8, 16.3, 17.9, 19.4,
      20.5, 21.0, 20.6, 19.6, 18.2, 16.7, 15.3, 14.3, 13.6, 13.0, 12.5, 12.2, 11.9, 11.8, 11.7,
      11.6, 11.7, 11.8, 12.2, 12.7, 13.7, 15.1, 16.7, 18.2, 19.3, 19.8, 19.6, 18.7, 17.5, 16.2,
      15.0, 14.1, 13.6, 13.1, 12.8, 12.5, 12.3, 12.2, 12.0, 11.9, 11.9, 11.9, 12.0, 12.2, 12.6,
      13.2, 13.9, 14.6, 15.1, 15.4, 15.4, 15.1, 14.8, 14.3, 13.9, 13.6, 13.4, 13.2, 13.0, 12.8,
      12.7, 12.6, 12.6, 12.6, 12.6, 12.7, 12.9, 13.2, 13.6, 14.2, 14.9, 15.6, 16.1, 16.3, 16.1,
      15.7, 15.1, 14.4, 13.9, 13.5, 13.3, 13.2, 13.1, 13.1, 13.1, 13.1, 13.0, 12.8, 12.6, 12.5,
      12.6, 13.0, 13.7, 14.9, 16.3, 17.6, 18.5, 19.0, 18.8, 18.0, 17.0, 15.9, 14.8, 13.9, 13.2,
      12.5, 11.9, 11.4, 11.0, 10.7, 10.6, 10.7, 10.9, 11.2, 11.6, 12.2, 13.2, 14.4, 15.9, 17.2,
      18.2, 18.7, 18.5, 17.8, 16.8, 15.6, 14.5, 13.7, 13.2, 12.7, 12.3, 11.9, 11.7, 11.6, 11.5,
      11.5, 11.6, 11.8, 12.2, 12.8, 13.8, 15.3, 17.0, 18.5, 19.6, 20.0, 19.6, 18.5, 17.0, 15.4,
      13.9, 12.8, 12.0, 11.3, 10.8, 10.4, 10.2, 10.1, 10.2, 10.5, 10.9, 11.4, 12.1, 12.9, 13.9,
      15.3, 16.8, 18.2, 19.2, 19.6, 19.3, 18.4, 17.1, 15.8, 14.5, 13.5, 12.9, 12.3, 11.8, 11.5,
      11.2, 11.1, 11.1, 11.2, 11.4, 11.8, 12.3, 12.9, 14.0, 15.5, 17.1, 18.6, 19.7, 20.2, 19.8,
      18.7, 17.3, 15.8, 14.3, 13.3, 12.7, 12.2, 11.9, 11.7, 11.6, 11.5, 11.6, 11.8, 12.1, 12.2,
      12.2, 12.6, 14.8, 17.7, 19.6, 19.4, 18.2, 17.0, 16.2, 15.5, 14.8, 14.0, 13.1, 12.4, 12.1,
      12.0, 11.9, 11.9
    ],
    "relative_humidity_2m": [
      95, 96, 98, 99, 97, 97, 98, 84, 77, 71, 65, 64, 66, 61, 60, 58, 61, 67, 77, 72, 74, 77, 82,
      88, 91, 94, 94, 94, 93, 94, 94, 76, 66, 60, 56, 61, 58, 49, 56, 53, 59, 68, 82, 89, 94, 98,
      95, 96, 98, 97, 98, 98, 99, 99, 98, 91, 88, 83, 70, 61, 61, 65, 69, 70, 75, 77, 89, 89, 90,
      90, 91, 91, 91, 89, 86, 86, 88, 88, 89, 73, 66, 58, 50, 48, 48, 50, 52, 56, 62, 67, 77, 77,
      82, 93, 99, 99, 98, 97, 96, 97, 96, 95, 94, 86, 77, 67, 63, 63, 57, 60, 58, 60, 65, 73, 86,
      95, 97, 97, 96, 97, 98, 97, 97, 97, 98, 99, 98, 92, 82, 63, 58, 57, 62, 59, 58, 59, 60, 66,
      75, 85, 87, 94, 98, 99, 99, 99, 99, 98, 97, 97, 98, 87, 74, 70, 64, 60, 60, 60, 58, 60, 65,
      70, 83, 86, 92, 93, 94, 93, 94, 94, 96, 97, 98, 95, 92, 87, 80, 71, 65, 59, 56, 54, 55, 59,
      64, 70, 79, 87, 90, 91, 92, 93, 94, 95, 96, 98, 98, 96, 93, 86, 73, 59, 50, 47, 46, 47, 49,
      54, 60, 68, 80, 90, 93, 93, 92, 92, 92, 92, 95, 98, 99, 92, 90, 87, 80, 71, 63, 56, 51, 50,
      52, 57, 65, 75, 85, 92, 96, 99, 99, 99, 98, 98, 99, 100, 100, 100, 99, 96, 89, 80, 72, 64, 59,
      57, 59, 64, 71, 80, 88, 94, 97, 99, 99, 98, 98, 98, 98, 99, 99, 100, 100, 99, 98, 96, 94, 92,
      90, 90, 90, 91, 92, 94, 95, 96, 97, 98, 98, 99, 99, 99, 99, 99, 99, 98, 97, 96, 93, 90, 87,
      84, 82, 81, 82, 85, 88, 91, 95, 97, 98, 98, 98, 97, 97, 96, 96, 97, 97, 97, 96, 93, 88, 80,
      73, 66, 62, 60, 61, 65, 71, 78, 85, 90, 93, 96, 97, 98, 99, 99, 99, 99, 99, 98, 96, 93, 87,
      81, 73, 67, 63, 61, 62, 65, 70, 75, 81, 85, 87, 89, 91, 92, 92, 92, 91, 90, 88, 86, 82, 79,
      74, 67, 61, 56, 53, 52, 53, 57, 64, 71, 79, 85, 89, 92, 94, 96, 96, 97, 96, 95, 93, 90, 87,
      83, 78, 72, 66, 61, 58, 57, 59, 63, 70, 78, 85, 91, 94, 95, 96, 95, 95, 94, 94, 93, 92, 91,
      88, 85, 79, 72, 64, 58, 54, 53, 55, 60, 68, 77, 86, 93, 97, 98, 99, 98, 98, 97, 96, 95, 94,
      93, 92, 89, 77, 63, 55, 57, 65, 73, 78, 83, 87, 91, 94, 96, 97, 96, 96, 96
    ],
    "dew_point_2m": [
      11.1, 10.9, 10.7, 11.1, 11.1, 11.1, 11.2, 10.4, 10.8, 11.2, 10.9, 10.9, 11.3, 10.0, 9.7, 9.6,
      9.9, 10.0, 10.0, 9.2, 8.9, 9.2, 9.7, 10.1, 10.3, 10.9, 10.1, 10.0, 9.9, 9.7, 9.6, 9.9, 9.8,
      10.1, 10.1, 10.7, 10.7, 9.5, 9.9, 9.7, 10.0, 10.5, 11.4, 11.5, 11.8, 11.9, 12.0, 12.0, 12.0,
      11.7, 11.6, 11.6, 11.5, 11.2, 11.3, 11.1, 11.0, 11.1, 10.5, 10.1, 10.5, 11.0, 11.5, 11.2,
      11.3, 11.0, 11.3, 10.6, 10.3, 10.2, 10.2, 10.3, 9.6, 9.0, 7.8, 7.6, 7.6, 7.7, 7.8, 8.1, 8.6,
      8.6, 8.1, 8.1, 8.7, 9.4, 9.8, 10.1, 10.3, 10.3, 11.1, 11.0, 11.1, 12.1, 12.3, 12.4, 12.0,
      11.5, 10.9, 10.6, 10.4, 10.1, 10.0, 11.1, 11.3, 10.5, 10.4, 10.8, 10.7, 10.8, 10.8, 11.0,
      11.1, 11.3, 12.2, 12.9, 12.9, 12.7, 12.6, 12.5, 12.2, 11.9, 11.4, 11.4, 11.2, 11.3, 11.4,
      11.6, 11.8, 10.2, 10.0, 10.4, 10.6, 10.8, 10.6, 10.4, 10.2, 10.2, 10.8, 11.5, 11.9, 12.2,
      12.3, 12.0, 11.8, 11.8, 11.6, 11.2, 11.2, 10.9, 10.9, 11.2, 10.9, 10.9, 10.9, 10.7, 10.8,
      10.8, 10.6, 10.7, 10.7, 10.8, 11.6, 12.1, 11.9, 11.8, 11.3, 10.6, 10.3, 10.8, 10.5, 10.1, 9.9,
      10.1, 10.6, 10.9, 11.0, 10.9, 10.8, 10.4, 9.9, 9.6, 9.7, 10.1, 10.4, 10.6, 10.7, 10.8, 10.8,
      10.7, 10.5, 10.2, 9.9, 9.5, 9.1, 8.7, 8.5, 9.0, 9.8, 10.2, 9.9, 9.2, 8.8, 8.8, 9.0, 9.3, 9.7,
      10.3, 10.8, 11.3, 11.8, 12.1, 12.0, 11.7, 11.4, 11.1, 10.9, 10.6, 10.4, 10.3, 10.4, 11.4,
      11.5, 11.6, 11.4, 11.1, 10.7, 10.3, 10.1, 10.1, 10.4, 10.9, 11.6, 12.2, 12.8, 13.1, 13.0,
      12.8, 12.4, 12.0, 11.7, 11.5, 11.5, 11.6, 11.7, 11.9, 12.0, 12.1, 12.0, 11.8, 11.5, 11.3,
      11.1, 11.1, 11.3, 11.7, 12.2, 12.7, 13.0, 13.2, 13.2, 13.0, 12.6, 12.3, 12.0, 11.8, 11.8,
      11.7, 11.8, 11.8, 11.9, 12.1, 12.3, 12.6, 12.9, 13.3, 13.5, 13.7, 13.7, 13.6, 13.5, 13.3,
      13.2, 13.0, 12.9, 12.8, 12.7, 12.6, 12.5, 12.5, 12.4, 12.4, 12.4, 12.4, 12.4, 12.5, 12.5,
      12.6, 12.8, 12.9, 13.0, 13.0, 13.1, 13.1, 13.1, 13.0, 13.0, 13.0, 12.9, 12.8, 12.8, 12.7,
      12.6, 12.5, 12.4, 12.3, 12.2, 12.1, 12.0, 11.9, 11.8, 11.6, 11.4, 11.2, 11.1, 11.0, 11.1,
      11.4, 11.7, 12.0, 12.2, 12.3, 12.1, 11.8, 11.5, 11.1, 10.8, 10.6, 10.5, 10.6, 10.7, 10.9,
      11.0, 11.1, 11.1, 11.1, 11.1, 11.1, 11.1, 11.1, 11.1, 11.1, 11.2, 11.2, 11.2, 11.2, 11.1,
      11.0, 10.8, 10.7, 10.5, 10.3, 10.1, 9.9, 9.7, 9.5, 9.3, 9.2, 9.2, 9.3, 9.4, 9.5, 9.7, 9.8,
      9.9, 10.0, 10.1, 10.2, 10.3, 10.3, 10.2, 10.1, 9.9, 9.8, 9.6, 9.6, 9.6, 9.7, 9.8, 9.9, 10.0,
      10.1, 10.2, 10.3, 10.4, 10.5, 10.7, 10.8, 11.0, 11.3, 11.6, 11.9, 12.0, 12.1, 11.9, 11.6,
      11.2, 10.8, 10.4, 10.2, 10.1, 10.1, 10.2, 10.3, 10.4, 10.5, 10.4, 10.4, 10.2, 10.2, 10.1,
      10.2, 10.5, 10.8, 11.3, 11.7, 12.0, 12.2, 12.2, 12.0, 11.7, 11.5, 11.2, 11.1, 11.0, 11.1,
      11.1, 11.0, 10.8, 10.8, 10.8, 10.6, 10.3, 10.7, 11.5, 12.1, 12.4, 12.6, 12.7, 12.5, 12.1,
      11.8, 11.6, 11.3, 11.3, 11.3
    ],
    "wind_speed_10m": [
      8.1, 7.1, 6.0, 5.9, 5.6, 3.7, 2.7, 5.3, 8.5, 12.0, 13.0, 13.6, 13.8, 11.2, 10.6, 9.2, 6.4,
      5.7, 6.6, 5.9, 5.5, 6.7, 6.5, 5.6, 3.9, 4.5, 3.4, 4.5, 6.0, 4.5, 4.3, 3.3, 5.2, 8.5, 10.4,
      12.9, 12.4, 11.3, 11.5, 12.2, 12.2, 9.4, 7.4, 7.4, 8.3, 8.3, 8.2, 6.9, 5.3, 6.4, 7.8, 7.8,
      7.6, 7.4, 7.6, 6.3, 7.2, 8.5, 11.0, 13.8, 15.9, 12.5, 13.8, 12.5, 11.0, 9.0, 7.0, 5.1, 3.8,
      3.8, 3.5, 4.6, 5.0, 5.3, 4.5, 4.8, 4.4, 3.7, 3.6, 6.3, 8.2, 10.5, 11.7, 12.4, 11.3, 11.4,
      10.4, 8.7, 6.7, 4.7, 1.2, 1.4, 4.8, 8.4, 7.6, 6.6, 4.6, 4.5, 3.7, 3.7, 2.1, 2.4, 3.3, 5.5,
      9.1, 12.3, 12.7, 13.9, 12.8, 13.5, 12.5, 12.0, 11.2, 8.7, 1.1, 5.0, 3.1, 2.8, 3.7, 2.7, 2.7,
      3.1, 4.0, 5.1, 6.0, 5.9, 6.3, 5.5, 6.9, 11.3, 13.9, 14.5, 13.4, 14.3, 13.4, 12.3, 9.8, 6.2,
      4.6, 4.8, 4.4, 6.2, 7.2, 6.2, 5.1, 5.0, 5.0, 4.5, 4.7, 4.4, 4.6, 4.8, 7.6, 11.5, 14.8, 16.3,
      16.0, 15.5, 15.7, 13.6, 10.8, 7.8, 4.0, 4.1, 1.8, 2.5, 4.9, 6.2, 5.6, 5.5, 5.2, 4.7, 4.6, 4.7,
      5.1, 6.4, 9.2, 12.9, 15.9, 17.8, 18.9, 19.2, 18.5, 16.8, 14.7, 11.7, 8.3, 5.8, 4.8, 4.6, 4.4,
      3.1, 1.8, 1.1, 1.3, 2.3, 3.0, 1.9, 0.2, 0.2, 2.8, 7.2, 10.5, 11.7, 12.0, 11.9, 11.7, 11.1,
      10.3, 8.9, 7.1, 5.6, 4.5, 3.7, 3.0, 1.9, 1.2, 1.3, 1.5, 1.7, 1.7, 1.0, 0.6, 0.6, 1.9, 4.3,
      6.9, 9.3, 11.2, 11.9, 11.5, 10.2, 8.3, 6.2, 4.4, 3.1, 2.4, 1.8, 1.3, 1.0, 0.9, 0.9, 1.1, 1.3,
      1.6, 1.7, 1.5, 0.8, 0.6, 2.7, 5.0, 7.1, 8.9, 9.7, 9.3, 8.1, 6.4, 4.5, 3.1, 2.4, 2.0, 1.5, 1.0,
      0.5, 0.0, 0.4, 0.7, 1.1, 1.3, 1.7, 1.9, 2.1, 2.7, 3.4, 4.5, 5.7, 6.5, 6.9, 6.5, 5.7, 4.4, 3.4,
      2.7, 2.5, 2.6, 2.6, 2.6, 2.7, 2.8, 2.8, 2.8, 3.0, 3.0, 3.1, 3.1, 3.0, 2.9, 2.7, 2.8, 3.1, 3.3,
      3.6, 3.9, 3.9, 4.0, 3.9, 3.8, 3.6, 3.3, 2.9, 2.4, 1.6, 1.3, 1.1, 1.1, 1.3, 1.8, 2.3, 3.0, 3.7,
      5.0, 6.5, 8.4, 9.9, 11.0, 11.2, 10.2, 8.0, 5.4, 2.9, 1.6, 1.9, 1.9, 1.5, 1.3, 2.3, 3.2, 3.8,
      3.8, 3.6, 3.1, 2.7, 2.6, 2.9, 4.2, 6.1, 8.5, 10.7, 12.3, 13.1, 12.7, 11.6, 9.8, 7.9, 6.1, 5.1,
      4.7, 4.5, 4.6, 4.6, 4.8, 5.0, 5.0, 5.1, 5.1, 5.2, 5.5, 6.1, 7.0, 8.6, 10.1, 11.6, 12.7, 13.3,
      13.2, 12.3, 11.3, 10.0, 8.7, 7.8, 7.0, 6.2, 5.2, 4.5, 4.0, 3.8, 3.7, 3.7, 3.8, 4.0, 4.6, 5.4,
      6.6, 8.4, 10.4, 12.4, 13.8, 14.6, 14.4, 13.6, 12.3, 11.0, 9.6, 8.5, 7.5, 6.5, 5.4, 4.5, 3.7,
      3.2, 3.0, 2.8, 3.1, 3.4, 3.9, 4.6, 5.9, 7.9, 10.2, 12.2, 13.9, 14.4, 13.8, 12.1, 9.9, 7.6,
      5.5, 4.1, 3.5, 3.3, 3.3, 3.7, 3.9, 3.8, 3.6, 3.2, 3.0, 2.0, 1.8, 1.7, 1.3, 0.8, 0.5, 0.8, 1.3,
      1.8, 2.9, 4.1, 5.0, 6.1, 7.0, 7.1, 5.9, 3.6, 1.9, 1.1
    ],
    "wind_gusts_10m": [
      24.1, 24.1, 20.5, 19.8, 22.0, 20.5, 15.5, 15.8, 27.4, 35.3, 38.9, 41.0, 42.5, 43.9, 35.3,
      32.4, 27.7, 20.9, 20.9, 24.8, 16.9, 19.4, 19.1, 18.7, 16.6, 12.2, 13.3, 13.0, 16.6, 16.2,
      13.3, 20.5, 19.4, 28.8, 34.2, 38.2, 39.6, 38.5, 38.2, 37.8, 38.9, 35.3, 27.7, 27.0, 22.7,
      23.8, 25.2, 23.8, 21.6, 16.9, 23.8, 24.5, 24.1, 25.2, 25.2, 25.2, 25.9, 28.4, 34.2, 43.6,
      49.0, 49.3, 43.6, 43.2, 36.4, 32.4, 27.0, 21.2, 16.2, 14.4, 13.7, 15.8, 17.6, 17.3, 15.8,
      16.6, 16.6, 15.5, 14.4, 19.8, 26.3, 33.1, 36.7, 39.2, 38.9, 37.1, 37.1, 33.1, 27.7, 20.2,
      14.4, 5.0, 13.3, 22.0, 22.3, 21.2, 18.0, 15.1, 14.8, 13.0, 12.6, 9.7, 11.5, 18.4, 28.8, 37.1,
      38.9, 42.1, 43.2, 41.4, 41.8, 39.2, 37.4, 32.8, 24.5, 16.9, 17.3, 13.0, 14.4, 14.0, 11.2,
      11.9, 15.1, 16.9, 20.2, 20.5, 20.9, 20.2, 24.1, 35.3, 43.2, 45.4, 45.4, 44.3, 44.3, 41.0,
      37.8, 30.2, 19.1, 16.6, 15.8, 18.4, 22.3, 22.0, 19.4, 17.3, 16.6, 16.9, 15.8, 15.8, 15.5,
      18.0, 25.9, 35.6, 45.7, 49.0, 49.7, 48.6, 47.9, 47.2, 41.4, 32.4, 23.0, 14.0, 13.0, 9.4, 15.5,
      20.5, 20.9, 19.8, 19.8, 19.1, 18.7, 18.7, 19.4, 22.3, 29.9, 40.0, 47.9, 52.2, 54.4, 55.8,
      56.9, 57.2, 55.8, 52.6, 47.5, 41.8, 34.9, 27.4, 21.6, 18.4, 16.6, 15.1, 13.7, 12.6, 11.9,
      10.8, 9.7, 11.5, 18.0, 27.4, 34.6, 38.5, 40.7, 41.8, 41.4, 40.0, 38.2, 36.4, 33.8, 31.0, 27.4,
      23.4, 19.4, 15.8, 13.0, 10.1, 7.6, 5.8, 4.7, 5.0, 5.4, 7.2, 10.8, 16.6, 23.4, 29.9, 35.6,
      39.6, 41.4, 42.5, 42.5, 41.4, 40.0, 37.8, 34.6, 29.9, 24.5, 19.4, 14.8, 11.5, 9.7, 8.3, 7.9,
      7.9, 8.6, 10.4, 13.3, 18.0, 23.4, 28.4, 33.1, 36.0, 37.4, 37.8, 37.4, 36.7, 35.3, 33.5, 31.0,
      27.7, 23.8, 19.8, 16.6, 14.0, 12.6, 11.9, 11.5, 11.5, 11.9, 12.6, 13.7, 15.8, 18.0, 20.2,
      22.0, 23.4, 24.1, 24.8, 24.8, 24.8, 24.5, 23.8, 22.3, 20.2, 18.0, 15.5, 13.3, 11.9, 10.8,
      10.1, 9.7, 9.7, 10.1, 11.2, 13.0, 15.8, 19.4, 22.7, 25.6, 27.0, 27.4, 27.0, 25.9, 24.5, 23.0,
      21.6, 19.8, 18.0, 15.8, 13.7, 11.9, 10.8, 10.1, 9.7, 9.7, 10.1, 11.2, 13.0, 16.2, 20.5, 25.9,
      31.0, 35.3, 38.2, 39.6, 40.3, 40.0, 39.2, 37.4, 35.6, 32.8, 28.4, 23.4, 18.7, 14.4, 11.9,
      10.4, 9.7, 10.1, 10.8, 12.2, 14.4, 18.0, 22.7, 28.4, 33.8, 38.5, 41.8, 43.6, 44.6, 45.0, 44.3,
      43.2, 41.4, 38.2, 33.8, 28.4, 23.4, 19.1, 16.2, 14.8, 14.4, 15.1, 16.2, 18.0, 20.5, 24.1,
      29.5, 35.6, 41.4, 46.1, 49.0, 49.7, 49.3, 47.9, 45.7, 43.2, 41.0, 38.9, 36.0, 33.1, 29.9,
      27.4, 25.2, 23.4, 21.6, 19.8, 19.1, 19.1, 20.2, 23.4, 28.1, 33.8, 39.6, 44.6, 47.9, 49.3,
      50.0, 49.7, 48.6, 47.2, 45.4, 42.8, 39.2, 34.9, 31.0, 27.0, 24.1, 22.0, 19.4, 17.6, 16.6,
      16.6, 17.6, 20.9, 25.6, 31.7, 37.8, 42.8, 46.1, 47.5, 48.2, 47.9, 46.8, 45.0, 43.2, 40.7,
      36.7, 32.8, 28.4, 24.5, 21.6, 19.4, 17.6, 16.6, 12.5, 8.6, 5.1, 3.2, 4.7, 6.1, 6.8, 7.6, 7.9,
      8.6, 9.4, 9.4, 8.3, 6.5, 5.0, 4.3, 3.6, 3.2, 3.2
    ],
    "precipitation_probability": [
      3, 4, 4, 3, 2, 3, 3, 4, 1, 0, 2, 29, 66, 84, 66, 31, 4, 0, 1, 4, 3, 1, 0, 0, 1, 4, 12, 22, 27,
      23, 14, 6, 0, 0, 0, 19, 46, 61, 51, 28, 12, 9, 12, 16, 21, 28, 33, 35, 35, 37, 46, 57, 61, 51,
      35, 25, 28, 37, 45, 52, 58, 59, 50, 35, 22, 13, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 1, 3, 6, 13, 21, 29, 37, 44, 47, 41, 31, 22, 18, 16, 14, 12, 11, 10, 7, 3, 4,
      12, 24, 33, 34, 31, 31, 39, 50, 57, 57, 53, 49, 45, 41, 37, 34, 32, 29, 25, 21, 18, 17, 18,
      24, 43, 67, 80, 70, 48, 31, 24, 22, 20, 19, 18, 18, 19, 20, 20, 19, 17, 16, 18, 21, 25, 27,
      29, 35, 52, 73, 84, 76, 58, 41, 28, 15, 6, 3, 3, 4, 4, 5, 6, 8, 11, 12, 9, 4, 2, 2, 5, 12, 28,
      48, 59, 51, 33, 18, 10, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 3, 4, 5, 7, 8,
      10, 11, 12, 11, 8, 6, 4, 3, 2, 2, 3, 3, 3, 2, 2, 1, 1, 1, 1, 2, 6, 14, 25, 35, 44, 53, 57, 54,
      46, 37, 28, 18, 10, 5, 3, 1, 0, 0, 0, 2, 4, 7, 11, 15, 20, 27, 34, 41, 47, 52, 55, 53, 49, 44,
      38, 31, 25, 19, 14, 9, 5, 2, 2, 6, 12, 19, 26, 33, 39, 43, 45, 47, 48, 48, 47, 45, 42, 39, 35,
      31, 27, 23, 18, 14, 10, 8, 6, 6, 8, 11, 14, 18, 22, 27, 32, 36, 40, 44, 45, 43, 39, 35, 30,
      25, 20, 16, 13, 11, 9, 8, 8, 10, 14, 18, 22, 26, 29, 30, 31, 31, 31, 30, 29, 28, 26, 24, 22,
      20, 18, 16, 13, 11, 9, 7, 6, 5, 6, 6, 7, 8, 10, 12, 15, 17, 20, 22, 24, 25, 25, 25, 25, 24,
      22, 19, 15, 12, 9, 6, 4, 4, 5, 6, 8, 11, 14, 19, 25, 30, 35, 40, 43, 43, 40, 37, 33, 29, 25,
      22, 19, 17, 15, 13, 12, 13, 14, 16, 18, 21, 24, 27, 31, 34, 37, 40, 41, 41, 40, 38, 36, 34,
      31, 28, 24, 21, 18, 15, 14, 14, 15, 17, 19, 21, 24, 27, 31, 35, 39, 43, 56, 65, 67, 64, 54,
      44, 35, 28, 23, 20, 17, 16, 19, 27, 38, 50, 62, 74, 84, 90, 95, 97, 98, 97, 94, 87, 78, 68, 58
    ],
    "precipitation": [
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.4, 0.3,
      0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.0, 0.0, 0.2, 0.1, 0.0, 0.0, 0.0, 0.0, 0.1,
      0.0, 0.0, 0.0, 0.1, 0.2, 0.0, 0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.7, 0.9,
      0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.0, 0.0, 0.0, 0.0,
      0.2, 0.5, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.0, 0.0, 0.0, 0.1, 0.1,
      0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.2, 0.2, 0.2,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.1,
      0.1, 0.1, 0.3, 0.3, 0.3, 0.3, 0.3, 0.3, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.6, 0.6, 0.6, 0.6, 0.6, 0.6, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 0.1,
      0.1, 0.1, 0.1, 0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 1.1, 1.1, 1.1, 1.1, 1.1, 1.1, 1.2, 1.2,
      1.2, 1.2, 1.2, 1.2, 0.7, 0.7, 0.7, 0.7, 0.7, 0.7, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1,
      0.1, 0.1, 0.1, 0.2, 0.2, 0.2, 0.2, 0.2, 0.2, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.1, 0.1,
      0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0,
      0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.7, 0.7, 0.7, 0.9, 0.9, 0.9, 0.5, 0.5, 0.5, 0.0, 0.0, 0.0, 0.0
    ],
    "is_day": [
      0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1,
      1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1,
      1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0,
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0,
      0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0
    ]
  },
  "daily_units": {
    "time": "iso8601",
    "sunrise": "iso8601",
    "sunset": "iso8601",
    "moon_phase": "fraction"
  },
  "daily": {
    "time": [
      "2026-10-16",
      "2026-10-17",
      "2026-10-18",
      "2026-10-19",
      "2026-10-20",
      "2026-10-21",
      "2026-10-22",
      "2026-10-23",
      "2026-10-24",
      "2026-10-25",
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
      "2026-10-29",
      "2026-10-30",
      "2026-10-31",
      "2026-11-01",
      "2026-11-02",
      "2026-11-03"
    ],
    "sunrise": [
      "2026-10-16T05:41",
      "2026-10-17T05:41",
      "2026-10-18T05:41",
      "2026-10-19T05:41",
      "2026-10-20T05:41",
      "2026-10-21T05:40",
      "2026-10-22T05:40",
      "2026-10-23T05:40",
      "2026-10-24T05:40",
      "2026-10-25T05:40",
      "2026-10-26T05:40",
      "2026-10-27T05:40",
      "2026-10-28T05:40",
      "2026-10-29T05:40",
      "2026-10-30T05:40",
      "2026-10-31T05:41",
      "2026-11-01T05:41",
      "2026-11-02T05:41",
      "2026-11-03T05:41"
    ],
    "sunset": [
      "2026-10-16T17:42",
      "2026-10-17T17:41",
      "2026-10-18T17:41",
      "2026-10-19T17:41",
      "2026-10-20T17:40",
      "2026-10-21T17:40",
      "2026-10-22T17:40",
      "2026-10-23T17:40",
      "2026-10-24T17:39",
      "2026-10-25T17:39",
      "2026-10-26T17:39",
      "2026-10-27T17:39",
      "2026-10-28T17:39",
      "2026-10-29T17:38",
      "2026-10-30T17:38",
      "2026-10-31T17:38",
      "2026-11-01T17:38",
      "2026-11-02T17:38",
      "2026-11-03T17:38"
    ],
    "moon_phase": [
      0.191, 0.221, 0.251, 0.282, 0.313, 0.344, 0.377, 0.411, 0.446, 0.483, 0.52, 0.558, 0.596,
      0.634, 0.671, 0.708, 0.745, 0.78, 0.815
    ]
  }
}
```

---

# Verificación T002 — astronomy-engine y datos del dueño

- **Fecha de ejecución:** 2026-10-19
- **Entorno:** Linux, Node `v24.19.0`, pnpm `11.21.0`
- **astronomy-engine:** **no instalado** en el proyecto (`package.json` no lo incluye). La verificación se hizo contra la documentación oficial y contra el paquete publicado en npm, no contra una copia instalada.
- **Versión de referencia:** `astronomy-engine@2.1.19` (etiqueta `latest` en npm el 2026-10-19), autor cosinekitty, licencia MIT, incluye tipos (`"types": "./astronomy.d.ts"`) y doble salida ESM/CJS.
- **Fuentes:**
  - `README.md` oficial del repositorio (`source/js/README.md` en la rama `master`), obtenido vía Context7 (`/cosinekitty/astronomy`) y vía `raw.githubusercontent.com`.
  - `astronomy.d.ts` del tarball publicado `astronomy-engine-2.1.19.tgz` (descargado y extraído en `/tmp/opencode/astroengine/`), que es la firma real que verá TypeScript.
  - Código fuente `astronomy.js` del mismo tarball, para comprobar detalles que el `.d.ts` no explica (por ejemplo, si `SearchHourAngle` aplica refracción).

Convención: cada sección indica la suposición del SPEC, el método, la firma confirmada y la conclusión.

---

## 12. Firma exacta de cada capacidad del SPEC §5.4

**Suposición del SPEC (§5.4, §13):** los nombres exactos de las funciones de astronomy-engine están por verificar en la documentación oficial.

**Método.** Contraste de las líneas `export declare function` del `astronomy.d.ts` de la versión 2.1.19 con la tabla de capacidades del SPEC §5.4. La ruta `/tmp/opencode/astroengine/package/astronomy.d.ts` es la del verificador.

**Firmas confirmadas (literales del `.d.ts` de la 2.1.19):**

| Capacidad del SPEC §5.4                     | Función confirmada                                                                                | Firma                                                                                                                                                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fase lunar como ángulo (0–360°)             | `MoonPhase`                                                                                       | `MoonPhase(date: FlexibleDateTime): number` — devuelve la diferencia de longitud eclíptica Sol–Luna, en `[0, 360)`: `0` = nueva, `90` = cuarto creciente, `180` = llena, `270` = cuarto menguante                                                                                        |
| Fracción iluminada (0–1)                    | `Illumination`                                                                                    | `Illumination(body: Body, date: FlexibleDateTime): IlluminationInfo` — propiedad `phase_fraction: number` en `[0, 1]`                                                                                                                                                                    |
| Altitud y azimut                            | `Equator` + `Horizon`                                                                             | `Equator(body, date, observer, ofdate: boolean, aberration: boolean): EquatorialCoordinates` y `Horizon(date, observer, ra, dec, refraction?: string): HorizontalCoordinates` — `HorizontalCoordinates` trae `azimuth` en `[0, 360)` (0 = norte, 90 = este) y `altitude` en `[-90, +90]` |
| Salida y puesta de Sol y Luna               | `SearchRiseSet`                                                                                   | `SearchRiseSet(body, observer, direction: number, dateStart: FlexibleDateTime, limitDays: number, metersAboveGround?: number): AstroTime \| null` — `direction` es `+1` para salida y `-1` para puesta                                                                                   |
| Cruce del Sol por una altitud (crepúsculos) | `SearchAltitude`                                                                                  | `SearchAltitude(body, observer, direction: number, dateStart: FlexibleDateTime, limitDays: number, altitude: number): AstroTime \| null` — `direction` `+1` ascendente / `-1` descendente; `altitude` en grados, `[-90, +90]`; el SPEC §4 usa `-6`, `-12` y `-18`                        |
| Elongación (Mercurio, Venus)                | `Elongation`                                                                                      | `Elongation(body, date: FlexibleDateTime): ElongationEvent` — `{ time, visibility: string, elongation: number, ecliptic_separation: number }`; `elongation` en `[0, 180]` y `visibility` vale `"morning"` o `"evening"`                                                                  |
| Magnitud aparente de planetas               | `Illumination`                                                                                    | `Illumination(body, date).mag: number` — misma llamada que la fracción iluminada                                                                                                                                                                                                         |
| Separación angular entre dos cuerpos        | **No hay función directa cuerpo–cuerpo.** Sustituto: `AngleBetween(a: Vector, b: Vector): number` | `AngleBetween` devuelve el ángulo en grados `[0, 180]` entre dos vectores; los vectores salen de `Equator(body, date, observer, ...).vec`. Para Sol–cuerpo existe además `AngleFromSun(body, date): number` (`[0, 180]`)                                                                 |
| Culminación (tránsito por el meridiano)     | `SearchHourAngle` (nativa)                                                                        | `SearchHourAngle(body, observer, hourAngle: number, dateStart: FlexibleDateTime, direction?: number): HourAngleEvent` — con `hourAngle = 0` encuentra la máxima altitud; devuelve `{ time: AstroTime, hor: HorizontalCoordinates }`                                                      |

**Tipos de apoyo confirmados (literales del `.d.ts`):**

```ts
export declare class Observer {
  latitude: number;
  longitude: number;
  height: number;
  constructor(latitude: number, longitude: number, height: number);
}

export declare class HorizontalCoordinates {
  azimuth: number;
  altitude: number;
  ra: number;
  dec: number;
}

export declare class EquatorialCoordinates {
  ra: number;
  dec: number;
  dist: number;
  vec: Vector;
}

export declare class HourAngleEvent {
  time: AstroTime;
  hor: HorizontalCoordinates;
}

export declare class ElongationEvent {
  time: AstroTime;
  visibility: string;
  elongation: number;
  ecliptic_separation: number;
}

export declare class IlluminationInfo {
  time: AstroTime;
  mag: number;
  phase_angle: number;
  helio_dist: number;
  geo_dist: number;
  gc: Vector;
  hc: Vector;
  ring_tilt?: number | undefined;
  phase_fraction: number;
}

export declare enum Body {
  Sun = 'Sun',
  Moon = 'Moon',
  Mercury = 'Mercury',
  Venus = 'Venus',
  Earth = 'Earth',
  Mars = 'Mars',
  Jupiter = 'Jupiter',
  Saturn = 'Saturn',
  Uranus = 'Uranus',
  Neptune = 'Neptune',
  Pluto = 'Pluto',
  SSB = 'SSB',
  EMB = 'EMB' /* Star1..Star8 y Star1..*/,
}
```

Notas de firma:

- El observador es `new Observer(latitude, longitude, height)`; `height` es la altitud en metros, exactamente el campo `elevation` que devuelve Open-Meteo (SPEC §5.4 y §5.1).
- `FlexibleDateTime` admite un `Date` de JavaScript; `astronomy-engine` trabaja en UTC y **no** lleva zona horaria (coincide con SPEC §10).
- En JavaScript `direction` **no es un enum**: es un número (`+1`/`-1`). La documentación de la versión solo muestra las constantes con nombre en otros lenguajes (por ejemplo Kotlin). La app debe pasar los números.
- `Equator` recibe el `observer` y por eso devuelve coordenadas **topocéntricas**, que son las que corresponden a un observador en el lugar (SPEC §5.4).
- Los cuerpos válidos en `Illumination`, `Equator`, `SearchRiseSet`, `SearchAltitude` y `SearchHourAngle` son los del enum `Body`; `Body.Earth` no es válido en varios de ellos.

**Conclusión.** Todas las capacidades del §5.4 tienen función confirmada, salvo la separación angular entre dos cuerpos cualesquiera, que no tiene función propia y se resuelve con `AngleBetween` sobre vectores de `Equator`. No se inventó ningún nombre: todos salen del `.d.ts` y del `README.md` oficiales.

---

## 13. Refracción atmosférica: cómo se activa y si está por defecto

**Suposición del SPEC (§5.4):** «Refracción atmosférica siempre activa en altitudes y en salidas y puestas».

**Método.** Lectura de la firma y del texto de `Horizon`, `SearchRiseSet`, `SearchAltitude` y `SearchHourAngle` en el `README.md` y en el `.d.ts` de la 2.1.19; y lectura del cuerpo de `SearchHourAngle` en `astronomy.js` del tarball.

**Resultado observado.**

- `Horizon(date, observer, ra, dec, refraction?)`: el parámetro es **opcional**. Si se omite (o es un valor falsy), **no** se aplica ninguna corrección. Solo con la cadena `"normal"` se aplica la corrección recomendada (Meeus «Astronomical Algorithms», con un desvanecimiento lineal por debajo de −1°). Existe un modo `"jplhor"` que la documentación marca como «solo para pruebas contra JPL Horizons, no recomendado».
- `SearchRiseSet`: **sí** corrige siempre por refracción. Usa una corrección fija de **34 minutos de arco** y además ajusta por el radio angular aparente del cuerpo. No hay parámetro para desactivarla.
- `SearchAltitude` (crepúsculos): **no** corrige por refracción, y es deliberado. La documentación dice: «By convention for twilight time calculations, the altitude is not corrected for atmospheric refraction. This is because the target altitudes are below the horizon, and refraction is not directly observable». Es coherente con el SPEC §4, que define la oscuridad por la altitud geométrica del Sol a −6°, −12° y −18°.
- `SearchHourAngle`: el `.d.ts` no lo explica, pero el cuerpo de `astronomy.js` de la 2.1.19 llama internamente a `Horizon(time, observer, ofdate.ra, ofdate.dec, 'normal')`. Por tanto el `hor` que devuelve la culminación **sí** viene con refracción.

Cuerpo literal de `astronomy.js` (línea 5382 del tarball):

```js
const hor = Horizon(time, observer, ofdate.ra, ofdate.dec, 'normal');
return new HourAngleEvent(time, hor);
```

**Conclusión.** La refracción **no está activa por defecto**: hay que activarla. La forma recomendada, y la que usará la app, es pasar la cadena `"normal"`:

- En altitud y azimut: `Horizon(date, observer, ra, dec, 'normal')`. Es una decisión de la app; la librería no lo hace sola.
- En salida y puesta: siempre activa dentro de `SearchRiseSet` (34′), sin opción.
- En culminación: activa de serie en el `hor` que devuelve `SearchHourAngle`.
- En los crepúsculos (`SearchAltitude`) queda **sin** refracción, por convención y de forma intencionada. No es un error.

El texto del SPEC §5.4 se ajustó para decir esto con precisión (la app pasa `"normal"` siempre que pide altitud; no se cambió la decisión de fondo).

---

## 14. Culminación: ¿nativa o muestreada?

**Suposición del SPEC (§5.4, §8.5):** si la librería no expone la culminación, usar el máximo de la serie muestreada y marcarlo como aproximado.

**Método.** Búsqueda de «culmination» en el `README.md` oficial y lectura de `SearchHourAngle` en el `.d.ts` y en `astronomy.js`.

**Resultado observado.** La culminación **es nativa**: `SearchHourAngle(body, observer, 0, dateStart)`. El `README.md` lo dice literalmente en la tabla de «Rise, set, and culmination times»: «`SearchHourAngle` — Finds when body reaches a given hour angle for an observer on the Earth. Hour angle = 0 finds culmination, the highest point in the sky». Devuelve un `HourAngleEvent` con `time` (el instante) y `hor.altitude` (la altitud máxima con refracción).

**Conclusión.** **No hace falta el plan B** (máximo de la serie muestreada). La culminación se calcula con `SearchHourAngle` y se muestra como valor exacto, sin la etiqueta de «aproximado». El plan B queda solo como respaldo documentado por si una versión futura cambiara la API; hoy no se usa.

---

## 15. Datos del dueño: petición y estado

**Suposición del SPEC (§9, §13):** faltan coordenadas, altitud y zona horaria de Desierto de la Tatacoa, Desierto de Checua y Lago de Tota, además de los textos «por qué observar aquí» y los textos legales.

**Método.** Relectura de §9 y §11 del SPEC. **No** se consultó ninguna fuente externa para rellenar coordenadas: el SPEC §9 prohíbe usar homónimos o aproximaciones, y la verificación de T001 ya confirmó que la geocodificación de Open-Meteo no devuelve esos tres sitios.

**Petición de datos al dueño — campos exactos por ciudad.** El JSON de la lista curada debe traer, por cada entrada, estos campos:

| Campo         | Tipo     | Notas                                                                                                                                    |
| ------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `slug`        | `string` | Único, estable, minúsculas y guiones. Los previstos en §9: `desierto-de-la-tatacoa`, `desierto-de-checua`, `lago-de-tota`                |
| `name`        | `string` | Nombre para mostrar                                                                                                                      |
| `latitude`    | `number` | Redondeada a 2 decimales. Fuente de verdad: el JSON. No inventar                                                                         |
| `longitude`   | `number` | Redondeada a 2 decimales. Fuente de verdad: el JSON. No inventar                                                                         |
| `elevationM`  | `number` | Altitud en metros, la que escriba el dueño, como referencia. En ejecución astronomy-engine usa la `elevation` que devuelve el pronóstico |
| `timeZone`    | `string` | Zona horaria IANA (por ejemplo `America/Bogota`)                                                                                         |
| `description` | `string` | Texto «por qué observar aquí». Lo escribe el dueño. No rellenar con datos de contaminación lumínica                                      |

Además de las tres ciudades de arriba, el dueño entrega el texto de las páginas legales `/terminos` y `/privacidad` (SPEC §2.1, §11).

**Estado.** Tatacoa, Checua y Lago de Tota **siguen pendientes**. En este archivo **no figura ninguna coordenada, altitud ni zona horaria** de esas tres ciudades: no se han inventado ni aproximado. Bogotá, Guatavita y Villa de Leyva no son parte del bloqueo; el SPEC §9 permite sacarlas de la geocodificación o que las escriba el dueño, y en cualquier caso manda el JSON.

**Conclusión.** El bloqueo de T019 y T025 en su parte de contenido se mantiene hasta que el dueño entregue estos campos y los textos legales.

---

## 16. Desviaciones, límites y puntos que requieren decisión (T002)

1. **La refracción no está activa por defecto, aunque el SPEC §5.4 decía «siempre activa».** Se confirmó que hay que pasar `"normal"` a `Horizon`; `SearchRiseSet` la aplica siempre, y `SearchAltitude` (crepúsculos) no la aplica a propósito. El dueño indicó usar lo más conveniente; se ajustó la redacción del §5.4 para decir que la app pasa `"normal"` siempre y que los crepúsculos son la excepción intencionada, sin reabrir la decisión `[CERRADO]`.
2. **Separación angular sin función directa.** El SPEC pedía «separación angular entre dos cuerpos». No existe una función cuerpo–cuerpo; se documenta `AngleBetween` sobre vectores de `Equator` como sustituto (y `AngleFromSun` para Sol–cuerpo). Afecta al aviso Luna–planeta de §8.5 y a la elongación; ninguna de las dos cambia de fondo.
3. **La versión instalada no se pudo verificar directamente.** astronomy-engine **no está instalado** y añadirlo es T003, no T002. La firma se verificó contra el paquete publicado 2.1.19 (su propio `.d.ts`), que es la firma que verá TypeScript al instalarlo, no contra `node_modules`.
4. **`direction` es un número, no un enum.** En Python/Kotlin la documentación usa `Direction.Rise`/`Direction.Set`; en JavaScript son `+1`/`-1`. No se debe importar un supuesto enum.
5. **`Elongation.visibility` viene en inglés.** Devuelve `"morning"` o `"evening"`; la traducción a «de la mañana» / «de la tarde» (SPEC §8.5) es responsabilidad de la app.
6. **Datos del dueño pendientes.** Sin cambios respecto al SPEC: nada inventado. Ver §15.
7. **Puntos de §13 fuera del alcance de T002.** Quedan las coordenadas/altitud/zona horaria de las ciudades curadas; ya estaban pendientes de T001.
