import Link from "next/link";

/**
 * Cabecera de página del proceso público.
 * Mismo lenguaje que la home: número mono + título serif + filete oro.
 */
export function CabeceraProceso({
  numero,
  titulo,
  descripcion,
  meta,
  acciones,
}: {
  readonly numero: string;
  readonly titulo: string;
  readonly descripcion?: string;
  readonly meta?: React.ReactNode;
  readonly acciones?: React.ReactNode;
}) {
  return (
    <header className="entrada-ui border-b border-toga-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="font-mono text-xs font-medium tracking-wider text-balanza-600">{numero}</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 max-w-3xl">
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-toga-900 sm:text-3xl">
              {titulo}
            </h1>
            {descripcion && (
              <p className="mt-3 text-base leading-relaxed prosa text-toga-600">{descripcion}</p>
            )}
            {meta && <div className="mt-4 flex flex-wrap items-center gap-3">{meta}</div>}
          </div>
          {acciones && <div className="flex shrink-0 flex-wrap gap-2">{acciones}</div>}
        </div>
        <div aria-hidden="true" className="mt-6 h-0.5 w-16 bg-balanza-600" />
      </div>
    </header>
  );
}

export function PanelVacio({
  titulo,
  detalle,
  accion,
}: {
  readonly titulo: string;
  readonly detalle: string;
  readonly accion?: React.ReactNode;
}) {
  return (
    <div className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white px-6 py-10 text-center">
      <p className="font-serif text-lg font-semibold text-toga-900">{titulo}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-toga-500">{detalle}</p>
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}

export function RutaProceso({
  items,
}: {
  readonly items: readonly { readonly href?: string; readonly texto: string }[];
}) {
  return (
    <nav aria-label="Ruta" className="text-sm text-toga-500">
      {items.map((item, i) => (
        <span key={`${item.texto}-${i}`}>
          {i > 0 && (
            <span className="mx-2" aria-hidden="true">
              /
            </span>
          )}
          {item.href ? (
            <Link href={item.href} className="transition-colors duration-150 hover:text-toga-900">
              {item.texto}
            </Link>
          ) : (
            <span className="text-toga-700">{item.texto}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
