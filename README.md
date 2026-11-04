# Vesper

App web para aficionados a la astronomía que responde a una pregunta: **¿cómo está el cielo en este lugar, esta noche o en otra noche cercana, y qué objetos podría observar?**

Combina dos fuentes:

- **Clima** de [Open-Meteo](https://open-meteo.com): nubosidad por capas, visibilidad, humedad, viento y precipitación.
- **Astronomía calculada localmente** con [astronomy-engine](https://github.com/cosinekitty/astronomy): Sol, Luna, planetas, crepúsculos y ventanas de observación.

Es un proyecto personal y de portafolio: no es comercial, no tiene dominio propio y la interfaz está en español.

> **Estado — versión 1.0:** app funcionalmente terminada y verificada en local contra los 16 criterios del SPEC §12 (2026-11-04; el criterio 6 pasa con la salvedad D2). La aceptación completa, con evidencia y desviaciones, vive en [`docs/specs/001-vesper/acceptance.md`](./docs/specs/001-vesper/acceptance.md). La publicación en Vercel (T029) queda pendiente de ejecución manual desde el dashboard; cuando exista la URL de producción se añadirá aquí.

## Qué hace

- **Elige el lugar** de cuatro formas: ubicación aproximada por IP al abrir `/`, lista de ciudades curadas, búsqueda por nombre (mínimo 3 caracteres) y GPS del navegador solo tras pulsar «Usar mi ubicación precisa».
- **Muestra las condiciones actuales**: temperatura, humedad, punto de rocío, nubosidad, viento, ráfagas, hora del dato y nivel de oscuridad según la altitud del Sol.
- **Analiza la noche seleccionada**: tira horaria desde una hora antes de la puesta hasta una hora después del amanecer, con nubosidad por capas, visibilidad, humedad, viento, ráfagas y probabilidad de precipitación.
- **Navega entre 18 noches** (de −3 a +14 días). Las noches pasadas se marcan como «pronóstico archivado».
- **Calcula la Luna**: fase entre 8 nombres, porcentaje de iluminación, salida, puesta y altura durante la noche.
- **Encuentra ventanas de observación** para la Luna, Mercurio, Venus, Marte, Júpiter, Saturno, Urano y Neptuno. El Sol se usa como contexto, nunca como objetivo.
- **Ajusta el umbral de altitud** entre 10°, 15°, 20°, 25° y 30° (por defecto 15°). El recálculo es local y no vuelve a pedir datos.
- **Puntúa la noche de 0 a 100** con una palabra —Excelente, Buena, Regular o Mala— para comparar noches en el selector.
- **Trabaja en la zona horaria del lugar**, también cuando es distinta de la del dispositivo.
- **Respeta la privacidad**: sin cuentas, sin base de datos, sin cookies y sin caché persistente en el navegador.

## Stack

- **Next.js 16.4.1** (App Router, `cacheComponents`) + **React 19.3**
- **TypeScript** estricto
- **Tailwind CSS v4**
- **TanStack Query v5** para el estado del servidor en el navegador
- **`fetch` nativo**, sin axios
- **astronomy-engine 2.1.19** para los cálculos astronómicos locales
- **Open-Meteo** para clima y geocodificación (plan gratuito, sin API key)
- **React Hook Form** para el buscador de lugares
- **Vitest** para las pruebas de dominio
- **Vercel** como hosting

## Empezar

Requiere **Node.js 20.9 o superior** y [pnpm](https://pnpm.io) 11.

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

No hacen falta claves de API. La variable `NEXT_PUBLIC_SITE_URL` es opcional en local: si no se define, se usa `http://localhost:3000` para `metadataBase`, el sitemap y `robots`. Para configurarla, copia `.env.example` a `.env.local` y asígnale la URL pública.

### Comandos

| Comando             | Qué hace                                     |
| ------------------- | -------------------------------------------- |
| `pnpm dev`          | Servidor de desarrollo con Turbopack.        |
| `pnpm build`        | Build de producción.                         |
| `pnpm start`        | Sirve el build de producción.                |
| `pnpm lint`         | ESLint sobre todo el repositorio.            |
| `pnpm typecheck`    | `tsc --noEmit` con TypeScript estricto.      |
| `pnpm test`         | Suite de Vitest: 26 archivos y 376 pruebas.  |
| `pnpm test:watch`   | Vitest en modo interactivo.                  |
| `pnpm format`       | Prettier con `prettier-plugin-tailwindcss`.  |
| `pnpm format:check` | Comprueba el formato sin modificar archivos. |

## Rutas y URL

| Ruta            | Descripción                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------- |
| `/`             | Redirección temporal (`307`) a `/clima/<slug>` con las cabeceras de IP de Vercel. Sin cabeceras, va a Bogotá. |
| `/clima/[slug]` | Pantalla principal. Acepta ciudades curadas, lugares buscados y slugs de solo coordenadas.                    |
| `/terminos`     | Términos de uso.                                                                                              |
| `/privacidad`   | Política de privacidad.                                                                                       |
| `/sitemap.xml`  | Sitemap con las rutas indexables.                                                                             |
| `/robots.txt`   | Reglas de rastreo y enlace al sitemap.                                                                        |

La URL es la fuente de verdad de la ubicación y de la noche:

```text
/clima/bogota                         # ciudad curada
/clima/zipaquira_5.02_-73.99          # lugar buscado: etiqueta_lat_lon
/clima/4.61_-74.08                    # solo coordenadas (IP o GPS)
/clima/bogota?date=2026-11-08         # noche D en el calendario local
```

- Las coordenadas se redondean a **2 decimales** (~1 km) en la URL, en las claves de caché y en las peticiones.
- `?date=YYYY-MM-DD` es el día local en el que **empieza** la noche. El rango disponible es **D −3 a D +14** (18 noches).
- Sin `?date=` se muestra la noche actual. Una fecha inválida o fuera de rango no rompe la página: muestra un mensaje y mantiene el lugar usable.
- Cambiar de noche actualiza la URL con `router.replace`, sin recargar y sin nuevas peticiones a Open-Meteo.
- Un slug con formato inválido responde **404**.

## Cómo funciona

### Clima y reparto de red

Open-Meteo entrega 19 días de datos (`past_days=3`, `forecast_days=16`). La app hace dos peticiones distintas: pronóstico (`hourly` + `daily`) y condiciones actuales (`current`).

| Dato                             | Quién lo pide | Caché                                                                  |
| -------------------------------- | ------------- | ---------------------------------------------------------------------- |
| Pronóstico de ciudades curadas   | Servidor      | `'use cache'` + `cacheLife('hours')` (3600 s); se incrusta en el HTML. |
| Pronóstico de lugares no curados | Navegador     | `cache: 'no-store'` + TanStack Query (1 h de frescura).                |
| Condiciones actuales («Ahora»)   | Navegador     | TanStack Query: 30 min de frescura y refresco automático cada 30 min.  |
| Geocodificación de búsquedas     | Navegador     | Memoria de la sesión.                                                  |
| Redirección de `/`               | Servidor      | Solo cabeceras; no llama a Open-Meteo.                                 |

TanStack Query mantiene los datos en memoria de la pestaña durante **24 horas** (`gcTime`), pero no los persiste en `localStorage`, `sessionStorage`, IndexedDB ni Cache Storage. Al cerrar la pestaña desaparecen. Las ciudades curadas cargan con el pronóstico ya incluido en el HTML; el resto pide sus datos al navegador.

### Astronomía local

Todo el cálculo astronómico ocurre en el dispositivo, sin red, con `astronomy-engine`:

- **Sol** para crepúsculos y nivel de oscuridad (no genera ventanas de observación).
- **Luna** como fuente única de fase, iluminación, posición, salida y puesta. No se mezcla con el `moon_phase` de Open-Meteo.
- **Planetas** con altitud, azimut, magnitud, elongación (Mercurio y Venus) y culminación.
- **Muestreo cada 10 minutos** a lo largo de la noche para construir las ventanas de observación.

### Noche, ventanas y puntuación

La **noche D** va de la puesta del Sol en D al amanecer en D+1. La tira visible añade una hora de margen a cada lado. Los datos usan los días D y D+1 del pronóstico y no asumen 24 horas por día: los cambios de hora producen días de 23 o 25 horas.

Una **ventana de observación** exige, a la vez: altitud mínima, oscuridad suficiente para el objeto, brillo adecuado, elongación suficiente (Mercurio y Venus) y ausencia de interferencia lunar problemática. Cada ventana muestra inicio, fin, altitud máxima, culminación y la peor clase de nubosidad. La «mejor ventana» se elige por menor nubosidad, luego mayor altitud y luego mayor duración.

La **puntuación de la noche** (0–100) combina nubosidad (55 %), viento (20 %), humedad (15 %) y probabilidad de lluvia (10 %), calculada solo con horas en las que el Sol está por debajo de −18°. A la media se le resta la interferencia lunar según iluminación y fracción de la noche con la Luna sobre el horizonte. El resultado se etiqueta como Excelente, Buena, Regular o Mala. Los detalles y bordes exactos están en el [SPEC §8.6](./docs/specs/001-vesper/SPEC.md).

### Zona horaria y estados

Todas las horas se muestran en la zona horaria del lugar, tomada de Open-Meteo. Cuando difiere de la del dispositivo, la interfaz lo avisa. Si la noche no existe (sol de medianoche o noche polar), se muestra «Sin noche astronómica este día» y el selector sigue navegable. Los valores nulos del pronóstico se tratan como desconocidos, nunca como cero.

La interfaz cubre carga con esqueletos, error con reintento, dato antiguo en memoria, falta de red, lugar sin pronóstico, límite de peticiones (429), fecha inválida y latitudes altas.

## Estructura del proyecto

```text
src/
├── app/                      # Rutas y layouts de Next.js (sin lógica de negocio)
├── components/               # UI compartida: marca, atribución y estados
├── lib/
│   ├── api/                  # Cliente fetch, errores y política de reintentos
│   ├── constants/            # Rutas y constantes de query
│   ├── providers/            # QueryClient y umbral de altitud
│   └── utils/                # URL del sitio y validaciones
└── modules/
    ├── location/             # Coordenadas, slugs, zona horaria, búsqueda, GPS y ciudades curadas
    ├── weather/              # Servicios, hooks y queries de Open-Meteo
    ├── astronomy/            # Observador, Sol, Luna, planetas y muestreo
    ├── night/                # Noche, nubosidad, fases, ventanas, mejor ventana y puntuación
    └── legal/                # Contenido de términos y privacidad
```

Cada módulo separa `components/`, `hooks/`, `services/`, `types/`, `utils/` y `constants/`. Las pruebas viven junto al archivo que prueban con sufijo `*.test.ts`. Las rutas se importan siempre desde `src/lib/constants/routes.constants.ts`, nunca se escriben a mano en los componentes.

## Ciudades curadas

Estas seis ciudades tienen página prerenderizada, metadata propia y pronóstico inicial incrustado:

| Ciudad                 | Slug                     |
| ---------------------- | ------------------------ |
| Bogotá                 | `bogota`                 |
| Guatavita              | `guatavita`              |
| Villa de Leyva         | `villa-de-leyva`         |
| Desierto de la Tatacoa | `desierto-de-la-tatacoa` |
| Desierto de Checua     | `desierto-de-checua`     |
| Lago de Tota           | `lago-de-tota`           |

La lista vive en `src/modules/location/constants/curated-cities.ts` y alimenta `generateStaticParams`, el sitemap, la metadata y el HTML inicial. Cualquier otro slug válido se genera bajo demanda y pide sus datos desde el navegador.

## SEO, legal y privacidad

- `metadataBase` se construye con `NEXT_PUBLIC_SITE_URL`; el sitemap y `robots` usan el mismo origen.
- Las ciudades curadas son indexables. Los slugs de coordenadas y de búsqueda llevan `noindex`.
- `/terminos` y `/privacidad` existen con texto de la versión 1.0; no se inventa contenido legal pendiente.
- La atribución a Open-Meteo (CC-BY 4.0) es visible en el pie de todas las páginas.
- No hay cuentas, anuncios, analítica, cookies ni base de datos propia. La ubicación por IP y el GPS solo eligen el lugar que se muestra; las coordenadas se envían a Open-Meteo para obtener el pronóstico.

## Accesibilidad

La interfaz usa HTML semántico, etiquetas ARIA donde hacen falta, navegación por teclado, foco visible y contraste alto. La información no depende solo del color: la nubosidad y la puntuación llevan texto además del color. Las animaciones respetan `prefers-reduced-motion` y la carga usa esqueletos del tamaño final para evitar saltos de diseño.

## Despliegue en Vercel

El despliegue se hace manualmente desde el dashboard de Vercel. No hace falta `vercel.json`: el proyecto es un Next.js estándar, Vercel aplica su preset y **no** se usa `output: 'export'`, porque la caché del servidor necesita el runtime de Next.js.

1. Importa el repositorio en Vercel y deja que detecte Next.js.
2. Define la variable de entorno `NEXT_PUBLIC_SITE_URL` con la URL de producción (por ejemplo, `https://<proyecto>.vercel.app`). Es la base de `metadataBase`, del sitemap y de `robots`.
3. Despliega y verifica en producción:
   - `curl -I https://<deploy>/` debe devolver `307` y usar las cabeceras de IP de Vercel.
   - Sin cabeceras de IP debe redirigir a `/clima/bogota`.
   - `/clima/bogota` y un slug no curado deben mostrar la atribución a Open-Meteo.
   - El botón «Usar mi ubicación precisa» debe funcionar por HTTPS.
   - La regeneración de las ciudades curadas debe respetar 3600 s.
4. Añade la URL a este README y a [`docs/specs/001-vesper/acceptance.md`](./docs/specs/001-vesper/acceptance.md), y marca T029 como terminada.

> El build depende de que Open-Meteo responda durante el prerenderizado. Si agota el tiempo de conexión, el build falla en lugar de generar la página sin datos iniciales. Está documentado como D4 en `acceptance.md` y requiere una corrección autorizada.

## Limitaciones conocidas de la versión 1

| ID  | Limitación                                                                                 | Detalle                                                               |
| --- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| D1  | El build hace 2 peticiones por ciudad curada (12 en total, no 6).                          | Solo pide pronósticos curados; no afecta al comportamiento de la app. |
| D2  | La salida y puesta de la Luna no modelan la depresión del horizonte por altitud del sitio. | Diferencia ≤2 min contra horizonte geométrico; 7–9 min en Bogotá.     |
| D3  | El panel lunar muestra los eventos del día local D, no exclusivamente los de la noche.     | El texto «Luna de esta noche» puede inducir a error.                  |
| D4  | El build falla si Open-Meteo agota el tiempo de conexión.                                  | El SPEC §7.5 pide degradar a página sin datos iniciales.              |
| D5  | La verificación en producción está pendiente de la URL y del despliegue manual.            | T029.                                                                 |

Las causas, evidencias y decisiones están en [`acceptance.md`](./docs/specs/001-vesper/acceptance.md).

## Documentación

- [`docs/specs/README.md`](./docs/specs/README.md) — estructura de los paquetes de spec.
- [`docs/specs/001-vesper/SPEC.md`](./docs/specs/001-vesper/SPEC.md) — especificación funcional y de arquitectura.
- [`docs/specs/001-vesper/PLAN.md`](./docs/specs/001-vesper/PLAN.md) — fases, dependencias y criterios de salida.
- [`docs/specs/001-vesper/tasks/README.md`](./docs/specs/001-vesper/tasks/README.md) — índice y orden de las tasks.
- [`docs/specs/001-vesper/acceptance.md`](./docs/specs/001-vesper/acceptance.md) — criterios §12, red, casos límite y contraste astronómico.
- [`docs/specs/001-vesper/verification-notes.md`](./docs/specs/001-vesper/verification-notes.md) — verificaciones de Open-Meteo, astronomy-engine y Next.js.
- [`docs/specs/001-vesper/design/README.md`](./docs/specs/001-vesper/design/README.md) — referencias visuales.
- [`design.md`](./design.md) — sistema visual «Nocturnal Observatory».
- [`AGENTS.md`](./AGENTS.md) — convenciones de código y reglas para agentes.

## Créditos

- Datos de clima y geocodificación: [Open-Meteo](https://open-meteo.com), licencia [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/).
- Cálculos astronómicos: [astronomy-engine](https://github.com/cosinekitty/astronomy), © Don Cross, licencia MIT.
- Next.js, React, TanStack Query y Tailwind CSS, con sus respectivas licencias MIT.
- Hosting: [Vercel](https://vercel.com).

Vesper es un proyecto personal de portafolio, sin fines comerciales.
