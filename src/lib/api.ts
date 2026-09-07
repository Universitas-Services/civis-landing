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
  /** Tiempo límite de la petición, en milisegundos. */
  readonly timeoutMs?: number;
}

/**
 * `fetch` sin `signal` espera indefinidamente, y eso rompe la construcción de
 * una forma que cuesta diagnosticar: las páginas estáticas piden datos al
 * generarse, Next las aborta al minuto y el despliegue entero falla con un
 * "took more than 60 seconds" que no dice de qué.
 *
 * Con un tiempo límite, una API lenta o inalcanzable degrada a estado vacío en
 * lugar de tumbar el despliegue, y la página se rellena sola en la primera
 * revalidación. El portal público prefiere mostrarse incompleto antes que no
 * mostrarse.
 */
const TIEMPO_LIMITE_MS = 8_000;

export async function apiGet<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { Accept: "application/json" },
    next: { revalidate: options.revalidate ?? 60 },
    signal: AbortSignal.timeout(options.timeoutMs ?? TIEMPO_LIMITE_MS),
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
    // Más holgado que en lectura: al enviar una objeción, el servidor valida,
    // guarda y emite el código de seguimiento.
    signal: AbortSignal.timeout(15_000),
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
