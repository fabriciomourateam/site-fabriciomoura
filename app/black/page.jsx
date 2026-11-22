import BlackPage from "./BlackPage";
import "./black.css";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Black Friday | Fabricio Moura",
  description: "Condição exclusiva de Black Friday no acompanhamento do Fabricio Moura. Só até 30/11.",
  robots: { index: false, follow: false },
  alternates: { canonical: "/black/" },
  openGraph: {
    title: "Black Friday | Fabricio Moura",
    description: "Condição exclusiva de Black Friday no acompanhamento do Fabricio Moura. Só até 30/11.",
    images: ["/img/hero-mobile.png"],
    locale: "pt_BR",
    type: "website",
  },
};

export default async function Page({ searchParams }) {
  const sp = (await searchParams) || {};
  const raw = Array.isArray(sp.k) ? sp.k[0] : sp.k;
  const k = typeof raw === "string" && /^[0-9a-f]{8}$/.test(raw) ? raw : "";
  return <BlackPage k={k} />;
}
