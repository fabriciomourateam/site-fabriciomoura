"use client";
import { useEffect, useState } from "react";

// Aparece depois que a pessoa passa do botão principal do topo
export default function StickyBar({ texto, whats, agendar, hrefWhats, hrefAgendar }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const target = document.getElementById("hero-cta");
    if (!target) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(target);
    return () => io.disconnect();
  }, []);
  return (
    <div className={`sticky-bar${show ? " is-visible" : ""}`} inert={!show}>
      <div className="sticky-bar__inner">
        {texto ? <p className="sticky-bar__text">{texto}</p> : null}
        <div className="sticky-bar__actions">
          <a className="btn btn--whats" href={hrefWhats} data-cta="barra-whatsapp">
            <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 23.7a10.7 10.7 0 0 1-5.5-1.5l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7Zm5.9-8c-.3-.2-1.9-1-2.2-1s-.5-.2-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5.9-1.7.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6a1.2 1.2 0 0 0-.9.4 3.6 3.6 0 0 0-1.1 2.7 6.3 6.3 0 0 0 1.3 3.3 14.4 14.4 0 0 0 5.5 4.9c2 .9 2.8 1 3.9.8a3.3 3.3 0 0 0 2.1-1.5 2.7 2.7 0 0 0 .2-1.5c-.1-.1-.3-.2-.6-.4Z"/></svg>
            <span className="only-desktop">{whats}</span><span className="only-mobile">WhatsApp</span>
          </a>
          <a className="btn btn--yellow" href={hrefAgendar} data-cta="barra-agendar">{agendar}</a>
        </div>
      </div>
    </div>
  );
}
