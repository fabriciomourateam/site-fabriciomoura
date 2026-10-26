# Contexto do projeto (leia antes de mexer)

Site do Fabricio Moura (nutricionista esportivo e educador físico, fabriciomoura.com).
Substitui a home e as páginas de anúncio do WordPress/Elementor atual por Next.js na Vercel.
O **blog e TODAS as páginas agora são do Next** (blog em 22/10/2026, demais páginas em 23/10/2026).
Do WordPress sobrou só o wp-admin e os arquivos (lib/wp-pages.mjs), ainda via proxy.

Regra do dono: o site atual converte bem. **Não mudar textos nem estrutura** sem pedido explícito.
Preferência de escrita: sem travessão (em-dash) em nenhum texto.

## Páginas
| URL | Arquivo | Observação |
|---|---|---|
| `/` | app/page.jsx | Home, com menu do blog |
| `/acompanhamento-esportivo/` | app/acompanhamento-esportivo/page.jsx | Principal página de anúncio (95% da verba do Google Ads) |
| `/acompanhamento-online/` | app/acompanhamento-online/page.jsx | Página de anúncio |
| `/consultoria` e `/lp/[slug]` | versões sem menu | Servidas automaticamente nas URLs normais quando há gclid, gbraid, wbraid, gad_source ou utm_medium pago (next.config.mjs, beforeFiles). noindex |
| `/admin` | painel (CMS) | Seletor no topo: Página inicial, Nutricionista esportivo, Nutricionista online |
| `/<slug>/` | app/[slug]/page.jsx | Artigos do blog, MESMA URL do WordPress |
| `/blog/` | app/blog/page.jsx | Índice dos artigos |
| `/admin/blog` | painel do blog | Lista, novo, editar, rascunho, prévia, excluir |
| `/calculadora-de-imc-e-calorias/` | app/calculadora-de-imc-e-calorias | Migrada do WP em 23/10/2026 (mesmas contas, textos, título e descrição) |
| `/sobre/` `/contato/` `/termos-de-uso/` `/politica-de-privacidade/` | content/paginas (layout institucional) | HTML original do WP + menu do site |
| `/renovacao/` `/renov/` `/renov150/` | content/paginas (layout livre, noindex) | Iguais ao WP. Painel `#admin` da própria página gera o HTML novo: colar em /admin/blog > Páginas |
| `/links/` `/fmteam-links/` `/celulite-zero/` `/seque-ganhando-massa/` | content/paginas (layout livre) | Iguais ao WP (links lê a planilha do Google como antes) |

- Conteúdo padrão em `lib/defaults.js`. Páginas de campanha ficam em `paginas.esportivo` e `paginas.online` e herdam da home tudo que não sobrescrevem (imagens, carrosséis, artes, rodapé).
- `lib/content.js > getPage(chave)` faz a mesclagem. Salvo no Supabase (tabela site_content, bucket site-media) ou em content/site.json localmente.
- Canonical de cada página = mesma URL que já está indexada (com barra no final). Dados estruturados: Person/Nutritionist (lib/schema-person.json, copiado do WP) + FAQPage gerado do FAQ.
- `skipTrailingSlashRedirect: true` porque o WordPress usa barra final.

## Blog (migrado do WordPress em 22/10/2026)
- **Fontes:** `content/blog/<slug>.json` (32 posts importados do WP pela Action "Importar blog do WordPress",
  `scripts/import-wp.mjs`) + tabela `blog_posts` no Supabase "Controle de pacientes" (posts novos e edições).
  Linha no Supabase com o mesmo slug VENCE o arquivo; status `draft`/`deleted` tira do ar. Tudo em `lib/blog.js`.
- **Imagens** dos posts: `public/wp-content/uploads/...` (mesmo caminho do WP, então as URLs antigas continuam valendo).
- **Roteamento:** todo endereço de 1 nível que não é página do Next é artigo (`app/[slug]`). As páginas que AINDA
  estão no WordPress ficam listadas em `lib/wp-pages.mjs` (rewrite `afterFiles`). **Criou página nova no WP? Adicione lá.**
  Endereço desconhecido: o `[slug]` pergunta ao WP se havia redirecionamento (Rank Math) e segue; senão 404.
- **Páginas (23/10/2026):** `content/paginas/<slug>.json` (importadas por `scripts/import-wp-paginas.mjs`, Action
  "Importar páginas do WordPress"; imagens base64 viraram arquivos em `public/paginas/`) + linhas `tipo='pagina'` em
  `blog_posts`. Mesmo app/[slug]; `layout` e `robots` vêm do arquivo. `/home/` redireciona para `/`.
- **Spam da invasão (jul/2026):** `/<texto>/<número 4+ dígitos>` responde 410 (`app/api/gone`, rewrite em next.config).
  `/category/conteudo_semanal/` redireciona para `/blog/`.
- **SEO:** canonical `/<slug>/`, título/descrição importados do Rank Math, BlogPosting + BreadcrumbList,
  `app/sitemap.js` (`/sitemap_index.xml` redireciona pra `/sitemap.xml`). Menu "Conteúdo Semanal" = 8 posts mais recentes.
- **Automação semanal** (repo `fabriciomoura-seo`, `scripts/publish-to-site.mjs`) publica via `POST /api/blog`
  com `Authorization: Bearer BLOG_API_TOKEN` (env na Vercel + secret no GitHub, mesmo valor).
