// Ajustes no HTML dos artigos na hora de exibir (não altera o que está salvo).
export function limparHtml(html = "") {
  return html
    // restos do WordPress: marcadores do Autoptimize e o CSS que escondia o cabeçalho do tema
    .replace(/<p>\s*<!--\/?noptimize-->\s*<\/p>/g, "")
    .replace(/<!--\/?noptimize-->/g, "")
    .replace(/<style>\s*body\.single-post[\s\S]*?<\/style>/g, "")
    // fontes: usa as que o site já carrega (next/font) em vez de baixar de novo do Google
    // (só quando o @import pede apenas Anton/Montserrat; páginas com outras fontes, como a de renovação, mantêm o delas)
    .replace(/@import url\(['"](https:\/\/fonts\.googleapis\.com[^'"]*)['"]\);?/g, (m, url) => {
      const fam = [...url.matchAll(/family=([^:&]+)/g)].map((x) => decodeURIComponent(x[1]).replace(/\+/g, " "));
      return fam.length && fam.every((f) => f === "Anton" || f === "Montserrat") ? "" : m;
    })
    .replace(/'Montserrat',\s*sans-serif/g, "var(--f-body)")
    .replace(/'Anton',\s*sans-serif/g, "var(--f-display)")
    // links internos: relativos, para funcionar também nas prévias da Vercel
    .replace(/https?:\/\/(?:www\.)?fabriciomoura\.com\/(?=[a-z0-9-]+\/|wp-content\/)/g, "/");
}
