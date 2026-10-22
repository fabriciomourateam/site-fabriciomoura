import crypto from "crypto";
import { savePost, getPost, postUrl } from "@/lib/blog";

/*
  Publicação automática de artigos (usada pela automação semanal do repositório fabriciomoura-seo).
  POST /api/blog  com  Authorization: Bearer <BLOG_API_TOKEN>
  Corpo JSON: { slug, title, seoTitle?, description?, focusKw?, image?, content, status? ("publish"|"draft"), date? }
  Mesmo slug = atualiza (não duplica). Responde { ok, url, atualizado }.
*/
function autorizado(req) {
  const real = process.env.BLOG_API_TOKEN;
  const enviado = (req.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
  if (!real || !enviado) return false;
  const a = crypto.createHash("sha256").update(enviado).digest();
  const b = crypto.createHash("sha256").update(real).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function POST(req) {
  if (!autorizado(req)) return Response.json({ ok: false, erro: "Não autorizado" }, { status: 401 });
  let p;
  try { p = await req.json(); } catch { return Response.json({ ok: false, erro: "JSON inválido" }, { status: 400 }); }
  if (!p?.content?.trim()) return Response.json({ ok: false, erro: "Falta o conteúdo" }, { status: 400 });
  try {
    const existia = await getPost(p.slug, { fresh: true });
    await savePost({ ...p, status: p.status === "draft" ? "draft" : "publish", date: p.date || existia?.date }, { source: "automacao" });
    const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://fabriciomoura.com").replace(/\/$/, "");
    return Response.json({ ok: true, url: site + postUrl(p.slug), atualizado: !!existia });
  } catch (e) {
    return Response.json({ ok: false, erro: e.message }, { status: 400 });
  }
}
