import Image from "next/image";
import TopNav from "../components/TopNav";
import BlogCard, { ScriptBlJs } from "../components/BlogCard";
import BlogFx from "../components/BlogFx";
import Calculadora from "./Calculadora";
import { listPosts } from "@/lib/blog";
import "../components/blog.css";

// Mesma URL, título e descrição que estavam no WordPress (Rank Math) desde 06/2026.
const URL = "/calculadora-de-imc-e-calorias/";
const TITULO = "Calculadora de IMC e Gasto Calórico | Fabricio Moura";
const DESC = "Calcule grátis o seu IMC e o seu gasto calórico diário e descubra quantas calorias comer para emagrecer ou ganhar massa, com acompanhamento esportivo.";
const FOTO = "/wp-content/uploads/2026/06/Screenshot_20260322_192920_Canva1-1024x1024.jpg";

export const metadata = {
  title: { absolute: TITULO },
  description: DESC,
  alternates: { canonical: URL },
  openGraph: { title: TITULO, description: DESC, url: URL, type: "website", locale: "pt_BR", images: [FOTO] },
  robots: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
};

const FAQ = [
  ["O que é um IMC saudável?", "Entre 18,5 e 24,9 é considerado peso normal. Abaixo disso é baixo peso e acima é sobrepeso ou obesidade. Lembre que o IMC não considera a quantidade de músculo, então quem treina deve usar o valor apenas como referência."],
  ["Quantas calorias devo comer para emagrecer?", "Em geral, um pouco abaixo do seu gasto calórico diário, algo em torno de 300 a 500 calorias a menos. O valor ideal, sem perder músculo, é definido de forma individual no acompanhamento."],
  ["A calculadora serve para quem treina?", "Sim. Ela te dá uma boa referência de calorias e de classificação de peso. Para quem treina e quer ganhar músculo perdendo gordura, a estratégia certa vem de um plano individual."],
];
const RELACIONADOS = ["quantas-calorias-por-dia-para-emagrecer", "deficit-calorico", "como-acelerar-o-metabolismo"];

export default async function Page() {
  const todos = await listPosts();
  const rel = RELACIONADOS.map((s) => todos.find((p) => p.slug === s)).filter(Boolean);
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://fabriciomoura.com").replace(/\/$/, "");
  const ld = [
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    { "@context": "https://schema.org", "@type": "WebApplication", name: "Calculadora de IMC e Gasto Calórico", url: site + URL, applicationCategory: "HealthApplication", operatingSystem: "Web", inLanguage: "pt-BR", offers: { "@type": "Offer", price: "0", priceCurrency: "BRL" }, author: { "@type": "Person", "@id": "https://fabriciomoura.com/#fabricio-moura", name: "Fabricio Moura" } },
  ];

  return (
    <div className="bl">
      <ScriptBlJs />
      <TopNav inicio variant="blog" />
      <main id="conteudo" className="bl-wrap cx">
        <header className="cx-head">
          <p className="bl-eyebrow bl-reveal">Ferramenta gratuita</p>
          <h1 className="bl-reveal" style={{ "--i": 1 }}>Calculadora de <span className="bl-gold">IMC</span><br />e <span className="bl-gold">Gasto Calórico</span></h1>
          <p className="cx-head__sub bl-reveal" style={{ "--i": 2 }}>Descubra em segundos o que o seu corpo precisa para mudar de verdade.</p>
          <div className="cx-trust bl-reveal" style={{ "--i": 3 }}>
            <Image src={FOTO} alt="Fabricio Moura" width={88} height={88} priority />
            <span>Criada por <b>Fabricio Moura</b>, consultor esportivo. Mais de 2.000 transformações em 7 países.</span>
          </div>
        </header>

        <section className="bl-reveal" style={{ "--i": 4 }} aria-label="Calculadora">
          <Calculadora />
          <p className="cx-disc">Estimativas baseadas na fórmula de Mifflin-St Jeor. São valores de referência e não substituem uma avaliação profissional individual.</p>
        </section>

        <article className="cx-seo">
          <h2 className="bl-reveal">Como usar a calculadora de IMC e gasto calórico</h2>
          <p className="bl-reveal">A calculadora de IMC mostra a relação entre o seu peso e a sua altura e indica se você está abaixo do peso, no peso normal, com sobrepeso ou obesidade. Já o gasto calórico (TDEE) estima quantas calorias o seu corpo gasta por dia, somando o metabolismo basal ao seu nível de treino. Juntos, esses dois números são um ótimo ponto de partida para montar a sua estratégia.</p>
          <h2 className="bl-reveal">IMC alto nem sempre é gordura</h2>
          <p className="bl-reveal">Se você treina pesado, a calculadora de IMC pode te classificar como acima do peso mesmo com pouca gordura, porque o IMC não separa músculo de gordura. Por isso, encare o resultado como referência. O que realmente define o seu plano é uma avaliação individual, feita por quem entende de performance.</p>
          <p className="bl-reveal">Quer transformar esse número em resultado de verdade? Veja como funciona o acompanhamento de <a href="/nutricionista-esportivo/">nutricionista esportivo</a> ou de <a href="/nutricionista-online/">nutricionista online</a>. E se você usa medicação para emagrecer, leia o guia de <a href="/cardapio-para-quem-toma-mounjaro/">cardápio para quem toma Mounjaro</a>.</p>
          <h2 className="bl-reveal">Perguntas frequentes</h2>
          <div className="cx-faq">
            {FAQ.map(([q, a], i) => (
              <details key={q} className="bl-reveal" open={i === 0}><summary>{q}</summary><p>{a}</p></details>
            ))}
          </div>
        </article>

      </main>
        {rel.length > 0 && (
          <section className="bl-wrap bl-rel cx-rel" aria-labelledby="cx-leia">
            <div className="bl-rel__head bl-reveal">
              <p className="bl-eyebrow">Continue aprendendo</p>
              <h2 id="cx-leia">Leia <span className="bl-gold">também</span></h2>
            </div>
            <div className="bl-rel__grid">
              {rel.map((p, i) => <BlogCard key={p.slug} post={p} i={i} />)}
            </div>
          </section>
        )}
      <BlogFx />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld).replace(/</g, "\\u003c") }} />
    </div>
  );
}
