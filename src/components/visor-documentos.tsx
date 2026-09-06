"use client";

import { useState } from "react";
import type { PublicDocumentRef } from "@/contracts";
import { API_URL } from "@/lib/config";

const CATEGORIAS: Record<string, string> = {
  CURRICULUM: "Currículum",
  ACADEMIC_TITLE: "Títulos",
  TEACHING_PROOF: "Docencia",
  PUBLICATION_PROOF: "Publicaciones",
  PROFESSIONAL_PROOF: "Trayectoria",
  IDENTITY: "Identidad",
  SWORN_STATEMENT: "Declaración jurada",
  OTHER: "Otros",
};

/**
 * Visor de documentos con pestañas.
 *
 * La URL del archivo NO viene en la respuesta: se pide al pulsar, y la API
 * devuelve una URL firmada de corta duración. Así una ficha cacheada no
 * conserva enlaces de descarga válidos indefinidamente.
 */
export function VisorDocumentos({
  documentos,
}: {
  readonly documentos: readonly PublicDocumentRef[];
}) {
  const [activo, setActivo] = useState(0);
  const [url, setUrl] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (documentos.length === 0) {
    return (
      <div className="border border-dashed border-toga-300 border-t-2 border-t-balanza-600 bg-white p-10 text-center">
        <p className="font-serif text-sm font-medium text-toga-700">Sin documentos públicos</p>
        <p className="mt-1.5 text-sm text-toga-500">
          Este expediente aún no tiene documentos autorizados para publicación.
        </p>
      </div>
    );
  }

  const documento = documentos[activo]!;

  async function abrir(indice: number) {
    setActivo(indice);
    setUrl(null);
    setError(null);
    setCargando(true);
    try {
      const respuesta = await fetch(
        `${API_URL}/public/documents/${documentos[indice]!.publicId}/download`,
      );
      if (!respuesta.ok) throw new Error();
      const datos = (await respuesta.json()) as { url: string };
      setUrl(datos.url);
    } catch {
      setError("No se pudo abrir el documento. Intente de nuevo.");
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="overflow-hidden border border-toga-200 border-t-2 border-t-balanza-600 bg-white">
      <div
        role="tablist"
        aria-label="Documentos del expediente"
        className="flex overflow-x-auto border-b border-toga-200 bg-toga-50"
      >
        {documentos.map((d, i) => (
          <button
            key={d.publicId}
            role="tab"
            type="button"
            aria-selected={i === activo}
            onClick={() => void abrir(i)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              i === activo
                ? "border-balanza-600 text-toga-900"
                : "border-transparent text-toga-500 hover:text-toga-900"
            }`}
          >
            {CATEGORIAS[d.category] ?? d.category}
          </button>
        ))}
      </div>

      <div className="p-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-toga-500">
          <span className="font-medium text-toga-700">{documento.label}</span>
          <span className="tabular-nums">{Math.round(documento.sizeBytes / 1024)} KB</span>
        </div>

        <div className="mt-3 min-h-[26rem] rounded-md border border-toga-200 bg-toga-50">
          {cargando && (
            <p className="p-10 text-center text-sm text-toga-500">Abriendo documento…</p>
          )}
          {error && <p className="p-10 text-center text-sm text-toga-600">{error}</p>}
          {!cargando && !error && !url && (
            <div className="p-10 text-center">
              <p className="text-sm text-toga-600">
                El documento se abre bajo un enlace temporal por seguridad.
              </p>
              <button
                type="button"
                onClick={() => void abrir(activo)}
                className="mt-4 rounded-md bg-balanza-600 px-4 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-balanza-700"
              >
                Abrir documento
              </button>
            </div>
          )}
          {url && (
            <iframe
              src={url}
              title={`Documento: ${documento.label}`}
              className="h-[26rem] w-full rounded-md"
            />
          )}
        </div>

        <p className="mt-3 break-all text-[0.7rem] text-toga-400">
          Huella SHA-256: <code>{documento.sha256}</code>
        </p>
      </div>
    </div>
  );
}
