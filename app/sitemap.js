import { listPosts, postUrl } from "@/lib/blog";

// fabriciomoura.com/sitemap.xml: substitui o sitemap do Rank Math (/sitemap_index.xml redireciona pra cá).
// Atualiza sozinho quando um artigo é publicado/editado no painel ou pela automação.
export default async function sitemap() {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://fabriciomoura.com").replace(/\/$/, "");
  const [posts, paginas] = await Promise.all([listPosts(), listPosts({ tipo: "pagina" })]);
  const ultimo = posts[0]?.modified ? new Date(posts[0].modified) : new Date();
  return [
    { url: `${site}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${site}/acompanhamento-esportivo/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site}/acompanhamento-online/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site}/blog/`, lastModified: ultimo, changeFrequency: "weekly", priority: 0.8 },
    { url: `${site}/calculadora-de-imc-e-calorias/`, changeFrequency: "monthly", priority: 0.7 },
    ...posts.map((p) => ({
      url: site + postUrl(p.slug), lastModified: new Date(p.modified || p.date), changeFrequency: "monthly", priority: 0.7,
      ...(p.image ? { images: [p.image.replace(/^\//, `${site}/`)] } : {}),
    })),
    // páginas migradas do WordPress que o Google pode indexar (renovação fica de fora: noindex)
    ...paginas.filter((p) => !/noindex/i.test(p.robots || "")).map((p) => ({ url: site + postUrl(p.slug), changeFrequency: "monthly", priority: 0.5 })),
  ];
}
