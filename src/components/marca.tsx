import { SITE } from "@/lib/config";

/**
 * Isotipo provisional: escudo de veeduría dibujado en línea, con el capitel
 * de una columna cuyo borde derecho insinúa un check de verificación.
 * NO es el logotipo definitivo (ver docs/pending-decisions.md, punto 1).
 */
export function Escudo({ className = "h-8 w-8" }: { readonly className?: string }) {
  return (
    <svg viewBox="0 0 32 36" className={className} aria-hidden="true" fill="none">
      <path
        d="M16 1.5 30 6v12c0 8.2-5.6 14.2-14 16.5C7.6 32.2 2 26.2 2 18V6l14-4.5Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path
        d="M9 13h14M10.5 13v9M21.5 13v9M8 22h16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M13 17.5l2.5 2.5 5-5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * La marca se adapta al ancho disponible.
 *
 * En pantallas estrechas el nombre completo dejaba sin sitio al botón de
 * objeción, que es la acción más importante de la página. Por debajo de `sm`
 * se muestran las siglas; el nombre completo sigue disponible para lectores
 * de pantalla en el `sr-only`.
 */
export function Marca({ invertido = false }: { readonly invertido?: boolean }) {
  return (
    <span className="flex items-center gap-2 sm:gap-3">
      <Escudo
        className={`h-8 w-8 shrink-0 sm:h-9 sm:w-9 ${
          invertido ? "text-balanza-500" : "text-balanza-600"
        }`}
      />

      {/* Pantalla estrecha: siglas */}
      <span
        className={`font-serif text-lg font-semibold tracking-tight sm:hidden ${
          invertido ? "text-white" : "text-toga-900"
        }`}
      >
        {SITE.shortName}
      </span>

      {/* Pantalla ancha: nombre completo en dos líneas */}
      <span className="hidden leading-tight sm:block">
        <span
          className={`block font-serif text-[0.95rem] font-semibold tracking-tight ${
            invertido ? "text-white" : "text-toga-900"
          }`}
        >
          CONSEJO INDEPENDIENTE
        </span>
        <span
          className={`block text-[0.62rem] uppercase tracking-[0.2em] ${
            invertido ? "text-toga-300" : "text-toga-500"
          }`}
        >
          Verificación de credenciales
        </span>
      </span>

      <span className="sr-only">{SITE.name}</span>
    </span>
  );
}
