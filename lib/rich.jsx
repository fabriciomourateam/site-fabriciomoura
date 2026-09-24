import { Fragment } from "react";

// Converte **texto** em destaque e quebras de linha em <br>, sem HTML cru.
export function Rich({ text = "", strongClass }) {
  const lines = String(text).split("\n");
  return lines.map((line, i) => (
    <Fragment key={i}>
      {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) =>
        part.startsWith("**") && part.endsWith("**") && part.length > 4
          ? strongClass ? <span key={j} className={strongClass}>{part.slice(2, -2)}</span> : <b key={j}>{part.slice(2, -2)}</b>
          : <Fragment key={j}>{part}</Fragment>
      )}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}

// Parágrafos separados por linha em branco
export function Paragraphs({ text = "", className }) {
  return String(text).split(/\n\s*\n/).map((p, i) => <p key={i} className={className}><Rich text={p} /></p>);
}
