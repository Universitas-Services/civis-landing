import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";

/**
 * Invalidación de caché tras una publicación.
 *
 * La API llama aquí cuando se publica o se retira un snapshot, para que la
 * landing deje de servir la versión anterior sin esperar a que expire el
 * plazo de revalidación.
 *
 * Sólo invalida rutas: no recibe contenido ni lo escribe en ninguna parte.
 * Aunque alguien lograra llamarla, lo peor que consigue es que la landing
 * vuelva a pedirle los datos a la API.
 */

const RUTAS = ["/", "/postulados", "/ranking", "/informes"] as const;

/** Comparación en tiempo constante: no filtra el secreto por temporización. */
function secretoValido(recibido: string | null): boolean {
  const esperado = process.env.REVALIDATE_SECRET;
  if (!esperado || esperado.includes("CHANGE_ME") || !recibido) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!secretoValido(request.headers.get("x-revalidate-secret"))) {
    // Mensaje genérico: no se confirma si el secreto existe o es incorrecto.
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  }

  for (const ruta of RUTAS) revalidatePath(ruta);
  // Los perfiles son rutas dinámicas: se invalida el segmento completo.
  revalidatePath("/postulados/[slug]", "page");

  return NextResponse.json({ revalidated: RUTAS, at: new Date().toISOString() });
}
