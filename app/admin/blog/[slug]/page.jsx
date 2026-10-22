import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import { getPost } from "@/lib/blog";
import Login from "../../Login";
import PostEditor from "../PostEditor";
import "../../admin.css";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar artigo", robots: { index: false, follow: false } };

export default async function EditarPost({ params }) {
  if (!(await isAdmin())) return <Login />;
  const { slug } = await params;
  if (slug === "novo") {
    return <PostEditor novo initial={{ slug: "", title: "", seoTitle: "", description: "", focusKw: "", image: "", content: "", status: "draft", date: new Date().toISOString() }} />;
  }
  const p = await getPost(slug, { fresh: true });
  if (!p || p.status === "deleted") notFound();
  return <PostEditor initial={p} />;
}
