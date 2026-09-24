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
    maximo: 35,
    descripcion:
      "Evalúa la acreditación de posgrados universitarios en ciencias jurídicas debidamente registrados y protocolizados.",
    criterios: [
      {
        label: "Doctorado en derecho o área afín",
        detalle: "25 puntos (requiere título registrado y constancia de aprobación de tesis).",
        puntos: "25 pts",
      },
      {
        label: "Maestría jurídica",
        detalle: "15 puntos (requiere título registrado y aprobación de trabajo de grado).",
        puntos: "15 pts",
      },
      {
        label: "Especialización jurídica",
        detalle: "10 puntos (requiere título registrado).",
        puntos: "10 pts",
      },
    ],
    cierre:
      "Regla de cierre: el sistema aplica un tope condicional de 35 puntos máximos. Tener múltiples maestrías o especializaciones no permite sobrepasar este límite.",
  },
  {
    numero: "02",
    titulo: "Docencia universitaria",
    maximo: 20,
    descripcion:
      "Pondera la trayectoria docente en facultades de Derecho reconocidas, premiando el mérito académico competitivo.",
    criterios: [
      {
        label: "Docencia por concurso público de oposición",
        detalle: "3 puntos por cada año de ejercicio acreditado.",
        puntos: "3 pts / año",
      },
      {
        label: "Docencia contratada o invitada",
        detalle: "1 punto por cada año de ejercicio acreditado.",
        puntos: "1 pt / año",
      },
    ],
  },
  {
    numero: "03",
    titulo: "Producción científica y doctrinal",
    maximo: 20,
    descripcion:
      "Valora la investigación y el aporte al acervo jurídico nacional e internacional con identificadores auditables.",
    criterios: [
      {
        label: "Libro jurídico publicado",
        detalle: "5 puntos por obra con número de registro ISBN y depósito legal.",
        puntos: "5 pts / obra",
      },
      {
        label: "Artículo en revista arbitrada e indexada",
        detalle:
          "2,5 puntos por artículo (en revistas reconocidas como Scopus, SciELO o Redalyc).",
        puntos: "2,5 pts / artículo",
      },
    ],
  },
  {
    numero: "04",
    titulo: "Trayectoria profesional y carrera judicial",
    maximo: 25,
    descripcion: "Verifica el ejercicio continuo y la madurez en la abogacía.",
    criterios: [
      {
        label: "Requisito de elegibilidad constitucional (Art. 263 CRBV)",
        detalle:
          "15 años mínimos de ejercicio profesional, docencia o judicatura. Filtro excluyente: si un postulante registra menos de 15 años acumulados, el sistema lo califica con 0 puntos y genera una alerta de inhabilitación por falta de requisito de ley.",
        puntos: "mín. 15 años",
        excluyente: true,
      },
      {
        label: "Años adicionales de ejercicio (del año 16 en adelante)",
        detalle: "Asigna 1,6667 puntos por cada año extra hasta alcanzar el tope de 25 puntos.",
        puntos: "1,6667 pts / año",
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
              <p className="text-sm font-semibold text-toga-900">Garantiza la igualdad de condiciones</p>
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
              Academia (máx. 35)
              <span className="text-toga-400"> + </span>
              Docencia (máx. 20)
              <span className="text-toga-400"> + </span>
              Publicaciones (máx. 20)
              <span className="text-toga-400"> + </span>
              Experiencia (máx. 25)
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
                      <span className="shrink-0 text-sm tabular-nums text-toga-600">{c.puntos}</span>
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
