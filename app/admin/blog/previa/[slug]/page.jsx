import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getPost } from "@/lib/blog";
import { limparHtml } from "@/lib/blog-html";
import Login from "../../../Login";

// Prévia de rascunho (só para quem está logado no painel)
export const dynamic = "force-dynamic";
export const metadata = { title: "Prévia do artigo", robots: { index: false, follow: false } };

export default async function Previa({ params }) {
  if (!(await isAdmin())) return <Login />;
  const { slug } = await params;
  const p = await getPost(slug, { fresh: true });
  if (!p) notFound();
  return (
    <main className="blog-post">
      <p style={{ background: "#f6c711", color: "#000", textAlign: "center", padding: 8, margin: 0, fontWeight: 700 }}>
        Prévia ({p.status === "publish" ? "publicado" : "rascunho, ainda não está no site"})
      </p>
      <div dangerouslySetInnerHTML={{ __html: limparHtml(p.content) }} />
    </main>
  );
}
