"use client";
import { useEffect } from "react";

/*
  Rastreamento completo do site:
  1. Google Ads direto (gtag AW-16613160058: vinculador de conversões + conversão "Botão WhatsApp")
     e Pixel da Meta direto. Modo antigo via GTM continua disponível (NEXT_PUBLIC_TRACKING_VIA=gtm).
  2. Tag do Google / GA4: opcional (campo vazio = desligado)
  3. API de Conversões da Meta: só envia se META_CAPI_TOKEN estiver na Vercel
  4. Código de rastreio na mensagem do WhatsApp (mesma lógica que roda hoje no WordPress, via Supabase)

  Modo "smart": os eventos entram numa fila na hora; os scripts de terceiros baixam 4 s depois do load
  (ou no primeiro toque/rolagem, o que vier antes). A página aparece primeiro, o rastreio vem logo em seguida.
  Modo "eager": carrega tudo imediatamente após a página ficar interativa.
*/
const API = "https://qhzifnyjyxdushxorzrk.supabase.co/functions/v1/ad-click-log";
const APIKEY = "sb_publishable_qph0mJ7a0tVoMhXs6yF6ZQ_k8HgA2FR";
const TTL = 90 * 24 * 60 * 60 * 1000;
const SELECTOR = 'a[href*="wa.me"], a[href*="api.whatsapp"], a[href*="whatsapp.com/send"]';
// GTM de produção. Usado mesmo se o campo do /admin estiver vazio: sem ele o Google Ads perde a
// conversão "Botão WhatsApp" (foi o que derrubou os leads em 24/09/2026). Trocar só se mudar de contêiner.
const GTM_PADRAO = "GTM-NVTZQGZ2";

// Tags diretas (padrão): substituem o GTM com o MESMO resultado e ~300 KB a menos de JS.
// - Google Ads: tag AW + conversão "Botão WhatsApp" no clique (mesma ação/rótulo que o GTM disparava).
// - Pixel da Meta: PageView + "Lead" no clique do WhatsApp (o que o GTM disparava).
// As chamadas entram numa FILA na hora (gtag/fbq stubs) e são enviadas quando os scripts carregam,
// então um clique no WhatsApp ANTES do script carregar não se perde (com o GTM, se perdia).
// Plano de volta: NEXT_PUBLIC_TRACKING_VIA=gtm na Vercel + redeploy -> volta a usar o GTM como antes.
// NUNCA ligar as duas coisas juntas (contaria conversão em dobro).
const VIA_GTM = process.env.NEXT_PUBLIC_TRACKING_VIA === "gtm";
const ADS_ID = "AW-16613160058";
const ADS_WHATS_LABEL = "CeqfCLy49roZEPro4vE9";
const PIXEL_PADRAO = "1780102476723382";
const LOAD_DELAY = 4000; // ms depois do load (ou antes, na primeira interação)

const getStore = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; } };
const setStore = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const cookie = (n) => document.cookie.split("; ").find((c) => c.startsWith(n + "="))?.split("=")[1];
const newId = (p) => `${p}.${Date.now()}.${Math.random().toString(36).slice(2, 10)}`;

function addScript(src, onDone) {
  const s = document.createElement("script");
  s.async = true; s.src = src;
  if (onDone) { s.onload = onDone; s.onerror = onDone; }
  document.head.appendChild(s);
}

// Fila imediata (sem baixar nada): tudo que for chamado antes dos scripts carregarem fica guardado.
function setupDirect({ googleTag, metaPixel }, pvId) {
  if (window.__fmQueues) return;
  window.__fmQueues = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", ADS_ID);
  if (googleTag) window.gtag("config", googleTag);
  const pixel = metaPixel || PIXEL_PADRAO;
  /* eslint-disable */
  !function(f){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window);
  /* eslint-enable */
  window.fbq("init", pixel);
  window.fbq("track", "PageView", {}, { eventID: pvId });
}

function loadDirect() {
  if (window.__fmTags) return;
  window.__fmTags = true;
  addScript(`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`);
  addScript("https://connect.facebook.net/en_US/fbevents.js");
}

