---
name: front-publico-civis
description: Sistema de diseño y reglas del front público de veeduría ciudadana (landing CIVIS). Úsala SIEMPRE que se toque cualquier cosa visible de este proyecto - una página, un componente, un color, un texto, una tabla, un formulario, un estado vacío o de error - y también al añadir una ruta nueva o consumir un endpoint. Actívala aunque solo digan "cambia este botón", "arregla la vista", "que se vea mejor", "añade una página" o "muestra este dato". Cubre la paleta Neutral Judicial, la escala tipográfica accesible, la medida de línea, los estados semánticos, qué datos pueden mostrarse y cuáles no, y la regla de cero peticiones a terceros.
---

# Front público — Consejo Independiente de Verificación de Credenciales

Landing de veeduría ciudadana. Sólo consume endpoints **públicos de lectura** de
la API y el endpoint controlado de objeciones. No tiene sesión, no maneja
secretos y no conoce ninguna ruta interna.

> **La identidad de este proyecto es propia.** El estándar de entrega de Mia
> Services (paleta verde/azul, acento gráfico, modo ayuda) **no aplica aquí**:
> esta plataforma es del Consejo Independiente y su identidad es la paleta
> Neutral Judicial descrita abajo. Si otra skill de marca se activa, esta la
> reemplaza para todo lo visible de este proyecto.

## Lo que nunca se hace

Estas cinco reglas no se negocian; el resto del documento es orientación.

1. **Cero peticiones a terceros.** Ni fuentes de Google, ni analítica, ni CDN,
   ni iconos remotos, ni mapas embebidos. Quien objeta a un magistrado corre
   riesgo: cada petición externa deja un rastro en manos ajenas. Las
   tipografías se auto-alojan con `next/font` (ver `src/lib/fuentes.ts`).
2. **Nada se muestra que la API no haya publicado.** Si un dato no viene en la
   respuesta pública, no se inventa, no se deduce y no se pide por otra vía.
   La API sirve _snapshots_ aprobados; la landing los pinta y ya.
3. **Nunca identificadores internos.** Las URL usan `slug`; las llamadas usan
   `publicId`. El `id` interno, la clave del bucket y la cédula del postulante
   no existen en este proyecto.
4. **Nunca la identidad de quien objeta.** Ni su nombre, ni su correo, ni el
   texto de su objeción. Como mucho, la etiqueta de una credencial objetada.
5. **El color nunca comunica solo.** Toda insignia lleva texto y símbolo
   además del color (WCAG 1.4.1).

## Paleta "Neutral Judicial"

Definida para transmitir autoridad sin usar los colores de la diatriba
política. Los tokens viven en `src/styles/globals.css`; **usa los tokens, no
hexadecimales sueltos**.

| Token                           | Valor                 | Uso                                                                                                                           |
| ------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `toga-900`                      | `#0f172a`             | Ancla: cabecera, títulos, botones principales. Gris pizarra, no negro: el negro puro resulta agresivo en pantalla             |
| `toga-600` / `toga-500`         | `#475569` / `#64748b` | Texto secundario y metadatos                                                                                                  |
| `toga-200` / `toga-100`         | `#e2e8f0` / `#f1f5f9` | Bordes tenues y separadores                                                                                                   |
| `toga-50`                       | `#f8fafc`             | Fondo del sitio                                                                                                               |
| `balanza-600`                   | `#d97706`             | Acento: filete institucional, foco, iconografía, alertas técnicas. **Sustituye al rojo**, que se asocia a alarma o partidismo |
| `validado-700` / `validado-50`  | `#047857` / `#ecfdf5` | Credencial que superó la auditoría                                                                                            |
| `objetado-600` / `objetado-100` | `#57534e` / `#f5f5f4` | Credencial objetada. Gris piedra, **no rojo**: una objeción es revisión documental normal, no un ataque                       |

Las tarjetas van en blanco puro sobre `toga-50`, con borde `toga-200`. Sin
sombras pesadas: la separación se hace con el borde y el espacio.

## Tipografía — IBM Plex

