"use client";
import { useEffect } from "react";

/*
  Rastreamento completo do site:
  1. Google Tag Manager (Google Ads: vinculador de conversões + conversão "Botão WhatsApp")
  2. Tag do Google / GA4: opcional (campo vazio = desligado)
  3. Pixel da Meta: opcional (campo vazio = desligado, e a API de Conversões também não é chamada)
  4. Código de rastreio na mensagem do WhatsApp (mesma lógica que roda hoje no WordPress, via Supabase)

  Modo "smart": as tags de terceiros carregam logo depois que a página ficou pronta na tela
  (ou no primeiro toque/rolagem, o que vier antes). A página aparece primeiro, o rastreio vem logo em seguida.
  Modo "eager": carrega tudo imediatamente após a página ficar interativa.
*/
const API = "https://qhzifnyjyxdushxorzrk.supabase.co/functions/v1/ad-click-log";
const APIKEY = "sb_publishable_qph0mJ7a0tVoMhXs6yF6ZQ_k8HgA2FR";
const TTL = 90 * 24 * 60 * 60 * 1000;
const SELECTOR = 'a[href*="wa.me"], a[href*="api.whatsapp"], a[href*="whatsapp.com/send"]';

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

function loadTags({ gtm, googleTag, metaPixel }, pvId) {
  if (window.__fmTags) return;
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
    const load = () => loadTags(ids, pvId);
    const triggers = ["pointerdown", "keydown", "scroll", "touchstart"];
    let timer;
    if (mode === "off") { /* rastreio desligado (testes) */ }
    else if (mode === "eager") load();
    else {
      triggers.forEach((ev) => window.addEventListener(ev, load, { once: true, passive: true }));
      const idle = () => (window.requestIdleCallback ? requestIdleCallback(load, { timeout: 1500 }) : setTimeout(load, 300));
      if (document.readyState === "complete") timer = setTimeout(idle, 200);
      else window.addEventListener("load", () => { timer = setTimeout(idle, 200); }, { once: true });
    }
    if (ids.metaPixel) capi("PageView", pvId);

    // --- Código de rastreio na mensagem do WhatsApp ---
    let adIds = { gclid: qs.get("gclid"), gbraid: qs.get("gbraid"), wbraid: qs.get("wbraid") };
    if (adIds.gclid || adIds.gbraid || adIds.wbraid) setStore("fm_ads", { ids: adIds, ts: Date.now() });
    else {
      const saved = getStore("fm_ads");
      if (saved?.ts && Date.now() - saved.ts < TTL) adIds = saved.ids;
    }
    const tag = srcTag(qs);
    const land = "home";
    let code = null;
    const decorate = () => {
      document.querySelectorAll(SELECTOR).forEach((a) => {
        if (!a.dataset.msg) {
          try { a.dataset.msg = new URL(a.href).searchParams.get("text") || msgPadrao; } catch { a.dataset.msg = msgPadrao; }
        }
        a.href = `https://wa.me/${numero}?text=${encodeURIComponent(buildText(a.dataset.msg, code, tag))}`;
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

    // --- Clique no WhatsApp: Contact no pixel e no servidor ---
    const onClick = (e) => {
      const a = e.target.closest?.(SELECTOR);
      if (!a) return;
      decorate();
      if (mode !== "off") load();
      const id = newId("ct");
      if (ids.metaPixel) window.fbq?.("track", "Contact", { content_name: a.dataset.cta || "whatsapp" }, { eventID: id });
      if (ids.metaPixel) window.fbq?.("trackCustom", "OutboundClick", { url: "wa.me" });
      if (ids.metaPixel) capi("Contact", id);
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
