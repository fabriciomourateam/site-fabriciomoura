import TopNav from "../components/TopNav";
import { listPosts, postUrl, dataBR } from "@/lib/blog";

export const metadata = {
  title: { absolute: "Blog: nutrição, emagrecimento e hipertrofia | Fabricio Moura" },
  description: "Artigos do nutricionista esportivo Fabricio Moura sobre emagrecimento, dieta, suplementos, Mounjaro e ganho de massa muscular.",
  alternates: { canonical: "/blog/" },
  openGraph: { title: "Blog | Fabricio Moura", url: "/blog/", type: "website", locale: "pt_BR" },
};

export default async function Blog() {
  const posts = await listPosts();
  return (
    <>
      <TopNav inicio />
      <main className="blog-index">
        <header className="blog-index__head">
          <p className="blog-kick">Conteúdo semanal</p>
          <h1>Blog do Fabricio Moura</h1>
          <p>Nutrição esportiva sem enrolação: emagrecimento, dieta, suplementos e hipertrofia.</p>
        </header>
        <div className="blog-cards">
          {posts.map((p) => (
            <a key={p.slug} className="blog-card" href={postUrl(p.slug)}>
              <small>{dataBR(p.date)}</small>
              <h2>{p.title}</h2>
              {p.description && <p>{p.description}</p>}
              <span>Ler artigo</span>
            </a>
          ))}
        </div>
      </main>
    </>
  );
}
