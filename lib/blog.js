import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { revalidatePath, revalidateTag } from "next/cache";
import { sbAuth } from "./content";
import { termosProibidos, textoDoPost } from "./temas-proibidos";

/*
  Blog do site. Duas fontes, juntadas pelo slug:
  1. content/blog/<slug>.json  (posts importados do WordPress, versionados no git)
  2. tabela blog_posts no Supabase (artigos novos do painel /admin e da automação semanal,
     e edições dos importados). Uma linha no Supabase SEMPRE vence o arquivo de mesmo slug;
     status "draft" ou "deleted" tira o post do ar sem apagar o arquivo.
  A URL de cada post é /<slug>/ (igual ao WordPress), servida por app/[slug]/page.jsx.
  As PÁGINAS migradas do WordPress (sobre, contato, renovação, links...) usam o mesmo esquema:
  content/paginas/<slug>.json + linhas com tipo = 'pagina'. layout "institucional" = com o menu do
  site; "livre" = página de venda/bio exatamente como era. robots vem do arquivo (renovação = noindex).
*/
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const blogUsingSupabase = !!(SB_URL && SB_KEY);
const DIRS = { post: path.join(process.cwd(), "content", "blog"), pagina: path.join(process.cwd(), "content", "paginas") };
const LIST_COLS = "slug,title,seo_title,description,focus_kw,image,status,published_at,updated_at,source,tipo";
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Trava (26/10/2026): post/página publicado com hormônio, anabolizante ou remédio de emagrecer sai do ar
// (vira rascunho na leitura). Esses temas só vão pro fabriciomoura.blog.br. Ver lib/temas-proibidos.js.
function travar(p) {
  if (p.status !== "publish") return p;
  const achados = termosProibidos(textoDoPost(p));
  if (!achados.length) return p;
  console.error(`Blog: "${p.slug}" tem tema proibido (${achados.join(", ")}); fora do ar.`);
  return { ...p, status: "draft", bloqueado: achados };
}

// Datas do WordPress vêm sem fuso (horário de São Paulo)
const brt = (d) => (d && !/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? `${d}-03:00` : d);

function fromFile(p, tipo = "post") {
  return travar({
    slug: p.slug, title: p.title, seoTitle: p.seoTitle || "", description: p.description || "",
    focusKw: p.focusKw || "", image: p.image || "", status: p.status || "publish",
    date: brt(p.date), modified: brt(p.modified || p.date), content: p.content, origem: "arquivo",
    tipo: p.tipo || tipo, layout: p.layout || "", robots: p.robots || "",
  });
}
function fromRow(r) {
  return travar({
    slug: r.slug, title: r.title, seoTitle: r.seo_title || "", description: r.description || "",
    focusKw: r.focus_kw || "", image: r.image || "", status: r.status,
    date: r.published_at, modified: r.updated_at, content: r.content, origem: r.source || "painel",
    tipo: r.tipo || "post",
  });
}

async function readFiles() {
  const out = [];
  for (const [tipo, dir] of Object.entries(DIRS)) {
    const names = await fs.readdir(dir).catch(() => []);
    for (const n of names.filter((n) => n.endsWith(".json"))) {
      try { out.push(fromFile(JSON.parse(await fs.readFile(path.join(dir, n), "utf8")), tipo)); }
      catch (e) { console.error(`Arquivo inválido em ${dir}/${n}`, e); }
    }
  }
  return out;
}
async function readFile(slug) {
  for (const [tipo, dir] of Object.entries(DIRS)) {
    const raw = await fs.readFile(path.join(dir, `${slug}.json`), "utf8").catch(() => null);
    if (raw) return fromFile(JSON.parse(raw), tipo);
  }
  return null;
}

async function sb(pathAndQuery, init = {}) {
  return fetch(`${SB_URL}/rest/v1/${pathAndQuery}`, {
    ...init,
    headers: { ...sbAuth(), "Content-Type": "application/json", ...(init.headers || {}) },
  });
}