- **Chave do Supabase:** as chaves antigas (JWT anon/service_role) foram DESLIGADAS no projeto em 12/05/2026.
  `SUPABASE_SERVICE_ROLE_KEY` na Vercel precisa ser a chave nova `sb_secret_...` (`sbAuth()` em `lib/content.js`).
  Sem ela o site funciona (lê os arquivos), mas o painel não salva.

## Trava de temas proibidos (26/10/2026, pedido do Fabricio)
- **Nada de hormônio, anabolizante ou remédio de emagrecer (Mounjaro, Ozempic, canetas etc.) no fabriciomoura.com.**
  Artigo de Masteron reprovou os anúncios do domínio inteiro no Google Ads (24/10). Esses temas vão só para o
  fabriciomoura.blog.br (repo fabriciomoura-seo/blog-br). Nunca linkar nem redirecionar do .com para o .blog.br.
- `lib/temas-proibidos.js` (mesma lista do robô em fabriciomoura-seo/scripts/temas-proibidos.mjs): `savePost` recusa
  publicar e `fromFile`/`fromRow` tiram do ar (rascunho na leitura) qualquer post/página com termo proibido.
- 26/10: "como-aumentar-testosterona-naturalmente" virou rascunho (fica só no blog.br); menções de cortisol/hormonal
  em 10 artigos e na celulite-zero reescritas; categoria "Suplementos e hormônios" virou "Suplementos".

## Rastreamento (corrigido 29/09/2026 — LEIA antes de mexer em tag)
- **O GTM `GTM-NVTZQGZ2` é OBRIGATÓRIO e NÃO é fantasma.** Ele é gerenciado pela agência (as
  contas Google do dono não têm acesso ao Tag Manager — por isso "parecia vazio"). O contêiner
  publicado contém a conversão **"Botão WhatsApp"** do Google Ads (`AW-16613160058`, rótulo
  `CeqfCLy49roZEPro4vE9`, gatilho de clique em link `wa.me`) — é a ação que as campanhas
  otimizam — e o **Pixel da Meta** `1780102476723382`.
- **Incidente 24→29/09/2026:** uma sessão anterior removeu o GTM achando que era fantasma. Com a
  virada do DNS (24/09 ~16:45 BRT) o site passou a não carregar tag nenhuma → "Botão WhatsApp"
  foi de ~50/dia a 0 em 25/09, o Smart Bidding estrangulou e os leads do Google caíram. Restaurado
  em 29/09 com fallback no código (`GTM_PADRAO` em `Tracking.jsx`): mesmo com o campo do /admin
  vazio, o GTM carrega. **Nunca tire o GTM sem que as tags diretas (abaixo) estejam no lugar.**
- **Modo de tags diretas (padrão a partir do PR "tags diretas"):** `Tracking.jsx` carrega o gtag do
  Google Ads (`AW-16613160058`, conversão `CeqfCLy49roZEPro4vE9` no clique do WhatsApp) e o Pixel
  (`1780102476723382`, PageView + Lead) DIRETO, sem o GTM. Os eventos entram numa fila na hora e os
  scripts baixam na 1ª interação ou 4 s após o load. Plano de volta: `NEXT_PUBLIC_TRACKING_VIA=gtm`
  na Vercel + redeploy (volta a carregar só o GTM). **Nunca os dois juntos** (conversão em dobro).
  Com o modo direto, o GTM da agência deixa de ser carregado nas páginas do Next (o WordPress/blog
  continua com o GTM dele).
- **Modo GTM (plano de volta):** nele NÃO preencha o campo "Pixel da Meta" do /admin (o pixel já
  roda dentro do GTM, contaria PageView em dobro). No modo direto o campo só troca o ID do pixel.
- **Conversões OFFLINE pelo CRM são ADICIONAIS, não substituem o GTM.** "Reunião agendada" (R$800)
  e "Venda" (valor real) sobem por gclid via as edge functions `google-ads-conversions` /
  `google-ads-sales` do Supabase "Controle de pacientes". A Tag do Google ligada ao Ads é
  `GT-5TGZL4Q5` (Google Ads `AW-16613160058`).
- **O que o site faz de rastreamento:** captura gclid/gbraid/wbraid (URL ou localStorage 90d) e
  injeta o `{cod}` na mensagem do WhatsApp, chamando a edge function `ad-click-log` (grava gclid,
  palavra-chave/UTM, campanha em `ad_clicks`). Mesmo snippet que rodava no footer do WordPress —
  ver `Tracking.jsx`. É isso que casa o lead ao gclid pra a conversão offline lá na frente.
- **Já feito no WordPress (24/09):** Site Kit → Analytics desconectado; plugin PixelYourSite desativado.

## Números de referência (medidos em 24/09/2026)
- Lighthouse celular das páginas atuais no WP: nota 49 e 53, CLS 0,80, 1,1 MB.
- Site novo: CLS 0, 840 KB. O GTM custa ~470ms de TBT no desktop, mas carrega depois da página
  (modo "smart") e é indispensável para as conversões — o custo é aceito.

## Publicação (ainda não feita)
Este site vive no seu **próprio repositório** `fabriciomourateam/site-fabriciomoura` (decisão de 24/09/2026;
antes o plano era subpasta do controle-de-pacientes, mudou para repo separado para Next e Vite não se
atrapalharem). Na Vercel é um projeto próprio com **Root Directory = `.`** (raiz do repo).
O painel Vite (`painel-fmteam`) segue no repo `controle-de-pacientes`, sem relação de build com este.
Passo a passo completo, testes e plano de volta: `docs/fabriciomoura/MANUAL-PUBLICAR-SITE.md` (no zip original;
os passos de publicação continuam valendo, só troca "importe a pasta" por "importe este repo").
