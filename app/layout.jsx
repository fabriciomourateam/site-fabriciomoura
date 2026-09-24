import { Anton, Montserrat } from "next/font/google";
import "./globals.css";
import { getContent } from "@/lib/content";
import Tracking from "./components/Tracking";

const anton = Anton({ weight: "400", subsets: ["latin"], display: "swap", variable: "--f-display" });
const montserrat = Montserrat({ subsets: ["latin"], display: "swap", variable: "--f-body", weight: ["400", "500", "600", "700", "800"] });

export async function generateMetadata() {
  const c = await getContent();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fabriciomoura.com"),
    title: c.seo.title,
    description: c.seo.description,
    alternates: { canonical: "/" },
    openGraph: { title: c.seo.title, description: c.seo.description, images: [c.hero.imgMobile.src], locale: "pt_BR", type: "website" },
  };
}

export const viewport = { themeColor: "#000000", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }) {
  const c = await getContent();
  return (
    <html lang="pt-BR" className={`${anton.variable} ${montserrat.variable}`}>
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
      </head>
      <body>
        {children}
        <Tracking ids={c.rastreio} numero={c.contato.whatsapp} msgPadrao={c.contato.msgPadrao}
          mode={process.env.NEXT_PUBLIC_TRACKING_MODE || "smart"} />
        {c.rastreio.metaPixel && (
          <noscript>
            <img height="1" width="1" style={{ display: "none" }} alt=""
              src={`https://www.facebook.com/tr?id=${c.rastreio.metaPixel}&ev=PageView&noscript=1`} />
          </noscript>
        )}
      </body>
    </html>
  );
}