async function readRows({ fresh = false } = {}) {
  if (!blogUsingSupabase) return [];
  const r = await sb(`blog_posts?select=${LIST_COLS}`, fresh ? { cache: "no-store" } : { cache: "force-cache", next: { tags: ["blog"] } });
  if (!r.ok) throw new Error("Supabase (blog_posts): " + (await r.text()));
  return (await r.json()).map(fromRow);
}

// Todos os posts (sem o HTML), mais recentes primeiro. `todos` inclui rascunhos (para o painel).
// tipo: "post" (padrão: blog, menu, sitemap de artigos), "pagina" ou "todos".
export async function listPosts({ todos = false, fresh = false, tipo = "post" } = {}) {
  const map = new Map();
  for (const p of await readFiles()) { delete p.content; map.set(p.slug, p); }
  try {
    for (const p of await readRows({ fresh })) {
      const base = map.get(p.slug);
      map.set(p.slug, { ...(base ? { layout: base.layout, robots: base.robots } : {}), ...p, tipo: base?.tipo || p.tipo, editado: !!base });
    }
  } catch (e) {
    console.error("Blog: falha ao ler o Supabase, usando só os arquivos", e);
  }
  return [...map.values()]
    .filter((p) => tipo === "todos" || p.tipo === tipo)
    .filter((p) => (todos ? p.status !== "deleted" : p.status === "publish"))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getPost(slug, { fresh = false } = {}) {
  if (!SLUG_RE.test(slug || "")) return null;
  if (blogUsingSupabase) {
    try {
      const r = await sb(`blog_posts?slug=eq.${slug}&select=*`, fresh ? { cache: "no-store" } : { cache: "force-cache", next: { tags: ["blog", `blog:${slug}`] } });
      if (r.ok) {
        const [row] = await r.json();
        if (row) {
          const base = await readFile(slug); // layout/robots/tipo das páginas vêm do arquivo
          return { ...(base ? { layout: base.layout, robots: base.robots } : {}), ...fromRow(row), tipo: base?.tipo || row.tipo || "post" };
        }
      }
      else console.error("Blog: Supabase recusou a leitura do post", slug, await r.text());
    } catch (e) { console.error("Blog: falha ao ler post no Supabase", e); }
  }
  return readFile(slug);
}

export async function savePost(p, { source = "painel" } = {}) {
  if (!blogUsingSupabase) throw new Error("Supabase não configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  if (!SLUG_RE.test(p.slug || "")) throw new Error("Endereço inválido. Use só letras minúsculas, números e hífen (ex.: whey-engorda).");
  if (!p.title?.trim()) throw new Error("Falta o título.");
  if (p.status !== "draft" && p.status !== "deleted") {
    const achados = termosProibidos(textoDoPost(p));
    if (achados.length) throw new Error(`Tema proibido no fabriciomoura.com (${achados.join(", ")}). Hormônio, anabolizante e remédio de emagrecer só vão para o fabriciomoura.blog.br.`);
  }
  const row = {
    slug: p.slug, title: p.title.trim(), seo_title: p.seoTitle || null, description: p.description || null,
    focus_kw: p.focusKw || null, image: p.image || null, content: p.content || "",
    status: ["publish", "draft", "deleted"].includes(p.status) ? p.status : "publish",
    published_at: p.date ? new Date(p.date).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString(), source, tipo: p.tipo === "pagina" ? "pagina" : "post",
  };
  const r = await sb("blog_posts?on_conflict=slug", {
    method: "POST", headers: { Prefer: "resolution=merge-duplicates,return=minimal" }, body: JSON.stringify(row),
  });
  if (!r.ok) throw new Error("Supabase recusou o salvamento: " + (await r.text()));
  revalidarBlog(p.slug);
  return row;
}

export function revalidarBlog(slug) {
  revalidateTag("blog", "max");
  if (slug) revalidateTag(`blog:${slug}`, "max");
  revalidatePath("/", "layout");
}

// "Leia também": posts com mais palavras em comum no endereço/título; completa com os mais recentes
const STOP = new Set(["de", "da", "do", "das", "dos", "e", "o", "a", "os", "as", "para", "com", "que", "em", "por", "um", "uma", "no", "na", "ou", "se", "quem", "como", "qual"]);
const words = (p) => new Set(`${p.slug} ${p.title}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w)));
export function relacionados(post, todos, n = 3) {
  const base = words(post);
  return todos
    .filter((p) => p.slug !== post.slug)
    .map((p, i) => ({ p, score: [...words(p)].filter((w) => base.has(w)).length * 10 - i * 0.01 }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.p);
}

export const postUrl = (slug) => `/${slug}/`;
export const dataCurta = (d) =>
  d ? new Intl.DateTimeFormat("pt-BR", { day: "numeric", month: "short", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(d)).replace(/\./g, "").replace(/ de /g, " ") : "";
export const dataBR = (d) =>
  d ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(d)) : "";

// Categoria automática pelo endereço/título (vale para importados, painel e automação, sem campo extra)
const CATEGORIAS = [
  ["Suplementos", /whey|creatina|suplement/],
  ["Hipertrofia", /hipertrofia|recomposicao|musculo|massa muscular|pos-treino|pos treino/],
  ["Acompanhamento", /^nutricionista|^quanto-custa|acompanhamento|consultoria/],
  ["Emagrecimento", /./],
];
export function categoria(p) {
  const t = `${p.slug} ${p.title}`.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return CATEGORIAS.find(([, re]) => re.test(t))[0];
}
export const CATEGORIAS_ORDEM = CATEGORIAS.map(([c]) => c);

// Título quebrado em partes, marcando a palavra-chave (focusKw, ou as palavras do endereço).
// Ex.: "Whey protein engorda? Mitos e verdades" + "whey engorda" -> [["Whey protein engorda", true], ["? Mitos e verdades", false]]
const norm = (w) => w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
export function tituloComDestaque(p) {
  const chave = (p.focusKw || p.slug.replace(/-/g, " ")).split(/\s+/).map(norm).filter((w) => w.length > 2 && !STOP.has(w));
  const partes = p.title.split(/(\s+)/);
  const bate = (w) => { const n = norm(w).replace(/[^a-z0-9]/g, ""); return n.length > 2 && chave.some((k) => n === k || n.startsWith(k) || k.startsWith(n) && n.length > 3); };
  const idx = partes.map((w, i) => (/\S/.test(w) && bate(w) ? i : -1)).filter((i) => i >= 0);
  if (!idx.length) return [[p.title, false]];
  // trecho contínuo do 1º ao último acerto, se não for longo demais; senão só as palavras que bateram
  const [ini, fim] = [idx[0], idx[idx.length - 1]];
  const palavrasNoTrecho = partes.slice(ini, fim + 1).filter((w) => /\S/.test(w)).length;
  let marcar;
  if (palavrasNoTrecho <= idx.length + 2) marcar = new Set(Array.from({ length: fim - ini + 1 }, (_, k) => ini + k));
  else {
    // só o primeiro trecho: acertos ligados por espaço ou palavras curtas (de, da, do...)
    marcar = new Set([ini]);
    let ult = ini;
    for (let i = ini + 1; i < partes.length; i++) {
      const w = partes[i];
      if (!/\S/.test(w)) continue;
      if (idx.includes(i)) { for (let k = ult + 1; k <= i; k++) marcar.add(k); ult = i; }
      else if (!STOP.has(norm(w))) break;
    }
  }
  const out = [];
  partes.forEach((w, i) => {
    // pontuação no fim da palavra marcada fica fora do destaque
    const m = marcar.has(i) ? w.match(/^(.*?)([?!.,:;)]*)$/) : null;
    const pedacos = m ? [[m[1], true], [m[2], false]] : [[w, false]];
    for (const [t, on] of pedacos) {
      if (!t) continue;
      const last = out[out.length - 1];
      if (last && (last[1] === on || (!/\S/.test(t) && marcar.has(i + 1) && marcar.has(i - 1)))) last[0] += t, last[1] = last[1] || on;
      else out.push([t, on]);
    }
  });
  return out;
}
