/**
 * Espejo del contrato público de la API.
 *
 * Este archivo NO define el dominio: lo define el backend, en
 * `api/src/contracts/`. Aquí sólo vive la parte que la landing consume — los
 * tipos de las respuestas públicas y el esquema del formulario de objeción —
 * para que este proyecto sea independiente y no dependa de un paquete
 * compartido.
 *
 * ⚠️ Si cambia el contrato en el backend, hay que reflejarlo aquí. La prueba
 * `src/contracts/contrato.test.ts` verifica contra la API en marcha que ambos
 * lados siguen de acuerdo.
 */
import { z } from "zod";

// ─────────────────────────────────────────────────── enumeraciones

export const CHAMBERS = [
  "CONSTITUCIONAL",
  "POLITICO_ADMINISTRATIVA",
  "ELECTORAL",
  "CASACION_CIVIL",
  "CASACION_PENAL",
  "CASACION_SOCIAL",
  "PLENA",
] as const;
export type Chamber = (typeof CHAMBERS)[number];

export const OBJECTION_CAUSE = [
  "EXCLUSIVE_NATIONALITY",
  "LACK_OF_HONOR",
  "INSUFFICIENT_CAREER",
  "MISSING_TITULAR_PROFESSOR",
  "MISSING_JUDICIAL_RANK",
  "MISSING_POSTGRADUATE",
  "POLITICAL_MILITANCY",
  "STATE_CONTRACTS",
  "KINSHIP_HIGH_OFFICIALS",
  "INCOMPATIBLE_MARRIAGE",
  "KINSHIP_NOMINATION_COMMITTEE",
  "FIRM_SANCTION",
  "PROVEN_MENTAL_INCAPACITY",
  "OTHER",
] as const;
export type ObjectionCause = (typeof OBJECTION_CAUSE)[number];

export const OBJECTION_CATEGORY = [
  "POLITICAL_MILITANCY",
  "KINSHIP",
  "STATE_CONTRACTS",
  "FIRM_SANCTION",
  "FALSE_CREDENTIAL",
  "INSUFFICIENT_EXPERIENCE",
  "OTHER",
] as const;
export type ObjectionCategory = (typeof OBJECTION_CATEGORY)[number];

export type SuitabilityBand = "HIGH" | "MEDIUM" | "LOW" | "INELIGIBLE";

export type ObjectionPublicStatus = "RECEIVED" | "UNDER_REVIEW" | "RESOLVED" | "CLOSED";

// ─────────────────────────────────────────────────── respuestas públicas

export interface PublicScoreBreakdownItem {
  readonly dimensionKey: string;
  readonly label: string;
  readonly points: number;
  readonly maxPoints: number;
}

export interface PublicCandidateListItem {
  readonly publicId: string;
  readonly slug: string;
  readonly fullName: string;
  readonly chamber: Chamber;
  readonly photoUrl: string | null;
  readonly total: number;
  readonly band: SuitabilityBand;
  readonly ineligible: boolean;
  readonly position: number | null;
  readonly tied: boolean;
  readonly provisional: boolean;
  readonly hasFoundedObjections: boolean;
}

export interface PublicDocumentRef {
  readonly publicId: string;
  readonly category: string;
  readonly label: string;
  readonly sizeBytes: number;
  readonly sha256: string;
  readonly downloadPath: string;
}

export interface FichaCampoPublico {
  readonly clave: string;
  readonly etiqueta: string;
  readonly valor: string;
}

export interface FichaGrupoPublico {
  readonly id: string;
  readonly titulo: string;
  readonly campos: readonly FichaCampoPublico[];
}

export interface FichaPublica {
  readonly grupos: readonly FichaGrupoPublico[];
}

export interface PublicCandidateDetail extends PublicCandidateListItem {
  readonly publicSummary: string | null;
  readonly breakdown: readonly PublicScoreBreakdownItem[];
  readonly documents: readonly PublicDocumentRef[];
  readonly ficha?: FichaPublica;
  readonly rubricVersion: string;
  readonly publishedAt: string;
  readonly objectedCredentials: readonly string[];
  /** Solo para precargar la denuncia. El ranking no la muestra. */
  readonly nationalId?: string;
}

