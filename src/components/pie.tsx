import Link from "next/link";
import { Marca } from "./marca";
import { SITE } from "@/lib/config";

const ENLACES = [
  { href: "/ranking", numero: "01", texto: "Ranking" },
  { href: "/postulados", numero: "02", texto: "Postulados" },
  { href: "/reglas", numero: "03", texto: "Baremo" },
  { href: "/informes", numero: "04", texto: "Informes" },
  { href: "/privacidad", numero: "", texto: "Privacidad" },
] as const;

export function Pie({ actualizadoEn }: { readonly actualizadoEn?: string | null }) {
  return (
    <footer className="mt-16 border-t border-toga-200">
      {/* Franja de participación ciudadana.
       *
       * Antes repetía el nombre del sitio y ofrecía un botón que duplicaba el
       * de la cabecera —y que, además, prometía «objetar» cuando en realidad
       * llevaba al listado, porque primero hay que elegir a quién se objeta—.
       * Ahora expone las dos acciones que una persona puede hacer de verdad, y
       * saca a la luz la consulta por código de seguimiento, que sólo estaba
       * en la lista de enlaces. */}
      <div className="border-b border-toga-200 bg-toga-900">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-xl">
              <p className="font-mono text-xs tracking-wider text-balanza-500">
                Participación ciudadana
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                Si conoce un hecho que afecte a una credencial, puede documentarlo
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-toga-300">
                Toda objeción se registra con un código de seguimiento y recibe respuesta motivada.
                La identidad de quien objeta no se publica en ningún caso.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:shrink-0">
              <Link
                href="/postulados"
                className="inline-flex w-fit items-center gap-2 rounded-md bg-balanza-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-balanza-700"
              >
                Presentar una objeción <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/seguimiento"
                className="inline-flex w-fit items-center gap-2 rounded-md border border-toga-600 px-4 py-2.5 text-sm font-medium text-toga-100 transition-colors duration-150 hover:border-toga-400 hover:text-white"
              >
                Consultar con mi código
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
            <div className="max-w-sm">
              <Marca />
              <p className="mt-3 text-sm leading-relaxed text-toga-500">{SITE.description}</p>
            </div>

            <nav aria-label="Enlaces del pie">
              <p className="font-mono text-xs tracking-wider text-balanza-600">Proceso</p>
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {ENLACES.map((e) => (
                  <li key={e.href}>
                    <Link
                      href={e.href}
                      className="text-sm text-toga-700 transition-colors duration-150 hover:text-balanza-700"
                    >
                      {e.numero ? (
                        <span className="mr-2 font-mono text-xs text-toga-400">{e.numero}</span>
                      ) : null}
                      {e.texto}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div className="mt-10 border-t border-toga-100 pt-6 text-xs text-toga-500">
            {actualizadoEn ? (
              <p>
                Última actualización pública:{" "}
                <time dateTime={actualizadoEn} className="font-medium text-toga-700">
                  {new Date(actualizadoEn).toLocaleString("es-VE", {
                    dateStyle: "long",
                    timeStyle: "short",
                  })}
                </time>
              </p>
            ) : (
              <p>Aún no se ha publicado información.</p>
            )}
            <p className="mt-2">
              Datos de demostración. Los perfiles mostrados son ficticios y no corresponden a
              personas reales.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
