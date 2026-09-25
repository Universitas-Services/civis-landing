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
    objectorNationalId: "V-12345678",
    objectorEmail: "persona@ejemplo.invalid",
    causes: ["POLITICAL_MILITANCY"] as const,
    description:
      "Descripción de prueba con la longitud mínima que exige el contrato, para que el esquema la acepte.",
    evidenceUrl: "https://ejemplo.invalid/prueba.pdf",
    verificationCode: "123456",
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

  it("exige la cédula del objetante y el enlace de pruebas", () => {
    expect(createObjectionSchema.safeParse(valida).success).toBe(true);
    expect(createObjectionSchema.safeParse({ ...valida, objectorNationalId: "" }).success).toBe(
      false,
    );
    expect(createObjectionSchema.safeParse({ ...valida, evidenceUrl: "no-es-url" }).success).toBe(
      false,
    );
  });

  it("si marca Otro, exige el texto", () => {
    expect(createObjectionSchema.safeParse({ ...valida, causes: ["OTHER"] }).success).toBe(false);
    expect(
      createObjectionSchema.safeParse({
        ...valida,
        causes: ["OTHER"],
        otherCause: "Otra incompatibilidad comprobada",
      }).success,
    ).toBe(true);
  });

  it("explica en español cada dato que falta o no cumple el formato", () => {
    const casos: { campo: string; valor: unknown; mensaje: string }[] = [
      {
        campo: "objectorFullName",
        valor: "A",
        mensaje: "Escriba el nombre y los apellidos completos.",
      },
      {
        campo: "objectorNationalId",
        valor: "",
        mensaje: "Indique la cédula con el formato V-12345678.",
      },
      {
        campo: "objectorEmail",
        valor: "no-es-correo",
        mensaje: "Indique un correo electrónico válido.",
      },
      {
        campo: "description",
        valor: "no me gusta",
        mensaje: "Describa los hechos con al menos 50 caracteres.",
      },
      {
        campo: "evidenceUrl",
        valor: "no-es-url",
        mensaje: "Indique un enlace válido a las pruebas.",
      },
      {
        campo: "verificationCode",
        valor: "12",
        mensaje: "El código de verificación tiene 6 dígitos.",
      },
      {
        campo: "privacyConsent",
        valor: false,
        mensaje: "Debe aceptar el aviso de privacidad.",
      },
    ];

    for (const caso of casos) {
      const resultado = createObjectionSchema.safeParse({ ...valida, [caso.campo]: caso.valor });
      expect(resultado.success).toBe(false);
      if (resultado.success) continue;
      const aviso = resultado.error.issues.find((issue) => issue.path[0] === caso.campo);
      expect(aviso?.message).toBe(caso.mensaje);
    }

    const sinCausal = createObjectionSchema.safeParse({ ...valida, causes: [] });
    expect(sinCausal.success).toBe(false);
    if (!sinCausal.success) {
      expect(sinCausal.error.issues.find((issue) => issue.path[0] === "causes")?.message).toBe(
        "Seleccione al menos una causal.",
      );
    }
  });
});