export interface PublicRanking {
  readonly entries: readonly PublicCandidateListItem[];
  readonly rubricVersion: string | null;
  readonly provisional: boolean;
  readonly cutoffAt: string;
  readonly publishedAt: string;
  readonly version: number;
}

export interface PublicProcessStats {
  readonly totalCandidates: number;
  readonly underTechnicalReview: number;
  readonly objectionsReceived: number;
  readonly flaggedCandidates: number;
  readonly lastPublishedAt: string | null;
}

export interface PublicObjectionReceipt {
  readonly trackingCode: string;
  readonly status: ObjectionPublicStatus;
  readonly receivedAt: string;
}

export interface PublicObjectionTracking extends PublicObjectionReceipt {
  readonly updatedAt: string;
}

export interface PublicRules {
  readonly rubricVersion: string;
  readonly name: string;
  readonly totalPoints: number;
  readonly provisional: boolean;
  readonly dimensions: readonly {
    readonly key: string;
    readonly label: string;
    readonly description: string;
    readonly maxPoints: number;
    readonly criteria: readonly {
      readonly key: string;
      readonly label: string;
      readonly description: string;
      readonly maxPoints: number;
      readonly legalBasis: string | null;
      readonly isExcluding: boolean;
      readonly minimumRequired: number | null;
    }[];
  }[];
}

// ─────────────────────────────────────────────────── formulario de objeción

/** Debe coincidir con `nationalIdSchema` del backend. El mensaje es para el ciudadano. */
export const nationalIdSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[VEJ]-?\d{6,9}$/, "Indique la cédula con el formato V-12345678.")
  .transform((v) => (v.includes("-") ? v : `${v[0]}-${v.slice(1)}`));

/**
 * Mismo esquema que valida la API. Se valida también aquí para dar respuesta
 * inmediata al ciudadano, pero la validación que manda es siempre la del
 * servidor: este lado es una cortesía, no una barrera de seguridad.
 */
export const createObjectionSchema = z
  .object({
    objectorFullName: z
      .string()
      .trim()
      .min(3, "Escriba el nombre y los apellidos completos.")
      .max(160, "El nombre no puede superar los 160 caracteres."),
    objectorNationalId: nationalIdSchema,
    objectorEmail: z.string().trim().toLowerCase().email("Correo inválido."),
    causes: z.array(z.enum(OBJECTION_CAUSE)).min(1, "Seleccione al menos una causal."),
    otherCause: z
      .string()
      .trim()
      .max(500, "La otra razón no puede superar los 500 caracteres.")
      .optional(),
    description: z
      .string()
      .trim()
      .min(50, "Describa los hechos con al menos 50 caracteres.")
      .max(8000, "La descripción no puede superar los 8000 caracteres."),
    evidenceUrl: z
      .string()
      .trim()
      .url("Indique un enlace válido a las pruebas.")
      .max(2000, "El enlace no puede superar los 2000 caracteres."),
    verificationCode: z
      .string()
      .trim()
      .regex(/^\d{6}$/, "El código de verificación tiene 6 dígitos."),
    privacyConsent: z.literal(true, { message: "Debe aceptar el aviso de privacidad." }),
    website: z.string().max(0).optional(),
    captchaToken: z.string().optional(),
  })
  .superRefine((valor, ctx) => {
    if (valor.causes.includes("OTHER") && !valor.otherCause?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["otherCause"],
        message: "Indique la otra razón.",
      });
    }
  });
export type CreateObjectionInput = z.infer<typeof createObjectionSchema>;

/**
 * Código de seguimiento de una objeción.
 *
 * Lo genera el servidor con formato OBJ-<año>-<10 hexadecimales>. Se valida
 * aquí para no consultar al servidor por un código que obviamente no existe,
 * y de paso se normaliza a mayúsculas: quien lo copia de un papel rara vez
 * respeta el formato.
 */
export const codigoSeguimientoSchema = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^OBJ-\d{4}-[0-9A-F]{10}$/, "El código tiene el formato OBJ-2026-A1B2C3D4E5");
