import { getImageProps } from "next/image";
import Carousel from "./Carousel";
import ListaAvaliacoes from "./ListaAvaliacoes";
import StickyBar from "./StickyBar";
import { ConsultoriaPremium, QuemE } from "./Posters";
import { waLink } from "@/lib/site";
import TopNav from "./TopNav";
import { getPage } from "@/lib/content";
import PERSON from "@/lib/schema-person.json";
import { Rich, Paragraphs } from "@/lib/rich";


function Cta({ children, id, variant = "yellow", name, c }) {
  return (
    <a id={id} className={`btn btn--${variant} btn--cta`} href={waLink(c.contato.whatsapp, c.contato.msgPadrao)} data-cta={name}>
      {children}
    </a>
  );
}

function Hero({ c }) {
  const h = c.hero;
  const common = { alt: h.alt, priority: true, sizes: "100vw", quality: 70 };
  const { props: { srcSet: desk } } = getImageProps({ ...common, src: h.imgDesktop.src, width: h.imgDesktop.w, height: h.imgDesktop.h });
  const { props: { srcSet: mob, ...rest } } = getImageProps({ ...common, src: h.imgMobile.src, width: h.imgMobile.w, height: h.imgMobile.h });
  return (
    <section className="hero">
      <picture className="hero__media">
        <source media="(min-width: 768px)" srcSet={desk} sizes="100vw" />
        <source media="(max-width: 767px)" srcSet={mob} sizes="100vw" />
        <img {...rest} fetchPriority="high" />
      </picture>
      <div className="hero__content">
        <h1 className="hero__title">
          {h.selo && <span className="hero__selo">{h.selo}</span>}
          {h.titulo}
        </h1>
        <h2 className="hero__subtitle">{h.subtitulo}</h2>
        <p className="hero__text"><Rich text={h.texto} /></p>
        <p className="hero__hint">{h.chamada}</p>
        <Cta id="hero-cta" name="hero" c={c}>{h.botao}</Cta>
      </div>
    </section>
  );
}

// Avaliações reais do Google, em texto (lib/defaults.js > avaliacoes)
function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" className="gicon">
      <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9Z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44Z" />
      <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9Z" />
    </svg>
  );
}

function Avaliacoes({ d, c }) {
  if (!d?.mostrar || !d.itens?.length) return null;
  return (
    <div className="block avaliacoes">
      <h2 className="display display--yellow">{d.titulo}</h2>

      <div className="avaliacoes__selo">
        <GoogleG size={30} />
        <strong className="avaliacoes__nota">{d.nota}</strong>
        <span className="avaliacoes__selo-info">
          <span className="estrelas" aria-label={`Nota ${d.nota} de 5`}>★★★★★</span>
          <span>{d.resumo}</span>
        </span>
      </div>

      <ListaAvaliacoes>
        {d.itens.map((r, i) => (
          <li key={i} className="avaliacao">
            <span className="estrelas" aria-hidden="true">★★★★★</span>
            <blockquote>{r.texto}</blockquote>
            <div className="avaliacao__autor">
              <span className="avaliacao__avatar" aria-hidden="true">{r.nome.charAt(0)}</span>
              <span>
                <strong>{r.nome}</strong>
                <small><GoogleG size={12} /> Avaliação no Google</small>
              </span>
            </div>
          </li>
        ))}
      </ListaAvaliacoes>

      {d.link && (
        <p className="avaliacoes__link">
          <a href={d.link} target="_blank" rel="noopener">{d.linkTexto} →</a>
        </p>
      )}
      <Cta name="avaliacoes" c={c}>{c.dor.botao}</Cta>
    </div>
  );
}

// Texto puro (sem **) para o JSON-LD
const plain = (t = "") => t.replace(/\*\*/g, "").replace(/\s*\n\s*/g, " ").trim();

function Schema({ c }) {
  const faq = {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: c.faq.map((f) => ({ "@type": "Question", name: plain(f.q), acceptedAnswer: { "@type": "Answer", text: plain(f.a) } })),
  };
  const json = (o) => ({ __html: JSON.stringify(o).replace(/</g, "\\u003c") });
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={json(PERSON)} />
      {c.faq.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={json(faq)} />}
    </>
  );
}

