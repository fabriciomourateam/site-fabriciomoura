"use client";
import Image from "next/image";
import { useRef } from "react";

export default function Carousel({ images, variant, label }) {
  const track = useRef(null);
  const go = (dir) => {
    const el = track.current;
    const slide = el?.firstElementChild;
    if (!slide) return;
    const step = slide.getBoundingClientRect().width + parseFloat(getComputedStyle(el).columnGap || 0);
    const max = el.scrollWidth - el.clientWidth - 2;
    if (dir > 0 && el.scrollLeft >= max) el.scrollTo({ left: 0, behavior: "smooth" });
    else if (dir < 0 && el.scrollLeft <= 2) el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
    else el.scrollBy({ left: dir * step, behavior: "smooth" });
  };
  return (
    <div className={`carousel carousel--${variant}`} role="region" aria-roledescription="carrossel" aria-label={label}>
      <button className="carousel__arrow carousel__arrow--prev" onClick={() => go(-1)} aria-label="Resultado anterior">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
      </button>
      <ul className="carousel__track" ref={track}>
        {images.map((img, i) => (
          <li className="carousel__slide" key={img.src}>
            <Image src={img.src} alt={img.alt} width={img.w} height={img.h}
              sizes={variant === "tall" ? "(max-width: 767px) 80vw, 360px" : "(max-width: 767px) 86vw, 400px"} />
          </li>
        ))}
      </ul>
      <button className="carousel__arrow carousel__arrow--next" onClick={() => go(1)} aria-label="Próximo resultado">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7" /></svg>
      </button>
    </div>
  );
}
