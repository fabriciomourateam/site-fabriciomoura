#!/usr/bin/env node
/**
 * import-wp-paginas.mjs: copia as PÁGINAS que ainda estavam no WordPress para content/paginas/<slug>.json.
 *
 * - Pega o HTML original de cada página (bloco "HTML personalizado") pela API do WP.
 * - Remove o comentário de instruções (no WP ele vazava como texto visível) e o envelope <html>/<head>.
 * - Imagens embutidas em base64 viram arquivos em public/paginas/ (página fica leve).
 * - Imagens de wp-content/uploads são baixadas para public/wp-content/uploads (mesmo caminho).
 * - Título e descrição vêm do <head> da página (Rank Math).
 * Uso: WP_SOURCE=https://fabriciomoura.com node scripts/import-wp-paginas.mjs
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const SRC = (process.env.WP_SOURCE || "https://fabriciomoura.com").replace(/\/+$/, "");
const UA = "Mozilla/5.0 (import-wp-paginas; fabriciomoura.com)";

// layout "institucional" = com o menu do site; "livre" = página de venda/bio, exatamente como era
const PAGINAS = {
  "sobre": { layout: "institucional" },
  "contato": { layout: "institucional" },
  "termos-de-uso": { layout: "institucional" },
  "politica-de-privacidade": { layout: "institucional" },
  "renovacao": { layout: "livre", robots: "noindex, follow" },
  "renov": { layout: "livre", robots: "noindex, follow" },
  "renov150": { layout: "livre", robots: "noindex, follow" },
  "links": { layout: "livre" },
  "fmteam-links": { layout: "livre" },
  "celulite-zero": { layout: "livre" },
  "seque-ganhando-massa": { layout: "livre" },
};

async function get(url, { tries = 5, binary = false } = {}) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(90_000) });
      if (r.ok) return binary ? Buffer.from(await r.arrayBuffer()) : await r.text();
      console.warn(`  HTTP ${r.status} em ${url} (tentativa ${i})`);
      if (r.status === 404) break;
    } catch (e) { console.warn(`  erro em ${url} (tentativa ${i}): ${e.message}`); }
    await new Promise((r) => setTimeout(r, 3000 * i));
  }
  throw new Error("Falhou: " + url);
}
const decode = (s = "") =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
   .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const meta = (html, attr, name) => {
  const tag = html.match(new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*>`, "i"))?.[0];
  return tag ? decode(tag.match(/content=["']([^"']*)["']/i)?.[1] || "") : "";
};

function limpar(c) {
  // só o miolo entre INÍCIO e FIM, quando a página tem esses marcadores
  const m = c.match(/<!--\s*IN[IÍ]CIO\s*-->([\s\S]*?)<!--\s*FIM[^>]*-->/i);
  if (m) c = m[1];
  // documento completo colado no bloco: fica só com <style> do head + corpo
  if (/<body[\s>]/i.test(c)) {
    const head = c.match(/<head[^>]*>([\s\S]*?)<\/head>/i)?.[1] || "";
    const estilos = (head.match(/<style[\s\S]*?<\/style>/gi) || []).join("\n");
    c = estilos + "\n" + (c.match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1] || c);
  }
  return c
    .replace(/<!DOCTYPE[^>]*>/gi, "").replace(/<\/?(html|head|body)[^>]*>/gi, "")
    .replace(/<meta[^>]*>|<title>[\s\S]*?<\/title>|<link[^>]+rel=["']?(preconnect|stylesheet)[^>]*>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "") // instruções e marcadores (no WP vazavam como texto)
    .replace(/<p>\s*<\/p>/g, "")
    .trim();
}

const pages = JSON.parse(await get(`${SRC}/wp-json/wp/v2/pages?per_page=100&_fields=slug,title,content,date,modified`));
await mkdir(path.join(ROOT, "content/paginas"), { recursive: true });
await mkdir(path.join(ROOT, "public/paginas"), { recursive: true });
const uploads = new Set();
for (const [slug, cfg] of Object.entries(PAGINAS)) {
  const p = pages.find((x) => x.slug === slug);
  if (!p) { console.warn("Página não encontrada no WP:", slug); continue; }
  console.log("→", slug);
  let html = "";
  try { html = await get(`${SRC}/${slug}/`); } catch (e) { console.warn("  sem HTML:", e.message); }
  let content = limpar(p.content.rendered);
  // base64 -> arquivo (mesmo conteúdo = mesmo arquivo, as 3 páginas de renovação reaproveitam)
  content = content.replace(/data:image\/(png|jpe?g|webp|gif|svg\+xml);base64,([A-Za-z0-9+/=\s]+)/g, (_, tipo, b64) => {
    const buf = Buffer.from(b64.replace(/\s+/g, ""), "base64");
    const ext = { "jpeg": "jpg", "svg+xml": "svg" }[tipo] || tipo;
    const nome = crypto.createHash("sha1").update(buf).digest("hex").slice(0, 12) + "." + ext;
    const dest = path.join(ROOT, "public/paginas", nome);
    if (!existsSync(dest)) writeFile(dest, buf);
    return "/paginas/" + nome;
  });
  for (const m of content.matchAll(/https?:\/\/(?:www\.)?fabriciomoura\.com(\/wp-content\/uploads\/[^"'\s)<>,]+)/g)) uploads.add(m[1]);
  const doc = {
    slug, tipo: "pagina", layout: cfg.layout,
    title: decode(p.title.rendered),
    seoTitle: decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || ""),
    description: meta(html, "name", "description") || meta(html, "property", "og:description"),
    image: meta(html, "property", "og:image"),
    robots: cfg.robots || meta(html, "name", "robots") || "index, follow",
    date: p.date, modified: p.modified, status: "publish", content,
  };
  await writeFile(path.join(ROOT, "content/paginas", `${slug}.json`), JSON.stringify(doc, null, 2) + "\n");
  console.log(`  ok (${Math.round(content.length / 1024)} KB)`);
}
for (const rel of uploads) {
  const clean = decodeURI(rel.split(/[?#]/)[0]);
  const dest = path.join(ROOT, "public", clean);
  if (existsSync(dest)) continue;
  try {
    const buf = await get(`${SRC}${clean}`, { binary: true });
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    console.log(`  imagem ${clean}`);
  } catch (e) { console.warn(`  FALHOU ${clean}: ${e.message}`); }
}
console.log("Pronto.");
