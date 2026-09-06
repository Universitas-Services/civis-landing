import Link from "next/link";
import type { Metadata } from "next";
import { Pie } from "@/components/pie";
import { CabeceraProceso } from "@/components/cabecera-proceso";

export const metadata: Metadata = {
  title: "Privacidad y uso de datos",
  description: "Qué datos se publican, cuáles no, y cómo se protege a quien objeta.",
};

function Seccion({
  titulo,
  children,
}: {
  readonly titulo: string;
  readonly children: React.ReactNode;
}) {
  return (
    <section className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5">
      <h2 className="font-serif text-base font-semibold text-toga-900">{titulo}</h2>
      <div className="mt-2 space-y-2 text-base leading-relaxed prosa text-toga-600">{children}</div>
    </section>
  );
}

export default function Privacidad() {
  return (
    <>
      <CabeceraProceso
        numero="Privacidad"
        titulo="Privacidad y uso de datos"
        descripcion="Este proceso busca transparencia sobre credenciales profesionales, no sobre la vida privada de nadie. Lo que sigue explica exactamente qué se publica y qué no."
      />

      <div className="entrada-ui mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="space-y-4">
          <Seccion titulo="Qué se publica de los postulantes">
            <p>
              Nombre completo, sala a la que aspira, resumen profesional, puntaje total y su
              desglose por dimensión del baremo, y los documentos que el comité clasificó
              expresamente como públicos.
            </p>
            <p>
              <strong className="text-toga-900">No se publica</strong> la cédula, el correo, el
              teléfono, las notas internas de evaluación ni ningún documento que no haya sido
              autorizado archivo por archivo.
            </p>
          </Seccion>

          <Seccion titulo="Nada se publica solo">
            <p>
              Ningún dato ni documento llega a esta página de forma automática. Cada publicación
              exige que una persona con rol de publicación revise la vista previa y la apruebe,
              dejando constancia de quién lo hizo y por qué.
            </p>
          </Seccion>

          <Seccion titulo="Si usted objeta a un candidato">
            <p>
              Su nombre, cédula, correo y teléfono se guardan de forma privada y{" "}
              <strong className="text-toga-900">no se publican en ningún caso</strong>. El texto de
              su objeción tampoco se publica.
            </p>
            <p>
              Lo único que puede llegar a aparecer públicamente es una etiqueta indicando que cierta
              credencial tiene una objeción fundada — sin su identidad y sin el contenido de lo que
              usted escribió.
            </p>
            <p>
              Recibirá un código de seguimiento. Ese código sólo devuelve un estado general
              (recibida, en revisión, resuelta): nunca las observaciones internas del comité.
            </p>
          </Seccion>

          <Seccion titulo="Los documentos">
            <p>
              Los expedientes se guardan en almacenamiento privado. Los archivos públicos se sirven
              mediante enlaces temporales que caducan a los pocos minutos, de forma que un enlace
              copiado no queda accesible de forma indefinida.
            </p>
          </Seccion>

          <Seccion titulo="Registro de actividad">
            <p>
              Toda operación sensible queda registrada en una bitácora que nadie puede editar ni
              borrar desde la aplicación: quién hizo qué, cuándo y con qué rol. Esa bitácora no
              guarda contraseñas, ni la identidad de quien objeta, ni el contenido de los
              documentos.
            </p>
          </Seccion>

          <Seccion titulo="Decisiones pendientes">
            <p>
              La política de retención, anonimización y eliminación de datos está pendiente de
              definición institucional. Mientras tanto no se elimina información: se conserva para
              auditoría.
            </p>
          </Seccion>
        </div>

        <p className="mt-8 border border-balanza-600/25 border-t-2 border-t-balanza-600 bg-balanza-50 px-4 py-3 text-sm text-balanza-700">
          <strong>Entorno de demostración.</strong> Los perfiles y objeciones que se muestran son
          ficticios y no corresponden a personas reales.
        </p>

        <Link
          href="/"
          className="mt-8 inline-block text-sm font-medium text-balanza-700 transition-colors duration-150 hover:underline"
        >
          ← Volver al inicio
        </Link>
      </div>
      <Pie actualizadoEn={null} />
    </>
  );
}
