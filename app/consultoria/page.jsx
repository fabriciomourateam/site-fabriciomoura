import Landing from "../components/Landing";

// Versão para anúncios: sem menu (menos saídas da página).
// Também é servida em "/" quando a visita vem de anúncio (gclid, utm_medium=cpc etc.), ver next.config.mjs.
// Fica fora do Google para não competir com a página principal.
export const dynamic = "force-static";
export const metadata = { robots: { index: false, follow: true }, alternates: { canonical: "/" } };

export default function Consultoria() {
  return <Landing menu={false} />;
}
