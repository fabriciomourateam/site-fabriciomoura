import { notFound, permanentRedirect } from "next/navigation";
import TopNav from "../components/TopNav";
import BlogCard, { ScriptBlJs } from "../components/BlogCard";
import BlogFx from "../components/BlogFx";
import "../components/blog.css";
import { getPost, listPosts, relacionados, postUrl, dataBR } from "@/lib/blog";
import { limparHtml } from "@/lib/blog-html";

// Artigos do blog na MESMA URL do WordPress: fabriciomoura.com/<slug>/
// Os importados são gerados no build; os novos (painel/automação) aparecem na hora e ficam em cache.
export const dynamicParams = true;
export async function generateStaticParams() {
  return (await listPosts()).map((p) => ({ slug: p.slug }));
}

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://fabriciomoura.com";
// Mesma pessoa do lib/schema-person.json (dados estruturados da home)
const AUTOR = { "@type": "Person", "@id": "https://fabriciomoura.com/#fabricio-moura", name: "Fabricio Moura", url: "https://fabriciomoura.com/sobre/" };

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p || p.status !== "publish") return {};
  const title = p.seoTitle || `${p.title} | Fabricio Moura`;
  return {
    title: { absolute: title },
    description: p.description,
    alternates: { canonical: postUrl(p.slug) },
    openGraph: {
      title, description: p.description, url: postUrl(p.slug), type: "article", locale: "pt_BR",
      publishedTime: p.date, modifiedTime: p.modified, ...(p.image ? { images: [p.image] } : {}),
    },
    robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  };
}

// Endereço que não é artigo: se o WordPress tinha um redirecionamento ali (Rank Math, slug antigo),
// segue o mesmo destino. Assim nenhum link antigo que o Google conhece vira 404.
async function destinoLegado(slug) {
  const wp = process.env.WORDPRESS_ORIGIN?.replace(/\/$/, "");
  if (!wp) return null;
  try {
    const r = await fetch(`${wp}/${slug}/`, {
      redirect: "manual", headers: { "X-Forwarded-Host": "fabriciomoura.com" }, next: { revalidate: 3600 },
    });
    const loc = r.status >= 300 && r.status < 400 ? r.headers.get("location") : null;
    if (!loc) return null;
    const dest = loc.replace(/^https?:\/\/(?:www\.|wp\.)?fabriciomoura\.com/, "") || "/";
    return dest.replace(/\/$/, "") === `/${slug}` ? null : dest;
  } catch {
    return null;
  }
}

export default async function Post({ params }) {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p || p.status !== "publish") {
    const dest = !p ? await destinoLegado(slug) : null;
    if (dest) permanentRedirect(dest);
    notFound();
  }
  const outros = relacionados(p, await listPosts());

  const url = SITE + postUrl(p.slug);
  const ld = [
    {
      "@context": "https://schema.org", "@type": "BlogPosting", headline: p.title, description: p.description,
      ...(p.image ? { image: [p.image] } : {}), datePublished: p.date, dateModified: p.modified,
      mainEntityOfPage: url, url, inLanguage: "pt-BR",
      author: AUTOR, publisher: AUTOR,
    },
    {
      "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Início", item: SITE + "/" },
        { "@type": "ListItem", position: 2, name: "Blog", item: SITE + "/blog/" },
        { "@type": "ListItem", position: 3, name: p.title, item: url },
      ],
    },
  ];

  return (
    <div className="bl bl--post">
      <ScriptBlJs />
      <div className="bl-progress" aria-hidden="true" />
      <TopNav inicio variant="blog" />
      <main id="conteudo" className="blog-post">
        <div dangerouslySetInnerHTML={{ __html: limparHtml(p.content) }} />
        <p className="bl-pubdate">Publicado em {dataBR(p.date)} · por Fabricio Moura</p>
        {outros.length > 0 && (
          <section className="bl-wrap bl-rel" aria-labelledby="leia-tambem">
            <div className="bl-rel__head bl-reveal">
              <p className="bl-eyebrow">Continue lendo</p>
              <h2 id="leia-tambem">Leia <span className="bl-gold">também</span></h2>
            </div>
            <div className="bl-rel__grid">
              {outros.map((o, i) => <BlogCard key={o.slug} post={o} i={i} />)}
            </div>
            <p className="bl-rel__all bl-reveal">
              <a className="bl-btn bl-btn--ghost" href="/blog/">Ver todos os artigos<span className="bl-ico">→</span></a>
            </p>
          </section>
        )}
      </main>
      <BlogFx />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </div>
  );
}
