"use client";
import { createContext, useContext, useEffect, useState, useTransition } from "react";
import { salvar, logout } from "./actions";

const get = (o, p) => p.split(".").reduce((a, k) => a?.[k], o);
function setIn(o, p, v) {
  const [k, ...rest] = p.split(".");
  const copy = Array.isArray(o) ? [...o] : { ...o };
  copy[k] = rest.length ? setIn(o[k], rest.join("."), v) : v;
  return copy;
}

// Reduz a imagem no navegador (máx. 1600px, WebP) antes de enviar
async function prepararImagem(file) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / bmp.width);
  const w = Math.round(bmp.width * scale), h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
  const blob = await new Promise((r) => canvas.toBlob(r, "image/webp", 0.86));
  return { blob: blob || file, w, h };
}

async function enviar(file) {
  const { blob, w, h } = await prepararImagem(file);
  const fd = new FormData();
  fd.append("file", blob, "imagem.webp");
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j.erro || "Falha no envio");
  return { src: j.url, w, h };
}

const Hint = ({ children }) => <small className="adm-hint">{children}</small>;
const Ctx = createContext(null);

// Nas páginas de campanha os campos são gravados em paginas.<chave>.<campo>
const useField = (p) => { const x = useContext(Ctx); return { ...x, p: x.pre + p }; };

function Text({ p: campo, label, hint }) {
  const { c, set, p } = useField(campo);
  return (
    <label className="adm-field">{label}
      <input value={get(c, p) ?? ""} onChange={(e) => set(p, e.target.value)} />
      {hint && <Hint>{hint}</Hint>}
    </label>
  );
}
function Area({ p: campo, label, rows = 3, hint = "**palavra** = destaque. Enter = nova linha." }) {
  const { c, set, p } = useField(campo);
  return (
    <label className="adm-field">{label}
      <textarea rows={rows} value={get(c, p) ?? ""} onChange={(e) => set(p, e.target.value)} />
      {hint && <Hint>{hint}</Hint>}
    </label>
  );
}
function ImageField({ p, label }) {
    const { c, set, withUpload } = useContext(Ctx);
    const img = get(c, p);
    return (
      <div className="adm-field">{label}
        <div className="adm-img">
          <img src={img?.src} alt="" />
          <label className="adm-btn adm-btn--ghost">Trocar imagem
            <input type="file" accept="image/*" hidden onChange={(e) => {
              const f = e.target.files?.[0]; e.target.value = "";
              if (f) withUpload(async () => set(p, await enviar(f)));
            }} />
          </label>
        </div>
      </div>
    );
}
function Gallery({ p, label }) {
    const { c, set, setC, setDirty, withUpload } = useContext(Ctx);
    const list = get(c, p) || [];
    const move = (i, d) => { const n = [...list]; [n[i], n[i + d]] = [n[i + d], n[i]]; set(p, n); };
    return (
      <div className="adm-field">{label} <Hint>{list.length} imagens. A ordem aqui é a ordem no site.</Hint>
        <ul className="adm-gallery">
          {list.map((img, i) => (
            <li key={img.src + i}>
              <img src={img.src} alt="" />
              <div className="adm-gallery__tools">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Mover para a esquerda">←</button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === list.length - 1} aria-label="Mover para a direita">→</button>
                <button type="button" className="danger" onClick={() => set(p, list.filter((_, j) => j !== i))} aria-label="Remover">✕</button>
              </div>
            </li>
          ))}
          <li className="adm-gallery__add">
            <label>+ Adicionar
              <input type="file" accept="image/*" multiple hidden onChange={(e) => {
                const files = [...(e.target.files || [])]; e.target.value = "";
                withUpload(async () => {
                  const novas = [];
                  for (const f of files) novas.push({ ...(await enviar(f)), alt: list[0]?.alt || "Resultado de aluno" });
                  setC((o) => setIn(o, p, [...(get(o, p) || []), ...novas])); setDirty(true);
                });
              }} />
            </label>
          </li>
        </ul>
      </div>
    );
}

function ListField({ p, label, hint }) {
  const { c, set } = useContext(Ctx);
  const list = get(c, p) || [];
  return (
    <div className="adm-field">{label}{hint && <Hint>{hint}</Hint>}
      {list.map((it, i) => (
        <div className="adm-listrow" key={i}>
          <input value={it} onChange={(e) => set(p, list.map((x, j) => (j === i ? e.target.value : x)))} aria-label={`${label} ${i + 1}`} />
          <button type="button" onClick={() => { const n = [...list]; [n[i], n[i - 1]] = [n[i - 1], n[i]]; set(p, n); }} disabled={i === 0} aria-label="Subir">↑</button>
          <button type="button" className="danger" onClick={() => set(p, list.filter((_, j) => j !== i))} aria-label="Remover">✕</button>
        </div>
      ))}
      <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => set(p, [...list, "Novo item"])}>+ Adicionar item</button>
    </div>
  );
}

