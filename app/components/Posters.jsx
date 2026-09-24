import Image from "next/image";
import { Rich } from "@/lib/rich";

// Recriação em texto das artes "Consultoria Premium" e "Quem é".
// Todas as medidas estão em pixels da arte original (1080 x 1182) e escalam com a largura (var --u).
const Check = () => (
  <svg className="pst-check" viewBox="0 0 24 24" aria-hidden="true">
    <rect x="1" y="1" width="22" height="22" rx="3" />
    <path d="M6 12.5l4 4 8-9" />
  </svg>
);

const lines = (t = "") => String(t).split("\n");

export function ConsultoriaPremium({ d }) {
  return (
    <div className="pst pst--premium">
      <Image className="pst-bg" src={d.fundo.src} alt={d.fotoAlt} fill sizes="(max-width: 767px) 100vw, 768px" />
      <h3 className="pst-title pst-title--premium">{lines(d.cardTitulo).map((l, i) => <span key={i}>{l}</span>)}</h3>
      <ul className="pst-list">
        {d.itens.map((it, i) => <li key={i}><Check /><span><Rich text={it} /></span></li>)}
      </ul>
    </div>
  );
}

export function QuemE({ d }) {
  return (
    <div className="pst pst--quem">
      <Image className="pst-bg" src={d.fundo.src} alt={d.fotoAlt} fill sizes="(max-width: 767px) 100vw, 768px" />
      <h3 className="pst-title pst-title--quem">{lines(d.titulo).map((l, i) => <span key={i}>{l}</span>)}</h3>
      <p className="pst-p pst-p--1"><Rich text={d.texto} /></p>
      <p className="pst-p pst-spec-title"><b>{d.especTitulo}</b></p>
      <ul className="pst-spec">
        {d.espec.map((it, i) => <li key={i}><Check /><span><Rich text={it} /></span></li>)}
        {d.conquista && <li className="pst-trophy"><span aria-hidden="true">🏆</span><span><Rich text={d.conquista} /></span></li>}
      </ul>
      <p className="pst-p pst-p--2"><Rich text={d.fechamento} /></p>
      <p className="pst-p pst-invite"><Rich text={d.convite} /></p>
    </div>
  );
}
