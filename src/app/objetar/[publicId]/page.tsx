import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PublicCandidateDetail } from "@/contracts";
import { apiGet } from "@/lib/api";
import { Pie } from "@/components/pie";
import { RutaProceso } from "@/components/cabecera-proceso";
import { FormularioObjecion } from "@/components/formulario-objecion";

export const metadata: Metadata = {
  title: "Objetar candidato",
  description: "Formulario de objeción ciudadana con protección de identidad.",
  robots: { index: false, follow: false },
};

const PASOS = [
  "Identifique la credencial y aporte la relación de hechos.",
  "El comité técnico contrasta lo alegado contra el expediente y el baremo.",
  "Se emite resolución motivada. Un ajuste de puntaje exige aprobación aparte.",
  "El ranking público sólo cambia al publicar una versión nueva.",
] as const;

export default async function Objetar({
  params,
}: {
  readonly params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const perfil = await apiGet<PublicCandidateDetail>(`/public/candidates/${publicId}`, {
    revalidate: 0,
  }).catch(() => null);
  if (!perfil) notFound();

  return (
    <>
      <header className="entrada-ui relative overflow-hidden bg-toga-900">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent 0 22px, #fff 22px 23px), repeating-linear-gradient(90deg, transparent 0 22px, #fff 22px 23px)",
          }}
        />
        <div className="relative mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="text-toga-400 [&_a]:text-toga-300 [&_a:hover]:text-white [&_span]:text-toga-200">
            <RutaProceso
              items={[
                { href: `/postulados/${perfil.slug}`, texto: perfil.fullName },
                { texto: "Objeción" },
              ]}
            />
          </div>
          <p className="mt-5 font-mono text-xs tracking-wider text-balanza-500">
            Participación ciudadana
          </p>
          <h1 className="mt-2 font-serif text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Objetar a {perfil.fullName}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-toga-300">
            Su identidad no se publica. Recibirá un código de seguimiento. Objetar no modifica el
            puntaje por sí solo.
          </p>
        </div>
      </header>

      <div
        className="entrada-ui mx-auto max-w-3xl px-4 py-10 sm:px-6"
        style={{ animationDelay: "40ms" }}
      >
        <ol className="grid gap-3 sm:grid-cols-2">
          {PASOS.map((texto, i) => (
            <li
              key={texto}
              className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-4"
            >
              <span className="font-mono text-xs tracking-wider text-balanza-600">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="mt-2 text-sm leading-relaxed text-toga-700">{texto}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10">
          <FormularioObjecion publicId={perfil.publicId} nombrePostulante={perfil.fullName} />
        </div>

        <p className="mt-8 text-center text-sm text-toga-500">
          <Link
            href={`/postulados/${perfil.slug}`}
            className="font-medium text-balanza-700 transition-colors duration-150 hover:underline"
          >
            ← Volver al perfil
          </Link>
        </p>
      </div>
      <Pie actualizadoEn={null} />
    </>
  );
}
