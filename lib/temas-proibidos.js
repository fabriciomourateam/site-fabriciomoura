/*
  Trava de temas proibidos no fabriciomoura.com (pedido do Fabricio, 24 e 26/10/2026).
  Hormônios, anabolizantes e remédios de emagrecer (Mounjaro, Ozempic etc.) NÃO podem aparecer no
  site principal: um artigo de Masteron fez o Google Ads reprovar os anúncios do domínio inteiro.
  Esses temas só vão para o blog separado (fabriciomoura.blog.br).
  Mesma lista de fabriciomoura-seo/scripts/temas-proibidos.mjs (o robô). Mudou lá? Mude aqui.
  Usada em lib/blog.js: post/página com termo proibido não é salvo como publicado e, se já estiver
  no banco ou em arquivo, sai do ar (vira rascunho na leitura).
*/
const TERMOS = [
  // anabolizantes e afins
  "anabolizante", "anabolizantes", "esteroide", "esteroides", "esteróide", "esteróides",
  "masteron", "drostanolona", "deca durabolin", "deca-durabolin", "nandrolona", "durateston",
  "trt", "reposição hormonal",
  // hormônios em geral (pedido do Fabricio 26/10: NADA de hormônio no site principal)
  "testosterona", "andropausa", "hormonio", "hormonios", "hormônio", "hormônios", "hormonal", "hormonais",
  "estrogenio", "estrogênio", "progesterona", "cortisol", "oxandrolona", "stanozolol", "winstrol",
  "trembolona", "boldenona", "hemogenin", "oximetolona", "dianabol", "metandrostenolona",
  "clembuterol", "sarm", "sarms", "ostarina", "ligandrol", "somatropina", "hormônio do crescimento",
  "pós-ciclo", "pos-ciclo", "pós ciclo", "tpc", "tamoxifeno", "clomifeno", "hcg",
  // medicamentos para emagrecer (receita / não aprovados)
  "mounjaro", "ozempic", "wegovy", "saxenda", "tirzepatida", "semaglutida", "liraglutida",
  "retatrutida", "glp-1", "glp1", "caneta emagrecedora", "canetas emagrecedoras",
  "sibutramina", "efedrina", "dnp",
];

const semAcento = (s) => (s || "").toString().normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const REGRAS = [...new Set(TERMOS.map(semAcento))].map((t) => ({
  termo: t,
  re: new RegExp(`(^|[^a-z0-9])${t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}($|[^a-z0-9])`),
}));

/** Termos proibidos encontrados no texto (ignora acento, maiúsculas e tags HTML). */
export function termosProibidos(texto) {
  const t = semAcento((texto || "").replace(/<[^>]+>/g, " "));
  return REGRAS.filter((r) => r.re.test(t)).map((r) => r.termo);
}

/** Texto público de um post (título, SEO, descrição, palavra-chave e conteúdo). */
export const textoDoPost = (p) => [p.title, p.seoTitle, p.description, p.focusKw, p.content].filter(Boolean).join(" ");
