"use client";
import { useEffect } from "react";

/*
  Efeitos do blog (sem biblioteca):
  - entrada dos blocos ao rolar (IntersectionObserver, uma vez só)
  - brilho dourado que segue o mouse no cartão (só em mouse, não em toque)
  - filtro por categoria no índice (reorganiza o bento)
  - barra de progresso de leitura nos navegadores sem "animation-timeline"
*/
import { bento } from "@/lib/blog-ui";

export default function BlogFx() {
  useEffect(() => {
    const root = document.documentElement;
    const reduz = matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. Entrada ao rolar
    const els = document.querySelectorAll(".bl-reveal");
    let io;
    if (reduz || !("IntersectionObserver" in window)) els.forEach((el) => el.classList.add("is-in"));
    else {
      io = new IntersectionObserver((entries) => {
        entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); } });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
      els.forEach((el) => io.observe(el));
    }

    // 2. Brilho que segue o mouse
    const fino = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const onMove = (e) => {
      const c = e.target.closest?.(".bl-card__core");
      if (!c) return;
      const r = c.getBoundingClientRect();
      c.style.setProperty("--mx", `${e.clientX - r.left}px`);
      c.style.setProperty("--my", `${e.clientY - r.top}px`);
    };
    if (fino) document.addEventListener("pointermove", onMove, { passive: true });

    // 3. Filtro por categoria
    const chips = document.querySelectorAll("[data-filtro]");
    const onChip = (e) => {
      const alvo = e.currentTarget.dataset.filtro;
      chips.forEach((b) => b.setAttribute("aria-pressed", String(b === e.currentTarget)));
      const topo = document.querySelector(".bl-destaques");
      if (topo) topo.hidden = alvo !== "Todos";
      const cards = [...document.querySelectorAll(".bl-grid .bl-card")];
      const vis = cards.filter((card) => (alvo === "Todos" ? !card.dataset.topo : card.dataset.cat === alvo));
      const spans = bento(vis.length);
      cards.forEach((card) => { card.hidden = !vis.includes(card); card.classList.remove("is-in"); });
      vis.forEach((card, n) => {
        card.style.setProperty("--span", spans[n]);
        card.style.setProperty("--i", n % 8);
        requestAnimationFrame(() => requestAnimationFrame(() => card.classList.add("is-in")));
      });
    };
    chips.forEach((b) => b.addEventListener("click", onChip));

    // 4. Barra de leitura (fallback)
    const bar = document.querySelector(".bl-progress");
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const max = root.scrollHeight - innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
      });
    };
    const semTimeline = bar && !CSS.supports("animation-timeline: scroll()");
    if (semTimeline) { addEventListener("scroll", onScroll, { passive: true }); onScroll(); }

    return () => {
      io?.disconnect();
      if (fino) document.removeEventListener("pointermove", onMove);
      chips.forEach((b) => b.removeEventListener("click", onChip));
      if (semTimeline) removeEventListener("scroll", onScroll);
    };
  }, []);
  return null;
}

