# PLAN — Vesper

> **Rol de este documento.** El [`SPEC.md`](./SPEC.md) define **qué** se construye y qué decisiones están cerradas. Este plan define **en qué orden** se construye, qué depende de qué y cuándo una fase se considera terminada. Las tasks se generarán después a partir de este plan; todavía no existen.
>
> El plan **no reduce el alcance** ni reabre decisiones `[CERRADO]`. Si hay contradicción entre documentos, manda el SPEC. Si aparece una ambigüedad o una suposición falsa, se pregunta al dueño antes de improvisar.
>
> Las fases son **orden de construcción**, no entregables parciales ni un MVP. El alcance completo del SPEC se implementa en su totalidad.

## 1. Estructura documental

La documentación vive en `docs/specs/`:

```text
docs/specs/
├── README.md
└── 001-vesper/
    ├── SPEC.md
    ├── PLAN.md
    ├── design/               # imágenes de referencia de diseño (llegarán más adelante)
    │   └── README.md
    └── tasks/
        ├── README.md
        └── TNNN-<slug>.md
```

Reglas:

- Cada spec futura ocupa `docs/specs/NNN-<slug>/` con su propio `SPEC.md`, `PLAN.md` y `tasks/`.
- El SPEC es la fuente de verdad funcional. El plan no lo duplica: lo secuencia.
- Las tasks serán archivos `TNNN-<slug>.md` dentro de `tasks/`, una por unidad ejecutable.
- Nada de esto vive suelto en la raíz del repositorio.

## 2. Punto de partida del repositorio

- Next.js 16.4.1, React 19.3, TypeScript estricto y Tailwind CSS v4.
- Proyecto Next.js inicial: solo layout, página de ejemplo y estilos base.
- Aún no están instalados TanStack Query, astronomy-engine, React Hook Form ni las herramientas de formato/pruebas.
- `next.config.ts` activa `cacheComponents`, `partialPrefetching` y `agentFeedback`. Hay que verificar su interacción con la generación estática, `revalidate` y las rutas dinámicas antes de construir encima.
- `SPEC.md` ya está ubicado en `docs/specs/001-vesper/`.

## 3. Invariantes de implementación

Estas reglas aplican a todas las fases y no se negocian durante la implementación:

1. **La URL es la fuente de verdad** de la ubicación (`slug`) y de la noche (`?date=`). El parámetro de fecha se lee solo en cliente.
2. **El servidor solo pide Open-Meteo para ciudades curadas.** Nunca resuelve slugs buscados o de coordenadas, nunca pide `current` y nunca envía `elevation`.
3. **Una sola función compartida de `fetch`** bifurca: servidor con `next: { revalidate: 3600 }`; cliente con `cache: 'no-store'`. El cliente no lleva `revalidate`.
4. **Astronomía local y única.** astronomy-engine es la única fuente para la Luna; no se mezcla con `moon_phase` de Open-Meteo. No hay llamadas de red para calcular.
5. **Todas las horas se interpretan en la zona horaria del lugar.** UTC solo existe en el límite con astronomy-engine. La fecha del dispositivo nunca decide qué noche es.
6. **Sin errores de hidratación.** El HTML de ciudades curadas es estable; lo que depende de “ahora”, `?date=`, GPS o del umbral elegido se resuelve tras montar.
7. **Datos faltantes son desconocidos, no cero.** Un valor nulo no se sustituye por cero ni se inventa.
8. **`app/` solo contiene páginas y layouts.** La lógica vive en `modules/`; los componentes compartidos, en `components/`; las rutas, en `lib/constants/routes.constants.ts`. Se respetan las convenciones de `AGENTS.md`.

### 3.1 Mapa de módulos

```text
src/modules/
├── location/   # entidad de ubicación, coordenadas, slug, zona horaria, lista curada, búsqueda y GPS
├── weather/    # Open-Meteo: pronóstico, bloque actual, servicios y queries
├── astronomy/  # astronomy-engine: observador, Sol, Luna, planetas y muestreo
├── night/      # modelo de noche, nubosidad, fases, ventanas, mejor ventana y puntuación
└── legal/      # contenido de las páginas de términos y privacidad
```

