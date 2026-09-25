import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PublicCandidateDetail } from "@/contracts";
import { apiGet } from "@/lib/api";
import { objecionesAbiertas } from "@/lib/portal";
import { Pie } from "@/components/pie";
import { RutaProceso } from "@/components/cabecera-proceso";
import { FormularioObjecion } from "@/components/formulario-objecion";

export const metadata: Metadata = {
  title: "Objetar candidato",
  description: "Formulario de impugnación de candidaturas al TSJ.",
  robots: { index: false, follow: false },
};

export default async function Objetar({
  params,
}: {
  readonly params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const abierto = await objecionesAbiertas();
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
        </div>
      </header>

      <div
        className="entrada-ui mx-auto max-w-3xl px-4 py-10 sm:px-6"
        style={{ animationDelay: "40ms" }}
      >
        {abierto ? (
          <FormularioObjecion
            publicId={perfil.publicId}
            nombrePostulante={perfil.fullName}
            cedulaPostulante={perfil.nationalId ?? "—"}
            sala={perfil.chamber}
          />
        ) : (
          <div className="border border-toga-200 bg-white p-6">
            <h2 className="font-serif text-lg font-semibold text-toga-900">
              Lapso de impugnación cerrado
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-toga-700">
              El lapso legal de impugnación se encuentra cerrado o finalizado. En este momento no
              se reciben objeciones.
            </p>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-toga-500">
          <Link
            href={`/postulados/${perfil.slug}`}
            className="font-medium text-balanza-700 hover:underline"
          >
            ← Volver al perfil
          </Link>
        </p>
      </div>
      <Pie actualizadoEn={null} />
    </>
  );
}
