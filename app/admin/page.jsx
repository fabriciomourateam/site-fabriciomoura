import { isAdmin } from "@/lib/auth";
import { getContent, usingSupabase } from "@/lib/content";
import Login from "./Login";
import Editor from "./Editor";
import "./admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar site | Fabricio Moura", robots: { index: false, follow: false } };

export default async function AdminPage() {
  if (!(await isAdmin())) return <Login />;
  const content = await getContent();
  return <Editor initial={content} storage={usingSupabase ? "Supabase" : "arquivo local"} />;
}
