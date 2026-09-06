import { IBM_Plex_Mono, IBM_Plex_Sans, IBM_Plex_Serif } from "next/font/google";

/**
 * Sistema tipográfico: IBM Plex.
 *
 * Por qué una sola familia y no un emparejamiento de dos fuentes distintas:
 * esto no es una página suelta, son tres aplicaciones (landing, backoffice y
 * la documentación de la API) que deben leerse como un mismo sistema. Plex
 * cubre las tres superficies con hermanas diseñadas juntas — Sans para
 * interfaz y datos, Serif para la voz institucional, Mono para códigos de
 * seguimiento y huellas SHA — con licencia SIL OFL.
 *
 * Su Serif está dibujada para pantalla, a diferencia de las serif de display
 * (Playfair y similares), que se deshacen por debajo de 18px.
 *
 * `next/font` las descarga en compilación y las sirve desde el propio
 * dominio: el navegador del ciudadano NO hace ninguna petición a Google. En
 * un sitio donde alguien objeta a un magistrado, eso no es una optimización
 * de rendimiento, es parte de protegerlo.
 */
export const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--fuente-sans",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
});

export const serif = IBM_Plex_Serif({
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--fuente-serif",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

/** Para lo que debe transcribirse sin ambigüedad: códigos y hashes. */
export const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--fuente-mono",
  fallback: ["ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
});
