import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { revalidatePath, revalidateTag } from "next/cache";
import { sbAuth } from "./content";

/*
  Blog do site. Duas fontes, juntadas pelo slug:
  1. content/blog/<slug>.json  (posts importados do WordPress, versionados no git)
  2. tabela blog_posts no Supabase (artigos novos do painel /admin e da automação semanal,
     e edições dos importados). Uma linha no Supabase SEMPRE vence o arquivo de mesmo slug;
     status "draft" ou "deleted" tira o post do ar sem apagar o arquivo.
  A URL de cada post é /<slug>/ (igual ao WordPress), servida por app/[slug]/page.jsx.
*/
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const blogUsingSupabase = !!(SB_URL && SB_KEY);
const DIR = path.join(process.cwd(), "content", "blog");
const LIST_COLS = "slug,title,seo_title,description,focus_kw,image,status,published_at,updated_at,source";
export const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

// Datas do WordPress vêm sem fuso (horário de São Paulo)
const brt = (d) => (d && !/[zZ]|[+-]\d\d:?\d\d$/.test(d) ? `${d}-03:00` : d);

function fromFile(p) {
  return {
    slug: p.slug, title: p.title, seoTitle: p.seoTitle || "", description: p.description || "",
    focusKw: p.focusKw || "", image: p.image || "", status: p.status || "publish",
    date: brt(p.date), modified: brt(p.modified || p.date), content: p.content, origem: "arquivo",
  };
}
function fromRow(r) {
  return {
    slug: r.slug, title: r.title, seoTitle: r.seo_title || "", description: r.description || "",
    focusKw: r.focus_kw || "", image: r.image || "", status: r.status,
    date: r.published_at, modified: r.updated_at, content: r.content, origem: r.source || "painel",
  };
}

async function readFiles() {
  const names = await fs.readdir(DIR).catch(() => []);
  const out = [];
  for (const n of names.filter((n) => n.endsWith(".json"))) {
    try { out.push(fromFile(JSON.parse(await fs.readFile(path.join(DIR, n), "utf8")))); }
    catch (e) { console.error("Post inválido em content/blog/" + n, e); }
  }
  return out;
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
export async function listPosts({ todos = false, fresh = false } = {}) {
  const map = new Map();
  for (const p of await readFiles()) { delete p.content; map.set(p.slug, p); }
  try {
    for (const p of await readRows({ fresh })) map.set(p.slug, { ...p, editado: map.has(p.slug) });
  } catch (e) {
    console.error("Blog: falha ao ler o Supabase, usando só os arquivos", e);
  }
  return [...map.values()]
    .filter((p) => (todos ? p.status !== "deleted" : p.status === "publish"))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function getPost(slug, { fresh = false } = {}) {
  if (!SLUG_RE.test(slug || "")) return null;
  if (blogUsingSupabase) {
    try {
      const r = await sb(`blog_posts?slug=eq.${slug}&select=*`, fresh ? { cache: "no-store" } : { cache: "force-cache", next: { tags: ["blog", `blog:${slug}`] } });
      if (r.ok) { const [row] = await r.json(); if (row) return fromRow(row); }
      else console.error("Blog: Supabase recusou a leitura do post", slug, await r.text());
    } catch (e) { console.error("Blog: falha ao ler post no Supabase", e); }
  }
  const raw = await fs.readFile(path.join(DIR, `${slug}.json`), "utf8").catch(() => null);
  return raw ? fromFile(JSON.parse(raw)) : null;
}

export async function savePost(p, { source = "painel" } = {}) {
  if (!blogUsingSupabase) throw new Error("Supabase não configurado (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).");
  if (!SLUG_RE.test(p.slug || "")) throw new Error("Endereço inválido. Use só letras minúsculas, números e hífen (ex.: whey-engorda).");
  if (!p.title?.trim()) throw new Error("Falta o título.");
  const row = {
    slug: p.slug, title: p.title.trim(), seo_title: p.seoTitle || null, description: p.description || null,
    focus_kw: p.focusKw || null, image: p.image || null, content: p.content || "",
    status: ["publish", "draft", "deleted"].includes(p.status) ? p.status : "publish",
    published_at: p.date ? new Date(p.date).toISOString() : new Date().toISOString(),
    updated_at: new Date().toISOString(), source,
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
export const dataBR = (d) =>
  d ? new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long", year: "numeric", timeZone: "America/Sao_Paulo" }).format(new Date(d)) : "";