function loadTags({ gtm: gtmId, googleTag, metaPixel }, pvId) {
  if (window.__fmTags) return;
  const gtm = (gtmId || "").trim() || GTM_PADRAO;
  window.__fmTags = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  // Pixel da Meta
  if (metaPixel) {
    /* eslint-disable */
    !function(f){if(f.fbq)return;var n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window);
    /* eslint-enable */
    window.fbq("init", metaPixel);
    window.fbq("track", "PageView", {}, { eventID: pvId });
    addScript("https://connect.facebook.net/en_US/fbevents.js");
  }
  // GTM (Google Ads). Carrega depois da tag do Google para o GTM não baixar a mesma tag uma segunda vez.
  const startGtm = () => {
    if (!gtm) return;
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    addScript(`https://www.googletagmanager.com/gtm.js?id=${gtm}`);
  };
  if (googleTag) {
    window.gtag("js", new Date());
    window.gtag("config", googleTag);
    addScript(`https://www.googletagmanager.com/gtag/js?id=${googleTag}`, startGtm);
  } else startGtm();
}

function srcTag(qs) {
  const utm = qs.get("utm_source");
  if (utm) return "[" + utm.toLowerCase() + "]";
  const ref = document.referrer || "";
  if (/google\.|bing\.|search\.yahoo|duckduckgo/.test(ref)) return "[organico]";
  if (/instagram\.com/.test(ref)) return "[instagram]";
  if (/facebook\.com|fb\./.test(ref)) return "[facebook]";
  if (/youtube\.com|youtu\.be/.test(ref)) return "[youtube]";
  if (/tiktok\.com/.test(ref)) return "[tiktok]";
  if (!ref) return "[direto]";
  return "";
}

function buildText(base, code, tag) {
  const has = base.includes("{cod}");
  // Código do anúncio (pago) entra entre crases -> vira "inline code" (monoespaçado) no WhatsApp.
  // A tag de origem ([direto]/[organico], tráfego não-pago) entra SEM crase.
  // O CRM extrai o código por regex com \b (fronteira de palavra), então a crase não atrapalha.
  const codeFmt = code ? "`" + code + "`" : "";
  let t = base;
  if (code) t = has ? t.replace("{cod}", codeFmt) : t.includes(code) ? t : t.trimEnd() + " " + codeFmt;
  else if (has) t = t.replace("{cod}", tag);
  else if (tag && !t.includes(tag)) t = t.trimEnd() + " " + tag;
  return t.replace(/\s{2,}/g, " ").trim();
}

// API de Conversões (servidor). Só envia se META_CAPI_TOKEN estiver configurado na Vercel.
function capi(event_name, event_id) {
  try {
    const body = JSON.stringify({ event_name, event_id, event_source_url: location.href, fbp: cookie("_fbp"), fbc: cookie("_fbc") });
    if (!navigator.sendBeacon?.("/api/meta", new Blob([body], { type: "application/json" })))
      fetch("/api/meta", { method: "POST", body, keepalive: true, headers: { "Content-Type": "application/json" } });
  } catch {}
}

