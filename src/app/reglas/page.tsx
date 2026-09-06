import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { Pie } from "@/components/pie";
import { CabeceraProceso, PanelVacio } from "@/components/cabecera-proceso";
import { InsigniaProvisional } from "@/components/insignias";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Reglas y baremo",
  description: "Baremo determinístico de 100 puntos y causales de exclusión aplicadas al proceso.",
};

interface Reglas {
  readonly rubricVersion: string;
  readonly name: string;
  readonly totalPoints: number;
  readonly provisional: boolean;
  readonly dimensions: readonly {
    readonly key: string;
    readonly label: string;
    readonly description: string;
    readonly maxPoints: number;
    readonly criteria: readonly {
      readonly key: string;
      readonly label: string;
      readonly description: string;
      readonly maxPoints: number;
      readonly legalBasis: string | null;
      readonly isExcluding: boolean;
      readonly minimumRequired: number | null;
    }[];
  }[];
}

export default async function ReglasPage() {
  const reglas = await apiGet<Reglas>("/public/rules").catch(() => null);

  if (!reglas) {
    return (
      <>
        <CabeceraProceso
          numero="03"
          titulo="Baremo y reglas"
          descripcion="Cómo se calculan los 100 puntos y las exclusiones."
        />
        <div className="entrada-ui mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <PanelVacio
            titulo="No se pudieron cargar las reglas"
            detalle="Intente de nuevo en unos minutos."
          />
        </div>
        <Pie actualizadoEn={null} />
      </>
    );
  }

  const puntuables = reglas.dimensions.filter((d) => d.maxPoints > 0);
  const excluyentes = reglas.dimensions.filter((d) => d.maxPoints === 0);

  return (
    <>
      <CabeceraProceso
        numero="03"
        titulo="Baremo y reglas"
        descripcion={`El puntaje se calcula sobre ${reglas.totalPoints} puntos con reglas determinísticas: las mismas credenciales producen siempre el mismo resultado.`}
        meta={
          <>
            {reglas.provisional && <InsigniaProvisional />}
            <span className="font-mono text-xs tracking-wider text-toga-500">
              {reglas.rubricVersion}
            </span>
          </>
        }
      />

      <div
        className="entrada-ui mx-auto max-w-6xl px-4 py-10 sm:px-6"
        style={{ animationDelay: "40ms" }}
      >
        <div className="space-y-5">
          {puntuables.map((d, i) => (
            <section
              key={d.key}
              className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-6"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <div>
                  <p className="font-mono text-xs tracking-wider text-balanza-600">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-1 font-serif text-lg font-semibold text-toga-900">{d.label}</h2>
                </div>
                <span className="shrink-0 rounded-md bg-toga-900 px-2.5 py-1 text-xs font-semibold tabular-nums text-white">
                  máx. {d.maxPoints} pts
                </span>
              </div>
              <p className="mt-2 text-sm text-toga-600">{d.description}</p>

              <ul className="mt-5 divide-y divide-toga-100 border-t border-toga-100">
                {d.criteria.map((c) => (
                  <li key={c.key} className="flex flex-wrap items-start gap-x-4 gap-y-1 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-toga-900">
                        {c.label}
                        {c.isExcluding && (
                          <span className="ml-2 rounded bg-objetado-100 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-objetado-600">
                            excluyente
                          </span>
                        )}
                      </p>
                      <p className="mt-0.5 text-sm leading-relaxed text-toga-500">
                        {c.description}
                      </p>
                      {c.legalBasis && (
                        <p className="mt-1 text-xs font-medium text-balanza-700">{c.legalBasis}</p>
                      )}
                    </div>
                    <span className="shrink-0 text-sm tabular-nums text-toga-600">
                      {c.maxPoints > 0 ? `${c.maxPoints} pts` : "—"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        {excluyentes.map((d) => (
          <section
            key={d.key}
            className="relative mt-8 overflow-hidden rounded-lg bg-toga-900 p-6 sm:p-8"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent 0 22px, #fff 22px 23px), repeating-linear-gradient(90deg, transparent 0 22px, #fff 22px 23px)",
              }}
            />
            <div className="relative">
              <p className="font-mono text-xs tracking-wider text-balanza-500">Exclusión</p>
              <h2 className="mt-2 font-serif text-lg font-semibold text-white">{d.label}</h2>
              <p className="mt-2 text-sm text-toga-300">{d.description}</p>
              <ul className="mt-5 space-y-3">
                {d.criteria.map((c) => (
                  <li key={c.key} className="flex items-baseline gap-3 text-sm">
                    <span aria-hidden="true" className="text-balanza-500">
                      ✕
                    </span>
                    <span className="text-toga-100">
                      {c.label}
                      {c.legalBasis && (
                        <span className="ml-2 text-xs text-toga-400">{c.legalBasis}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        ))}

        <section className="mt-8 border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-6">
          <h2 className="font-serif text-lg font-semibold text-toga-900">Empates</h2>
          <p className="mt-2 text-base leading-relaxed prosa text-toga-600">
            Cuando dos postulantes obtienen el mismo puntaje, comparten posición. No se aplica
            desempate mientras no exista una regla aprobada.
          </p>
        </section>
      </div>
      <Pie actualizadoEn={null} />
    </>
  );
}
