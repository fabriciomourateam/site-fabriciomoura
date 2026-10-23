// Endereços de 1 nível que AINDA são servidos pelo WordPress (wp.fabriciomoura.com) via proxy.
// Desde 23/10/2026 todas as páginas foram migradas para o Next (content/paginas); aqui sobrou só o
// sistema do WordPress (painel e arquivos). Criou página nova no WordPress? Acrescente o endereço aqui.
// Endereços com mais de um nível (/wp-content/..., /wp-admin/...) já vão para o WordPress sozinhos.
export const WP_PAGES = ["wp-admin", "wp-json", "wp-login.php", "xmlrpc.php", "wp-cron.php", "feed", "comments"];
