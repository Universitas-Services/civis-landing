import Link from "next/link";
import type { Metadata } from "next";
import type { PublicCandidateListItem } from "@/contracts";
import { apiGet } from "@/lib/api";
import { Pie } from "@/components/pie";
import { CabeceraProceso, PanelVacio } from "@/components/cabecera-proceso";
import { InsigniaBanda, InsigniaSala, Puntaje } from "@/components/insignias";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Postulados",
  description: "Listado público de postulantes con su puntaje, sala y expediente consultable.",
};

interface Respuesta {
  readonly items: PublicCandidateListItem[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly publishedAt: string | null;
}

const SALAS = [
  ["", "Todas las salas"],
  ["CONSTITUCIONAL", "Constitucional"],
  ["POLITICO_ADMINISTRATIVA", "Político-Administrativa"],
  ["ELECTORAL", "Electoral"],
  ["CASACION_CIVIL", "Casación Civil"],
  ["CASACION_PENAL", "Casación Penal"],
  ["CASACION_SOCIAL", "Casación Social"],
] as const;

export default async function Postulados({
  searchParams,
}: {
  readonly searchParams: Promise<{ q?: string; chamber?: string; page?: string }>;
}) {
  const params = await searchParams;
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.chamber) query.set("chamber", params.chamber);
  query.set("page", params.page ?? "1");
  query.set("pageSize", "20");

  const data = await apiGet<Respuesta>(`/public/candidates?${query}`).catch(() => null);

  return (
    <>
      <CabeceraProceso
        numero="02"
        titulo="Postulados"
        descripcion="Sólo perfiles con publicación autorizada. En cada ficha puede consultar el expediente y objetar una credencial."
      />

      <div
        className="entrada-ui mx-auto max-w-6xl px-4 py-10 sm:px-6"
        style={{ animationDelay: "40ms" }}
      >
        <form
          method="get"
          className="flex flex-col gap-3 border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label htmlFor="q" className="block text-xs font-medium text-toga-600">
              Buscar por nombre
            </label>
            <input
              id="q"
              name="q"
              type="search"
              defaultValue={params.q ?? ""}
              placeholder="Nombre o apellido"
              className="mt-1 w-full rounded-md border border-toga-300 px-3 py-2.5 text-sm text-toga-900 placeholder:text-toga-400"
            />
          </div>
          <div className="sm:w-64">
            <label htmlFor="chamber" className="block text-xs font-medium text-toga-600">
              Sala de postulación
            </label>
            <select
              id="chamber"
              name="chamber"
              defaultValue={params.chamber ?? ""}
              className="mt-1 w-full rounded-md border border-toga-300 bg-white px-3 py-2.5 text-sm text-toga-900"
            >
              {SALAS.map(([valor, texto]) => (
                <option key={valor} value={valor}>
                  {texto}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md bg-toga-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-toga-800"
          >
            Filtrar
          </button>
        </form>

        {!data ? (
          <div className="mt-8">
            <PanelVacio
              titulo="No se pudo cargar el listado"
              detalle="Intente de nuevo en unos minutos."
            />
          </div>
        ) : data.items.length === 0 ? (
          <div className="mt-8">
            <PanelVacio
              titulo="Sin resultados"
              detalle="Ningún postulante coincide con la búsqueda."
              accion={
                <Link
                  href="/postulados"
                  className="text-sm font-semibold text-balanza-700 hover:underline"
                >
                  Limpiar filtros
                </Link>
              }
            />
          </div>
        ) : (
          <>
            <p className="mt-8 font-mono text-xs tracking-wider text-toga-500">
              {String(data.total).padStart(2, "0")}{" "}
              {data.total === 1 ? "postulante" : "postulantes"}
            </p>
            <ul className="mt-3 divide-y divide-toga-200 overflow-hidden border border-toga-200 border-t-2 border-t-balanza-600 bg-white">
              {data.items.map((c) => (
                <li key={c.publicId}>
                  <Link
                    href={`/postulados/${c.slug}`}
                    className="flex flex-col gap-3 px-5 py-4 transition-colors duration-150 hover:bg-toga-50 sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-base font-semibold leading-snug text-toga-900">
                        {c.fullName}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <InsigniaSala sala={c.chamber} />
                        {c.position !== null && (
                          <span className="text-xs font-medium text-toga-500">
                            Pos. {c.position}
                            {c.tied && " · empate"}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 sm:ml-auto">
                      <Puntaje valor={c.total} tamano="sm" />
                      <InsigniaBanda banda={c.band} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
      <Pie actualizadoEn={data?.publishedAt ?? null} />
    </>
  );
}
