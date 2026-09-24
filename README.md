# Site Fabricio Moura (Next.js)

Réplica da página inicial e das páginas /acompanhamento-esportivo/ e /acompanhamento-online/ do fabriciomoura.com, reconstruída em Next.js para carregar rápido no celular,
com barra fixa de contato, rastreamento completo e painel de edição (CMS) em `/admin`.

## Como funciona
- A página é gerada pronta e servida pela CDN da Vercel (não é montada a cada visita).
- Quando você salva no `/admin`, só essa página é regenerada. O site continua servindo do cache.
- Imagens são convertidas automaticamente para AVIF/WebP no tamanho de cada tela e ficam 1 ano em cache.
- Fontes ficam hospedadas no próprio site (sem depender do Google Fonts).

## Rastreamento incluído
| Tag | ID | Para quê |
|---|---|---|
| Google Tag Manager | GTM-NVTZQGZ2 | Google Ads: vinculador, remarketing e conversão "Botão WhatsApp" |
| Tag do Google (GA4) | desligada | Campo em /admin > Rastreamento, caso queira religar |
| Pixel da Meta + API de Conversões | desligados | Campo em /admin > Rastreamento. Vazio = não carrega nada da Meta |
| Código no WhatsApp | Supabase ad-click-log | Mesma lógica de hoje: gclid vira código na mensagem, ou a origem ([instagram], [organico]...) |

As tags de terceiros carregam logo depois que a página aparece (ou no primeiro toque/rolagem).
Assim o visitante vê o site primeiro e o rastreio entra em seguida.

## Publicar (Vercel)
1. Suba esta pasta para um repositório no GitHub.
2. Na Vercel: Add New > Project > importe o repositório.
3. Em Settings > Environment Variables, preencha as variáveis do `.env.example`.
4. No Supabase, rode `supabase/schema.sql` (SQL Editor).
5. Faça o deploy e teste no endereço de prévia da Vercel.

Os artigos do blog continuam no WordPress (os links do menu apontam para lá).

## Duas versões da página

- `fabriciomoura.com` com o menu do blog (tráfego orgânico)
- `fabriciomoura.com/consultoria` sem menu (anúncios). Fica fora do Google (noindex).
- Visitas que chegam em `/` vindas do Google Ads (gclid, gbraid, wbraid, gad_source) ou com `utm_medium=cpc|ppc|paid|paid_social|pago|ads|cpm` recebem automaticamente a versão sem menu, na mesma URL. Não precisa mudar os anúncios.
- Meta Ads: o Instagram coloca `fbclid` até em links orgânicos, então ele não é usado como sinal. Nos anúncios da Meta, adicione `?utm_medium=paid` ou aponte para `/consultoria`.

## Trocar o domínio fabriciomoura.com mantendo o blog

Tudo que não existe neste projeto (posts, páginas do Elementor, calculadora, links, wp-admin, sitemaps) é entregue pelo WordPress na mesma URL de hoje. Nenhum endereço muda, o SEO do blog fica intacto e você continua postando no WordPress normalmente.

1. **Hostinger > Domínios > Subdomínios:** crie `wp.fabriciomoura.com` apontando para a mesma pasta do WordPress (`public_html`). Ative o SSL dele.
2. **wp-config.php** (antes da linha "That's all, stop editing"):
   ```php
   if (($_SERVER['HTTP_X_FORWARDED_HOST'] ?? '') === 'fabriciomoura.com') {
     $_SERVER['HTTP_HOST'] = 'fabriciomoura.com';
     $_SERVER['HTTPS'] = 'on';
   }
   ```
   Não mude o "Endereço do site" nas configurações do WordPress. Ele continua `https://fabriciomoura.com`.
3. **Vercel > Settings > Environment Variables:** `WORDPRESS_ORIGIN=https://wp.fabriciomoura.com`
4. **Teste antes:** adicione `novo.fabriciomoura.com` como domínio na Vercel e confira a home, /acompanhamento-esportivo/, /acompanhamento-online/ (com e sem ?gclid=teste), 3 posts do blog e o wp-admin.
5. **Virada:** na Hostinger > DNS, troque o registro A do `@` para `76.76.21.21` (Vercel) e o `www` para CNAME `cname.vercel-dns.com`. Mantenha o registro do `wp` apontando para a Hostinger.
6. Depois da virada, o wp-admin pode ser acessado por `fabriciomoura.com/wp-admin` ou `wp.fabriciomoura.com/wp-admin`.

Para voltar atrás, basta restaurar o registro A antigo na Hostinger.

## Usar o painel
- Acesse `/admin` e entre com a senha.
- `**palavra**` deixa em negrito (nos títulos grandes, fica amarelo). Enter quebra a linha.
- Imagens enviadas são reduzidas no navegador (máx. 1600px, WebP) antes de subir.
- Mantenha `{cod}` nas mensagens do WhatsApp: é onde entra o código de rastreio.

## Rodar no computador
```
npm install
npm run dev
```
Sem Supabase configurado, o painel salva em `content/site.json` (senha local: `admin`).
