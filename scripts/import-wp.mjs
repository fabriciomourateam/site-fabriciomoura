#!/usr/bin/env node
/**
 * import-wp.mjs: copia os posts do WordPress para dentro deste repositório.
 *
 * Para cada post publicado grava content/blog/<slug>.json (título, SEO, datas, HTML do artigo)
 * e baixa as imagens usadas (wp-content/uploads) para public/wp-content/uploads/, mantendo o
 * MESMO caminho. Assim as URLs das imagens e dos artigos continuam iguais e o WordPress pode
 * ser desligado depois.
 *
 * Uso: WP_SOURCE=https://fabriciomoura.com node scripts/import-wp.mjs
 * Roda pela GitHub Action "Importar blog do WordPress" (a rede local pode não alcançar o WP).
 */
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

const ROOT = path.resolve(new URL("..", import.meta.url).pathname);
const SRC = (process.env.WP_SOURCE || "https://fabriciomoura.com").replace(/\/+$/, "");
const UA = "Mozilla/5.0 (import-wp; fabriciomoura.com)";

async function get(url, { tries = 5, binary = false } = {}) {
  for (let i = 1; i <= tries; i++) {
    try {
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(90_000) });
      if (r.ok) return binary ? Buffer.from(await r.arrayBuffer()) : await r.text();
      if (r.status === 404) throw Object.assign(new Error("404 " + url), { fatal: true });
      console.warn(`  HTTP ${r.status} em ${url} (tentativa ${i})`);
    } catch (e) {
      if (e.fatal) throw e;
      console.warn(`  erro em ${url} (tentativa ${i}): ${e.message}`);
    }
    await new Promise((r) => setTimeout(r, 3000 * i));
  }
  throw new Error("Falhou: " + url);
}

const decode = (s = "") =>
  s.replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
   .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
   .replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&apos;/g, "'")
   .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&");
const meta = (html, attr, name) => {
  const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]*>`, "i");
  const tag = html.match(re)?.[0];
  return tag ? decode(tag.match(/content=["']([^"']*)["']/i)?.[1] || "") : "";
};

const posts = JSON.parse(await get(`${SRC}/wp-json/wp/v2/posts?per_page=100&status=publish&_fields=id,slug,date,modified,title,content,excerpt`));
console.log(`${posts.length} posts publicados.`);
const slugs = new Set(posts.map((p) => p.slug));
const images = new Set();
const UP = /https?:\/\/(?:www\.)?fabriciomoura\.com(\/wp-content\/uploads\/[^"'\s)<>,]+)/g;

await mkdir(path.join(ROOT, "content/blog"), { recursive: true });
for (const p of posts) {
  console.log("→", p.slug);
  let html = "";
  try { html = await get(`${SRC}/${p.slug}/`); } catch (e) { console.warn("  sem HTML da página:", e.message); }
  let content = p.content.rendered;
  // Links internos para outros posts: sempre com barra final (é a URL indexada)
  content = content.replace(/https?:\/\/(?:www\.)?fabriciomoura\.com\/([a-z0-9-]+)(?=["'#?])/g, (m, s) => (slugs.has(s) ? `https://fabriciomoura.com/${s}/` : m));
  for (const m of content.matchAll(UP)) images.add(m[1]);
  const image = meta(html, "property", "og:image");
  const imgPath = image.match(/\/wp-content\/uploads\/.+$/)?.[0];
  if (imgPath) images.add(imgPath);
  const post = {
    slug: p.slug,
    title: decode(p.title.rendered),
    seoTitle: decode(html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || ""),
    description: meta(html, "name", "description") || meta(html, "property", "og:description"),
    image: imgPath ? `https://fabriciomoura.com${imgPath}` : "",
    robots: meta(html, "name", "robots"),
    date: p.date,
    modified: p.modified,
    status: "publish",
    wpId: p.id,
    content,
  };
  await writeFile(path.join(ROOT, "content/blog", `${p.slug}.json`), JSON.stringify(post, null, 2) + "\n");
}

console.log(`\n${images.size} imagens para baixar.`);
for (const rel of images) {
  const clean = decodeURI(rel.split(/[?#]/)[0]);
  const dest = path.join(ROOT, "public", clean);
  if (existsSync(dest)) continue;
  try {
    const buf = await get(`${SRC}${rel.split(/[?#]/)[0]}`, { binary: true });
    await mkdir(path.dirname(dest), { recursive: true });
    await writeFile(dest, buf);
    console.log(`  ok ${clean} (${Math.round(buf.length / 1024)} KB)`);
  } catch (e) {
    console.warn(`  FALHOU ${clean}: ${e.message}`);
  }
}
console.log("\nPronto.");
