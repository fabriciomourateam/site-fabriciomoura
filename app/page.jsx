import Landing from "./components/Landing";

// Versão orgânica: com o menu do blog
export const dynamic = "force-static";
export default function Home() {
  return <Landing menu />;
}
