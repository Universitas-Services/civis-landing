"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  createObjectionSchema,
  OBJECTION_CAUSE,
  type CreateObjectionInput,
  type ObjectionCause,
  type PublicObjectionReceipt,
} from "@/contracts";
import { apiPost, ApiError } from "@/lib/api";

type BorradorDenuncia = Omit<CreateObjectionInput, "verificationCode">;

const CAUSAS: readonly { codigo: ObjectionCause; texto: string }[] = [
  { codigo: "EXCLUSIVE_NATIONALITY", texto: "Falta de nacionalidad originaria exclusiva" },
  { codigo: "LACK_OF_HONOR", texto: "Carencia de reconocida honorabilidad y conducta ética" },
  {
    codigo: "INSUFFICIENT_CAREER",
    texto: "Insuficiencia en la trayectoria profesional (menos de 15 años)",
  },
  {
    codigo: "MISSING_TITULAR_PROFESSOR",
    texto: "Falta de rango de profesor titular (para la vía docente)",
  },
  {
    codigo: "MISSING_JUDICIAL_RANK",
    texto: "Falta de jerarquía judicial mínima (para la vía judicial)",
  },
  {
    codigo: "MISSING_POSTGRADUATE",
    texto: "Carencia de formación de posgrado en ciencia jurídica",
  },
  { codigo: "POLITICAL_MILITANCY", texto: "Militancia política activa o proselitismo" },
  { codigo: "STATE_CONTRACTS", texto: "Conflicto de interés por contrataciones con el Estado" },
  {
    codigo: "KINSHIP_HIGH_OFFICIALS",
    texto: "Vínculo de parentesco con altos funcionarios del Estado",
  },
  { codigo: "INCOMPATIBLE_MARRIAGE", texto: "Unión conyugal incompatible" },
  {
    codigo: "KINSHIP_NOMINATION_COMMITTEE",
    texto: "Parentesco con miembros del Comité de Postulaciones Judiciales",
  },
  { codigo: "FIRM_SANCTION", texto: "Inhabilitación o sanción firme" },
  { codigo: "PROVEN_MENTAL_INCAPACITY", texto: "Incapacidad mental comprobada" },
  { codigo: "OTHER", texto: "Otro" },
];

/** Zod, en inglés, cuando el esquema no trae un mensaje propio. */
const MENSAJE_TECNICO =
  /too small|too big|invalid input|invalid option|invalid string|expected string|expected array|invalid email|invalid url/i;

const MENSAJE_CAMPO: Record<string, string> = {
  objectorFullName:
    "Escriba el nombre y el apellido (mínimo 2 letras cada uno). Sólo letras y espacios.",
  objectorNationalId: "La cédula debe tener entre 6 y 8 dígitos.",
  objectorEmail: "Correo inválido.",
  causes: "Seleccione al menos una causal.",
  otherCause: "Indique la otra razón.",
  description: "Describa los hechos con al menos 50 caracteres.",
  evidenceUrl: "Indique un enlace válido a las pruebas.",
  verificationCode: "El código de verificación tiene 6 dígitos.",
  privacyConsent: "Debe aceptar el aviso de privacidad.",
};

function mensajeDeCampo(campo: string, mensaje: string): string {
  const limpio = mensaje.replace(/\s+/g, " ").trim();
  if (limpio && !MENSAJE_TECNICO.test(limpio)) return limpio;
  return MENSAJE_CAMPO[campo] ?? "Revise este dato.";
}

function mensajeDeServidor(mensaje: string, respaldo: string): string {
  const limpio = mensaje.replace(/\s+/g, " ").trim();
  if (!limpio || MENSAJE_TECNICO.test(limpio)) return respaldo;
  return limpio;
}

