import type { Metadata } from "next";
import { Cabecera } from "@/components/cabecera";
import { mono, sans, serif } from "@/lib/fuentes";
import { SITE } from "@/lib/config";
import "@/styles/globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: SITE.name, template: `%s · ${SITE.shortName}` },
  description: SITE.description,
  openGraph: {
    type: "website",
    locale: "es_VE",
    siteName: SITE.name,
    title: SITE.name,
    description: SITE.description,
  },
  twitter: { card: "summary_large_image", title: SITE.name, description: SITE.description },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="es-VE" className={`${sans.variable} ${serif.variable} ${mono.variable}`}>
      <body>
        <a href="#contenido" className="salto-contenido">
          Saltar al contenido principal
        </a>
        <Cabecera />
        <main id="contenido">{children}</main>
      </body>
    </html>
  );
}
