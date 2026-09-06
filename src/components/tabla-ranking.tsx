import Link from "next/link";
import type { PublicCandidateListItem } from "@/contracts";
import { InsigniaBanda, InsigniaSala, Puntaje } from "./insignias";

/**
 * Ranking responsive.
 *
 * No hay una forma universal de hacer responsive una tabla de datos: el
 * patrón que recomienda la literatura de accesibilidad es reordenar en
 * tarjetas por debajo del punto de quiebre, en lugar de obligar a desplazar
 * en horizontal — un desplazamiento lateral en móvil esconde columnas sin
 * avisar y es especialmente hostil con lectores de pantalla.
 *
 * Se emite una sola de las dos vistas: la oculta lleva `display:none`, que la
 * saca también del árbol de accesibilidad, de modo que ningún lector anuncia
 * el contenido dos veces.
 */
export function TablaRanking({
  entradas,
}: {
  readonly entradas: readonly PublicCandidateListItem[];
}) {
  return (
    <>
      {/* ── Móvil: una tarjeta por postulante ─────────────────────── */}
      <ul className="space-y-3 md:hidden">
        {entradas.map((c) => (
          <li key={c.publicId}>
            <Link
              href={`/postulados/${c.slug}`}
              className="block border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-4 transition-colors duration-150 hover:bg-toga-50"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="text-sm font-semibold text-toga-900">
                  {c.position !== null ? (
                    <>
                      <span className="text-toga-400">#</span>
                      {c.position}
                    </>
                  ) : (
                    <span className="text-toga-400">Sin posición</span>
                  )}
                  {c.tied && (
                    <span className="ml-2 text-xs font-medium text-balanza-700">empate</span>
                  )}
                </span>
                <Puntaje valor={c.total} tamano="sm" />
              </div>

              <p className="mt-2 font-medium leading-snug text-toga-900">{c.fullName}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <InsigniaSala sala={c.chamber} />
                <InsigniaBanda banda={c.band} />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      {/* ── Escritorio: tabla completa ────────────────────────────── */}
      <div className="hidden overflow-hidden border border-toga-200 border-t-2 border-t-balanza-600 bg-white md:block">
        <table className="w-full text-left text-sm">
          <caption className="sr-only">
            Ranking de postulantes ordenado por puntaje descendente. Las posiciones empatadas
            comparten número.
          </caption>
          <thead className="border-b border-toga-200 bg-toga-50">
            <tr>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-900">
                Pos.
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-900">
                Postulante
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-900">
                Sala
              </th>
              <th scope="col" className="px-4 py-3 text-right font-semibold text-toga-900">
                Puntaje
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-toga-900">
                Estatus
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-toga-100">
            {entradas.map((c) => (
              <tr key={c.publicId} className="transition-colors duration-150 hover:bg-toga-50">
                <th scope="row" className="px-4 py-3 text-left font-normal">
                  {c.position !== null ? (
                    <span className="cifra font-semibold text-toga-900">{c.position}</span>
                  ) : (
                    <span className="text-toga-400">—</span>
                  )}
                  {c.tied && (
                    <span className="ml-1.5 text-xs font-medium text-balanza-700">empate</span>
                  )}
                </th>
                <td className="px-4 py-3">
                  <Link
                    href={`/postulados/${c.slug}`}
                    className="font-medium text-toga-900 hover:text-balanza-700 hover:underline"
                  >
                    {c.fullName}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <InsigniaSala sala={c.chamber} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Puntaje valor={c.total} tamano="sm" />
                </td>
                <td className="px-4 py-3">
                  <InsigniaBanda banda={c.band} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
