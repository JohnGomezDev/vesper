# Documentación de specs

Cada bloque de trabajo se organiza como un **paquete de spec** independiente. Así se pueden añadir specs futuras sin mezclarlas con las anteriores y sin dejar documentos sueltos en la raíz.

## Estructura

```text
docs/
└── specs/
    ├── README.md
    ├── 001-vesper/
    │   ├── SPEC.md          # Qué se construye y qué decisiones están cerradas
    │   ├── PLAN.md          # Cómo se construye: fases, orden y puertas de salida
    │   └── tasks/
    │       └── README.md    # Convención de tasks; aquí vivirán las tasks
    └── 002-<slug>/          # Próxima spec
        ├── SPEC.md
        ├── PLAN.md
        └── tasks/
```

## Convenciones

- **Nombre del paquete:** `NNN-<slug>`, con número incremental de tres dígitos y slug en kebab-case. Ejemplo: `001-vesper`, `002-compartir-noches`.
- **Un paquete = un alcance funcional.** No se mezclan specs distintas en la misma carpeta.
- **`SPEC.md` manda.** Define el qué y las decisiones cerradas. No se reabre un `[CERRADO]` sin autorización del dueño.
- **`PLAN.md` deriva del SPEC.** Define orden, dependencias, entregables internos y criterios de salida. No reduce alcance ni inventa requisitos.
- **`tasks/` deriva del PLAN.** Cada task es una unidad ejecutable y verificable. No se crean tasks antes de que el plan esté aprobado.
- **Enlaces relativos** entre documentos del mismo paquete.
- **Las decisiones nuevas** se registran en el `SPEC.md` del paquete (o en el documento que el SPEC indique), no solo en conversaciones.

## Orden de lectura

1. `SPEC.md` — alcance y decisiones.
2. `PLAN.md` — secuencia de construcción.
3. `tasks/` — trabajo atómico.

## Paquetes

| Paquete        | Estado      | Descripción                                                        |
| -------------- | ----------- | ------------------------------------------------------------------ |
| `001-vesper`   | En plan     | App completa de clima y observación astronómica.                   |
