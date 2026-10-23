// Endereços de 1 nível que AINDA são servidos pelo WordPress (wp.fabriciomoura.com) via proxy.
// Todo o resto de 1 nível (/<algo>/) é artigo do blog, servido por app/[slug]/page.jsx.
// Criou uma página nova no WordPress? Acrescente o endereço aqui (senão ela dá 404 no site).
// Endereços com mais de um nível (/wp-content/..., /wp-admin/..., /categoria/x/) já vão para o WordPress sozinhos.
export const WP_PAGES = [
  // páginas
  "sobre", "contato", "termos-de-uso", "politica-de-privacidade",
  "renovacao", "renov", "renov150", "links", "fmteam-links", "celulite-zero", "seque-ganhando-massa", "home",
  // sistema do WordPress
  "wp-admin", "wp-json", "wp-login.php", "xmlrpc.php", "wp-cron.php", "feed", "comments",
];

// (a calculadora saiu do WordPress em 23/10/2026: agora é app/calculadora-de-imc-e-calorias)
// Páginas do WordPress que entram no sitemap (as demais são de campanha/links e ficam de fora)
export const WP_PAGES_SITEMAP = ["sobre", "contato", "termos-de-uso", "politica-de-privacidade"];
