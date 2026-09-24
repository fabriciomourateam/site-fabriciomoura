import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { DEFAULT_CONTENT } from "./defaults";

// Onde o conteúdo fica salvo:
// - Produção (Vercel): tabela site_content + bucket site-media no Supabase
// - Local, sem Supabase configurado: arquivo content/site.json e pasta public/uploads
const SB_URL = process.env.SUPABASE_URL;
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const usingSupabase = !!(SB_URL && SB_KEY);
const LOCAL_FILE = path.join(process.cwd(), "content", "site.json");
const BUCKET = "site-media";

const isObj = (v) => v && typeof v === "object" && !Array.isArray(v);
function merge(base, over) {
  if (!isObj(base) || !isObj(over)) return over ?? base;
  const out = { ...base };
  for (const k of Object.keys(over)) out[k] = isObj(base[k]) ? merge(base[k], over[k]) : over[k] ?? base[k];
  return out;
}

export async function getContent() {
  try {
    if (usingSupabase) {
      const r = await fetch(`${SB_URL}/rest/v1/site_content?id=eq.home&select=data`, {
        headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
        cache: "force-cache",
        next: { tags: ["site-content"] },
      });
      if (r.ok) {
        const rows = await r.json();
        if (rows[0]?.data) return merge(DEFAULT_CONTENT, rows[0].data);
      }
    } else {
      const raw = await fs.readFile(LOCAL_FILE, "utf8").catch(() => null);
      if (raw) return merge(DEFAULT_CONTENT, JSON.parse(raw));
    }
  } catch (e) {
    console.error("Falha ao ler conteúdo, usando padrão", e);
  }
  return DEFAULT_CONTENT;
}

export async function saveContent(data) {
  if (usingSupabase) {
    const r = await fetch(`${SB_URL}/rest/v1/site_content?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`,
        "Content-Type": "application/json", Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({ id: "home", data, updated_at: new Date().toISOString() }),
    });
    if (!r.ok) throw new Error("Supabase recusou o salvamento: " + (await r.text()));
  } else {
    await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
    await fs.writeFile(LOCAL_FILE, JSON.stringify(data, null, 2));
  }
}

export async function uploadImage(bytes, ext, contentType) {
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  if (usingSupabase) {
    const r = await fetch(`${SB_URL}/storage/v1/object/${BUCKET}/${name}`, {
      method: "POST",
      headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}`, "Content-Type": contentType, "cache-control": "31536000" },
      body: bytes,
    });
    if (!r.ok) throw new Error("Falha no upload: " + (await r.text()));
    return `${SB_URL}/storage/v1/object/public/${BUCKET}/${name}`;
  }
  const dir = path.join(process.cwd(), "content", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(bytes));
  return `/api/media/${name}`;
}

// Conteúdo de uma página de campanha: a página inicial + o que foi personalizado em paginas[chave]
export async function getPage(key) {
  const c = await getContent();
  if (!key || key === "home") return c;
  const pg = c.paginas?.[key];
  if (!pg) return c;
  return merge(c, pg);
}
