import { describe, expect, it } from "vitest";
import { createObjectionSchema, nationalIdSchema } from "../index";

/**
 * El esquema del formulario de objeción es un ESPEJO del que valida la API.
 * Si los dos se desincronizan, el ciudadano rellena un formulario que el
 * servidor rechaza sin explicar por qué. Estas pruebas fijan el
 * comportamiento que ambos lados deben compartir.
 */
describe("nationalIdSchema", () => {
  it("normaliza la cédula al formato con guion", () => {
    expect(nationalIdSchema.parse("V12345678")).toBe("V-12345678");
    expect(nationalIdSchema.parse("v-12345678")).toBe("V-12345678");
    expect(nationalIdSchema.parse("  E-1234567 ")).toBe("E-1234567");
  });

  it("rechaza formatos que la API también rechazaría", () => {
    for (const invalida of ["12345678", "X-12345678", "V-12345", "V-1234567890"]) {
      expect(nationalIdSchema.safeParse(invalida).success).toBe(false);
    }
  });
});

describe("createObjectionSchema", () => {
  const valida = {
    objectorFullName: "Ciudadana Ficticia",
    objectorEmail: "persona@ejemplo.invalid",
    category: "FALSE_CREDENTIAL" as const,
    description:
      "Descripción de prueba con la longitud mínima que exige el contrato, para que el esquema la acepte.",
    privacyConsent: true as const,
  };

  it("acepta una objeción bien formada", () => {
    expect(createObjectionSchema.safeParse(valida).success).toBe(true);
  });

  it("exige el consentimiento de privacidad de forma explícita", () => {
    // `false` no vale: el consentimiento se otorga, no se omite.
    const r = createObjectionSchema.safeParse({ ...valida, privacyConsent: false });
    expect(r.success).toBe(false);
  });

  it("exige una descripción con sustancia, no una línea suelta", () => {
    const r = createObjectionSchema.safeParse({ ...valida, description: "no me gusta" });
    expect(r.success).toBe(false);
  });

  it("normaliza el correo a minúsculas", () => {
    const r = createObjectionSchema.parse({ ...valida, objectorEmail: "Persona@Ejemplo.INVALID" });
    expect(r.objectorEmail).toBe("persona@ejemplo.invalid");
  });

  it("acepta el honeypot vacío y rechaza el relleno", () => {
    expect(createObjectionSchema.safeParse({ ...valida, website: "" }).success).toBe(true);
    // Un bot rellena el campo oculto; una persona nunca lo ve.
    expect(createObjectionSchema.safeParse({ ...valida, website: "http://spam" }).success).toBe(
      false,
    );
  });

  it("la cédula del objetante es opcional", () => {
    expect(createObjectionSchema.safeParse(valida).success).toBe(true);
    expect(
      createObjectionSchema.safeParse({ ...valida, objectorNationalId: "V-9876543" }).success,
    ).toBe(true);
  });
});