export default function Tracking({ ids, numero, msgPadrao, mode }) {
  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const pvId = newId("pv");

    // fbclid -> cookie _fbc (para a API de Conversões casar o clique do anúncio)
    const fbclid = qs.get("fbclid");
    if (fbclid && !cookie("_fbc")) document.cookie = `_fbc=fb.1.${Date.now()}.${fbclid}; path=/; max-age=7776000; SameSite=Lax`;

    // --- Carregamento das tags ---
    const load = VIA_GTM ? () => loadTags(ids, pvId) : loadDirect;
    const triggers = ["pointerdown", "keydown", "scroll", "touchstart"];
    let timer;
    if (mode === "off") { /* rastreio desligado (testes) */ }
    else if (!VIA_GTM) {
      // Fila na hora; scripts na primeira interação ou LOAD_DELAY depois do load.
      setupDirect(ids, pvId);
      if (mode === "eager") load();
      else {
        triggers.forEach((ev) => window.addEventListener(ev, load, { once: true, passive: true }));
        if (document.readyState === "complete") timer = setTimeout(load, LOAD_DELAY);
        else window.addEventListener("load", () => { timer = setTimeout(load, LOAD_DELAY); }, { once: true });
      }
    }
    else if (mode === "eager") load();
    else {
      triggers.forEach((ev) => window.addEventListener(ev, load, { once: true, passive: true }));
      const idle = () => (window.requestIdleCallback ? requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 300));
      if (document.readyState === "complete") timer = setTimeout(idle, 200);
      else window.addEventListener("load", () => { timer = setTimeout(idle, 200); }, { once: true });
    }
    const pixelOn = !VIA_GTM || !!ids.metaPixel; // no modo GTM o pixel roda dentro do contêiner
    if (pixelOn && mode !== "off") capi("PageView", pvId);

    // --- Código de rastreio na mensagem do WhatsApp ---
    let adIds = { gclid: qs.get("gclid"), gbraid: qs.get("gbraid"), wbraid: qs.get("wbraid") };
    if (adIds.gclid || adIds.gbraid || adIds.wbraid) setStore("fm_ads", { ids: adIds, ts: Date.now() });
    else {
      const saved = getStore("fm_ads");
      if (saved?.ts && Date.now() - saved.ts < TTL) adIds = saved.ids;
    }
    const tag = srcTag(qs);
    const path = (location.pathname || "").toLowerCase();
    const land = path.includes("esportivo") ? "esportivo" : path.includes("online") ? "online" : "home";
    let code = null;
    const decorate = () => {
      document.querySelectorAll(SELECTOR).forEach((a) => {
        if (!a.dataset.msg) {
          try { a.dataset.msg = new URL(a.href).searchParams.get("text") || msgPadrao; } catch { a.dataset.msg = msgPadrao; }
        }
        a.href = `https://wa.me/${numero}?text=${encodeURIComponent(buildText(a.dataset.msg, code, tag))}`;
        // Nova aba, igual ao site antigo: a página continua viva e o GTM termina de enviar a
        // conversão "Botão WhatsApp" (o gatilho não usa "aguardar tags").
        a.target = "_blank";
        a.rel = "noopener noreferrer";
      });
    };
    decorate();
    if (adIds.gclid || adIds.gbraid || adIds.wbraid) {
      const cached = getStore("fm_code_" + land);
      if (cached?.code && Date.now() - cached.ts < TTL) { code = cached.code; decorate(); }
      else fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: APIKEY },
        body: JSON.stringify({ ...adIds, landing: land, page_url: location.href }),
      }).then((r) => r.json()).then((j) => {
        if (j?.code) { code = j.code; setStore("fm_code_" + land, { code, ts: Date.now() }); decorate(); }
      }).catch(() => {});
    }

    // --- Clique no WhatsApp: conversão do Google Ads + Lead no Pixel (e no servidor) ---
    const onClick = (e) => {
      const a = e.target.closest?.(SELECTOR);
      if (!a) return;
      decorate();
      if (mode === "off") return;
      load();
      const id = newId("ct");
      if (!VIA_GTM) {
        // Entra na fila mesmo se o gtag.js/fbevents.js ainda não carregou; a aba continua aberta
        // (o WhatsApp abre em nova aba), então a fila é enviada assim que o script chega.
        window.gtag?.("event", "conversion", { send_to: `${ADS_ID}/${ADS_WHATS_LABEL}` });
        window.fbq?.("track", "Lead", { content_name: a.dataset.cta || "whatsapp" }, { eventID: id });
        capi("Lead", id);
      } else if (ids.metaPixel) {
        window.fbq?.("track", "Contact", { content_name: a.dataset.cta || "whatsapp" }, { eventID: id });
        window.fbq?.("trackCustom", "OutboundClick", { url: "wa.me" });
        capi("Contact", id);
      }
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      triggers.forEach((ev) => window.removeEventListener(ev, load));
      clearTimeout(timer);
    };
  }, [ids, numero, msgPadrao, mode]);
  return null;
}