function mensajeDeDenuncia(error: unknown, paso: "codigo" | "denuncia"): string {
  const respaldo =
    paso === "codigo"
      ? "No se pudo enviar el código de verificación."
      : "No se pudo registrar la denuncia. Intente de nuevo en unos minutos.";
  if (!(error instanceof ApiError)) return respaldo;
  if (error.status === 403) {
    return "El lapso de impugnación está cerrado. La denuncia no se envió.";
  }
  if (error.status === 503) {
    return paso === "codigo"
      ? "No se pudo enviar el código de verificación. Intente de nuevo."
      : "No se pudo enviar el correo, así que la denuncia no quedó registrada.";
  }
  if (error.status === 429) {
    return "Se recibieron demasiadas solicitudes desde su conexión. Intente más tarde.";
  }
  if (error.status === 400 && paso === "denuncia") {
    return mensajeDeServidor(error.message, "El código no es válido o ya caducó.");
  }
  return mensajeDeServidor(error.message, respaldo);
}

function avisar(mensaje: string) {
  toast.error(mensaje, { id: "aviso-denuncia" });
}

const ANCLA_CAMPO: Record<string, string> = {
  objectorNationalId: "numeroCedula",
  causes: "causales",
  privacyConsent: "privacyConsent",
};

/** Igual que el alta de expediente del panel: sólo letras, tildes, ñ y espacios. */
function filtrarNombre(valor: string): string {
  return valor.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]/g, "").replace(/\s{2,}/g, " ");
}

function nombreCompletoValido(valor: string): boolean {
  return /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,}(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]{2,})+$/.test(valor.trim());
}

function mostrarPrimerError(campos: Record<string, string>) {
  const primero = Object.keys(campos)[0];
  if (!primero) return;
  const nodo = document.getElementById(ANCLA_CAMPO[primero] ?? primero);
  nodo?.scrollIntoView({ behavior: "smooth", block: "center" });
}

const SALA: Record<string, string> = {
  CONSTITUCIONAL: "Sala Constitucional",
  POLITICO_ADMINISTRATIVA: "Sala Político-Administrativa",
  ELECTORAL: "Sala Electoral",
  CASACION_CIVIL: "Sala de Casación Civil",
  CASACION_PENAL: "Sala de Casación Penal",
  CASACION_SOCIAL: "Sala de Casación Social",
  PLENA: "Sala Plena",
};

