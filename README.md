# civis-landing

Sitio público de veeduría ciudadana del **Consejo Independiente de
Verificación (CIVIS)**. Muestra el ranking de postulantes, sus expedientes
públicos y recibe objeciones ciudadanas.

Sólo consume endpoints **públicos de lectura** de la API. No tiene sesión, no
maneja secretos y no conoce ninguna ruta interna.

| Repositorio | Qué es | Puerto local |
|---|---|---|
| [civis-api](https://github.com/Universitas-Services/civis-api) | API — única fuente de verdad | 3001 |
| **civis-landing** (este) | Sitio público | 3000 |
| [civis-backoffice](https://github.com/Universitas-Services/civis-backoffice) | Panel interno | 3002 |

## Arrancar

La API debe estar en marcha primero.

```bash
cp .env.example .env.local
pnpm install
pnpm dev            # http://localhost:3000
```

Sólo hay variables `NEXT_PUBLIC_*` más `REVALIDATE_SECRET`, que comparte con la
API para invalidar la caché cuando se publica contenido.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript 6 · Tailwind CSS 4 · Zod 4.

## Diseño

Paleta **"Neutral Judicial"**: gris pizarra como ancla, oro viejo como acento
—sustituye al rojo, asociado a alarma o partidismo—, verde esmeralda para lo
validado y gris piedra para lo objetado, porque una objeción es revisión
documental normal, no un ataque.

Tipografía **IBM Plex** (Sans, Serif y Mono), **auto-alojada**. Esto último no
es una optimización de rendimiento: quien objeta a un magistrado corre riesgo,
y cada petición a un tercero deja rastro en manos ajenas. **Este sitio no hace
ninguna petición externa.**

La guía completa está en `.claude/skills/front-publico-civis/`.

## Reglas que no se negocian

1. Cero peticiones a terceros: ni fuentes, ni analítica, ni CDN.
2. Nada se muestra que la API no haya publicado como snapshot aprobado.
3. Nunca identificadores internos: las URL usan `slug`, las llamadas `publicId`.
4. Nunca la identidad de quien objeta, ni el texto de su objeción.
5. El color nunca comunica solo: toda insignia lleva texto y símbolo.

## Comprobar

```bash
pnpm validate    # formato + lint + tipos + pruebas
pnpm build
```

## Documentación del sistema

La documentación transversal —arquitectura, modelo de dominio, flujos, matriz
de datos públicos, modelo de amenazas, despliegue y decisiones pendientes—
vive en [civis-api/docs](https://github.com/Universitas-Services/civis-api/tree/main/docs).

## Estado

Los perfiles que muestra son **ficticios**: no corresponden a personas reales.
