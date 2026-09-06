import type { SuitabilityBand } from "@/contracts";

/**
 * Semáforo de idoneidad.
 *
 * El color nunca comunica solo: cada insignia lleva texto y un símbolo, para
 * que siga siendo legible con daltonismo o en impresión (WCAG 1.4.1).
 */
const BANDAS: Record<SuitabilityBand, { etiqueta: string; clases: string; simbolo: string }> = {
  HIGH: {
    etiqueta: "Altamente idóneo",
    clases: "bg-validado-50 text-validado-700 ring-validado-700/20",
    simbolo: "●",
  },
  MEDIUM: {
    etiqueta: "Idóneo medio",
    clases: "bg-balanza-50 text-balanza-700 ring-balanza-600/25",
    simbolo: "◐",
  },
  LOW: {
    etiqueta: "Perfil insuficiente",
    clases: "bg-objetado-100 text-objetado-600 ring-objetado-600/20",
    simbolo: "○",
  },
  INELIGIBLE: {
    etiqueta: "Inhabilitado",
    clases: "bg-toga-900 text-toga-50 ring-toga-900/40",
    simbolo: "✕",
  },
};

export function InsigniaBanda({ banda }: { readonly banda: SuitabilityBand }) {
  const b = BANDAS[banda] ?? BANDAS.LOW;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${b.clases}`}
    >
      <span aria-hidden="true">{b.simbolo}</span>
      {b.etiqueta}
    </span>
  );
}

export function InsigniaSala({ sala }: { readonly sala: string }) {
  const legible = sala
    .toLowerCase()
    .split("_")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  return (
    <span className="inline-flex rounded-md bg-toga-100 px-2 py-0.5 text-xs font-medium text-toga-600 ring-1 ring-inset ring-toga-200">
      {legible}
    </span>
  );
}

export function InsigniaProvisional() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-balanza-50 px-2 py-0.5 text-xs font-medium text-balanza-700 ring-1 ring-inset ring-balanza-600/25">
      Resultado provisional
    </span>
  );
}

/** Puntaje sobre 100, con la cifra como dato principal. */
export function Puntaje({
  valor,
  tamano = "md",
}: {
  readonly valor: number;
  readonly tamano?: "sm" | "md" | "lg";
}) {
  const clases = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-5xl",
  }[tamano];
  return (
    <span className="inline-flex items-baseline gap-1 tabular-nums">
      <span className={`${clases} font-semibold tracking-tight text-toga-900`}>{valor}</span>
      <span className="text-xs text-toga-500">/ 100</span>
    </span>
  );
}
