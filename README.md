# Vesper

App web para aficionados a la astronomía que responde a una pregunta: **¿cómo está el cielo en este lugar, esta noche o en otra noche cercana, y qué objetos podría observar?**

Combina dos fuentes:

- **Clima** de [Open-Meteo](https://open-meteo.com): nubosidad por capas, visibilidad, humedad, viento y precipitación.
- **Astronomía calculada localmente** con [astronomy-engine](https://github.com/cosinekitty/astronomy): Sol, Luna, planetas, crepúsculos y ventanas de observación.

Es un proyecto personal y de portafolio: no es comercial, no tiene dominio propio y la interfaz está en español.

> **Estado:** etapa inicial. La app todavía no está construida y varios detalles pueden cambiar. La especificación funcional y de arquitectura completa vive en [`SPEC.md`](./SPEC.md).

## Stack previsto

- Next.js 16 (App Router) + React + TypeScript
- Tailwind CSS v4
- TanStack Query v5
- `fetch` nativo
- astronomy-engine + Open-Meteo
- Hosting: Vercel

## Empezar

Requiere [pnpm](https://pnpm.io).

```bash
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Documentación

- [`SPEC.md`](./SPEC.md) — especificación funcional y de arquitectura.
- [`AGENTS.md`](./AGENTS.md) — convenciones de código y reglas para agentes.