Cada módulo organiza sus `components/`, `hooks/`, `services/`, `types/` y `constants/` según `AGENTS.md`. El módulo `night` consume `weather` y `astronomy`; `location` no depende de los demás.

## 4. Fases

| Fase | Resultado principal                              | Depende de   | Referencias del SPEC |
| ---- | ------------------------------------------------ | ------------ | -------------------- |
| F0   | Suposiciones verificadas y decisiones cerradas   | —            | §5, §6, §7, §13      |
| F1   | Base del proyecto, dependencias y tooling        | F0           | §3, §11              |
| F2   | Dominio, slug, fechas y modelo de noche          | F1           | §4, §6.2, §6.3, §10  |
| F3   | Capa de datos, queries y caché                   | F2           | §5.1–5.3, §7         |
| F4   | Motor astronómico local                          | F2           | §5.4                 |
| F5   | Análisis de noche, ventanas y puntuación         | F2, F3, F4   | §4, §8.3–8.6         |
| F6   | Rutas, ubicación, búsqueda, GPS y ciudades       | F2, F3       | §6, §8.1, §9         |
| F7   | Pantalla principal completa y estados            | F5, F6       | §8.2, §8.7           |
| F8   | SEO, legal, privacidad y atribución              | F6, F7       | §9, §11              |
| F9   | Calidad, aceptación y despliegue                 | F0–F8        | §7.1, §10, §12       |

### F0 — Verificación y decisiones

**Objetivo:** eliminar las incertidumbres que podrían contaminar la arquitectura antes de escribir código de producción.

**Trabajo:**

- Contrastar con documentación oficial (Context7 y fuentes primarias) los puntos `[POR VERIFICAR]` del SPEC §13:
  - variables de Open-Meteo en `hourly`/`current`;
  - combinación válida de `past_days=3` y `forecast_days=16`;
  - formato y escala de `moon_phase`;
  - campos reales de geocodificación;
  - peso de la consulta en el contador de llamadas;
  - cabeceras de IP de Vercel;
  - funciones de astronomy-engine, refracción y culminación;
  - opción exacta de TanStack Query para fijar la hora del dato inicial;
  - comportamiento de `revalidate` en Next.js 16.4.1 con la configuración actual.
- Probar las respuestas reales de Open-Meteo en desarrollo, incluyendo errores 400 y 429.
- Verificar si leer `?date=` en cliente exige un límite de `Suspense` en esta versión de Next.js.
- Confirmar el efecto de `cacheComponents` y `partialPrefetching` sobre rutas estáticas, `generateStaticParams` y regeneración. Si la configuración estorba al modelo del SPEC, proponer el cambio y consultarlo.
- Obtener del dueño los datos que faltan: coordenadas/altitud/zona horaria de Tatacoa, Checua y Lago de Tota; textos legales; textos “por qué observar aquí”.
- Confirmar que las decisiones de producto ya resueltas (sección 5) quedan registradas en el SPEC.

**Salida:** SPEC actualizado con los resultados (`[VERIFICADO]` o corrección acordada) y decisiones registradas. Si una suposición resulta falsa, se avisa al dueño y se ajusta el SPEC antes de seguir.

**Puerta:** ninguna incertidumbre pendiente puede bloquear F1–F3. Los textos del dueño pueden quedar pendientes, pero no se inventan.

### F1 — Base del proyecto y tooling

**Objetivo:** dejar el esqueleto técnico listo para que las fases siguientes solo añadan dominio y funcionalidad.

**Trabajo:**

