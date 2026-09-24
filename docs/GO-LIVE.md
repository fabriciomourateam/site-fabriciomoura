# GO-LIVE: colocar o site novo (Next.js/Vercel) no ar em fabriciomoura.com

Registro de como o site novo foi publicado no domínio real, o que NAO se toca,
e como reverter se precisar. Feito em 24/09/2026 com o Fabricio.

## Resultado

O site novo (Next.js na Vercel) serve `fabriciomoura.com`, `www.fabriciomoura.com`
e as paginas de anuncio. O blog continua no WordPress, servido pelo mesmo dominio
via proxy (rewrites do `next.config.mjs`). E-mail continua no Hostinger, intacto.

## Arquitetura em producao

- **Site novo (Vercel):** `fabriciomoura.com` (apex) + `www` + paginas de campanha.
  Projeto Vercel `site-fabriciomoura`, Root Directory `.`, deploy a partir da branch `main`.
- **Blog (WordPress):** roda no hosting do Hostinger, exposto no subdominio
  `wp.fabriciomoura.com`. O site novo faz proxy das rotas do blog pra ele
  (`WORDPRESS_ORIGIN=https://wp.fabriciomoura.com`). O visitante nunca ve o `wp.`;
  tudo aparece sob `fabriciomoura.com`.
- **E-mail:** Hostinger. Os registros MX / SPF / DKIM / DMARC ficam como estao.

## Variaveis de ambiente na Vercel

- `WORDPRESS_ORIGIN = https://wp.fabriciomoura.com`
- `NEXT_PUBLIC_SITE_URL = https://fabriciomoura.com`

## O que foi feito, em fases

### Fase 1 - Deploy e validacao
- Site importado no repo proprio `fabriciomourateam/site-fabriciomoura` e deployado
  na Vercel (`site-fabriciomoura.vercel.app`).
- Removido o GTM fantasma (`rastreio.gtm = ""`): nao rastreava nada e so gerava TBT.
  PageSpeed subiu (desktop ~96, mobile ~99).
- Mensagem do WhatsApp ajustada: `{cod}` no comeco, codigo pago entre crases
  (monoespacado), tag de origem `[direto]`/`[organico]` sem crase. `msgAgendar = msgPadrao`.
- Barra fixa sem texto e com botoes centralizados. Deteccao de landing pela URL.

### Fase 2 - Preparar o WordPress e testar sem virar o dominio
1. **Subdominio do WordPress:** criado `wp.fabriciomoura.com` apontando pro `public_html`
   (onde o WordPress mora).
2. **`wp-config.php`:** adicionado o ajuste de host encaminhado (o site novo faz proxy,
   entao o WP precisa saber o host original). ATENCAO aos DOIS parenteses de abertura:
   ```php
   if (($_SERVER['HTTP_X_FORWARDED_HOST'] ?? '') === 'fabriciomoura.com') {
     $_SERVER['HTTP_HOST'] = 'fabriciomoura.com';
     $_SERVER['HTTPS'] = 'on';
   }
   ```
   (com um parentese so, da erro de sintaxe e derruba o site inteiro.)
3. **Dominio de teste:** criado `novo.fabriciomoura.com` (CNAME -> `cname.vercel-dns.com`)
   apontando pro projeto Vercel, so pra validar sem tocar no dominio de producao.
   Testado: 3 paginas (com e sem `?gclid=TESTE1234567890`), posts do blog via proxy, `/wp-admin`. OK.

### Fase 3 - A virada (DNS do dominio real)
Na Vercel, adicionados `fabriciomoura.com` e `www.fabriciomoura.com` ao projeto.
No Hostinger (Zona DNS), editados SO estes dois registros:

Valores finais aplicados (os que a Vercel recomenda no "View DNS configuration"):

| Registro | Antes | Depois (em producao) |
|---|---|---|
| `@` (apex) | ALIAS -> `fabriciomoura.com.cdn.hstgr.net` | A -> `216.198.79.1` |
| `www` | CNAME -> `www.fabriciomoura.com.cdn.hstgr.net` | CNAME -> `0d72035e3a3ff3b9.vercel-dns-017.com` |

O `www` redireciona pro apex (`fabriciomoura.com`) - comportamento desejado, dominio
canonico unico.

> O `www` CNAME (`0d72035e3a3ff3b9.vercel-dns-017.com`) e especifico deste projeto Vercel.
> O IP do apex (`216.198.79.1`) e o que a Vercel recomenda hoje; se um dia der aviso amarelo
> "DNS Change Recommended", conferir o "View DNS configuration" do apex na Vercel e usar o
> valor que ela mostrar. Os dois ficaram "Valid Configuration" (verde) apos aplicar.

O `novo.fabriciomoura.com` (dominio de teste da Fase 2) foi removido do Hostinger e da
Vercel apos a virada.

## NAO TOCAR (mexer aqui quebra e-mail ou o blog)

- **E-mail:** `MX @` (mx1/mx2.hostinger.com), `TXT @` do SPF (`v=spf1 include:_spf.mail.hostinger.com ~all`),
  `_dmarc`, os tres `hostingermail-*._domainkey`, `autodiscover`, `autoconfig`.
- **`wp` (ALIAS -> `wp.fabriciomoura.com.cdn.hstgr.net`):** e o WordPress que serve o blog
  por baixo do proxy. Vital.
- Subdominios de terceiros que ja existiam: `novo`, `membros`, `time`, `shape-express`,
  `agente`, e o TXT de verificacao do Google. Sem relacao com essa virada.

## Rastreamento em producao (nao mudou com a virada)

- **Nenhuma tag de terceiro no site** (sem GTM, GA4 ou Pixel).
- **Conversao ao Google Ads e OFFLINE, pelo CRM:** "Reuniao agendada" (R$800) e "Venda"
  sobem por gclid via as edge functions `google-ads-conversions` / `google-ads-sales`
  do Supabase "Controle de pacientes". Independe do site.
- **O que o site faz:** captura gclid/gbraid/wbraid (URL ou localStorage 90d) e injeta
  o `{cod}` na mensagem do WhatsApp, chamando a edge function `ad-click-log` (grava gclid,
  palavra-chave/UTM, campanha em `ad_clicks`). E o que casa o lead ao gclid pra a conversao
  offline la na frente. Ver `app/components/Tracking.jsx`.

## Rollback (se algo quebrar)

A virada e reversivel pelo DNS. No Hostinger, volta os dois registros pro estado anterior:

| Registro | Voltar para |
|---|---|
| `@` (apex) | A/ALIAS -> `fabriciomoura.com.cdn.hstgr.net` |
| `www` | CNAME -> `www.fabriciomoura.com.cdn.hstgr.net` |

Propaga em minutos e o WordPress volta a responder no dominio principal como antes.
Se o problema for so o `wp-config.php`, restaurar o backup baixado antes da edicao.

## Checagem pos-virada (primeira meia hora)

- `https://fabriciomoura.com` abre o site novo (aba anonima).
- 3 paginas: home, `/acompanhamento-esportivo/`, `/acompanhamento-online/`.
- Um post do blog abre (proxy pro WordPress).
- `/wp-admin` faz login.
- `?gclid=TESTE1234567890` traz o codigo certo (E/O/H conforme a pagina) em monoespacado.
- E-mail: manda e recebe um teste.