// page: "home" | "esportivo" | "online" (páginas de campanha em lib/defaults.js > paginas)
export default async function Landing({ menu = true, page = "home" }) {
  const c = await getPage(page);
  const wa = (msg) => waLink(c.contato.whatsapp, msg);
  return (
    <>
      {menu && (
      // Home e páginas de anúncio são destino do Google Ads: menu sem a lista de artigos do blog
      // (títulos com nome de medicamento fazem o Google limitar/reprovar os anúncios).
      <TopNav artigos={false} />
      )}

      <Schema c={c} />
      <main>
        <Hero c={c} />

        <section className="pain">
          <h2 className="display"><Rich text={c.dor.titulo} /></h2>
          <p className="pain__questions"><Rich text={c.dor.perguntas} /></p>
          <Paragraphs text={c.dor.texto} />
          <Cta variant="black" name="dor" c={c}>{c.dor.botao}</Cta>
        </section>

        <section className="dark">
          {c.resultados1.length > 0 && <Carousel images={c.resultados1} variant="tall" label="Resultados de alunos" />}

          <div className="block">
            <h2 className="display display--yellow"><Rich text={c.impede.titulo} /></h2>
            <Paragraphs text={c.impede.texto} />
            <Cta name="impede" c={c}>{c.impede.botao}</Cta>
          </div>

          {c.resultados2.length > 0 && <Carousel images={c.resultados2} variant="wide" label="Mais resultados de alunos" />}

          <div className="block">
            <h2 className="display"><Rich text={c.incluso.titulo} strongClass="display--yellow" /></h2>
            <ConsultoriaPremium d={c.incluso} />
            <Cta name="incluso" c={c}>{c.incluso.botao}</Cta>
          </div>

          <div className="block">
            <hr className="rule" />
            <QuemE d={c.quemE} />
            <Cta name="quem-e" c={c}>{c.quemE.botao}</Cta>
          </div>

          <Avaliacoes d={c.avaliacoes} c={c} />

          {c.pratica?.titulo && (
            <div className="block pratica">
              <h2 className="display display--yellow"><Rich text={c.pratica.titulo} /></h2>
              <Paragraphs text={c.pratica.texto} />
            </div>
          )}

          <div className="faq">
            {c.faq.map((f, i) => (
              <details key={i} open={i === 0}>
                <summary>{f.q}</summary>
                <Paragraphs text={f.a} />
              </details>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer__social">
          <a className="social social--whats" href={wa(c.contato.msgPadrao)} data-cta="rodape" aria-label="WhatsApp">
            <svg viewBox="0 0 32 32" aria-hidden="true"><path d={WA_ICON} /></svg>
          </a>
          <a className="social social--insta" href={c.contato.instagram} target="_blank" rel="noopener" aria-label="Instagram">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={IG_ICON} /></svg>
          </a>
        </div>
        <p>Todos os direitos reservados. ®️<br />{new Date().getFullYear()}</p>
        <p className="footer__legal"><Rich text={c.rodape.legal} /></p>
        <p className="footer__links">
          <a href="/politica-de-privacidade/">Política de privacidade</a> · <a href="/termos-de-uso/">Termos de uso</a> · <a href="/contato/">Contato</a>
        </p>
      </footer>

      <StickyBar texto={c.barra.texto} whats={c.barra.botaoWhats} agendar={c.barra.botaoAgendar}
        hrefWhats={wa(c.contato.msgPadrao)} hrefAgendar={wa(c.contato.msgAgendar)} />
    </>
  );
}

const WA_ICON = "M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7a10.7 10.7 0 0 1-5.5-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-1-2.2-1s-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8 1 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4Z";
const IG_ICON = "M12 7.3A4.7 4.7 0 1 0 16.7 12 4.7 4.7 0 0 0 12 7.3Zm0 7.8A3.1 3.1 0 1 1 15.1 12 3.1 3.1 0 0 1 12 15.1Zm6-8a1.1 1.1 0 1 1-1.1-1.1A1.1 1.1 0 0 1 18 7.1ZM21.1 8.2a5.4 5.4 0 0 0-1.5-3.8 5.5 5.5 0 0 0-3.8-1.5C14.3 2.8 9.7 2.8 8.2 2.9a5.5 5.5 0 0 0-3.8 1.5 5.5 5.5 0 0 0-1.5 3.8c-.1 1.5-.1 6.1 0 7.6a5.4 5.4 0 0 0 1.5 3.8 5.5 5.5 0 0 0 3.8 1.5c1.5.1 6.1.1 7.6 0a5.4 5.4 0 0 0 3.8-1.5 5.5 5.5 0 0 0 1.5-3.8c.1-1.5.1-6.1 0-7.6Zm-2 9.2a3.1 3.1 0 0 1-1.8 1.8c-1.2.5-4.1.4-5.3.4s-4.2.1-5.3-.4a3.1 3.1 0 0 1-1.8-1.8c-.5-1.2-.4-4.1-.4-5.4s-.1-4.2.4-5.3a3.1 3.1 0 0 1 1.8-1.8c1.2-.5 4.1-.4 5.3-.4s4.2-.1 5.3.4a3.1 3.1 0 0 1 1.8 1.8c.5 1.2.4 4.1.4 5.3s.1 4.2-.4 5.4Z";
