import Link from "next/link";
import { Marca } from "./marca";

const ENLACES = [
  { href: "/reglas", texto: "Reglas y baremo" },
  { href: "/postulados", texto: "Postulados" },
  { href: "/ranking", texto: "Ranking" },
  { href: "/informes", texto: "Informes" },
] as const;

/**
 * Header institucional — Neutral Judicial.
 * Rol: Gris Pizarra (`toga-900` / #0f172a). Acento: Oro Viejo (`balanza-600`).
 */
export function Cabecera() {
  return (
    <header className="sticky top-0 z-40 bg-toga-900">
      <div aria-hidden="true" className="h-1 bg-balanza-600" />
      <nav
        aria-label="Navegación principal"
        className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6"
      >
        <Link href="/" className="shrink-0 rounded-md">
          <Marca invertido />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {ENLACES.map((e) => (
            <li key={e.href}>
              <Link
                href={e.href}
                className="rounded-md px-3 py-2 text-sm font-medium text-toga-300 transition-colors duration-150 hover:bg-toga-800 hover:text-white"
              >
                {e.texto}
              </Link>
            </li>
          ))}
        </ul>

        {/* Acción crítica sobre fondo pizarra: Oro Viejo como contraste. */}
        <Link
          href="/postulados"
          className="shrink-0 rounded-md bg-balanza-600 px-3.5 py-2 text-sm font-semibold text-white transition-colors duration-150 hover:bg-balanza-700 sm:px-4"
        >
          Objetar
          <span className="hidden sm:inline"> candidato</span>
        </Link>
      </nav>

      <ul className="flex gap-1 overflow-x-auto border-t border-toga-800 px-4 py-2 md:hidden">
        {ENLACES.map((e) => (
          <li key={e.href}>
            <Link
              href={e.href}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-toga-300 transition-colors duration-150 hover:bg-toga-800 hover:text-white"
            >
              {e.texto}
            </Link>
          </li>
        ))}
      </ul>
    </header>
  );
}
