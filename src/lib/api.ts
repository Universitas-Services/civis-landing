import { API_URL } from "./config";

/**
 * Cliente de lectura pública.
 *
 * La landing sólo consume endpoints públicos: no envía credenciales, no usa
 * cookies y no conoce ninguna ruta interna.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

interface FetchOptions {
  /** Segundos de revalidación en el caché de Next. */
  readonly revalidate?: number;
}

export async function apiGet<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: options.revalidate ?? 60 },
  });

  if (!response.ok) {
    throw new ApiError(
      response.status === 404 ? "No encontrado" : "No se pudo obtener la información",
      response.status,
    );
  }
  return response.json() as Promise<T>;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as T | { message?: string } | null;
  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload && payload.message
        ? payload.message
        : "No se pudo procesar la solicitud";
    throw new ApiError(message, response.status);
  }
  return payload as T;
}
