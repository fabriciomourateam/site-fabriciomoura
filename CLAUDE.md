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
