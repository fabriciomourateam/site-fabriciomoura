import Image from "next/image";
import TopNav from "../components/TopNav";
import BlogCard, { Seta, ScriptBlJs } from "../components/BlogCard";
import BlogFx from "../components/BlogFx";
import { listPosts, categoria, CATEGORIAS_ORDEM } from "@/lib/blog";
import { bento } from "@/lib/blog-ui";
import { getContent } from "@/lib/content";
import { waLink } from "@/lib/site";
import "../components/blog.css";

export const metadata = {
  title: { absolute: "Blog: nutrição, emagrecimento e hipertrofia | Fabricio Moura" },
  description: "Artigos do nutricionista esportivo Fabricio Moura sobre emagrecimento, dieta, suplementos e ganho de massa muscular. Conteúdo novo toda semana.",
  alternates: { canonical: "/blog/" },
  openGraph: { title: "Blog | Fabricio Moura", url: "/blog/", type: "website", locale: "pt_BR" },
};

const FOTO = "/wp-content/uploads/2026/06/Screenshot_20260322_192920_Canva1-1024x1024.jpg";
const Whats = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.866 9.866 0 001.51 5.26l-.999 3.648 3.978-1.607z" /></svg>
);

export default async function Blog() {
  const [posts, c] = await Promise.all([listPosts(), getContent()]);
  const wa = waLink(c.contato.whatsapp, c.contato.msgPadrao);
  const [primeiro, ...resto] = posts;
  const lateral = resto.slice(0, 2);
  const grade = resto.slice(2);
  const contagem = Object.fromEntries(CATEGORIAS_ORDEM.map((k) => [k, posts.filter((p) => categoria(p) === k).length]));
  const cats = CATEGORIAS_ORDEM.filter((k) => contagem[k] > 0);

  return (
    <div className="bl">
      <ScriptBlJs />
      <TopNav inicio variant="blog" />
      <main id="conteudo">
        <header className="bl-hero bl-wrap">
          <div className="bl-hero__txt">
            <p className="bl-eyebrow bl-reveal">Conteúdo semanal · {posts.length} artigos</p>
            <h1 className="bl-reveal" style={{ "--i": 1 }}>
              O que <span className="bl-gold">funciona de verdade</span> pra secar e ganhar músculo
            </h1>
            <p className="bl-hero__sub bl-reveal" style={{ "--i": 2 }}>
              Respostas diretas sobre dieta, suplementos e treino, de quem já acompanhou
              mais de 2.000 transformações em 7 países. Artigo novo toda semana.
            </p>
          </div>
          <aside className="bl-autor bl-reveal" style={{ "--i": 3 }} aria-label="Sobre o autor">
            <div className="bl-autor__core">
              <div className="bl-autor__foto">
                <Image src={FOTO} alt="Fabricio Moura, nutricionista e treinador" width={160} height={160} priority />
              </div>
              <div>
                <p className="bl-autor__nome">Fabricio Moura</p>
                <p className="bl-autor__cargo">Nutricionista e treinador · 18 anos de experiência</p>
              </div>
              <a className="bl-btn" href={wa}>
                Falar com o Fabricio<span className="bl-ico"><Whats /></span>
              </a>
            </div>
          </aside>
        </header>

        {primeiro && (
          <section className="bl-wrap bl-destaques" aria-label="Artigos mais recentes">
            <BlogCard post={primeiro} tam="hero" destaque novo i={0} foto={FOTO} />
            <div className="bl-destaques__lado">
              {lateral.map((p, i) => <BlogCard key={p.slug} post={p} tam="lado" i={i + 1} />)}
            </div>
          </section>
        )}

        <section className="bl-wrap bl-todos" aria-labelledby="todos-artigos">
          <div className="bl-todos__head bl-reveal">
            <h2 id="todos-artigos">Todos os artigos</h2>
            <div className="bl-chips" role="group" aria-label="Filtrar por assunto">
              <button type="button" data-filtro="Todos" aria-pressed="true">Todos <small>{posts.length}</small></button>
              {cats.map((k) => (
                <button key={k} type="button" data-filtro={k} aria-pressed="false">{k} <small>{contagem[k]}</small></button>
              ))}
            </div>
          </div>
          <div className="bl-grid">
            {(() => { const sp = bento(grade.length); return grade.map((p, i) => <BlogCard key={p.slug} post={p} span={sp[i]} i={i} />); })()}
            {/* os 3 do topo só aparecem aqui quando um assunto é filtrado (em "Todos" já estão lá em cima) */}
            {[primeiro, ...lateral].filter(Boolean).map((p) => (
              <BlogCard key={"t-" + p.slug} post={p} span={4} topo />
            ))}
          </div>
        </section>

        <section className="bl-wrap bl-cta bl-reveal" aria-label="Acompanhamento">
          <div className="bl-cta__core">
            <p className="bl-eyebrow">Acompanhamento individual</p>
            <h2>Chega de adivinhar. <span className="bl-gold">Eu monto o seu plano</span> e acompanho de perto.</h2>
            <p>Dieta, treino e suplementação ajustados à sua rotina, com ajustes semanais e garantia de resultado.</p>
            <a className="bl-btn bl-btn--lg" href={wa}>
              Quero meu acompanhamento<span className="bl-ico"><Whats /></span>
            </a>
          </div>
        </section>
      </main>
      <BlogFx />
    </div>
  );
}
