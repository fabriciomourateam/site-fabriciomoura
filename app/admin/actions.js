"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { checkPassword, startSession, endSession, isAdmin } from "@/lib/auth";
import { saveContent } from "@/lib/content";

export async function login(_, formData) {
  await new Promise((r) => setTimeout(r, 400)); // freia tentativas em sequência
  if (!checkPassword(formData.get("senha"))) return { erro: "Senha incorreta." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin");
}

export async function salvar(data) {
  if (!(await isAdmin())) return { ok: false, erro: "Sessão expirada. Entre de novo." };
  try {
    await saveContent(data);
    revalidateTag("site-content", "max");
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: e.message };
  }
}
