import Landing from "../components/Landing";

// Página para o tráfego dos anúncios do ChatGPT (OpenAI): igual à home, sem menu.
// O Tracking troca a mensagem do WhatsApp por uma frase própria ("Vim pelo ChatGPT") com a tag
// [chatgpt], e o CRM registra a origem 'chatgpt' (regra em lead_origin_rules), sem misturar com o Google.
// Fora do Google para não competir com a página principal.
export const dynamic = "force-static";
export const metadata = { robots: { index: false, follow: true }, alternates: { canonical: "/" } };

export default function ChatGPT() {
  return <Landing menu={false} />;
}
