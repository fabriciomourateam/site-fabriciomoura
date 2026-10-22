/** @type {import('next').NextConfig} */
import { WP_PAGES } from "./lib/wp-pages.mjs";

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
  // Atalho da bio do Instagram: fabriciomoura.com/bio -> página de links (membros).
  // Temporário (307) de propósito, pra o navegador não cachear o destino (facilita trocar por uma /bio nativa depois).
  // Os artigos (content/blog/*.json) são lidos em tempo de execução: incluí-los nas funções da Vercel
  outputFileTracingIncludes: {
    "/[slug]": ["./content/blog/**"], "/blog": ["./content/blog/**"], "/sitemap.xml": ["./content/blog/**"],
    "/admin/**": ["./content/blog/**"], "/api/blog": ["./content/blog/**"], "/": ["./content/blog/**"],
    "/acompanhamento-esportivo": ["./content/blog/**"], "/acompanhamento-online": ["./content/blog/**"],
  },
  async redirects() {
    return [
      // O sitemap agora é gerado pelo Next (app/sitemap.js). O Search Console conhece o endereço antigo do Rank Math.
      { source: "/sitemap_index.xml", destination: "/sitemap.xml", permanent: true },
      { source: "/bio", destination: "https://membros.fabriciomoura.com/links.html", permanent: false },
      { source: "/bio/", destination: "https://membros.fabriciomoura.com/links.html", permanent: false },
    ];
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
      // Páginas de 1 nível que continuam no WordPress (lib/wp-pages.mjs). Precisam vir antes da rota
      // dos artigos (app/[slug]), que responde por todos os outros endereços de 1 nível.
      afterFiles: wp
        ? [
            ...WP_PAGES.flatMap((p) => [
              { source: `/${p}/`, destination: `${wp}/${p}/` },
              { source: `/${p}`, destination: `${wp}/${p}` },
            ]),
            // arquivos soltos do WordPress (sitemaps do Rank Math, .php etc.)
            { source: "/:file([^/]+\\.(?:php|xml|xsl|txt))", destination: `${wp}/:file` },
          ]
        : [],
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
