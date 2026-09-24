import { isAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/content";

const TIPOS = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/avif": "avif" };

export async function POST(req) {
  if (!(await isAdmin())) return Response.json({ erro: "Não autorizado" }, { status: 401 });
  const form = await req.formData();
  const file = form.get("file");
  if (!file || !TIPOS[file.type]) return Response.json({ erro: "Envie JPG, PNG, WebP ou AVIF" }, { status: 400 });
  if (file.size > 4 * 1024 * 1024) return Response.json({ erro: "Imagem acima de 4 MB" }, { status: 400 });
  try {
    const url = await uploadImage(new Uint8Array(await file.arrayBuffer()), TIPOS[file.type], file.type);
    return Response.json({ url });
  } catch (e) {
    return Response.json({ erro: e.message }, { status: 500 });
  }
}
