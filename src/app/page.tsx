import Link from "next/link";
import type { PublicProcessStats, PublicRanking } from "@/contracts";
import { apiGet } from "@/lib/api";
import { Pie } from "@/components/pie";
import { InsigniaBanda, Puntaje } from "@/components/insignias";

export const revalidate = 60;

async function cargar() {
  const [stats, ranking] = await Promise.all([
    apiGet<PublicProcessStats>("/public/process").catch(() => null),
    apiGet<PublicRanking | null>("/public/ranking").catch(() => null),
  ]);
  return { stats, ranking };
}

const ACCESOS = [
  {
    href: "/ranking",
    numero: "01",
    titulo: "Ranking",
    detalle: "Posiciones vigentes según el baremo publicado.",
  },
  {
    href: "/postulados",
    numero: "02",
    titulo: "Postulados",
    detalle: "Perfiles, puntajes y expedientes autorizados.",
  },
  {
    href: "/reglas",
    numero: "03",
    titulo: "Baremo",
    detalle: "Cómo se calculan los 100 puntos y las exclusiones.",
  },
  {
    href: "/informes",
    numero: "04",
    titulo: "Informes",
    detalle: "Publicaciones con huella SHA-256 verificable.",
  },
] as const;

function Cifra({
  valor,
  etiqueta,
  detalle,
}: {
  readonly valor: number;
  readonly etiqueta: string;
  readonly detalle: string;
}) {
  return (
    <div className="border-l-2 border-balanza-600 bg-white px-5 py-4">
      <p className="cifra text-3xl font-semibold tracking-tight text-toga-900">{valor}</p>
      <p className="mt-1 text-sm font-medium text-toga-700">{etiqueta}</p>
      <p className="mt-0.5 text-xs leading-relaxed text-toga-500">{detalle}</p>
    </div>
  );
}

