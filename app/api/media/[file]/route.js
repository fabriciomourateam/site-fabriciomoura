import { promises as fs } from "fs";
import path from "path";

// Só usado no modo local (sem Supabase): entrega as imagens enviadas pelo CMS
const TIPOS = { webp: "image/webp", jpg: "image/jpeg", png: "image/png", avif: "image/avif" };
export async function GET(_, { params }) {
  const { file } = await params;
  if (!/^[\w-]+\.(webp|jpg|png|avif)$/.test(file)) return new Response(null, { status: 404 });
  try {
    const buf = await fs.readFile(path.join(process.cwd(), "content", "uploads", file));
    return new Response(buf, { headers: { "Content-Type": TIPOS[file.split(".").pop()], "Cache-Control": "public, max-age=31536000, immutable" } });
  } catch { return new Response(null, { status: 404 }); }
}
