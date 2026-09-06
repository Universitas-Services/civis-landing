"use client";

import { useState } from "react";
import { codigoSeguimientoSchema, type PublicObjectionTracking } from "@/contracts";
import { apiGet, ApiError } from "@/lib/api";

const ESTADO: Record<string, { texto: string; detalle: string; clases: string }> = {
  RECEIVED: {
    texto: "Recibida",
    detalle: "Su objeción llegó al comité y está a la espera de asignación.",
    clases: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
  },
  UNDER_REVIEW: {
    texto: "En revisión",
    detalle: "Un evaluador tiene su objeción asignada y la está estudiando.",
    clases: "bg-toga-100 text-toga-700 ring-toga-300",
  },
  RESOLVED: {
    texto: "Resuelta",
    detalle:
      "El comité emitió una resolución motivada. Si procedía un ajuste de puntaje, se refleja en el perfil público del postulante.",
    clases: "bg-validado-50 text-validado-700 ring-validado-700/20",
  },
  CLOSED: {
    texto: "Cerrada",
    detalle: "El trámite concluyó sin dar lugar a revisión de fondo.",
    clases: "bg-objetado-100 text-objetado-600 ring-objetado-600/20",
  },
};

export function FormularioSeguimiento() {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [consultando, setConsultando] = useState(false);
  const [resultado, setResultado] = useState<PublicObjectionTracking | null>(null);

  async function consultar(formData: FormData) {
    setError(null);
    setResultado(null);

    const analisis = codigoSeguimientoSchema.safeParse(formData.get("codigo"));
    if (!analisis.success) {
      setError(analisis.error.issues[0]?.message ?? "Código inválido");
      return;
    }

    setConsultando(true);
    try {
      const r = await apiGet<PublicObjectionTracking>(`/public/objections/track/${analisis.data}`, {
        revalidate: 0,
      });
      setResultado(r);
    } catch (e) {
      // Mismo mensaje para "no existe" y "formato raro": no se confirma qué
      // códigos son válidos, para que nadie pueda ir probando.
      setError(
        e instanceof ApiError && e.status === 404
          ? "No encontramos ninguna objeción con ese código. Revise que lo haya copiado completo."
          : "No se pudo consultar en este momento. Intente de nuevo en unos minutos.",
      );
    } finally {
      setConsultando(false);
    }
  }

  const estado = resultado ? (ESTADO[resultado.status] ?? ESTADO.RECEIVED!) : null;

  return (
    <>
      <form
        action={consultar}
        className="rounded-lg border border-toga-200 bg-white p-5"
        noValidate
      >
        <label htmlFor="codigo" className="block text-sm font-medium text-toga-700">
          Código de seguimiento
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="codigo"
            name="codigo"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            placeholder="OBJ-2026-A1B2C3D4E5"
            autoComplete="off"
            spellCheck={false}
            className="codigo w-full rounded-md border border-toga-300 px-3 py-2.5 text-base tracking-wider text-toga-900 placeholder:text-toga-400"
          />
          <button
            type="submit"
            disabled={consultando}
            className="shrink-0 rounded-md bg-toga-900 px-6 py-2.5 text-base font-semibold text-white hover:bg-toga-800 disabled:opacity-60"
          >
            {consultando ? "Consultando…" : "Consultar"}
          </button>
        </div>
        {error && (
          <p role="alert" className="mt-3 text-sm font-medium text-balanza-700">
            {error}
          </p>
        )}
      </form>

      {resultado && estado && (
        <div className="mt-6 rounded-lg border border-toga-200 bg-white p-5">
          <p className="codigo text-sm text-toga-500">{resultado.trackingCode}</p>
          <span
            className={`mt-2 inline-flex rounded-full px-3 py-1.5 text-sm font-medium ring-1 ring-inset ${estado.clases}`}
          >
            {estado.texto}
          </span>
          <p className="prosa mt-3 text-base leading-relaxed text-toga-600">{estado.detalle}</p>

          <dl className="mt-4 grid gap-3 border-t border-toga-100 pt-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-toga-500">Recibida</dt>
              <dd className="mt-0.5 text-toga-900">
                <time dateTime={resultado.receivedAt}>
                  {new Date(resultado.receivedAt).toLocaleString("es-VE", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </time>
              </dd>
            </div>
            <div>
              <dt className="text-toga-500">Última actualización</dt>
              <dd className="mt-0.5 text-toga-900">
                <time dateTime={resultado.updatedAt}>
                  {new Date(resultado.updatedAt).toLocaleString("es-VE", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </time>
              </dd>
            </div>
          </dl>
        </div>
      )}
    </>
  );
}
