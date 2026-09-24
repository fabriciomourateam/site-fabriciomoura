import Landing from "../components/Landing";
import { pageMetadata } from "@/lib/seo";

// Mesma URL que já está no Google. Visitas de anúncio recebem a versão sem menu (ver next.config.mjs).
export const dynamic = "force-static";
export const generateMetadata = () => pageMetadata("esportivo");
export default function Page() {
  return <Landing page="esportivo" menu />;
}
