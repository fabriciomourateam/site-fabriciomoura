"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { DEFAULT_CONTENT as C } from "@/lib/defaults";

const BASE = "https://qhzifnyjyxdushxorzrk.supabase.co/functions/v1/campaign-go";
const END = new Date("2026-11-30T23:59:59-03:00").getTime();

function link(k, p) {
  return k ? `${BASE}?k=${k}&p=${p}` : `${BASE}?g=black-leads-2026&p=${p}`;
}

function useCountdown() {
  const [left, setLeft] = useState(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, END - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  if (left === null) return null;
  const s = Math.floor(left / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
const p2 = (n) => String(n).padStart(2, "0");

function Countdown({ t, big }) {
  const items = t ? [["dias", t.d], ["horas", t.h], ["min", t.m], ["seg", t.s]] : [["dias", "--"], ["horas", "--"], ["min", "--"], ["seg", "--"]];
  return (
    <div className={`bf-cd ${big ? "bf-cd--big" : ""}`} role="timer" aria-label="Tempo restante da Black Friday">
      {items.map(([l, v]) => (
        <div key={l} className="bf-cd__box">
          <b>{typeof v === "number" ? p2(v) : v}</b>
          <span>{l}</span>
        </div>
      ))}
    </div>
  );
}

function Count({ to, prefix = "", suffix = "", decimals = 0 }) {
  const ref = useRef(null);
  const [v, setV] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { setV(to); return; }
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      const t0 = performance.now();
      const dur = 1600;
      const step = (now) => {
        const x = Math.min(1, (now - t0) / dur);
        setV(to * (1 - Math.pow(1 - x, 3)));
        if (x < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(el);
    return () => io.disconnect();
  }, [to]);
  const txt = decimals ? v.toFixed(decimals).replace(".", ",") : Math.round(v).toLocaleString("pt-BR");
  return <span ref={ref}>{prefix}{txt}{suffix}</span>;
}

function Stars({ n = 5 }) {
  return (
    <span className="bf-stars" aria-label={`${n} estrelas`}>
      {Array.from({ length: n }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" style={{ "--i": i }} aria-hidden="true">
          <path d="M12 2l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 18l-6.4 3.6L7 14.5 1.7 9.5l7.2-.9z" />
        </svg>
      ))}
    </span>
  );
}

const ITENS = [
  ["🥗", "Dieta 100% individualizada", "Montada pro seu corpo, sua rotina e o que você gosta de comer."],
  ["🏋️", "Treino montado pro seu objetivo", "Treino individual, com ajustes ao longo do caminho."],
  ["📊", "Bioimpedância", "Pra você ver seu % de gordura e acompanhar a evolução de verdade."],
  ["📱", "Aplicativo completo", "Desenvolvido por mim, com dieta, treino e acompanhamento num só lugar."],
  ["✅", "Check-ins de avaliação", "Ajustes contínuos pra você não ficar parado nem perdido."],
  ["👥", "Comunidade exclusiva", "Os alunos do Time juntos, trocando energia e motivação."],
  ["💬", "Suporte total pelo WhatsApp", "Você não faz sozinho. Contato próximo e direto com o Time."],
];

export default function BlackPage({ k }) {
  const t = useCountdown();
  const [ready, setReady] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [open, setOpen] = useState(0);
  const plansRef = useRef(null);
  const heroRef = useRef(null);

  useEffect(() => {
    setReady(true);
    if (k) {
      try { fetch(`${BASE}?k=${k}&visita=lp`, { mode: "no-cors", keepalive: true }).catch(() => {}); } catch (e) {}
    }
  }, [k]);

  useEffect(() => {
    const els = document.querySelectorAll(".bf-rev");
    const io = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("bf-in"); io.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let heroOut = false, plansIn = false;
    const upd = () => setSticky(heroOut && !plansIn);
    const a = new IntersectionObserver(([e]) => { heroOut = !e.isIntersecting; upd(); });
    const b = new IntersectionObserver(([e]) => { plansIn = e.isIntersecting; upd(); });
    if (heroRef.current) a.observe(heroRef.current);
    if (plansRef.current) b.observe(plansRef.current);
    return () => { a.disconnect(); b.disconnect(); };
  }, []);

  const goPlans = (e) => {
    e.preventDefault();
    plansRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={`bf ${ready ? "bf-js" : ""}`}>
      {/* 1. Barra topo */}
      <div className="bf-top">
        <span className="bf-top__txt"><i className="bf-dot" /> BLACK FRIDAY <em>·</em> termina em</span>
        <Countdown t={t} />
      </div>

      {/* 2. Hero */}
      <header className="bf-hero" ref={heroRef}>
        <div className="bf-hero__bg" aria-hidden="true">
          <span className="bf-orb bf-orb--a" /><span className="bf-orb bf-orb--b" />
          {Array.from({ length: 14 }).map((_, i) => <span key={i} className="bf-sp" style={{ "--n": i }} />)}
        </div>
        <div className="bf-wrap bf-hero__grid">
          <div className="bf-hero__copy">
            <span className="bf-seal">Condição exclusiva de Black Friday</span>
            <h1 className="bf-h1">Seu shape novo começa agora, com a <span className="bf-grad">maior condição do ano</span></h1>
            <p className="bf-sub">Dieta e treino individualizados e acompanhamento de perto, pra você chegar no físico que quer sem sofrimento. Bora?</p>
            <a href="#planos" onClick={goPlans} className="bf-btn bf-btn--cta">Quero garantir minha vaga</a>
            <div className="bf-mini">
              <Stars /> <b>5,0</b> <span>· +800 avaliações no Google</span>
            </div>
          </div>
          <div className="bf-hero__photo">
            <div className="bf-photo-ring" />
            <Image src="/img/hero-mobile.png" alt="Fabricio Moura" width={676} height={682} priority sizes="(max-width: 860px) 90vw, 520px" />
          </div>
        </div>
      </header>

      {/* 3. Números */}
      <section className="bf-nums">
        <div className="bf-wrap bf-nums__grid">
          <div className="bf-rev"><b><Count to={2000} prefix="+" /></b><span>transformações</span></div>
          <div className="bf-rev" style={{ "--d": ".08s" }}><b><Count to={7} /></b><span>países</span></div>
          <div className="bf-rev" style={{ "--d": ".16s" }}><b><Count to={18} /></b><span>anos de experiência</span></div>
          <div className="bf-rev" style={{ "--d": ".24s" }}><b><Count to={5} decimals={1} /></b><span>no Google</span></div>
        </div>
      </section>

      {/* 4. Antes e depois */}
      <section className="bf-sec">
        <div className="bf-wrap">
          <h2 className="bf-h2 bf-rev">Resultados reais de <span className="bf-grad">alunos do Time</span></h2>
        </div>
        {[[C.resultados1, ""], [C.resultados2, " bf-marq--rev"]].map(([list, cls], r) => (
          <div className={`bf-marq${cls}`} key={r} aria-label={r === 0 ? "Fotos de antes e depois de alunos" : undefined}>
            <div className="bf-marq__track">
              {[...list, ...list].map((x, i) => (
                <div className="bf-marq__item" key={i} aria-hidden={i >= list.length ? "true" : undefined}>
                  <Image src={x.src} alt={i < list.length ? x.alt : ""} width={x.w} height={x.h} loading="lazy" sizes="260px" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 5. O que recebe */}
      <section className="bf-sec bf-sec--alt">
        <div className="bf-wrap">
          <h2 className="bf-h2 bf-rev">O que você <span className="bf-grad">recebe</span></h2>
          <div className="bf-cards">
            {ITENS.map(([ic, tt, tx], i) => (
              <div className="bf-card bf-rev" style={{ "--d": `${(i % 4) * 0.07}s` }} key={tt}>
                <span className="bf-card__ic">{ic}</span>
                <h3>{tt}</h3>
                <p>{tx}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Avaliações */}
      <section className="bf-sec">
        <div className="bf-wrap">
          <h2 className="bf-h2 bf-rev">O que dizem os <span className="bf-grad">alunos</span></h2>
          <div className="bf-rating bf-rev">
            <Stars /> <b><Count to={5} decimals={1} /></b>
            <span>Mais de <b><Count to={800} /></b> avaliações no Google</span>
          </div>
        </div>
        <div className="bf-revs">
          {C.avaliacoes.itens.map((a, i) => (
            <figure className="bf-review bf-rev" style={{ "--d": `${(i % 4) * 0.06}s` }} key={a.nome}>
              <Stars />
              <blockquote>“{a.texto}”</blockquote>
              <figcaption>{a.nome}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* 7. Planos */}
      <section className="bf-sec bf-plans" id="planos" ref={plansRef}>
        <div className="bf-wrap">
          <span className="bf-seal bf-rev">Só até 30/11</span>
          <h2 className="bf-h2 bf-rev">Escolha seu <span className="bf-grad">plano Black</span></h2>
          <div className="bf-plangrid">
            <article className="bf-plan bf-rev">
              <h3>Trimestral</h3>
              <p className="bf-plan__bonus">3 meses + <b>30 dias de bônus</b></p>
              <div className="bf-plan__price"><small>12x de</small><strong>R$ 49,75</strong><small>no cartão</small></div>
              <a className="bf-btn bf-btn--ghost" href={link(k, "3m")}>Quero o Trimestral</a>
              <a className="bf-pix" href={link(k, "3m_pix")}>ou pagar no Pix</a>
            </article>

            <article className="bf-plan bf-plan--best bf-rev" style={{ "--d": ".1s" }}>
              <span className="bf-ribbon">MAIS ESCOLHIDO</span>
              <div className="bf-plan__in">
                <h3>Anual</h3>
                <p className="bf-plan__tag">Melhor custo-benefício</p>
                <p className="bf-plan__bonus">12 meses + <b>60 dias de bônus</b></p>
                <div className="bf-plan__price"><small>12x de</small><strong>R$ 108,08</strong><small>no cartão</small></div>
                <p className="bf-plan__month">sai R$ 92/mês</p>
                <a className="bf-btn bf-btn--cta" href={link(k, "12m")}>Quero o Anual</a>
                <a className="bf-pix" href={link(k, "12m_pix")}>ou pagar no Pix</a>
              </div>
            </article>
          </div>
          <div className="bf-deadline bf-rev">
            <p>Condição válida só até 30/11</p>
            <Countdown t={t} big />
            <p className="bf-next">Assim que fizer a adesão, te mando os próximos passos pra gente começar 🚀</p>
          </div>
        </div>
      </section>

      {/* 8. Quem é */}
      <section className="bf-sec bf-sec--alt">
        <div className="bf-wrap bf-about">
          <div className="bf-about__img bf-rev">
            <Image src="/img/quem-e-bg.webp" alt="Fabricio Moura em foto de fisiculturismo" width={1080} height={1174} loading="lazy" sizes="(max-width: 860px) 92vw, 480px" />
          </div>
          <div className="bf-about__txt bf-rev" style={{ "--d": ".1s" }}>
            <h2 className="bf-h2 bf-h2--left">Quem é <span className="bf-grad">Fabricio Moura</span></h2>
            <p>Nutricionista e educador físico, construí uma equipe de nutrição e treinamento com nutricionistas e treinadores especializados.</p>
            <ul className="bf-facts">
              <li>Mais de <b>2.000 transformações</b> em <b>7 países</b></li>
              <li>Mais de <b>12 títulos no BodyBuilding</b></li>
              <li><b>18 anos</b> de experiência prática</li>
            </ul>
            <p>Minha vida inteira tive a musculação, a alimentação e a qualidade de vida como base. E hoje estou aqui pra te convidar pra entrar no Time e ter sua vida transformada.</p>
          </div>
        </div>
      </section>

      {/* 9. Gatilhos */}
      <section className="bf-sec">
        <div className="bf-wrap bf-trig">
          <div className="bf-trig__box bf-rev">
            <span>⏳</span>
            <h3>Só até 30/11</h3>
            <p>A condição de Black Friday acaba no fim do mês e não volta depois.</p>
          </div>
          <div className="bf-trig__box bf-rev" style={{ "--d": ".08s" }}>
            <span>🎁</span>
            <h3>Dias de bônus só na Black</h3>
            <p>30 dias a mais no Trimestral e 60 dias a mais no Anual.</p>
          </div>
          <div className="bf-trig__box bf-rev" style={{ "--d": ".16s" }}>
            <span>🤝</span>
            <h3>Você não faz sozinho</h3>
            <p>Ajustes contínuos e suporte de perto durante todo o processo.</p>
          </div>
        </div>
      </section>

      {/* 10. FAQ */}
      <section className="bf-sec bf-sec--alt">
        <div className="bf-wrap bf-faq">
          <h2 className="bf-h2 bf-rev">Dúvidas <span className="bf-grad">frequentes</span></h2>
          {[
            { q: "O acompanhamento online funciona?", a: "Sim. O acompanhamento online entrega a mesma estratégia individual, com a flexibilidade de fazer no seu ritmo e de onde você estiver." },
            { q: "Você prescreve o treino também?", a: "Sim. Sou nutricionista e também educador físico, então dieta e treino são montados de forma integrada no mesmo acompanhamento." },
            C.faq[2],
            { q: "Como começo depois de pagar?", a: "Assim que o pagamento confirma, te mando o formulário de anamnese e os próximos passos." },
          ].map((f, i) => (
            <div className={`bf-q ${open === i ? "bf-q--open" : ""}`} key={f.q}>
              <button type="button" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                <span>{f.q}</span><i aria-hidden="true" />
              </button>
              <div className="bf-q__a"><div><p>{f.a}</p></div></div>
            </div>
          ))}
          <p className="bf-doubt">Ficou com dúvida? É só responder a mensagem no WhatsApp.</p>
        </div>
      </section>

      {/* 11. CTA final + rodapé */}
      <section className="bf-final">
        <div className="bf-wrap">
          <h2 className="bf-h2 bf-rev">Bora entrar pro <span className="bf-grad">Time</span>?</h2>
          <p className="bf-rev">A melhor condição do ano termina em:</p>
          <Countdown t={t} big />
          <a href="#planos" onClick={goPlans} className="bf-btn bf-btn--cta bf-btn--lg">Quero garantir minha vaga</a>
        </div>
      </section>

      <footer className="bf-foot">
        <Image src="/img/logo.png" alt="Fabricio Moura" width={1080} height={762} loading="lazy" sizes="90px" />
        <p>{C.rodape.legal.replace(/\*\*/g, "").split("\n").map((l, i) => <span key={i}>{l}<br /></span>)}</p>
      </footer>

      {/* 12. Botão fixo */}
      <a href="#planos" onClick={goPlans} className={`bf-sticky ${sticky ? "bf-sticky--on" : ""}`} aria-hidden={!sticky} tabIndex={sticky ? 0 : -1}>
        Garantir minha Black
      </a>
    </div>
  );
}
