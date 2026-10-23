import { listPosts, postUrl } from "@/lib/blog";

// Menu do topo (home, páginas de campanha com menu e blog). A lista de artigos é automática:
// os 8 mais recentes publicados. `inicio` mostra o link para a home (usado nas páginas do blog).
// "Conteúdo Semanal" leva para o índice do blog. variant="blog" = menu flutuante em pílula (só no blog).
// artigos={false}: só os links "Conteúdo Semanal" e calculadora, sem a lista de títulos (páginas de anúncio:
// o Google Ads revisa a página e limita/reprova por termos de medicamento nos títulos dos artigos).
export default async function TopNav({ inicio = false, variant, artigos = true }) {
  const posts = artigos ? (await listPosts()).slice(0, 8) : [];
  const calc = "/calculadora-de-imc-e-calorias/";
  return (
    <header className={variant === "blog" ? "topnav topnav--float" : "topnav"}>
      <nav className="topnav__desktop" aria-label="Menu principal">
        {inicio && <><a className="topnav__item" href="/">Início</a><span className="topnav__sep" aria-hidden="true">|</span></>}
        <div className="topnav__item topnav__item--menu">
          <a href="/blog/">Conteúdo Semanal</a>
          {artigos && (
          <ul className="topnav__dropdown">
            {posts.map((p) => <li key={p.slug}><a href={postUrl(p.slug)}>{p.title}</a></li>)}
            <li><a href="/blog/"><b>Ver todos os artigos</b></a></li>
          </ul>
          )}
        </div>
        <span className="topnav__sep" aria-hidden="true">|</span>
        <a className="topnav__item" href={calc}>Calculadora de IMC e Calorias</a>
      </nav>
      <details className="topnav__mobile">
        <summary aria-label="Abrir menu"><span /><span /><span /></summary>
        <ul>
          {inicio && <li><a href="/">Início</a></li>}
          <li><a href="/blog/">Conteúdo Semanal</a></li>
          {posts.map((p) => <li key={p.slug} className="sub"><a href={postUrl(p.slug)}>{p.title}</a></li>)}
          {artigos && <li className="sub"><a href="/blog/"><b>Ver todos os artigos</b></a></li>}
          <li><a href={calc}>Calculadora de IMC e Calorias</a></li>
        </ul>
      </details>
    </header>
  );
}
