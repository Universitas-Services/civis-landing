import Link from "next/link";
import { Pie } from "@/components/pie";

export default function NoEncontrado() {
  return (
    <>
      <div className="entrada-ui mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="font-mono text-xs tracking-wider text-balanza-600">Error 404</p>
        <h1 className="mt-4 font-serif text-2xl font-semibold tracking-tight text-toga-900 sm:text-3xl">
          Esta página no está disponible
        </h1>
        <div aria-hidden="true" className="mx-auto mt-4 h-0.5 w-16 bg-balanza-600" />
        <p className="mt-4 text-base leading-relaxed prosa text-toga-600">
          Puede que el enlace sea incorrecto, o que el perfil que busca todavía no tenga autorizada
          su publicación.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/postulados"
            className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-balanza-700"
          >
            Ver postulados
          </Link>
          <Link
            href="/"
            className="rounded-md border border-toga-300 px-5 py-2.5 text-sm font-semibold text-toga-700 transition-colors duration-150 hover:bg-toga-100"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
      <Pie actualizadoEn={null} />
    </>
  );
}
