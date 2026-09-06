/**
 * Identidad institucional centralizada.
 *
 * Nombre, siglas y dominio están pendientes de definición (ver
 * docs/pending-decisions.md, punto 1). Se leen del entorno para poder
 * cambiarlos sin tocar código.
 */
export const SITE = {
  name:
    process.env.NEXT_PUBLIC_SITE_NAME ?? "Consejo Independiente de Verificación de Credenciales",
  shortName: process.env.NEXT_PUBLIC_SITE_SHORT_NAME ?? "CIVIS",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  description:
    "Plataforma de auditoría técnica y veeduría ciudadana sobre las credenciales de los postulantes.",
} as const;

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
