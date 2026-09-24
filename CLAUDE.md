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

## Rastreamento (decidido com o dono)
- Mantém: **GTM-NVTZQGZ2** (contém a conversão "Botão WhatsApp" AW-16613160058 rótulo CeqfCLy49roZEPro4vE9, vinculador e remarketing). Testado: dispara igual no site novo.
- Removidos: GA4 (GT-PJRQZN9M) e Pixel da Meta (1780102476723382). Não rodam Meta Ads para o site e não usam o GA4. Campos vazios no painel = desligado (o código não chama fbq nem /api/meta).
- Pendente fora do código: pausar as tags da Meta dentro do GTM e desativar o plugin PixelYourSite e o módulo Analytics do Site Kit no WordPress.
- Código na mensagem do WhatsApp: `{cod}` vem da edge function `ad-click-log` do Supabase "Controle de pacientes" (grava gclid, palavra-chave, campanha em ad_clicks). Mesma lógica do WordPress.

## Números de referência (medidos em 24/09/2026)
- Lighthouse celular das páginas atuais no WP: nota 49 e 53, CLS 0,80, 1,1 MB.
- Site novo: CLS 0, 840 KB. O TBT alto que sobra vem do GTM carregando o Pixel da Meta (sai quando pausarem a tag no GTM).

## Publicação (ainda não feita)
Este site vive no seu **próprio repositório** `fabriciomourateam/site-fabriciomoura` (decisão de 24/09/2026;
antes o plano era subpasta do controle-de-pacientes, mudou para repo separado para Next e Vite não se
atrapalharem). Na Vercel é um projeto próprio com **Root Directory = `.`** (raiz do repo).
O painel Vite (`painel-fmteam`) segue no repo `controle-de-pacientes`, sem relação de build com este.
Passo a passo completo, testes e plano de volta: `docs/fabriciomoura/MANUAL-PUBLICAR-SITE.md` (no zip original;
os passos de publicação continuam valendo, só troca "importe a pasta" por "importe este repo").
