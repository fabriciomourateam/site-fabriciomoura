import { postUrl, dataCurta, categoria, tituloComDestaque } from "@/lib/blog";

export const Seta = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17 17 7M9 7h8v8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
);

// Título com a palavra-chave do artigo em destaque (dourado)
export function TituloKw({ post, as: Tag = "h3", className }) {
  return (
    <Tag className={className}>
      {tituloComDestaque(post).map(([t, on], i) => (on ? <mark key={i} className="bl-kw">{t}</mark> : <span key={i}>{t}</span>))}
    </Tag>
  );
}

// Cartão de artigo em "moldura dupla" (casca + núcleo). `tam` controla a coluna no grid (bento).
// span = colunas (de 12) no bento; tam = estilo do cartão (hero/lado/normal)
export default function BlogCard({ post, i = 0, tam = "n", span, destaque = false, novo = false, topo = false, foto }) {
  const cat = categoria(post);
  return (
    <a href={postUrl(post.slug)} className={`bl-card bl-card--${tam} bl-reveal${destaque ? " bl-card--hero" : ""}`} data-cat={cat} style={{ "--i": i % 8, ...(span ? { "--span": span } : {}) }}
      {...(topo ? { "data-topo": "1", hidden: true } : {})}>
      <article className="bl-card__core">
        {foto && <img className="bl-card__foto" src={foto} alt="" aria-hidden="true" loading="eager" />}
        <div className="bl-card__top">
          <span className="bl-cat">{cat}</span>
          {novo ? <span className="bl-flag">Novo</span> : <time dateTime={post.date}>{dataCurta(post.date)}</time>}
        </div>
        <TituloKw post={post} as={destaque ? "h2" : "h3"} className="bl-card__t" />
        {post.description && <p className="bl-card__d">{post.description}</p>}
        <span className="bl-card__go">
          Ler artigo<span className="bl-ico"><Seta /></span>
        </span>
      </article>
    </a>
  );
}

// Liga o "modo animado" antes da primeira pintura (sem isso os blocos piscariam visíveis e depois sumiriam)
export const ScriptBlJs = () => (
  <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('bl-js')" }} />
);
