import type { NextConfig } from "next";

function configuredOrigin(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    return new URL(value).origin;
  } catch {
    return undefined;
  }
}

const apiOrigin = configuredOrigin(process.env.NEXT_PUBLIC_API_URL);
const documentOrigin = configuredOrigin(process.env.NEXT_PUBLIC_DOCUMENT_ORIGIN);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // La landing no acepta subidas: no necesita ampliar el límite del cuerpo.
  poweredByHeader: false,
  // Netlify despliega con su propio adaptador (OpenNext); con `standalone`
  // el sitio responde "Page Not Found" en todas las rutas. Docker, en cambio,
  // lo necesita. Se decide por el entorno de construcción, no a mano.
  output: process.env.NETLIFY ? undefined : "standalone",
  async headers() {
    const securityHeaders = [
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'none'",
          "object-src 'none'",
          "img-src 'self' data:",
          "font-src 'self'",
          "style-src 'self' 'unsafe-inline'",
          "script-src 'self' 'unsafe-inline'",
          ["connect-src 'self'", apiOrigin].filter(Boolean).join(" "),
          ["frame-src 'self' blob:", documentOrigin].filter(Boolean).join(" "),
        ].join("; "),
      },
      { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
      { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
      { key: "Cross-Origin-Resource-Policy", value: "same-site" },
      ...(process.env.NODE_ENV === "production"
        ? [{ key: "Strict-Transport-Security", value: "max-age=15552000; includeSubDomains" }]
        : []),
    ];
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          ...securityHeaders,
        ],
      },
    ];
  },
};

export default nextConfig;