export function FormularioObjecion({
  publicId,
  nombrePostulante,
  cedulaPostulante,
  sala,
}: {
  readonly publicId: string;
  readonly nombrePostulante: string;
  readonly cedulaPostulante: string;
  readonly sala: string;
}) {
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [enviando, setEnviando] = useState(false);
  const [pidiendoCodigo, setPidiendoCodigo] = useState(false);
  const [modalCodigo, setModalCodigo] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [borrador, setBorrador] = useState<BorradorDenuncia | null>(null);
  const [causas, setCausas] = useState<readonly ObjectionCause[]>([]);
  const [recibo, setRecibo] = useState<PublicObjectionReceipt | null>(null);
  const [nombreObjetante, setNombreObjetante] = useState("");
  const [digitosCedula, setDigitosCedula] = useState("");
  const [correoObjetante, setCorreoObjetante] = useState("");
  const formulario = useRef<HTMLFormElement>(null);

  const codigoListo = /^\d{6}$/.test(codigo);

  function alternarCausa(codigo: ObjectionCause) {
    setCausas((prev) =>
      prev.includes(codigo) ? prev.filter((c) => c !== codigo) : [...prev, codigo],
    );
  }

  function cerrarModal() {
    if (enviando) return;
    setModalCodigo(false);
  }

  useEffect(() => {
    if (!modalCodigo) return;
    function alPulsar(event: KeyboardEvent) {
      if (event.key === "Escape" && !enviando) {
        setModalCodigo(false);
      }
    }
    document.addEventListener("keydown", alPulsar);
    return () => document.removeEventListener("keydown", alPulsar);
  }, [modalCodigo, enviando]);

  function leerFormulario(formData: FormData) {
    const prefijo = String(formData.get("prefijoCedula") ?? "V");
    const numero = String(formData.get("numeroCedula") ?? "").replace(/\D/g, "");
    return {
      objectorFullName: String(formData.get("objectorFullName") ?? ""),
      objectorNationalId: numero ? `${prefijo}-${numero}` : "",
      objectorEmail: String(formData.get("objectorEmail") ?? ""),
      causes: causas.filter((c) => (OBJECTION_CAUSE as readonly string[]).includes(c)),
      otherCause: String(formData.get("otherCause") ?? "") || undefined,
      description: String(formData.get("description") ?? ""),
      evidenceUrl: String(formData.get("evidenceUrl") ?? ""),
      privacyConsent: formData.get("privacyConsent") === "on",
      website: String(formData.get("website") ?? ""),
    };
  }

  async function prepararDenuncia(formData: FormData) {
    setErrores({});
    const leido = leerFormulario(formData);
    const resultado = createObjectionSchema.safeParse({
      ...leido,
      verificationCode: "000000",
    });
    const mapa: Record<string, string> = {};
    if (!nombreCompletoValido(leido.objectorFullName)) {
      mapa.objectorFullName = MENSAJE_CAMPO.objectorFullName ?? "Revise este dato.";
    }
    const digitos = leido.objectorNationalId.split("-")[1] ?? "";
    if (!/^\d{6,8}$/.test(digitos)) {
      mapa.objectorNationalId =
        digitos.length === 0
          ? "Indique la cédula."
          : (MENSAJE_CAMPO.objectorNationalId ?? "Revise este dato.");
    }
    if (!resultado.success) {
      for (const issue of resultado.error.issues) {
        const campo = issue.path.join(".");
        if (campo === "verificationCode" || mapa[campo]) continue;
        mapa[campo] = mensajeDeCampo(campo, issue.message);
      }
    }
    if (Object.keys(mapa).length > 0 || !resultado.success) {
      setErrores(mapa);
      avisar("Revise los datos marcados en el formulario.");
      mostrarPrimerError(mapa);
      return;
    }

    const { verificationCode: _codigoProvisional, ...datos } = resultado.data;

    setPidiendoCodigo(true);
    try {
      await apiPost("/public/objections/codigo", { email: datos.objectorEmail });
      setBorrador(datos);
      setCodigo("");
      setModalCodigo(true);
    } catch (error) {
      avisar(mensajeDeDenuncia(error, "codigo"));
    } finally {
      setPidiendoCodigo(false);
    }
  }

  async function confirmarDenuncia() {
    if (!borrador || !codigoListo) return;
    const resultado = createObjectionSchema.safeParse({
      ...borrador,
      verificationCode: codigo,
    });
    if (!resultado.success) {
      const issue = resultado.error.issues.find((item) => item.path[0] === "verificationCode");
      avisar(
        mensajeDeCampo(
          "verificationCode",
          issue?.message ?? "El código de verificación tiene 6 dígitos.",
        ),
      );
      return;
    }

    setEnviando(true);
    try {
      const respuesta = await apiPost<PublicObjectionReceipt>(
        `/public/candidates/${publicId}/objections`,
        resultado.data,
        30_000,
      );
      setModalCodigo(false);
      setRecibo(respuesta);
    } catch (error) {
      avisar(mensajeDeDenuncia(error, "denuncia"));
    } finally {
      setEnviando(false);
    }
  }

  const claseCampo =
    "mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-sm text-toga-900 placeholder:text-toga-400";
  const salaLegible = SALA[sala] ?? sala;

  function Error({ campo }: { readonly campo: string }) {
    if (!errores[campo]) return null;
    return (
      <p role="alert" className="mt-1 text-xs font-medium text-balanza-700">
        {errores[campo]}
      </p>
    );
  }

  return (
    <>
      {recibo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-toga-900/50 px-4">
          <div
            role="dialog"
            aria-labelledby="denuncia-enviada"
            className="w-full max-w-md border border-validado-700/20 border-t-2 border-t-validado-700 bg-white p-6"
          >
            <p className="font-mono text-xs tracking-wider text-validado-700">Correo enviado</p>
            <h2
              id="denuncia-enviada"
              className="mt-1 font-serif text-lg font-semibold text-toga-900"
            >
              La denuncia fue enviada a su correo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-toga-700">
              Revise el buzón que indicó. El correo incluye este código de seguimiento y el PDF de
              la denuncia adjunto:
            </p>
            <p className="mt-4 border border-toga-200 bg-toga-50 px-4 py-3 text-center font-mono text-lg font-semibold tracking-wider text-toga-900">
              {recibo.trackingCode}
            </p>
            <Link
              href="/postulados"
              className="mt-5 inline-block rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700"
            >
              Volver a los postulados
            </Link>
          </div>
        </div>
      )}

      {modalCodigo && borrador && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-toga-900/50 px-4"
          onClick={(event) => {
            if (event.target === event.currentTarget) cerrarModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="codigo-enviado"
            aria-describedby="codigo-enviado-detalle"
            className="w-full max-w-md border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-6"
          >
            <p className="font-mono text-xs tracking-wider text-balanza-600">Código enviado</p>
            <h2 id="codigo-enviado" className="mt-1 font-serif text-lg font-semibold text-toga-900">
              Revise su correo
            </h2>
            <p id="codigo-enviado-detalle" className="mt-2 text-sm leading-relaxed text-toga-700">
              Enviamos un código de 6 dígitos a{" "}
              <strong className="font-medium text-toga-900">{borrador.objectorEmail}</strong>.
              Escríbalo para enviar la denuncia. Caduca en 10 minutos.
            </p>
            <label
              htmlFor="verificationCode"
              className="mt-4 block text-xs font-medium text-toga-600"
            >
              Código de verificación <span className="text-balanza-700">*</span>
            </label>
            <input
              id="verificationCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              autoFocus
              maxLength={6}
              value={codigo}
              onChange={(event) => setCodigo(event.target.value.replace(/\D/g, "").slice(0, 6))}
              onKeyDown={(event) => {
                if (event.key === "Enter" && codigoListo && !enviando) {
                  event.preventDefault();
                  void confirmarDenuncia();
                }
              }}
              className="codigo mt-1 w-full rounded-md border border-toga-300 px-3 py-2 text-base tracking-wider text-toga-900"
            />
            <p className="mt-2 text-xs text-toga-500">
              El botón se habilita cuando el código tiene 6 dígitos. La denuncia se envía solo si el
              código es correcto.
            </p>
            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={cerrarModal}
                disabled={enviando}
                className="rounded-md border border-toga-300 bg-white px-5 py-2.5 text-sm font-semibold text-toga-700 hover:bg-toga-50 disabled:opacity-60"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={() => void confirmarDenuncia()}
                disabled={enviando || !codigoListo}
                className="rounded-md bg-balanza-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60"
              >
                {enviando ? "Enviando…" : "Enviar denuncia"}
              </button>
            </div>
          </div>
        </div>
      )}

      <form
        ref={formulario}
        className="space-y-6"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          const nodo =
            event.currentTarget instanceof HTMLFormElement
              ? event.currentTarget
              : formulario.current;
          if (!nodo || modalCodigo || pidiendoCodigo || enviando) return;
          void prepararDenuncia(new FormData(nodo));
        }}
      >
        <header>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-toga-900">
            Impugnación de candidaturas al TSJ
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-toga-700">
            Bienvenido al canal seguro de contraloría social impulsado por el Consejo Independiente
            de Verificación de Credenciales Judiciales. Conforme al artículo 264 de la Constitución
            (CRBV) y al artículo 71 de la Ley Orgánica del Tribunal Supremo de Justicia (LOTSJ),
            todo ciudadano dispone de un lapso preclusivo de quince (15) días continuos para
            presentar objeciones fundadas contra los candidatos.
          </p>
        </header>

        <div aria-hidden="true" className="absolute left-[-9999px]">
          <label htmlFor="website">No rellenar</label>
          <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        <fieldset className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5">
          <legend className="px-2 font-mono text-xs tracking-wider text-balanza-600">
            Objetante
          </legend>
          <div className="grid gap-4">
            <div>
              <label htmlFor="objectorFullName" className="block text-xs font-medium text-toga-600">
                Nombre y apellidos completos del objetante{" "}
                <span className="text-balanza-700">*</span>
              </label>
              <p className="mt-1 text-xs text-toga-500">
                Escriba sus nombres y apellidos completos de forma exacta. Ejemplo: Juan Alberto
                Pérez Gómez.
              </p>
              <input
                id="objectorFullName"
                name="objectorFullName"
                required
                autoComplete="name"
                value={nombreObjetante}
                onChange={(event) => setNombreObjetante(filtrarNombre(event.target.value))}
                aria-invalid={Boolean(errores.objectorFullName)}
                className={claseCampo}
              />
              <Error campo="objectorFullName" />
            </div>
            <div>
              <p className="block text-xs font-medium text-toga-600">
                Cédula de identidad del objetante <span className="text-balanza-700">*</span>
              </p>
              <p className="mt-1 text-xs text-toga-500">
                Ingrese su número de documento de identidad venezolano. Ejemplo: V-12345678.
              </p>
              <div className="mt-1 flex gap-2">
                <select
                  name="prefijoCedula"
                  aria-label="Tipo de cédula"
                  className="rounded-md border border-toga-300 bg-white px-3 py-2 text-sm text-toga-900"
                  defaultValue="V"
                >
                  <option value="V">V</option>
                  <option value="E">E</option>
                </select>
                <input
                  id="numeroCedula"
                  name="numeroCedula"
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={8}
                  placeholder="12345678"
                  aria-label="Número de cédula"
                  aria-invalid={Boolean(errores.objectorNationalId)}
                  value={digitosCedula}
                  onChange={(event) =>
                    setDigitosCedula(event.target.value.replace(/\D/g, "").slice(0, 8))
                  }
                  className="codigo w-full rounded-md border border-toga-300 px-3 py-2 text-sm text-toga-900"
                />
              </div>
              <Error campo="objectorNationalId" />
            </div>
            <div>
              <label htmlFor="objectorEmail" className="block text-xs font-medium text-toga-600">
                Correo electrónico <span className="text-balanza-700">*</span>
              </label>
              <p className="mt-1 text-xs text-toga-500">
                Proporcione una dirección de correo activa y de acceso exclusivo. Al generar la
                denuncia enviaremos un código a este correo para comprobar la dirección. Ejemplo:
                veedor.seguro@ejemplo.com.
              </p>
              <input
                id="objectorEmail"
                name="objectorEmail"
                type="email"
                required
                autoComplete="email"
                value={correoObjetante}
                onChange={(event) => setCorreoObjetante(event.target.value.toLowerCase())}
                aria-invalid={Boolean(errores.objectorEmail)}
                className={claseCampo}
              />
              <Error campo="objectorEmail" />
            </div>
          </div>
        </fieldset>

        <fieldset className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5">
          <legend className="px-2 font-mono text-xs tracking-wider text-balanza-600">
            Candidato
          </legend>
          <div className="grid gap-4">
            <div>
              <label className="block text-xs font-medium text-toga-600" htmlFor="nombreCandidato">
                Nombre del candidato al que se objeta
              </label>
              <p className="mt-1 text-xs text-toga-500">
                Verifique que el nombre corresponde al postulante seleccionado.
              </p>
              <input
                id="nombreCandidato"
                readOnly
                value={nombrePostulante}
                className={`${claseCampo} bg-toga-50`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-toga-600" htmlFor="cedulaCandidato">
                Cédula del candidato al que se objeta
              </label>
              <input
                id="cedulaCandidato"
                readOnly
                value={cedulaPostulante}
                className={`${claseCampo} bg-toga-50`}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-toga-600" htmlFor="salaCandidato">
                Sala del TSJ a la que aspira
              </label>
              <input
                id="salaCandidato"
                readOnly
                value={salaLegible}
                className={`${claseCampo} bg-toga-50`}
              />
            </div>
          </div>
        </fieldset>

        <fieldset
          id="causales"
          className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5"
        >
          <legend className="px-2 font-mono text-xs tracking-wider text-balanza-600">Causal</legend>
          <p className="text-sm font-medium text-toga-900">
            Tipo de incompatibilidad o requisito incumplido (Art. 37 LOTSJ / Art. 263 CRBV)
          </p>
          <p className="mt-1 text-xs text-toga-500">
            Seleccione la o las causas de inelegibilidad que se configuran en el perfil del
            candidato. Puede marcar varias.
          </p>
          <div className="mt-3 space-y-2">
            {CAUSAS.map((causal) => (
              <label
                key={causal.codigo}
                className="flex cursor-pointer items-start gap-3 rounded-md border border-toga-200 p-3 hover:bg-toga-50"
              >
                <input
                  type="checkbox"
                  checked={causas.includes(causal.codigo)}
                  onChange={() => alternarCausa(causal.codigo)}
                  className="mt-0.5"
                />
                <span className="text-sm text-toga-900">{causal.texto}</span>
              </label>
            ))}
          </div>
          <Error campo="causes" />
          {causas.includes("OTHER") && (
            <div className="mt-3">
              <label htmlFor="otherCause" className="block text-xs font-medium text-toga-600">
                Otra razón <span className="text-balanza-700">*</span>
              </label>
              <input id="otherCause" name="otherCause" className={claseCampo} />
              <Error campo="otherCause" />
            </div>
          )}
        </fieldset>

        <fieldset className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5">
          <legend className="px-2 font-mono text-xs tracking-wider text-balanza-600">Hechos</legend>
          <label htmlFor="description" className="block text-xs font-medium text-toga-600">
            Descripción objetiva, cronológica e instrumental de los hechos{" "}
            <span className="text-balanza-700">*</span>
          </label>
          <p className="mt-1 text-xs text-toga-500">
            Exponga de forma cronológica, clara y objetiva las circunstancias que demuestran la
            incompatibilidad. Evite adjetivos descalificativos, juicios morales o insultos. Limítese
            a narrar situaciones comprobables.
          </p>
          <textarea id="description" name="description" rows={7} required className={claseCampo} />
          <Error campo="description" />
        </fieldset>

        <fieldset className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5">
          <legend className="px-2 font-mono text-xs tracking-wider text-balanza-600">
            Pruebas
          </legend>
          <label htmlFor="evidenceUrl" className="block text-xs font-medium text-toga-600">
            Enlace de acceso a las pruebas documentales digitalizadas{" "}
            <span className="text-balanza-700">*</span>
          </label>
          <p className="mt-1 text-xs leading-relaxed text-toga-500">
            No es posible cargar archivos en este formulario. Digitalice la prueba en PDF, JPG o
            PNG, súbala a su almacenamiento en la nube y deje el enlace público para que cualquier
            persona con el enlace pueda verlo. Su identidad, el texto y este enlace se guardan en el
            servidor y no se publican en el ranking.
          </p>
          <input
            id="evidenceUrl"
            name="evidenceUrl"
            type="url"
            placeholder="https://drive.google.com/file/d/…/view"
            className={claseCampo}
          />
          <Error campo="evidenceUrl" />
        </fieldset>

        <fieldset className="border border-toga-200 border-t-2 border-t-balanza-600 bg-white p-5">
          <legend className="px-2 font-mono text-xs tracking-wider text-balanza-600">
            Consentimiento
          </legend>
          <label className="flex cursor-pointer items-start gap-3">
            <input id="privacyConsent" type="checkbox" name="privacyConsent" required className="mt-1" />
            <span className="text-sm leading-relaxed text-toga-700">
              He leído el{" "}
              <Link href="/privacidad" className="font-medium text-balanza-700 underline">
                aviso de privacidad
              </Link>{" "}
              y autorizo el tratamiento de mis datos para la tramitación de esta denuncia. Entiendo
              que mi identidad no se publica.
            </span>
          </label>
          <Error campo="privacyConsent" />
        </fieldset>

        <button
          type="submit"
          disabled={pidiendoCodigo || enviando}
          className="w-full rounded-md bg-balanza-600 px-6 py-3.5 text-sm font-semibold text-white hover:bg-balanza-700 disabled:opacity-60 sm:w-auto"
        >
          {pidiendoCodigo ? "Enviando código…" : "Generar denuncia"}
        </button>
      </form>
    </>
  );
}
