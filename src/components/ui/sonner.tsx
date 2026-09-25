"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

/**
 * Toast de shadcn (Sonner), con la paleta CIVIS.
 * El icono va junto al texto: el color no es la única señal.
 */
export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      position="top-center"
      richColors
      closeButton
      duration={8000}
      offset="1rem"
      containerAriaLabel="Avisos"
      toastOptions={{ closeButtonAriaLabel: "Cerrar aviso" }}
      style={
        {
          "--normal-bg": "var(--color-lienzo)",
          "--normal-text": "var(--color-gris-pizarra)",
          "--normal-border": "var(--color-borde-lienzo)",
          "--error-bg": "var(--color-balanza-50)",
          "--error-border": "var(--color-balanza-200)",
          "--error-text": "var(--color-balanza-700)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