Una sola familia para las tres aplicaciones. La elección viene de la guía del
[USWDS](https://designsystem.digital.gov/components/typography/), del
[GOV.UK Design System](https://designnotes.blog.gov.uk/2022/12/12/making-the-gov-uk-frontend-typography-scale-more-accessible/)
y de la recomendación de usar un sistema tipográfico completo cuando el
trabajo abarca interfaz, documentación y contenido técnico a la vez.

- **IBM Plex Serif** en `h1`–`h3`: voz institucional. Está dibujada para
  pantalla, a diferencia de las serif de display (Playfair y similares), que
  se deshacen por debajo de 18px. Se aplica sola desde `globals.css`: **no la
  pongas en línea en cada título**.
- **IBM Plex Sans** para interfaz, datos y cuerpo.
- **IBM Plex Mono** para códigos de seguimiento y huellas SHA — lo que alguien
  puede tener que transcribir sin confundir `0` con `O`. Usa `<code>` o la
  clase `.codigo`, con ligaduras desactivadas.

Se auto-alojan con `next/font` (`src/lib/fuentes.ts`). No las cambies por
enlaces a Google Fonts.

- **16px es el suelo absoluto**, también en móvil. Por debajo la legibilidad
  cae para baja visión y dislexia. `text-sm` (14px) sólo para metadatos:
  fechas, tamaños de archivo, huellas SHA. Nunca para texto corrido.
- Interlineado 1.6 en cuerpo.
- Prosa con la clase `.prosa` (`max-width: 66ch`): el USWDS sitúa la lectura
  cómoda entre 45 y 90 caracteres.
- Cifras comparables con `tabular-nums` o la clase `.cifra`, para que los
  puntajes se alineen en columna.

## Componentes

Antes de crear uno, revisa `src/components/`:

- `insignias.tsx` — `InsigniaBanda` (semáforo), `InsigniaSala`,
  `InsigniaProvisional`, `Puntaje`.
- `visor-documentos.tsx` — visor con pestañas. Pide la URL firmada **al
  pulsar**, nunca antes: así una página cacheada no conserva enlaces válidos.
- `formulario-objecion.tsx` — valida con el mismo esquema Zod que la API.
- `cabecera.tsx` / `pie.tsx` — el pie muestra siempre la fecha de última
  actualización pública.

## Contenido y tono

- Trata al lector como ciudadano, no como usuario de software. Frases cortas,
  sin tecnicismos, sin jerga jurídica innecesaria.
- Distingue **siempre** puntaje provisional de resultado final.
- Los empates se muestran como empates. No se inventan desempates.
- Los estados vacíos explican por qué no hay nada y qué esperar, no dicen
  sólo "sin resultados".
- Los errores no revelan nada del interior del sistema.

## Responsive

El sitio se diseña **primero para móvil**: la mayoría de la ciudadanía entra
desde el teléfono.

- **Tablas de datos**: no hay solución universal. El patrón adoptado es
  **tarjetas por debajo de `md`, tabla completa por encima** — ver
  `components/tabla-ranking.tsx`. Obligar a desplazar en horizontal esconde
  columnas sin avisar y es hostil con lectores de pantalla. Se emite una sola
  de las dos vistas (`display:none` la saca del árbol de accesibilidad).
- **La página nunca desplaza en horizontal.** Compruébalo de verdad:
  `document.documentElement.scrollWidth > window.innerWidth` debe dar `false`
  a 375px. Si algo se sale, arregla el elemento, no pongas `overflow: hidden`
  encima.
- La cabecera muestra las **siglas** por debajo de `sm` y el nombre completo
  por encima: el nombre largo dejaba sin sitio al botón de objeción, que es
  la acción más importante de la página.
- Nada de tamaños de fuente menores en móvil: 16px sigue siendo el suelo.
- Puntos de quiebre de Tailwind por defecto. `sm` 640 · `md` 768 · `lg` 1024.

## Accesibilidad — comprobaciones obligatorias

- Foco visible siempre (ya definido en `globals.css`; no lo elimines).
- El contenido ancho (tablas) desplaza dentro de su contenedor con
  `overflow-x-auto`. **La página nunca desplaza en horizontal.**
- Toda tabla lleva `<caption>` (puede ser `sr-only`) y `<th scope>`.
- Los formularios funcionan sin JavaScript cuando es posible (los filtros de
  `/postulados` usan `method="get"`).
- Enlace de salto al contenido en el layout.
- Respeta `prefers-reduced-motion`.

## Contrato con la API

`src/contracts/index.ts` es un **espejo** del contrato del backend, que vive en
`api/src/contracts/`. Si cambia allí, hay que reflejarlo aquí. No añadas lógica
de dominio a este archivo: el cálculo de puntajes y el ranking los hace el
servidor, siempre.
