import type { PublicCandidateDetail, PublicCandidateListItem } from "@/contracts";
import { apiGet } from "./api";

/**
 * Resuelve un slug legible al identificador público opaco.
 *
 * La API indexa por `publicId` a propósito (un identificador opaco no revela
 * orden ni cantidad de expedientes), pero las URLs públicas usan slug porque
 * es lo que una persona puede leer y compartir.
 */
export async function resolverSlug(slug: string): Promise<string | null> {
  const data = await apiGet<{ items: PublicCandidateListItem[] }>(
    "/public/candidates?pageSize=100",
  ).catch(() => null);
  return data?.items.find((c) => c.slug === slug)?.publicId ?? null;
}

/**
 * Normaliza un perfil publicado.
 *
 * Los perfiles se sirven desde snapshots inmutables: uno publicado con una
 * versión anterior del contrato puede carecer de campos que hoy existen.
 * Eso no debe tumbar la página — se rellenan con valores vacíos y la ficha
 * muestra lo que sí hay.
 */
function normalizar(perfil: PublicCandidateDetail): PublicCandidateDetail {
  return {
    ...perfil,
    breakdown: perfil.breakdown ?? [],
    documents: perfil.documents ?? [],
    objectedCredentials: perfil.objectedCredentials ?? [],
  };
}

export async function obtenerPerfil(slug: string): Promise<PublicCandidateDetail | null> {
  const publicId = await resolverSlug(slug);
  if (!publicId) return null;
  const perfil = await apiGet<PublicCandidateDetail>(`/public/candidates/${publicId}`).catch(
    () => null,
  );
  return perfil ? normalizar(perfil) : null;
}
