import Image from "next/image";
import { SITE } from "@/lib/config";

/**
 * Marca CIVIS.
 *
 * Sobre fondo oscuro (`invertido`): logo horizontal blanco.
 * Sobre lienzo claro: logo horizontal a color.
 * El nombre completo queda en `sr-only` para lectores de pantalla.
 */
export function Marca({ invertido = false }: { readonly invertido?: boolean }) {
  return (
    <span className="flex items-center">
      <Image
        src={invertido ? "/brand/logo-horiz-blanco.png" : "/brand/logo-horiz.png"}
        alt=""
        width={220}
        height={56}
        className="h-9 w-auto max-w-[11rem] object-contain object-left sm:h-10 sm:max-w-[14rem]"
        priority
      />
      <span className="sr-only">{SITE.name}</span>
    </span>
  );
}
