"use client";

import { useState } from "react";
import Link from "next/link";
import { createObjectionSchema, type PublicObjectionReceipt } from "@/contracts";
import { apiPost, ApiError } from "@/lib/api";

const CATEGORIAS = [
  ["POLITICAL_MILITANCY", "Militancia político-partidista", "Art. 37 LOTSJ"],
  ["KINSHIP", "Parentesco con altos funcionarios", "Art. 37 LOTSJ"],
  ["STATE_CONTRACTS", "Contrataciones vigentes con el Estado", "Art. 37 LOTSJ"],
  ["FIRM_SANCTION", "Sanción definitivamente firme", "Art. 37 LOTSJ"],
  ["FALSE_CREDENTIAL", "Credencial falsa o no acreditable", ""],
  ["INSUFFICIENT_EXPERIENCE", "No alcanza los años de ejercicio exigidos", "Art. 263 CRBV"],
  ["OTHER", "Otra causal", ""],
] as const;

export function FormularioObjecion({
  publicId,
  nombrePostulante,
}: {
  readonly publicId: string;
  readonly nombrePostulante: string;
}) {
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [recibo, setRecibo] = useState<PublicObjectionReceipt | null>(null);
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);

  async function enviar(formData: FormData) {
    setErrores({});
    setErrorGeneral(null);

    const bruto = {
      objectorFullName: String(formData.get("objectorFullName") ?? ""),
      objectorNationalId: String(formData.get("objectorNationalId") ?? "") || undefined,
      objectorEmail: String(formData.get("objectorEmail") ?? ""),
      objectorPhone: String(formData.get("objectorPhone") ?? "") || undefined,
      category: formData.get("category"),
      description: String(formData.get("description") ?? ""),
      privacyConsent: formData.get("privacyConsent") === "on",
      website: String(formData.get("website") ?? ""),
    };

    // Se valida con el MISMO esquema que usa la API: un solo contrato.
    const resultado = createObjectionSchema.safeParse(bruto);
    if (!resultado.success) {
      const mapa: Record<string, string> = {};
      for (const issue of resultado.error.issues) {
        const campo = issue.path.join(".");
        if (!mapa[campo]) mapa[campo] = issue.message;
      }
      setErrores(mapa);
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await apiPost<PublicObjectionReceipt>(
        `/public/candidates/${publicId}/objections`,
        resultado.data,
      );
      setRecibo(respuesta);
    } catch (error) {
      setErrorGeneral(
        error instanceof ApiError && error.status === 429
          ? "Se recibieron demasiadas solicitudes desde su conexión. Intente más tarde."
          : "No se pudo registrar la objeción. Intente de nuevo en unos minutos.",
      );
    } finally {
      setEnviando(false);
    }
  }

  if (recibo) {
    return (
      <div className="border border-validado-700/20 border-t-2 border-t-validado-700 bg-validado-50 p-6">
        <p className="font-mono text-xs tracking-wider text-validado-700">Recibo</p>
        <h2 className="mt-1 font-serif text-lg font-semibold text-validado-700">
          Objeción registrada
        </h2>
        <p className="mt-2 text-base leading-relaxed prosa text-toga-700">
          Su objeción fue recibida y será revisada por el comité técnico. Guarde este código: es la
          única forma de consultar su estado.
        </p>
        <p className="mt-4 border border-validado-700/20 bg-white px-4 py-3 text-center font-mono text-lg font-semibold tracking-wider text-toga-900">
          {recibo.trackingCode}
        </p>
        <p className="mt-4 text-sm text-toga-600">
          Su identidad no se publica. La objeción tampoco se publica automáticamente, y no modifica
          ningún puntaje por sí sola.
        </p>
        <Link
          href="/postulados"
          className="mt-5 inline-block rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-balanza-700"
        >
          Volver a los postulados
        </Link>
      </div>
    );
  }

  const claseCampo =
    "mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";

  function Error({ campo }: { readonly campo: string }) {
    if (!errores[campo]) return null;
    return (
      <p role="alert" className="mt-1 text-xs font-medium text-balanza-700">
        {errores[campo]}
      </p>
    );
  }

  return (
    <form action={enviar} className="space-y-6" noValidate>
      {errorGeneral && (
        <p
          role="alert"
          className="rounded-md border border-balanza-600/25 bg-balanza-50 px-4 py-3 text-sm text-balanza-700"
        >
          {errorGeneral}
        </p>
      )}

      {/* Honeypot: invisible para personas, tentador para bots. */}
      <div aria-hidden="true" className="absolute left-[-9999px]">
        <label htmlFor="website">No rellenar</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5">
        <legend className="px-2 font-mono text-xs tracking-wider text-balanza-600">
          01 · Identificación del objetante
        </legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="objectorFullName" className="block text-xs font-medium text-toga-600">
              Nombre completo <span className="text-balanza-700">*</span>
            </label>
            <input id="objectorFullName" name="objectorFullName" required className={claseCampo} />
            <Error campo="objectorFullName" />
          </div>
          <div>
            <label htmlFor="objectorEmail" className="block text-xs font-medium text-toga-600">
              Correo electrónico <span className="text-balanza-700">*</span>
            </label>
            <input
              id="objectorEmail"
              name="objectorEmail"
              type="email"
              required
              className={claseCampo}
            />
            <Error campo="objectorEmail" />
          </div>
          <div>
            <label htmlFor="objectorNationalId" className="block text-xs font-medium text-toga-600">
              Cédula <span className="text-toga-400">(opcional)</span>
            </label>
            <input
              id="objectorNationalId"
              name="objectorNationalId"
              placeholder="V-12345678"
              className={claseCampo}
            />
            <Error campo="objectorNationalId" />
          </div>
          <div>
            <label htmlFor="objectorPhone" className="block text-xs font-medium text-toga-600">
              Teléfono <span className="text-toga-400">(opcional)</span>
            </label>
            <input id="objectorPhone" name="objectorPhone" type="tel" className={claseCampo} />
          </div>
        </div>
      </fieldset>

      <fieldset className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5">
        <legend className="px-2 font-mono text-xs tracking-wider text-balanza-600">
          02 · Tipificación
        </legend>
        <p className="text-xs text-toga-500">
          Seleccione la causal legal en la que enmarca su objeción sobre {nombrePostulante}.
        </p>
        <div className="mt-3 space-y-2">
          {CATEGORIAS.map(([valor, texto, base]) => (
            <label
              key={valor}
              className="flex cursor-pointer items-start gap-3 rounded-md border border-toga-200 p-3 hover:bg-toga-50"
            >
              <input type="radio" name="category" value={valor} required className="mt-0.5" />
              <span className="text-sm text-toga-900">
                {texto}
                {base && <span className="ml-2 text-xs text-toga-500">({base})</span>}
              </span>
            </label>
          ))}
        </div>
        <Error campo="category" />
      </fieldset>

      <fieldset className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5">
        <legend className="px-2 font-mono text-xs tracking-wider text-balanza-600">
          03 · Relación de hechos
        </legend>
        <label htmlFor="description" className="block text-xs font-medium text-toga-600">
          Describa los hechos de forma cronológica <span className="text-balanza-700">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={7}
          required
          minLength={50}
          placeholder="Indique qué credencial objeta, por qué, y qué pruebas la sustentan."
          className={claseCampo}
        />
        <Error campo="description" />
      </fieldset>

      <fieldset className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5">
        <legend className="px-2 font-mono text-xs tracking-wider text-balanza-600">
          04 · Consentimiento
        </legend>
        <label className="flex cursor-pointer items-start gap-3">
          <input type="checkbox" name="privacyConsent" required className="mt-1" />
          <span className="text-base leading-relaxed prosa text-toga-700">
            He leído el{" "}
            <Link href="/privacidad" className="font-medium text-balanza-700 underline">
              aviso de privacidad
            </Link>{" "}
            y autorizo el tratamiento de mis datos para la tramitación de esta objeción. Entiendo
            que mi identidad no se publica.
          </span>
        </label>
        <Error campo="privacyConsent" />
      </fieldset>

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-md bg-balanza-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-balanza-700 disabled:opacity-60 sm:w-auto"
      >
        {enviando ? "Enviando…" : "Enviar objeción"}
      </button>
    </form>
  );
}
