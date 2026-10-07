import type { Metadata } from "next";
import { apiGet } from "@/lib/api";
import { Pie } from "@/components/pie";
import { CabeceraProceso } from "@/components/cabecera-proceso";
import { InsigniaProvisional } from "@/components/insignias";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Reglas y baremo",
  description:
    "Marco legal y baremo unificado: cómo se calculan los 100 puntos y las causales de exclusión del proceso.",
};

interface ReglasMeta {
  readonly rubricVersion: string;
  readonly provisional: boolean;
  readonly totalPoints: number;
}

const DIMENSIONES = [
  {
    numero: "01",
    titulo: "Formación académica superior",
    maximo: 30,
    descripcion:
      "Evalúa la acreditación de posgrados universitarios en ciencias jurídicas y diplomados de perfeccionamiento profesional debidamente registrados. Requiere pertinencia temática directa con la Sala del TSJ a la que se aspira.",
    criterios: [
      {
        label: "Grado académico principal",
        detalle:
          "Doctorado 18 puntos (requiere constancia de tesis), maestría 12 puntos o especialización 6 puntos. Tope de 18 puntos en este renglón.",
        puntos: "máx. 18 pts",
      },
      {
        label: "Posgrados adicionales",
        detalle: "2 puntos por cada título de posgrado extra en áreas afines.",
        puntos: "máx. 10 pts",
      },
      {
        label: "Diplomados avanzados",
        detalle: "1 punto por cada certificado afín mayor a 80 horas.",
        puntos: "máx. 2 pts",
      },
    ],
    cierre: "Regla de cierre: el sistema aplica un tope de 30 puntos máximos en esta dimensión.",
  },
  {
    numero: "02",
    titulo: "Producción científica y doctrinal",
    maximo: 10,
    descripcion:
      "Valora la investigación y el aporte al acervo jurídico nacional e internacional con identificadores auditables.",
    criterios: [
      {
        label: "Libros jurídicos",
        detalle:
          "0,5 puntos por cada libro publicado en autoría o coautoría con número de registro ISBN y depósito legal comprobable.",
        puntos: "máx. 5 pts",
      },
      {
        label: "Artículos científicos",
        detalle:
          "0,5 puntos por cada artículo publicado en revistas arbitradas e indexadas reconocidas (por ejemplo Scopus, SciELO o Redalyc).",
        puntos: "máx. 5 pts",
      },
    ],
  },
  {
    numero: "03",
    titulo: "Trayectoria profesional y perfiles PLUS",
    maximo: 50,
    descripcion:
      "Suma los años de experiencia comprobada en judicatura, docencia y libre ejercicio profesional, con igualdad de condiciones y tope global.",
    criterios: [
      {
        label: "Requisito base de elegibilidad (Art. 263 CRBV)",
        detalle:
          "Cumplir 15 años de servicio comprobado otorga la base matemática para ser evaluado. Filtro excluyente si no se alcanza ese mínimo.",
        puntos: "mín. 15 años",
        excluyente: true,
      },
      {
        label: "Años adicionales de ejercicio (del año 16 en adelante)",
        detalle: "1,5 puntos por cada año extra como litigante, juez o docente.",
        puntos: "1,5 pts / año",
      },
      {
        label: "Regla de dilución (anti-dedo)",
        detalle:
          "Si el cargo de juez o docente universitario se obtuvo sin concurso público de oposición, cada año extra suma solo 0,15 puntos.",
        puntos: "0,15 pts / año",
      },
      {
        label: "Méritos de élite (PLUS)",
        detalle:
          "Puntos extra por actuaciones excepcionales comprobadas: arbitraje certificado, litigio ante instancias internacionales, defensa pro bono en derechos humanos, cargos en tribunales u organismos internacionales, o dirección gremial.",
        puntos: "PLUS",
      },
    ],
    cierre:
      "Regla de cierre: el motor MERITUM-AI aplica un tope global restrictivo de 50 puntos máximos en este bloque, impidiendo que la puntuación se infle indefinidamente por antigüedad.",
  },
  {
    numero: "04",
    titulo: "Evaluación técnica y competencias",
    maximo: 10,
    descripcion:
      "Traslada el resultado de las rúbricas y proyectos técnicos exigidos durante la fase legislativa de audiencias públicas.",
    criterios: [
      {
        label: "Entrevista técnica",
        detalle:
          "Evaluación de conocimientos jurídicos, argumentación, oratoria y subsunción de criterios ante el comité parlamentario.",
        puntos: "máx. 5 pts",
      },
      {
        label: "Plan de modernización",
        detalle:
          "Calificación del proyecto escrito y defendido públicamente para la celeridad procesal y la modernización tecnológica de la administración de justicia. Sin plan documentado, el sistema asigna 0 puntos en este renglón.",
        puntos: "máx. 5 pts",
      },
    ],
  },
] as const;

