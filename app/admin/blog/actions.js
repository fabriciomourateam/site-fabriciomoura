"use server";
import { isAdmin } from "@/lib/auth";
import { getPost, savePost } from "@/lib/blog";

export async function salvarPost(p) {
  if (!(await isAdmin())) return { ok: false, erro: "Sessão expirada. Entre de novo." };
  try {
    await savePost(p, { source: "painel" });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}

// "Excluir" tira o artigo do ar (status deleted). O registro fica guardado no Supabase.
export async function excluirPost(slug) {
  if (!(await isAdmin())) return { ok: false, erro: "Sessão expirada. Entre de novo." };
  try {
    const p = await getPost(slug, { fresh: true });
    if (!p) return { ok: false, erro: "Artigo não encontrado." };
    await savePost({ ...p, status: "deleted" }, { source: "painel" });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}
