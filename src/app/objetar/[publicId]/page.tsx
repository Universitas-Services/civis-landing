import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import type { PublicCandidateDetail } from "@/contracts";
import { apiGet } from "@/lib/api";
import { Pie } from "@/components/pie";
import { RutaProceso } from "@/components/cabecera-proceso";
// TEMPORAL / revertir: el formulario propio está en
// `@/components/formulario-objecion` y se reactivará cuando el backend
// genere el documento de objeción. Mientras tanto se usa un Google Form.

export const metadata: Metadata = {
  title: "Objetar candidato",
  description: "Formulario de objeción ciudadana con protección de identidad.",
  robots: { index: false, follow: false },
};

/** TEMPORAL / revertir: excepción a “cero terceros” (skill front-publico-civis). */
const GOOGLE_FORM_EMBED_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfBEfufwUmIiz0vTOEfDXHlOlGc_w4th-X6_qHF-3NcY8Bg0Q/viewform?embedded=true";

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
            Complete el formulario embebido. Este sitio no publica su identidad. Objetar no modifica
            el puntaje por sí solo.
          </p>
        </div>
      </header>

      <div
        className="entrada-ui mx-auto max-w-3xl px-4 py-10 sm:px-6"
        style={{ animationDelay: "40ms" }}
      >
        <iframe
          src={GOOGLE_FORM_EMBED_URL}
          title={`Formulario de objeción — ${perfil.fullName}`}
          className="w-full border-0"
          width={640}
          height={3621}
          loading="lazy"
        >
          Cargando…
        </iframe>

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