const INCOMPATIBILIDADES = [
  {
    titulo: "Militancia político-partidista activa",
    detalle:
      "Desempeño de cargos directivos en partidos políticos o proselitismo activo (Art. 37.5 LOTSJ).",
  },
  {
    titulo: "Incompatibilidad por parentesco cercano",
    detalle:
      "Vínculos de consanguinidad (hasta 4.° grado) o afinidad (hasta 2.° grado) con magistrados del TSJ activos o altos funcionarios del Poder Público (Art. 37.6 LOTSJ).",
  },
  {
    titulo: "Contrataciones vigentes con el Estado",
    detalle:
      "Ser propietario, socio accionista o representante legal de personas jurídicas que mantengan contratos de obras o servicios con la Administración Pública (Art. 37.7 LOTSJ).",
  },
  {
    titulo: "Sanción firme o inhabilitación",
    detalle:
      "Registrar inhabilitación administrativa de la Contraloría General de la República o condenas penales definitivamente firmes (Art. 37.4 LOTSJ).",
  },
] as const;

export default async function ReglasPage() {
  // Metadatos públicos si existen; el desglose editorial es tentativo mientras se fija el baremo.
  const reglas = await apiGet<ReglasMeta>("/public/rules").catch(() => null);

  return (
    <>
      <CabeceraProceso
        numero="03"
        titulo="Marco legal y baremo unificado"
        descripcion="Cómo se traducen la Constitución y la LOTSJ en una calificación objetiva de 100 puntos, auditable por la ciudadanía."
        meta={
          reglas ? (
            <>
              {reglas.provisional && <InsigniaProvisional />}
              <span className="font-mono text-xs tracking-wider text-toga-500">
                {reglas.rubricVersion}
              </span>
            </>
          ) : undefined
        }
      />

      <div
        className="entrada-ui mx-auto max-w-6xl px-4 py-10 sm:px-6"
        style={{ animationDelay: "40ms" }}
      >
        {/* ── 1. Bloque pedagógico ─────────────────────────────────── */}
        <section className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-6 sm:p-8">
          <p className="font-mono text-xs tracking-wider text-balanza-600">01</p>
          <h2 className="mt-1 font-serif text-xl font-semibold tracking-tight text-toga-900">
            ¿Qué es un baremo de evaluación judicial?
          </h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed prosa text-toga-700">
            <p>
              Un baremo es una matriz de evaluación técnica, objetiva y estandarizada que traduce
              las exigencias de la Constitución de la República Bolivariana de Venezuela (CRBV) y de
              la Ley Orgánica del Tribunal Supremo de Justicia (LOTSJ) en reglas de puntuación
              matemáticas y preestablecidas.
            </p>
            <p>
              En lugar de calificar a un candidato mediante apreciaciones subjetivas, simpatías
              políticas o deliberaciones a puerta cerrada, el baremo asigna un valor numérico exacto
              a cada credencial académica, libro publicado o año de ejercicio profesional demostrado
              en el expediente.
            </p>
          </div>

          <h3 className="mt-8 font-serif text-lg font-semibold tracking-tight text-toga-900">
            ¿Por qué es indispensable el baremo en la veeduría cívica?
          </h3>
          <ul className="mt-4 space-y-4">
            <li className="border-l-2 border-balanza-600 bg-toga-50 px-4 py-3">
              <p className="text-sm font-semibold text-toga-900">
                Elimina la discrecionalidad y el favoritismo
              </p>
              <p className="mt-1 text-sm leading-relaxed text-toga-600">
                Si las reglas son públicas y fijas, nadie puede otorgar o quitar puntos «a dedo».
                Las mismas credenciales siempre producen el mismo resultado.
              </p>
            </li>
            <li className="border-l-2 border-balanza-600 bg-toga-50 px-4 py-3">
              <p className="text-sm font-semibold text-toga-900">
                Garantiza la igualdad de condiciones
              </p>
              <p className="mt-1 text-sm leading-relaxed text-toga-600">
                Todos los postulantes a las distintas Salas del TSJ son auditados bajo la misma vara
                de medir, garantizando la equidad procedimental.
              </p>
            </li>
            <li className="border-l-2 border-balanza-600 bg-toga-50 px-4 py-3">
              <p className="text-sm font-semibold text-toga-900">
                Hace la evaluación auditable por el ciudadano
              </p>
              <p className="mt-1 text-sm leading-relaxed text-toga-600">
                Permite que la sociedad civil revise el expediente en PDF de un candidato y
                compruebe por sí misma si la calificación asignada en la tabla pública coincide
                exactamente con sus soportes reales.
              </p>
            </li>
          </ul>
        </section>

        {/* ── 2. Calificación objetiva ─────────────────────────────── */}
        <section className="mt-8 border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-6 sm:p-8">
          <p className="font-mono text-xs tracking-wider text-balanza-600">02</p>
          <h2 className="mt-1 font-serif text-xl font-semibold tracking-tight text-toga-900">
            Funcionamiento de la calificación objetiva (MERITUM-AI)
          </h2>
          <p className="mt-4 text-base leading-relaxed prosa text-toga-700">
            A través del motor de evaluación MERITUM-AI, la plataforma calcula la calificación final
            de cada aspirante sobre una escala única de 100 puntos máximos.
          </p>
          <div className="mt-6 overflow-x-auto rounded-md bg-toga-900 px-4 py-5 sm:px-6">
            <p className="font-mono text-xs tracking-wider text-balanza-500">Fórmula</p>
            <p className="mt-2 text-sm leading-relaxed text-toga-100 sm:text-base">
              <span className="font-semibold text-white">Puntuación total</span>
              <span className="text-toga-400"> = </span>
              Formación académica (máx. 30)
              <span className="text-toga-400"> + </span>
              Producción científica (máx. 10)
              <span className="text-toga-400"> + </span>
              Trayectoria profesional acumulativa (máx. 50)
              <span className="text-toga-400"> + </span>
              Evaluación técnica y plan de trabajo (máx. 10)
            </p>
          </div>
        </section>

        {/* ── 3. Dimensiones ───────────────────────────────────────── */}
        <section className="mt-8" aria-labelledby="dimensiones">
          <p className="font-mono text-xs tracking-wider text-balanza-600">03</p>
          <h2
            id="dimensiones"
            className="mt-1 font-serif text-xl font-semibold tracking-tight text-toga-900"
          >
            Desglose de las 4 dimensiones del baremo
          </h2>
          <p className="mt-2 text-base leading-relaxed prosa text-toga-600">
            Cada dimensión aporta un máximo de puntos. La suma no supera 100.
          </p>

          <div className="mt-6 space-y-5">
            {DIMENSIONES.map((d) => (
              <article
                key={d.numero}
                className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-6"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <div>
                    <p className="font-mono text-xs tracking-wider text-balanza-600">{d.numero}</p>
                    <h3 className="mt-1 font-serif text-lg font-semibold text-toga-900">
                      {d.titulo}
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-md bg-toga-900 px-2.5 py-1 text-xs font-semibold tabular-nums text-white">
                    máx. {d.maximo} pts
                  </span>
                </div>
                <p className="mt-2 text-sm text-toga-600">{d.descripcion}</p>

                <ul className="mt-5 divide-y divide-toga-100 border-t border-toga-100">
                  {d.criterios.map((c) => (
                    <li key={c.label} className="flex flex-wrap items-start gap-x-4 gap-y-1 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-toga-900">
                          {c.label}
                          {"excluyente" in c && c.excluyente && (
                            <span className="ml-2 rounded bg-objetado-100 px-1.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-objetado-600">
                              excluyente
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-sm leading-relaxed text-toga-500">{c.detalle}</p>
                      </div>
                      <span className="shrink-0 text-sm tabular-nums text-toga-600">
                        {c.puntos}
                      </span>
                    </li>
                  ))}
                </ul>

                {"cierre" in d && d.cierre && (
                  <p className="mt-4 border border-toga-200 bg-toga-50 px-4 py-3 text-sm leading-relaxed text-toga-700">
                    {d.cierre}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* ── 4. Incompatibilidades ────────────────────────────────── */}
        <section className="relative mt-8 overflow-hidden rounded-lg bg-toga-900 p-6 sm:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent 0 22px, #fff 22px 23px), repeating-linear-gradient(90deg, transparent 0 22px, #fff 22px 23px)",
            }}
          />
          <div className="relative">
            <p className="font-mono text-xs tracking-wider text-balanza-500">04</p>
            <h2 className="mt-2 font-serif text-lg font-semibold text-white sm:text-xl">
              Incompatibilidades absolutas y exclusión inmediata (Art. 37 LOTSJ)
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-toga-300">
              Independientemente del puntaje meritocrático acumulado, el artículo 37 de la Ley
              Orgánica del Tribunal Supremo de Justicia y los artículos 256 y 263 de la Constitución
              establecen causales de exclusión automática. Cualquiera de estas situaciones
              inhabilita al postulante de forma inmediata:
            </p>
            <ul className="mt-6 space-y-4">
              {INCOMPATIBILIDADES.map((item) => (
                <li key={item.titulo} className="flex items-start gap-3 text-sm">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 text-balanza-500">
                    ✕
                  </span>
                  <div>
                    <p className="font-medium text-toga-100">{item.titulo}</p>
                    <p className="mt-1 leading-relaxed text-toga-400">{item.detalle}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

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
