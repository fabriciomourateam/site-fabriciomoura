"use client";
import { useEffect, useState, useTransition } from "react";
import { salvarPost, excluirPost } from "./actions";

// Data/hora no fuso de São Paulo <-> campo datetime-local
const paraCampo = (iso) => {
  const d = new Date(iso || Date.now());
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
};
const doCampo = (v) => (v ? new Date(`${v}:00-03:00`).toISOString() : new Date().toISOString());
const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

async function enviarImagem(file) {
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const j = await r.json();
  if (!r.ok) throw new Error(j.erro || "Falha no envio");
  return j.url;
}

export default function PostEditor({ initial, novo = false }) {
  const [p, setP] = useState({ ...initial, date: paraCampo(initial.date) });
  const [dirty, setDirty] = useState(false);
  const [msg, setMsg] = useState(null);
  const [pending, start] = useTransition();
  const [slugManual, setSlugManual] = useState(!novo);

  const set = (k, v) => {
    setP((o) => {
      const n = { ...o, [k]: v };
      if (k === "title" && novo && !slugManual) n.slug = slugify(v);
      return n;
    });
    setDirty(true); setMsg(null);
  };

  useEffect(() => {
    const warn = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const salvar = (status) => start(async () => {
    const dados = { ...p, status: status || p.status, date: doCampo(p.date) };
    const r = await salvarPost(dados);
    if (!r.ok) return setMsg({ ok: false, t: r.erro });
    setP((o) => ({ ...o, status: dados.status }));
    setDirty(false);
    setMsg({ ok: true, t: dados.status === "publish" ? "Publicado. Já está no site." : "Salvo como rascunho (não aparece no site)." });
    if (novo) window.location.href = `/admin/blog/${p.slug}`;
  });

  const excluir = () => {
    if (!confirm("Tirar este artigo do site? Ele some do blog, do menu e do sitemap.")) return;
    start(async () => {
      const r = await excluirPost(p.slug);
      if (r.ok) { setDirty(false); window.location.href = "/admin/blog"; }
      else setMsg({ ok: false, t: r.erro });
    });
  };

  const publicado = p.status === "publish";
  const desc = p.description || "";
  return (
    <main className="adm">
      <header className="adm-top">
        <a href="/admin/blog" style={{ color: "#fff" }}>← Blog</a>
        <strong>{novo ? "Novo artigo" : "Editar artigo"}</strong>
        <span className={`adm-status${dirty ? " is-dirty" : ""}`}>
          {dirty ? "Alterações não salvas" : publicado ? "Publicado" : "Rascunho"}
        </span>
        <div className="adm-top__actions">
          {!novo && (
            <a className="adm-btn adm-btn--ghost" href={publicado ? `/${p.slug}/` : `/admin/blog/previa/${p.slug}`} target="_blank" rel="noopener">
              {publicado ? "Ver no site" : "Prévia"}
            </a>
          )}
          <button className="adm-btn adm-btn--ghost" disabled={pending} onClick={() => salvar("draft")}>Salvar rascunho</button>
          <button className="adm-btn" disabled={pending} onClick={() => salvar("publish")}>{pending ? "Salvando..." : publicado ? "Salvar e manter publicado" : "Publicar"}</button>
        </div>
      </header>
      {msg && <p className={`adm-msg ${msg.ok ? "ok" : "erro"}`} role="status">{msg.t}</p>}

      <div className="adm-body">
        <details open><summary>Artigo</summary>
          <label className="adm-field">Título (aparece no blog e no menu)
            <input value={p.title} onChange={(e) => set("title", e.target.value)} />
          </label>
          <label className="adm-field">Endereço
            <input value={p.slug} disabled={!novo} onChange={(e) => { setSlugManual(true); set("slug", slugify(e.target.value)); }} />
            <small className="adm-hint">
              fabriciomoura.com/<b>{p.slug || "endereco-do-artigo"}</b>/{!novo && " (não muda depois de publicado, para não perder o Google)"}
            </small>
          </label>
          <div className="adm-row">
            <label className="adm-field">Data de publicação (horário de Brasília)
              <input type="datetime-local" value={p.date} onChange={(e) => set("date", e.target.value)} />
            </label>
            <label className="adm-field">Palavra-chave foco
              <input value={p.focusKw || ""} onChange={(e) => set("focusKw", e.target.value)} />
            </label>
          </div>
        </details>

        <details open><summary>Google (SEO)</summary>
          <label className="adm-field">Título no Google
            <input value={p.seoTitle || ""} placeholder={`${p.title || "Título"} | Fabricio Moura`} onChange={(e) => set("seoTitle", e.target.value)} />
            <small className="adm-hint">{(p.seoTitle || "").length} caracteres (ideal até 60). Vazio = título do artigo + "| Fabricio Moura".</small>
          </label>
          <label className="adm-field">Descrição no Google
            <textarea rows={3} value={desc} onChange={(e) => set("description", e.target.value)} />
            <small className="adm-hint">{desc.length} caracteres (ideal entre 120 e 160).</small>
          </label>
          <div className="adm-field">Imagem de compartilhamento (WhatsApp, redes)
            <div className="adm-img">
              {p.image && <img src={p.image} alt="" />}
              <label className="adm-btn adm-btn--ghost">Enviar imagem
                <input type="file" accept="image/*" hidden onChange={async (e) => {
                  const f = e.target.files?.[0]; if (!f) return;
                  try { set("image", await enviarImagem(f)); } catch (err) { setMsg({ ok: false, t: err.message }); }
                }} />
              </label>
            </div>
            <input value={p.image || ""} placeholder="https://..." onChange={(e) => set("image", e.target.value)} />
          </div>
        </details>

        <details open><summary>Conteúdo (HTML)</summary>
          <p className="adm-hint adm-hint--box">
            Os artigos usam o modelo visual preto e ouro em HTML. Para escrever um à mão, o jeito mais fácil é abrir
            um artigo parecido, copiar este campo inteiro, colar aqui e trocar os textos. Use "Prévia" antes de publicar.
          </p>
          <textarea className="adm-code" rows={28} spellCheck={false} value={p.content || ""} onChange={(e) => set("content", e.target.value)} />
        </details>

        {!novo && <button type="button" className="adm-link danger" onClick={excluir} disabled={pending}>Excluir artigo</button>}
      </div>
    </main>
  );
}
