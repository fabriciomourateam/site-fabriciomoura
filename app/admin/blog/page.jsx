import { isAdmin } from "@/lib/auth";
import { listPosts, postUrl, dataBR, blogUsingSupabase } from "@/lib/blog";
import Login from "../Login";
import "../admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blog | Editar site", robots: { index: false, follow: false } };

const ORIGEM = { arquivo: "importado do WordPress", painel: "painel", automacao: "automação semanal" };

export default async function BlogAdmin() {
  if (!(await isAdmin())) return <Login />;
  const posts = await listPosts({ todos: true, fresh: true });
  return (
    <main className="adm">
      <header className="adm-top">
        <strong>Blog</strong>
        <span className="adm-status">{posts.length} artigos</span>
        <div className="adm-top__actions">
          <a className="adm-btn adm-btn--ghost" href="/admin">Páginas do site</a>
          <a className="adm-btn adm-btn--ghost" href="/blog/" target="_blank" rel="noopener">Ver blog</a>
          <a className="adm-btn" href="/admin/blog/novo">+ Novo artigo</a>
        </div>
      </header>
      <div className="adm-body">
        {!blogUsingSupabase && <p className="adm-warn">Supabase não configurado: dá para ver os artigos, mas não salvar.</p>}
        <p className="adm-hint adm-hint--box">
          Todo artigo publicado aparece sozinho no blog, no menu "Conteúdo Semanal", no "Leia também" dos outros
          artigos e no sitemap do Google. O endereço é fabriciomoura.com/&lt;endereço&gt;/.
        </p>
        <ul className="adm-posts">
          {posts.map((p) => (
            <li key={p.slug}>
              <div>
                <a className="adm-posts__t" href={`/admin/blog/${p.slug}`}>{p.title}</a>
                <small>
                  /{p.slug}/ · {dataBR(p.date)} · {ORIGEM[p.origem] || p.origem}{p.editado ? " (editado)" : ""}
                </small>
              </div>
              <span className={`adm-tag ${p.status === "publish" ? "is-on" : ""}`}>{p.status === "publish" ? "Publicado" : "Rascunho"}</span>
              <a className="adm-link" href={p.status === "publish" ? postUrl(p.slug) : `/admin/blog/previa/${p.slug}`} target="_blank" rel="noopener">Ver</a>
              <a className="adm-link" href={`/admin/blog/${p.slug}`}>Editar</a>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