- Instalar y fijar dependencias: `@tanstack/react-query`, `astronomy-engine`, `react-hook-form`; herramientas de desarrollo para formato y pruebas de lógica pura.
- Configurar Prettier con `prettier-plugin-tailwindcss`, scripts de `lint`, `typecheck`, `test` y `format`, y `.env.example` (sin claves; Open-Meteo no las usa).
- Crear `Providers` con un `QueryClient` por sesión del navegador, montado en el layout raíz, con `staleTime` y `gcTime` por defecto coherentes con el SPEC.
- Definir la base visual global, el layout raíz, metadata base y los componentes compartidos mínimos: estados de carga, error y vacío, esqueletos y atribución.
- Crear `lib/constants/routes.constants.ts` con todas las rutas, incluida la ruta de detalle.
- Preparar la estructura `modules/`, `components/` y `lib/` según `AGENTS.md`.
- Configurar el entorno de pruebas para funciones puras (slug, fechas, noche, nubosidad, puntuación). No se plantean pruebas end-to-end en esta fase.

**Puerta:** `pnpm lint`, `pnpm typecheck` y `pnpm build` pasan; el `QueryClient` no se recrea al navegar; `app/` sigue sin lógica de negocio.

### F2 — Dominio, URL y tiempo

**Objetivo:** implementar el modelo que sostiene toda la app: ubicación, slug, fecha local y noche.

**Trabajo:**

- Tipos de ubicación, coordenadas, pronóstico, respuesta actual, resultados de geocodificación y errores de API.
- Redondeo de coordenadas a 2 decimales, mitad alejándose de cero; construcción y parseo de los tres tipos de slug del SPEC §6.2, conservando el signo `-` y sin partir nombres con guiones.
- Validación estricta de latitud, longitud y `?date=YYYY-MM-DD`; rango D = −3…+14 relativo al “hoy” del lugar.
- Utilidades de zona horaria con `Intl` (o equivalente): fecha local, medianoche local, “hoy” y conversión de instantes.
- Modelo de noche D: `sunset` de D, `sunrise` de D+1, tira visible con una hora de margen, filas horarias que solapan y agrupación por fecha local, sin asumir 24 filas.
- Cálculo de la noche actual, incluida la madrugada, y estado explícito sin noche actual para latitudes altas sin `sunrise`/`sunset`.
- Pruebas de tabla para slug, redondeo, rango de fechas, cambios de hora, hemisferio sur y nombres con guiones.

**Puerta:** los casos límite del SPEC §10 tienen prueba o comportamiento explícito; ninguna fecha se decide con la zona del dispositivo.

### F3 — Capa de datos y caché

**Objetivo:** centralizar Open-Meteo y TanStack Query con el reparto servidor/cliente del SPEC.

**Trabajo:**

- Función única de `fetch` para Open-Meteo: construye la URL, comprueba `response.ok`, conserva estado y cuerpo del error, propaga `AbortSignal` y bifurca servidor/cliente.
- Servicios separados para pronóstico (`hourly` + `daily`), bloque `current` y geocodificación; tipos y guardas de respuesta sin `as` inseguros.
- Query keys `['forecast', lat, lon]` y `['current', lat, lon]` con coordenadas ya redondeadas; claves de geocodificación para la caché de sesión.
- Hooks de pronóstico y “ahora” con `staleTime` de 1 h y 30 min, `gcTime` de 24 h, refresco automático de 30 min solo para “ahora”, pausa con pestaña oculta y política de reintentos del SPEC.
- Prefetch del pronóstico al elegir una búsqueda; `initialData` + hora real de obtención para ciudades curadas.
- Contrato servidor↔cliente para entregar el pronóstico precargado y su `fetchedAt` sin filtrar lógica de servidor al navegador.
- Pruebas de construcción de URL, errores 4xx/5xx/429 y ramas de caché.

**Puerta:** una ruta no curada no genera peticiones de servidor; una petición de navegador no lleva `revalidate`; los 4xx no se reintentan salvo 429; “ahora” se refresca sin invalidar el pronóstico.

### F4 — Motor astronómico local

**Objetivo:** encapsular astronomy-engine y producir todos los datos astronómicos que consume la interfaz.

