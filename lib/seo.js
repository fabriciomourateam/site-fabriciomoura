import { getPage } from "./content";

// Metadados de uma página de campanha (título, descrição, canonical igual à URL que já está no Google)
export async function pageMetadata(key, { anuncio = false } = {}) {
  const c = await getPage(key);
  const rota = c.rota || "/";
  return {
    title: c.seo.title,
    description: c.seo.description,
    alternates: { canonical: rota },
    openGraph: { title: c.seo.title, description: c.seo.description, url: rota, images: [c.hero.imgMobile.src], locale: "pt_BR", type: "website" },
    // Versão de anúncio (sem menu) fica fora do Google para não duplicar a página
    ...(anuncio ? { robots: { index: false, follow: true } } : {}),
  };
}
