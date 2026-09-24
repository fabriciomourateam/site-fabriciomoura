/** @type {import('next').NextConfig} */
const supabaseHost = process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).hostname : null;

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig = {
  poweredByHeader: false,
  // O WordPress usa URLs com barra no final (/whey-engorda/). Não deixar o Next mexer nelas.
  skipTrailingSlashRedirect: true,
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [390, 640, 828, 1080, 1280, 1600, 1920],
    imageSizes: [160, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // imagens otimizadas ficam 1 ano em cache
    remotePatterns: supabaseHost ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }] : [],
  },
  // Visitas de anúncio (em "/" e nas páginas de campanha) recebem a versão sem menu, sem mudar a URL.
  // Resolvido na CDN, sem custo de velocidade. Para Meta Ads, use ?utm_medium=paid ou aponte para /consultoria.
  async rewrites() {
    const paid = [
      { type: "query", key: "gclid" },
      { type: "query", key: "gbraid" },
      { type: "query", key: "wbraid" },
      { type: "query", key: "gad_source" },
      { type: "query", key: "utm_medium", value: "(?:cpc|ppc|paid|paid_social|pago|ads|cpm)" },
    ];
    // Tudo que não existe aqui (blog, páginas do Elementor, wp-admin, sitemaps...) é servido pelo WordPress,
    // com a mesma URL de hoje. Defina WORDPRESS_ORIGIN (ex: https://wp.fabriciomoura.com) na Vercel.
    const wp = process.env.WORDPRESS_ORIGIN?.replace(/\/$/, "");
    return {
      beforeFiles: [
        ["/", "/consultoria"],
        ["/acompanhamento-esportivo", "/lp/esportivo"],
        ["/acompanhamento-esportivo/", "/lp/esportivo"],
        ["/acompanhamento-online", "/lp/online"],
        ["/acompanhamento-online/", "/lp/online"],
      ].flatMap(([source, destination]) => paid.map((cond) => ({ source, has: [cond], destination }))),
      // Duas regras para manter a barra final (sem ela o WordPress redireciona em loop)
      fallback: wp
        ? [
            { source: "/:path+/", destination: `${wp}/:path+/` },
            { source: "/:path*", destination: `${wp}/:path*` },
          ]
        : [],
    };
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      { source: "/img/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/admin/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }, { key: "Cache-Control", value: "no-store" }] },
    ];
  },
};
export default nextConfig;