**Trabajo:**

- Módulo de astronomía con observador (latitud, longitud y `elevation` del pronóstico) y conversión explícita UTC ↔ hora local.
- Fase lunar como ángulo y fracción iluminada; altitud, azimut y salida/puesta de Sol y Luna con refracción.
- Crepúsculos por cruce de altitudes del Sol; posiciones de planetas; elongación de Mercurio y Venus; magnitud aparente; separación angular; culminación.
- Si la librería no expone la culminación, usar el máximo de la serie muestreada y marcarlo como aproximado.
- Muestreo cada 10 minutos a lo largo de la tira visible, reutilizable por todos los objetos.
- Cálculo en servidor para el HTML de ciudades curadas con umbral por defecto; cálculo en cliente para “ahora”, umbral elegido y cambios de lugar.
- Pruebas de humo de posiciones, fase y horas de salida/puesta; contraste manual posterior con Stellarium, Heavens Above o JPL Horizons.

**Puerta:** no hay red en el módulo; la Luna sale de una sola fuente; las horas de Sol/Luna son coherentes con una fuente externa dentro de uno o dos minutos para Bogotá y otro lugar.

### F5 — Análisis de noche, ventanas y puntuación

**Objetivo:** convertir clima y astronomía en las respuestas que ve el usuario: nubosidad útil, ventanas, mejor ventana y nota de la noche.

**Trabajo:**

- Nubosidad ponderada por capas, clase de la hora y tratamiento de capas faltantes como desconocidas.
- Nombre e icono de las 8 fases lunares con los tramos semiabiertos del SPEC §8.4; porcentaje de iluminación siempre visible.
- Ventanas de observación de Luna y planetas con muestreo de 10 min, umbral de altitud configurable, oscuridad acumulativa por objeto, brillo, elongación, interferencia lunar y peor clase de nubosidad.
- Tolerancia a un hueco aislado de muestreo para no partir una ventana; horas “no óptimas” fuera de ventanas.
- Ventana sin Luna destacada para Urano y Neptuno y avisos de separación Luna–planeta.
- Resumen de “mejor ventana” de la noche por nubosidad, altitud y duración.
- Puntuación horaria y nocturna del SPEC §8.6: horas válidas bajo −18°, pesos, escalones, resta lunar por iluminación y solape, recorte a 0 y palabras.
- Etiqueta “sin noche astronómica” y “pronóstico archivado”.
- Pruebas de tabla para todos los bordes de escalones, nulos, solape lunar, nota 45 y nota 65.

**Puerta:** las fórmulas y bordes del SPEC están cubiertos por pruebas; cambiar el umbral o la noche recalcula solo en local, sin nuevas peticiones.

### F6 — Rutas, ubicación, búsqueda y GPS

**Objetivo:** implementar la navegación y las cuatro formas de elegir ubicación.

**Trabajo:**

- `/` dinámica: leer cabeceras de IP de Vercel, redirigir con 307 al slug de coordenadas redondeadas o a Bogotá si no hay cabeceras. Sin Open-Meteo.
- `/clima/[slug]`: página servidor que valida el slug, responde 404 si es inválido, prerenderiza solo ciudades curadas, define metadata propia y entrega el pronóstico inicial solo para curadas.
- `generateStaticParams` con la lista curada; `dynamicParams` para slugs válidos no curados; metadata no indexable para estos últimos.
- Precarga de datos de ciudades curadas con `revalidate: 3600`; si falla en build o regeneración, página sin datos iniciales y cliente que los pide.
- Contenedor cliente: lee slug y `?date=`, usa las queries, aplica `initialDataUpdatedAt`, actualiza la URL con `router.replace` y muestra esqueleto al cambiar de lugar.
- Selector de ubicación con lista curada, buscador React Hook Form (mínimo 3 caracteres, solo al pulsar, `count=7`, `language=es`), nombres con región/país y caché de sesión.
- GPS solo con botón explícito; manejo de rechazo, timeout y fallo; slug de coordenadas.
- Nombre visible: curado, etiqueta del slug en enlace frío, “Ubicación aproximada” para IP o nombre recordado de la búsqueda.
- Aviso de zona horaria del lugar cuando difiere de la del dispositivo.

