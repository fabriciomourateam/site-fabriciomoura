export default function robots() {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://fabriciomoura.com";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api/", "/consultoria", "/wp-admin/"] },
    sitemap: `${site}/sitemap.xml`,
  };
}
