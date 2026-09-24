import { apiGet } from "./api";

/** Si la API no responde, el lapso se trata como cerrado. */
export async function objecionesAbiertas(): Promise<boolean> {
  try {
    const portal = await apiGet<{ objectionsOpen: boolean }>("/public/portal", { revalidate: 15 });
    return portal.objectionsOpen === true;
  } catch {
    return false;
  }
}