**Puerta:** se cumplen los criterios 11, 12, 15 y 16 del SPEC; un slug inválido da 404; un slug válido no curado responde 200 y pide datos solo desde el navegador.

### F7 — Pantalla principal y estados

**Objetivo:** construir la experiencia completa de `/clima/[slug]` sobre el dominio y las rutas ya listos.

**Trabajo:**

- Bloque “Ahora”: temperatura, humedad, rocío, nubosidad, viento, ráfagas, hora del dato, día/noche (`is_day`) y oscuridad por altitud del Sol.
- Bloque “Esta noche”: tira horaria desde una hora antes de la puesta hasta una hora después del amanecer, con margen visual, nubosidad por capas, visibilidad, humedad, diferencia temperatura/rocío, viento, ráfagas y precipitación.
- Resumen de mejor ventana, información lunar y lista de ventanas por objeto con inicio, fin, altitud máxima, culminación y peor nubosidad.
- Selector horizontal de noches −3…+14 con palabra y número de la nota, nubosidad media, indicación de lluvia probable (≥ 60 % en horas válidas) y “sin noche astronómica”; bloqueo en los extremos.
- Selector de umbral de altitud 10/15/20/25/30° en estado de sesión, sin URL ni `localStorage`.
- Etiqueta “pronóstico archivado” y aviso de que las horas son locales del lugar.
- Estados completos: carga con esqueletos, error con reintento, dato viejo en memoria con aviso, sin red, lugar sin datos, 429, fecha inválida/fuera de rango y latitudes altas.
- Accesibilidad: navegación por teclado, etiquetas, contraste, información que no dependa solo del color y respeto a `prefers-reduced-motion`.
- Evitar desajustes de hidratación: lo dependiente de “ahora”, fecha, GPS y umbral se resuelve tras montar.

**Puerta:** se cumplen los criterios 1–10, 13 y 14 del SPEC; no hay errores de hidratación; la vista funciona en móvil y escritorio.

### F8 — SEO, legal, privacidad y atribución

**Objetivo:** cerrar las superficies públicas y legales de la app.

**Trabajo:**

- Metadata única para cada ciudad curada; `noindex` para slugs de coordenadas y búsquedas; sitemap y robots con las rutas indexables.
- Páginas `/terminos` y `/privacidad` con el texto entregado por el dueño. Si aún no existe, dejar la ruta y un estado explícito de texto pendiente, sin inventar contenido legal.
- Privacidad: coordenadas enviadas a Open-Meteo desde navegador y servidor, retención de registros de Open-Meteo, uso de IP/GPS, ausencia de almacenamiento propio y exposición de coordenadas al compartir un slug.
- Atribución visible a Open-Meteo con enlace y mención de CC-BY 4.0.
- Páginas `not-found` y `error` coherentes con el resto de la interfaz.
- Aviso de que la app no es comercial y no usa cuentas ni almacenamiento persistente.

**Puerta:** la atribución es visible; las rutas legales existen; no se inventa texto legal; la metadata de ciudades curadas es correcta y la de lugares no curados no es indexable.

### F9 — Calidad, aceptación y despliegue

**Objetivo:** demostrar que la app completa cumple el SPEC y dejarla publicada en Vercel.

**Trabajo:**

