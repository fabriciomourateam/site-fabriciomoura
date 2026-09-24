# Contexto do projeto (leia antes de mexer)

Site do Fabricio Moura (nutricionista esportivo e educador físico, fabriciomoura.com).
Substitui a home e as páginas de anúncio do WordPress/Elementor atual por Next.js na Vercel.
O blog continua no WordPress, servido pelo mesmo domínio via proxy (rewrites "fallback").

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

- Conteúdo padrão em `lib/defaults.js`. Páginas de campanha ficam em `paginas.esportivo` e `paginas.online` e herdam da home tudo que não sobrescrevem (imagens, carrosséis, artes, rodapé).
- `lib/content.js > getPage(chave)` faz a mesclagem. Salvo no Supabase (tabela site_content, bucket site-media) ou em content/site.json localmente.
- Canonical de cada página = mesma URL que já está indexada (com barra no final). Dados estruturados: Person/Nutritionist (lib/schema-person.json, copiado do WP) + FAQPage gerado do FAQ.
- `skipTrailingSlashRedirect: true` porque o WordPress usa barra final.

## Rastreamento (revisado 24/09/2026 com o dono, no Claude Code)
- **NÃO há GTM.** O dono não tem contêiner Tag Manager (a conta Tag Manager está vazia). O
  `GTM-NVTZQGZ2` que constava antes era fantasma: não rastreava nada e só gerava TBT.
  Removido (`rastreio.gtm = ""`).
- **A conversão ao Google Ads é OFFLINE, pelo CRM.** "Reunião agendada" (R$800) e "Venda"
  (valor real) sobem por gclid via as edge functions `google-ads-conversions` /
  `google-ads-sales` do Supabase "Controle de pacientes" — independe do site. A Tag do Google
  ligada ao Ads é `GT-5TGZL4Q5` (Google Ads `AW-16613160058`); NÃO é carregada pelo site.
- **Nenhuma tag de terceiro no site:** GA4, Pixel da Meta e GTM todos vazios/removidos. O site
  não carrega nenhum script de tracking externo (só um `preconnect` do Google, inócuo).
- **O que o site faz de rastreamento:** captura gclid/gbraid/wbraid (URL ou localStorage 90d) e
  injeta o `{cod}` na mensagem do WhatsApp, chamando a edge function `ad-click-log` (grava gclid,
  palavra-chave/UTM, campanha em `ad_clicks`). Mesmo snippet que rodava no footer do WordPress —
  ver `Tracking.jsx`. É isso que casa o lead ao gclid pra a conversão offline lá na frente.
- **Já feito no WordPress (24/09):** Site Kit → Analytics desconectado; plugin PixelYourSite desativado.

## Números de referência (medidos em 24/09/2026)
- Lighthouse celular das páginas atuais no WP: nota 49 e 53, CLS 0,80, 1,1 MB.
- Site novo: CLS 0, 840 KB. O TBT que aparecia no desktop (470ms) era o carregador do GTM fantasma;
  com `rastreio.gtm = ""` o site deixa de carregar qualquer script externo, então esse TBT sai. Re-medir após o deploy.

## Publicação (ainda não feita)
Este site vive no seu **próprio repositório** `fabriciomourateam/site-fabriciomoura` (decisão de 24/09/2026;
antes o plano era subpasta do controle-de-pacientes, mudou para repo separado para Next e Vite não se
atrapalharem). Na Vercel é um projeto próprio com **Root Directory = `.`** (raiz do repo).
O painel Vite (`painel-fmteam`) segue no repo `controle-de-pacientes`, sem relação de build com este.
Passo a passo completo, testes e plano de volta: `docs/fabriciomoura/MANUAL-PUBLICAR-SITE.md` (no zip original;
os passos de publicação continuam valendo, só troca "importe a pasta" por "importe este repo").
