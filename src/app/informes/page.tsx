import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { Pie } from "@/components/pie";
import { CabeceraProceso, PanelVacio } from "@/components/cabecera-proceso";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Informes",
  description: "Informes finales aprobados y publicados por el comité técnico.",
};

interface Informe {
  readonly version: number;
  readonly sha256: string;
  readonly publishedAt: string | null;
  readonly title?: string;
  readonly summary?: string;
}

export default async function Informes() {
  const informes = await apiGet<Informe[]>("/public/reports").catch(() => []);

  return (
    <>
      <CabeceraProceso
        numero="04"
        titulo="Informes publicados"
        descripcion="Cada informe lleva huella SHA-256 para verificar que el documento consultado es exactamente el aprobado."
      />

      <div
        className="entrada-ui mx-auto max-w-6xl px-4 py-10 sm:px-6"
        style={{ animationDelay: "40ms" }}
      >
        {informes.length === 0 ? (
          <PanelVacio
            titulo="Aún no hay informes publicados"
            detalle="Los informes finales aparecen cuando el comité aprueba su contenido."
          />
        ) : (
          <ul className="space-y-4">
            {informes.map((informe, i) => (
              <li
                key={informe.version}
                className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-6"
              >
                <p className="font-mono text-xs tracking-wider text-balanza-600">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <div className="mt-2 flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="font-serif text-lg font-semibold text-toga-900">
                    {informe.title ?? `Informe versión ${informe.version}`}
                  </h2>
                  {informe.publishedAt && (
                    <time dateTime={informe.publishedAt} className="text-xs text-toga-500">
                      {new Date(informe.publishedAt).toLocaleDateString("es-VE", {
                        dateStyle: "long",
                      })}
                    </time>
                  )}
                </div>
                {informe.summary && (
                  <p className="mt-3 text-base leading-relaxed prosa text-toga-600">
                    {informe.summary}
                  </p>
                )}
                <p className="mt-4 break-all font-mono text-[0.7rem] text-toga-400">
                  SHA-256: {informe.sha256}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
      <Pie actualizadoEn={informes[0]?.publishedAt ?? null} />
    </>
  );
}