- Ejecutar la lista completa de criterios de aceptación del SPEC §12.
- Verificar el reparto de red del §7.1: peticiones de servidor solo para curadas, peticiones de navegador sin `revalidate`, número de peticiones de build igual al de ciudades curadas.
- Probar zonas horarias distintas de la del dispositivo, cambio de hora, latitudes altas, noches pasadas, último día del pronóstico, datos nulos y 429.
- Contrastar fase, iluminación, salida y puesta con una fuente externa para Bogotá y otro lugar.
- Revisar accesibilidad, rendimiento, responsive y `prefers-reduced-motion`.
- Ejecutar lint, typecheck, pruebas y build de producción.
- Desplegar en Vercel, comprobar la redirección 307, las cabeceras de IP, el HTTPS para GPS y el comportamiento de regeneración.
- Actualizar README y documentación de estado.

**Puerta:** todos los criterios del SPEC §12 pasan; no queda ningún `[POR VERIFICAR]` que afecte al comportamiento; solo pueden quedar pendientes los contenidos que dependen del dueño.

## 5. Decisiones resueltas y dependencias externas

Decisiones cerradas durante la planificación y ya registradas en el SPEC:

| Tema                            | Decisión                                                                            |
| ------------------------------- | ----------------------------------------------------------------------------------- |
| Criterio de “mejor ventana”     | Clase de nubosidad (menor `nube`), luego mayor altitud máxima, luego mayor duración. |
| Umbral de “lluvia probable”     | Máximo de `precipitation_probability` ≥ 60 % en las horas válidas de la nota.        |
| Nubosidad del selector de noches | Media de `nube` en las horas válidas de la nota.                                    |
| Qué cuenta como “objeto débil”  | Urano y Neptuno.                                                                     |
| Noche actual sin `sunrise`/`sunset` | Estado explícito de “sin noche astronómica”, sin noche actual; fecha por defecto el día local. |

Pendientes que dependen de terceros o de verificación:

| Tema                                                          | Estado        | Fase   | Acción                                                               |
| ------------------------------------------------------------- | ------------- | ------ | -------------------------------------------------------------------- |
| Verificaciones del SPEC §13                                   | Por verificar | F0     | Contrastar con documentación y respuestas reales; actualizar el SPEC. |
| Textos de `/terminos` y `/privacidad`                         | Abierto       | F8     | Los entrega el dueño. No inventarlos.                                |
| Textos “por qué observar aquí” de las ciudades                | Abierto       | F6, F8 | Los entrega el dueño. No rellenarlos con contaminación lumínica.     |
| Coordenadas, altitud y zona horaria de Tatacoa, Checua y Tota | Pendiente     | F0, F6 | Las completa el dueño en el JSON. No aproximarlas ni usar homónimos. |

Ninguna de estas decisiones se resuelve por cuenta del agente. Si una verificación contradice el SPEC, se detiene la fase afectada y se consulta al dueño.

## 6. Contrato para las tasks

Las tasks ya están generadas en [`tasks/`](./tasks/README.md) siguiendo este contrato:

- Un archivo por task: `tasks/TNNN-<slug>.md`, numeración correlativa.
- Cada task referencia su fase del plan y las secciones del SPEC que implementa.
- Incluye dependencias, alcance, archivos previstos, pasos, criterios de aceptación y forma de verificación.
- Una task no introduce alcance nuevo ni reabre decisiones cerradas.
- Las tasks respetan el orden de dependencias de la tabla de fases.
- No se genera una task de UI antes de que existan sus datos y su dominio.
- La última task de cada fase incluye su puerta de salida.

## 7. Definición de terminado global

La app se considera terminada cuando:

1. Todos los criterios de aceptación del SPEC §12 se cumplen.
2. Todas las funcionalidades del SPEC §2.1 están implementadas y las del §2.2 siguen fuera.
3. Las comprobaciones de red y caché del SPEC §7.1 son demostrables.
4. `pnpm lint`, `pnpm typecheck`, las pruebas y `pnpm build` pasan sin errores.
5. No hay errores de hidratación ni usos de `any`, `@ts-ignore` o `@ts-expect-error` sin justificar.
6. La app está desplegada en Vercel y la redirección, el GPS y la regeneración funcionan en producción.
7. La documentación del paquete refleja el estado real y las decisiones tomadas.