export default function Editor({ initial, storage }) {
  const [c, setC] = useState(initial);
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState(null);
  const [saving, start] = useTransition();
  const [uploading, setUploading] = useState(0);

  const set = (p, v) => { setC((o) => setIn(o, p, v)); setDirty(true); setMsg(null); };
  const [pg, setPg] = useState("home");
  const pre = pg === "home" ? "" : `paginas.${pg}.`;
  const home = pg === "home";
  const faqPath = pre + "faq";
  const faq = get(c, faqPath) || [];
  const verSite = home ? "/" : c.paginas?.[pg]?.rota || "/";

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const save = () => start(async () => {
    const r = await salvar(c);
    if (r.ok) { setDirty(false); setMsg({ ok: true, t: "Salvo. O site já está atualizado." }); }
    else setMsg({ ok: false, t: r.erro });
  });

  const withUpload = async (fn) => {
    setUploading((n) => n + 1);
    try { await fn(); } catch (e) { setMsg({ ok: false, t: e.message }); } finally { setUploading((n) => n - 1); }
  };

  return (
    <Ctx.Provider value={{ c, set, setC, setDirty, withUpload, pre }}>
    <main className="adm">
      <header className="adm-top">
        <strong>Editar site</strong>
        <span className={`adm-status${dirty ? " is-dirty" : ""}`}>
          {uploading ? "Enviando imagem..." : dirty ? "Alterações não salvas" : "Tudo salvo"}
        </span>
        <div className="adm-top__actions">
          <a className="adm-btn adm-btn--ghost" href={verSite} target="_blank" rel="noopener">Ver página</a>
          <button className="adm-btn" onClick={save} disabled={!dirty || saving || uploading > 0}>{saving ? "Salvando..." : "Salvar alterações"}</button>
          <form action={logout}><button className="adm-link">Sair</button></form>
        </div>
      </header>
      {msg && <p className={`adm-msg ${msg.ok ? "ok" : "erro"}`} role="status">{msg.t}</p>}

      <div className="adm-body">
        <div className="adm-pages" role="tablist" aria-label="Página que está editando">
          {[["home", "Página inicial"], ["esportivo", "Nutricionista esportivo"], ["online", "Nutricionista online"]].map(([k, t]) => (
            <button key={k} type="button" role="tab" aria-selected={pg === k} className={pg === k ? "is-on" : ""} onClick={() => setPg(k)}>{t}</button>
          ))}
        </div>
        {!home && <p className="adm-hint adm-hint--box">Aqui você edita só os textos desta página ({c.paginas?.[pg]?.rota}). Fotos, carrosséis, artes, barra fixa e rodapé são os mesmos da Página inicial.</p>}

        <details open><summary>Topo (primeira dobra)</summary>
          <Text p="hero.titulo" label="Título" />
          <Text p="hero.subtitulo" label="Subtítulo" />
          <Area p="hero.texto" label="Texto" />
          <Text p="hero.chamada" label="Frase acima do botão" />
          {home && <>
          <Text p="hero.botao" label="Texto do botão" />
          <div className="adm-row">
            <ImageField p="hero.imgDesktop" label="Imagem no computador" />
            <ImageField p="hero.imgMobile" label="Imagem no celular" />
          </div>
          <Text p="hero.alt" label="Descrição da imagem" hint="Lida por leitores de tela e pelo Google." />
          </>}
        </details>

        <details><summary>Faixa amarela (dores)</summary>
          <Area p="dor.titulo" label="Título" rows={2} />
          <Area p="dor.perguntas" label="Perguntas" rows={4} />
          <Area p="dor.texto" label="Texto" />
          {home && <Text p="dor.botao" label="Texto do botão" />}
        </details>

        {home && <details><summary>Resultados (1º carrossel)</summary>
          <Gallery p="resultados1" label="Imagens" />
        </details>}

        <details><summary>O que impede seus resultados</summary>
          <Area p="impede.titulo" label="Título" rows={2} />
          <Area p="impede.texto" label="Texto" rows={6} hint="**palavra** = negrito. Linha em branco = novo parágrafo." />
          {home && <Text p="impede.botao" label="Texto do botão" />}
        </details>

        {home && <>
        <details><summary>Resultados (2º carrossel)</summary>
          <Gallery p="resultados2" label="Imagens" />
        </details>

        <details><summary>O que está incluso</summary>
          <Area p="incluso.titulo" label="Título da seção" rows={2} hint="**palavra** fica amarela. Enter = nova linha." />
          <Area p="incluso.cardTitulo" label="Título da arte" rows={2} hint="Enter = nova linha." />
          <ListField p="incluso.itens" label="Itens com check" hint="O primeiro item fica em negrito. Textos muito longos podem encostar na foto." />
          <ImageField p="incluso.fundo" label="Fundo com foto (sem texto)" />
          <Text p="incluso.fotoAlt" label="Descrição da foto" />
          <Text p="incluso.botao" label="Texto do botão" />
        </details>

        <details><summary>Quem é Fabricio</summary>
          <Area p="quemE.titulo" label="Título" rows={2} hint="Enter = nova linha." />
          <Area p="quemE.texto" label="Apresentação" rows={6} hint="Cada Enter é uma linha da arte. **palavra** = negrito." />
          <Text p="quemE.especTitulo" label="Título das especializações" />
          <ListField p="quemE.espec" label="Especializações" />
          <Text p="quemE.conquista" label="Linha do troféu" hint="**palavra** = negrito." />
          <Area p="quemE.fechamento" label="Texto final" rows={3} />
          <Area p="quemE.convite" label="Convite (amarelo)" rows={2} />
          <ImageField p="quemE.fundo" label="Fundo com foto (sem texto)" />
          <Text p="quemE.fotoAlt" label="Descrição da foto" />
          <Text p="quemE.botao" label="Texto do botão" />
        </details>
        </>}

        <details><summary>Texto antes das perguntas</summary>
          <Text p="pratica.titulo" label="Título" hint="Deixe vazio para esconder a seção." />
          <Area p="pratica.texto" label="Texto" rows={10} hint="Linha em branco = novo parágrafo. Bom para o Google: explique o serviço com as palavras que as pessoas buscam." />
        </details>

        <details><summary>Perguntas frequentes</summary>
          {faq.map((f, i) => (
            <div className="adm-faq" key={i}>
              <Text p={`faq.${i}.q`} label={`Pergunta ${i + 1}`} />
              <Area p={`faq.${i}.a`} label="Resposta" />
              <button type="button" className="adm-link danger" onClick={() => set(faqPath, faq.filter((_, j) => j !== i))}>Remover pergunta</button>
            </div>
          ))}
          <button type="button" className="adm-btn adm-btn--ghost" onClick={() => set(faqPath, [...faq, { q: "Nova pergunta", a: "Resposta" }])}>+ Adicionar pergunta</button>
        </details>

        {home && <>
        <details><summary>Barra fixa de contato</summary>
          <Text p="barra.texto" label="Frase (aparece no computador)" />
          <Text p="barra.botaoWhats" label="Botão WhatsApp" />
          <Text p="barra.botaoAgendar" label="Botão agendar" />
        </details>

        <details><summary>WhatsApp e contato</summary>
          <Text p="contato.whatsapp" label="Número do WhatsApp" hint="Só números, com 55 e DDD. Ex: 5511914849797" />
          <Area p="contato.msgPadrao" label="Mensagem padrão dos botões" rows={2} hint="Mantenha `{cod}`: é onde entra o código de rastreio do anúncio." />
          <Area p="contato.msgAgendar" label="Mensagem do botão Agendar (barra fixa)" rows={2} hint="Mantenha `{cod}`." />
          <Text p="contato.instagram" label="Link do Instagram" />
        </details>
        </>}

        <details><summary>{home ? "Rodapé e Google" : "Google (título e descrição)"}</summary>
          {home && <Area p="rodape.legal" label="Texto legal do rodapé" rows={2} />}
          <Text p="seo.title" label="Título na aba e no Google" />
          <Area p="seo.description" label="Descrição no Google" rows={2} hint="Até uns 155 caracteres." />
        </details>

        {home && <details><summary>Rastreamento (avançado)</summary>
          <p className="adm-warn">Só altere se trocar de conta. Um ID errado para de registrar conversões dos anúncios.</p>
          <Text p="rastreio.gtm" label="Google Tag Manager" />
          <Text p="rastreio.googleTag" label="Tag do Google (Analytics)" hint="Vazio = desligado. Não afeta as conversões do Google Ads." />
          <Text p="rastreio.metaPixel" label="Pixel da Meta" hint="Vazio = desligado." />
        </details>}

        <p className="adm-foot">Conteúdo salvo em: {storage}</p>
      </div>
    </main>
    </Ctx.Provider>
  );
}
