import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { obtenerPerfil } from "@/lib/candidatos";
import { Pie } from "@/components/pie";
import { RutaProceso } from "@/components/cabecera-proceso";
import { InsigniaBanda, InsigniaProvisional, InsigniaSala, Puntaje } from "@/components/insignias";
import { VisorDocumentos } from "@/components/visor-documentos";

export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const perfil = await obtenerPerfil(slug);
  if (!perfil) return { title: "Perfil no disponible" };
  return {
    title: perfil.fullName,
    description: perfil.publicSummary ?? `Perfil público y puntaje de ${perfil.fullName}.`,
    openGraph: { title: perfil.fullName, description: perfil.publicSummary ?? undefined },
  };
}

export default async function PerfilPublico({
  params,
}: {
  readonly params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const perfil = await obtenerPerfil(slug);
  if (!perfil) notFound();

  return (
    <>
      <header className="entrada-ui border-b border-toga-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <RutaProceso
            items={[{ href: "/postulados", texto: "02 · Postulados" }, { texto: perfil.fullName }]}
          />

          <div className="mt-5 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="font-mono text-xs tracking-wider text-balanza-600">Perfil público</p>
              <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-toga-900 sm:text-3xl">
                {perfil.fullName}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <InsigniaSala sala={perfil.chamber} />
                <InsigniaBanda banda={perfil.band} />
                {perfil.provisional && <InsigniaProvisional />}
              </div>
              {perfil.publicSummary && (
                <p className="mt-4 max-w-2xl text-base leading-relaxed prosa text-toga-600">
                  {perfil.publicSummary}
                </p>
              )}
              <div aria-hidden="true" className="mt-6 h-0.5 w-16 bg-balanza-600" />
            </div>

            <div className="shrink-0 border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-6 text-center lg:w-52">
              <p className="text-xs font-medium uppercase tracking-wider text-toga-500">
                Puntaje total
              </p>
              <div className="mt-2">
                <Puntaje valor={perfil.total} tamano="lg" />
              </div>
              <p className="mt-2 text-xs text-toga-500">
                {perfil.position !== null ? (
                  <>
                    Posición {perfil.position}
                    {perfil.tied && " · empate"}
                  </>
                ) : (
                  "Fuera de competencia"
                )}
              </p>
            </div>
          </div>

          <Link
            href={`/objetar/${perfil.publicId}`}
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-balanza-600 px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-balanza-700"
          >
            Objetar candidato <span aria-hidden="true">→</span>
          </Link>
        </div>
      </header>

      <div
        className="entrada-ui mx-auto max-w-6xl px-4 py-10 sm:px-6"
        style={{ animationDelay: "40ms" }}
      >
        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <section aria-labelledby="desglose">
            <p className="font-mono text-xs tracking-wider text-balanza-600">A</p>
            <h2
              id="desglose"
              className="mt-1 font-serif text-xl font-semibold tracking-tight text-toga-900"
            >
              Desglose del puntaje
            </h2>
            <p className="mt-2 text-sm text-toga-600">
              Baremo{" "}
              <Link
                href="/reglas"
                className="font-medium text-balanza-700 transition-colors duration-150 hover:underline"
              >
                {perfil.rubricVersion}
              </Link>
              .
            </p>

            <ul className="mt-5 space-y-3">
              {perfil.breakdown.map((d, i) => {
                const porcentaje = d.maxPoints > 0 ? (d.points / d.maxPoints) * 100 : 0;
                return (
                  <li
                    key={d.dimensionKey}
                    className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-4"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm font-medium text-toga-900">
                        <span className="mr-2 font-mono text-xs text-balanza-600">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        {d.label}
                      </span>
                      <span className="shrink-0 text-sm tabular-nums text-toga-600">
                        <strong className="text-toga-900">{d.points}</strong> / {d.maxPoints}
                      </span>
                    </div>
                    <div
                      className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-toga-100"
                      role="img"
                      aria-label={`${d.points} de ${d.maxPoints} puntos`}
                    >
                      <div
                        className="h-full rounded-full bg-balanza-600 transition-[width] duration-150"
                        style={{ width: `${Math.min(100, porcentaje)}%` }}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>

            {perfil.ineligible && (
              <div className="relative mt-5 overflow-hidden rounded-lg bg-toga-900 p-5">
                <p className="text-sm font-medium text-white">Postulante inhabilitado</p>
                <p className="mt-1.5 text-sm leading-relaxed text-toga-300">
                  Causal de exclusión comprobada. El puntaje se conserva por transparencia; el
                  perfil no compite.
                </p>
              </div>
            )}

            {perfil.objectedCredentials.length > 0 && (
              <div className="mt-5 border border-objetado-600/20 bg-objetado-100 p-4">
                <p className="text-sm font-medium text-objetado-600">
                  Credenciales con objeción fundada
                </p>
                <ul className="mt-2 space-y-1 text-sm text-objetado-600">
                  {perfil.objectedCredentials.map((c) => (
                    <li key={c}>* {c}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section aria-labelledby="expediente">
            <p className="font-mono text-xs tracking-wider text-balanza-600">B</p>
            <h2
              id="expediente"
              className="mt-1 font-serif text-xl font-semibold tracking-tight text-toga-900"
            >
              Expediente
            </h2>
            <p className="mt-2 text-sm text-toga-600">
              Documentos autorizados. Se leen en la página; no hace falta descargarlos.
            </p>
            <div className="mt-5">
              <VisorDocumentos documentos={perfil.documents} />
            </div>
          </section>
        </div>
      </div>

      <Pie actualizadoEn={perfil.publishedAt} />
    </>
  );
}