export default async function Inicio() {
  const { stats, ranking } = await cargar();
  const destacados = ranking?.entries.filter((e) => e.position !== null).slice(0, 5) ?? [];

  return (
    <>
      {/* ── Portada institucional ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-toga-900">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 22px, #fff 22px 23px), repeating-linear-gradient(90deg, transparent 0 22px, #fff 22px 23px)",
          }}
        />
        <div className="entrada-ui relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <p className="font-serif text-xl font-semibold tracking-tight text-white sm:text-2xl">
            CONSEJO INDEPENDIENTE
          </p>
          <p className="mt-1 text-[0.7rem] font-medium uppercase tracking-[0.2em] text-balanza-500">
            Verificación de credenciales · Veeduría ciudadana
          </p>
          <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
            La transparencia no se declara: se verifica.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-toga-300 sm:text-lg">
            Baremo único y público, expedientes a la vista y objeción ciudadana con seguimiento. El
            puntaje se calcula con reglas conocidas de antemano; no depende de apreciación
            discrecional.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/ranking"
              className="rounded-md bg-balanza-600 px-5 py-3 text-sm font-semibold text-white transition-colors duration-150 hover:bg-balanza-700"
            >
              Ver ranking de idoneidad
            </Link>
            <Link
              href="/reglas"
              className="rounded-md border border-toga-600 px-5 py-3 text-sm font-semibold text-toga-100 transition-colors duration-150 hover:bg-toga-800"
            >
              Cómo se calcula el puntaje
            </Link>
          </div>
        </div>
      </section>

      {/* ── Accesos: panel protagonista + cuatro destinos ─────────── */}
      <section
        className="entrada-ui mx-auto max-w-6xl px-4 py-12 sm:px-6"
        aria-labelledby="accesos"
        style={{ animationDelay: "40ms" }}
      >
        <h2 id="accesos" className="sr-only">
          Accesos del proceso
        </h2>

        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          {/* Protagonista: participación ciudadana */}
          <Link
            href="/postulados"
            className="group relative flex flex-col justify-between overflow-hidden rounded-lg bg-toga-900 p-7 sm:p-8 lg:col-span-5 lg:min-h-[22rem]"
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent 0 22px, #fff 22px 23px), repeating-linear-gradient(90deg, transparent 0 22px, #fff 22px 23px)",
              }}
            />
            <div className="relative">
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-balanza-500">
                Participación ciudadana
              </p>
              <p className="mt-4 font-serif text-2xl font-semibold leading-snug tracking-tight text-white sm:text-3xl">
                Objetar una credencial con código de seguimiento
              </p>
              <p className="mt-4 max-w-sm text-sm leading-relaxed text-toga-300">
                Elige el postulante, tipifica la causal y recibe un código. Su identidad no se
                publica; el puntaje no cambia solo por objetar.
              </p>
            </div>
            <span className="relative mt-8 inline-flex w-fit items-center gap-2 rounded-md bg-balanza-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 group-hover:bg-balanza-700">
              Ir a objetar
              <span aria-hidden="true">→</span>
            </span>
          </Link>

          {/* Cuatro destinos numerados */}
          <ul className="grid gap-4 sm:grid-cols-2 lg:col-span-7">
            {ACCESOS.map((a) => (
              <li key={a.href}>
                <Link
                  href={a.href}
                  className="group flex h-full flex-col border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-6 transition-colors duration-150 hover:border-toga-300 hover:bg-toga-50"
                >
                  <span className="font-mono text-xs font-medium tracking-wider text-balanza-600">
                    {a.numero}
                  </span>
                  <span className="mt-3 font-serif text-xl font-semibold tracking-tight text-toga-900">
                    {a.titulo}
                  </span>
                  <span className="mt-2 flex-1 text-sm leading-relaxed text-toga-600">
                    {a.detalle}
                  </span>
                  <span className="mt-5 text-sm font-semibold text-toga-900 transition-colors duration-150 group-hover:text-balanza-700">
                    Abrir <span aria-hidden="true">→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Cifras ────────────────────────────────────────────────── */}
      <section
        className="entrada-ui border-y border-toga-200 bg-white"
        aria-labelledby="cifras"
        style={{ animationDelay: "80ms" }}
      >
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 id="cifras" className="text-lg font-semibold tracking-tight text-toga-900">
            El proceso en cifras
          </h2>
          {stats ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Cifra
                valor={stats.totalCandidates}
                etiqueta="Postulantes publicados"
                detalle="Con evaluación aprobada y publicación autorizada."
              />
              <Cifra
                valor={stats.underTechnicalReview}
                etiqueta="Expedientes en revisión"
                detalle="Verificación documental o evaluación técnica."
              />
              <Cifra
                valor={stats.objectionsReceived}
                etiqueta="Objeciones recibidas"
                detalle="Bajo protocolo de protección de identidad."
              />
              <Cifra
                valor={stats.flaggedCandidates}
                etiqueta="Con incompatibilidad"
                detalle="Inhabilitados por causal legal comprobada."
              />
            </div>
          ) : (
            <p className="mt-5 text-sm text-toga-500">
              Las cifras del proceso no están disponibles en este momento.
            </p>
          )}
        </div>
      </section>

      {/* ── Ranking ───────────────────────────────────────────────── */}
      {destacados.length > 0 && (
        <section
          className="entrada-ui mx-auto max-w-6xl px-4 py-12 sm:px-6"
          aria-labelledby="destacados"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-wider text-balanza-600">Vista previa</p>
              <h2
                id="destacados"
                className="mt-1 font-serif text-lg font-semibold tracking-tight text-toga-900"
              >
                Primeras posiciones
              </h2>
            </div>
            <Link
              href="/ranking"
              className="text-sm font-medium text-balanza-700 transition-colors duration-150 hover:text-balanza-600 hover:underline"
            >
              Ver ranking completo →
            </Link>
          </div>

          <ol className="mt-5 divide-y divide-toga-200 overflow-hidden border border-toga-200 border-t-2 border-t-balanza-600 bg-white">
            {destacados.map((c) => (
              <li key={c.publicId}>
                <Link
                  href={`/postulados/${c.slug}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4 transition-colors duration-150 hover:bg-toga-50"
                >
                  <span className="w-16 shrink-0 text-xs font-medium uppercase tracking-wider text-toga-500">
                    Pos. {c.position}
                    {c.tied && " · empate"}
                  </span>
                  <p className="min-w-0 flex-1 font-medium leading-snug text-toga-900">
                    {c.fullName}
                  </p>
                  <InsigniaBanda banda={c.band} />
                  <Puntaje valor={c.total} tamano="sm" />
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ── Pie; la objeción ya está en el panel protagonista ─────── */}
      <Pie actualizadoEn={stats?.lastPublishedAt ?? null} />
    </>
  );
}
