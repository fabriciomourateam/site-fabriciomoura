import { notFound } from "next/navigation";
import Landing from "../../components/Landing";
import { pageMetadata } from "@/lib/seo";

// Versões sem menu das páginas de campanha, servidas nas URLs normais quando a visita vem de anúncio.
// Não precisam ser acessadas direto: /acompanhamento-esportivo/?gclid=... já cai aqui.
const PAGINAS = ["esportivo", "online"];
export const dynamic = "force-static";
export const dynamicParams = false;
export const generateStaticParams = () => PAGINAS.map((slug) => ({ slug }));
export async function generateMetadata({ params }) {
  const { slug } = await params;
  return pageMetadata(slug, { anuncio: true });
}
export default async function Page({ params }) {
  const { slug } = await params;
  if (!PAGINAS.includes(slug)) notFound();
  return <Landing page={slug} menu={false} />;
}
