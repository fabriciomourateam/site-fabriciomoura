// 410 = "removida para sempre". Usado para as páginas falsas criadas pela invasão do WordPress em
// julho/2026 (/Nome-De-Produto-Em-Alemao/123456). O Google tira 410 do índice mais rápido que 404.
const gone = () =>
  new Response("Página removida.", {
    status: 410,
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Robots-Tag": "noindex", "Cache-Control": "public, max-age=86400" },
  });
export const GET = gone;
export const HEAD = gone;
