import type { Metadata } from "next";
import { Pie } from "@/components/pie";
import { FormularioSeguimiento } from "@/components/formulario-seguimiento";

export const metadata: Metadata = {
  title: "Seguimiento de objeción",
  description: "Consulte el estado de una objeción con su código de seguimiento.",
  robots: { index: false, follow: true },
};

export default function Seguimiento() {
  return (
    <>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-tight text-toga-900 sm:text-3xl">
          Seguimiento de su objeción
        </h1>
        <p className="prosa mt-3 text-base leading-relaxed text-toga-600">
          Cuando envió su objeción recibió un código. Introdúzcalo aquí para saber en qué punto está
          su trámite.
        </p>

        <div className="mt-8">
          <FormularioSeguimiento />
        </div>

        <section className="mt-10 rounded-lg border border-toga-200 bg-white p-5">
          <h2 className="text-base font-semibold text-toga-900">Qué puede ver aquí, y qué no</h2>
          <div className="prosa mt-2 space-y-2 text-base leading-relaxed text-toga-600">
            <p>
              Esta consulta devuelve un estado general: recibida, en revisión, resuelta o cerrada.
              No muestra las observaciones internas del comité ni el contenido de la deliberación.
            </p>
            <p>
              Esa limitación es deliberada. Un código de seguimiento viaja en correos y papeles; si
              abriera el expediente completo, cualquiera que lo encontrara sabría quién objetó a
              quién y por qué.
            </p>
            <p>
              Si su objeción se declara fundada y da lugar a un ajuste de puntaje, el cambio
              aparecerá en el perfil público del postulante — pero nunca su nombre.
            </p>
          </div>
        </section>
      </div>
      <Pie actualizadoEn={null} />
    </>
  );
}
