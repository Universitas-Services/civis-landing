import Link from "next/link";
import type { Metadata } from "next";
import type { PublicRanking } from "@/contracts";
import { apiGet } from "@/lib/api";
import { Pie } from "@/components/pie";
import { CabeceraProceso, PanelVacio } from "@/components/cabecera-proceso";
import { InsigniaBanda, InsigniaProvisional, InsigniaSala, Puntaje } from "@/components/insignias";
import { TablaRanking } from "@/components/tabla-ranking";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Ranking de idoneidad",
  description:
    "Ranking vigente de postulantes, calculado con el baremo público a partir de evaluaciones aprobadas.",
};

export default async function RankingPage() {
  const ranking = await apiGet<PublicRanking | null>("/public/ranking").catch(() => null);

  if (!ranking || ranking.entries.length === 0) {
    return (
      <>
        <CabeceraProceso
          numero="01"
          titulo="Ranking de idoneidad"
          descripcion="Posiciones vigentes según el baremo publicado."
        />
        <div className="entrada-ui mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <PanelVacio
            titulo="Aún no hay ranking publicado"
            detalle="Cuando el comité apruebe la publicación, aparecerá aquí junto con su fecha de corte."
          />
        </div>
        <Pie actualizadoEn={null} />
      </>
    );
  }

  const enCompetencia = ranking.entries.filter((e) => e.position !== null);
  const inhabilitados = ranking.entries.filter((e) => e.position === null);

  return (
    <>
      <CabeceraProceso
        numero="01"
        titulo="Ranking de idoneidad"
        descripcion="El puntaje se calcula en el servidor a partir de evaluaciones aprobadas. Las posiciones empatadas se muestran como tales: no se aplican criterios de desempate no definidos."
        meta={
          <>
            {ranking.provisional && <InsigniaProvisional />}
            <span className="text-sm text-toga-500">
              Baremo <strong className="text-toga-700">{ranking.rubricVersion}</strong> · Corte al{" "}
              <time dateTime={ranking.cutoffAt}>
                {new Date(ranking.cutoffAt).toLocaleDateString("es-VE", { dateStyle: "long" })}
              </time>
            </span>
            <Link
              href="/reglas"
              className="text-sm font-medium text-balanza-700 transition-colors duration-150 hover:underline"
            >
              Ver baremo →
            </Link>
          </>
        }
      />

      <div
        className="entrada-ui mx-auto max-w-6xl px-4 py-10 sm:px-6"
        style={{ animationDelay: "40ms" }}
      >
        <TablaRanking entradas={enCompetencia} />

        {inhabilitados.length > 0 && (
          <section className="mt-12" aria-labelledby="inhabilitados">
            <p className="font-mono text-xs font-medium tracking-wider text-balanza-600">05</p>
            <h2
              id="inhabilitados"
              className="mt-2 font-serif text-xl font-semibold tracking-tight text-toga-900"
            >
              Fuera de competencia
            </h2>
            <p className="mt-2 max-w-3xl text-sm text-toga-600">
              Causal de exclusión comprobada. Se listan por transparencia; no ocupan posición.
            </p>
            <ul className="mt-5 divide-y divide-toga-200 overflow-hidden border border-toga-200 border-t-2 border-t-balanza-600 bg-white">
              {inhabilitados.map((c) => (
                <li key={c.publicId} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <Link
                    href={`/postulados/${c.slug}`}
                    className="font-medium text-toga-900 transition-colors duration-150 hover:text-balanza-700"
                  >
                    {c.fullName}
                  </Link>
                  <InsigniaSala sala={c.chamber} />
                  <span className="ml-auto flex items-center gap-3">
                    <Puntaje valor={c.total} tamano="sm" />
                    <InsigniaBanda banda="INELIGIBLE" />
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
      <Pie actualizadoEn={ranking.publishedAt} />
    </>
  );
}
