"use client";
import { useEffect, useRef } from "react";

// Lista de avaliações. No celular (carrossel de arrastar) passa sozinha um cartão a cada 4 s
// e volta pro primeiro no fim. Para de vez quando a pessoa toca, arrasta ou rola a lista.
// Só anda com a lista visível e a aba aberta. Não anda com "reduzir movimento" ligado.
// No computador a lista é grade (nada a rolar), então não faz nada.
export default function ListaAvaliacoes({ children, intervalo = 4000 }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let visivel = false;
    const passo = () => {
      if (!visivel || document.hidden) return;
      const max = el.scrollWidth - el.clientWidth - 2;
      if (max <= 0) return;
      const card = el.firstElementChild;
      const step = card.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0);
      if (el.scrollLeft >= max) el.scrollTo({ left: 0, behavior: "smooth" });
      else el.scrollBy({ left: step, behavior: "smooth" });
    };

    const timer = setInterval(passo, intervalo);
    const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; }, { threshold: 0.6 });
    io.observe(el);

    const eventos = ["pointerdown", "touchstart", "wheel", "keydown"];
    const parar = () => {
      clearInterval(timer);
      io.disconnect();
      eventos.forEach((ev) => el.removeEventListener(ev, parar));
    };
    eventos.forEach((ev) => el.addEventListener(ev, parar, { passive: true }));

    return parar;
  }, [intervalo]);

  return <ul className="avaliacoes__lista" ref={ref}>{children}</ul>;
}
