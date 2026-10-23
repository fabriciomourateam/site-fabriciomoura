"use client";
import { useState } from "react";

// Mesmas contas da calculadora do WordPress: IMC (faixas da OMS) e gasto calórico por Mifflin-St Jeor.
const WPP = "5511914849797";
const wa = (m) => `https://wa.me/${WPP}?text=${encodeURIComponent(m)}`;
const r10 = (n) => Math.round(n / 10) * 10;
const fmt = (n) => n.toLocaleString("pt-BR");
const num = (v) => parseFloat(String(v).replace(",", "."));

const FAIXAS = [
  [18.5, "Abaixo do peso", "#4f8cff", "Seu IMC indica peso abaixo do ideal. Ganhar massa com qualidade pede estratégia, e eu posso montar a sua."],
  [25, "Peso normal", "#3ad07f", "Peso na faixa saudável. O próximo nível é a recomposição: menos gordura e mais músculo."],
  [30, "Sobrepeso", "#FCD404", "Seu IMC indica sobrepeso. Dá para virar esse jogo ganhando músculo e perdendo gordura, com método e garantia."],
  [35, "Obesidade grau I", "#ff9f43", "Seu IMC indica obesidade grau I. Com o acompanhamento certo, a virada acontece. Bora conversar sobre o seu caso."],
  [40, "Obesidade grau II", "#ff7a43", "Seu IMC indica obesidade grau II. Recomendo acompanhamento profissional, e posso te orientar com segurança."],
  [Infinity, "Obesidade grau III", "#ff6b6b", "Seu IMC indica obesidade grau III. O acompanhamento é essencial. Fale comigo para começarmos com segurança."],
];
const ATIVIDADE = [
  ["1.2", "Sedentário (pouco ou nenhum treino)"],
  ["1.375", "Leve (treino 1 a 3x por semana)"],
  ["1.55", "Moderado (treino 3 a 5x por semana)"],
  ["1.725", "Intenso (treino 6 a 7x por semana)"],
  ["1.9", "Muito intenso (2x ao dia, trabalho físico)"],
];

const Whats = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M.057 24l1.687-6.163a11.867 11.867 0 01-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 018.413 3.488 11.824 11.824 0 013.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 01-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884a9.866 9.866 0 001.51 5.26l-.999 3.648 3.978-1.607z" /></svg>
);
// O Tracking do site usa data-msg para montar o link final (com o código do anúncio, se houver)
const BotaoWhats = ({ msg, children }) => (
  <a className="bl-btn bl-btn--lg" href={wa(msg)} data-msg={msg} target="_blank" rel="noopener">
    {children}<span className="bl-ico"><Whats /></span>
  </a>
);

function Campo({ label, ...p }) {
  return (
    <label className="cx-field">
      <span>{label}</span>
      <input inputMode="decimal" type="number" {...p} />
    </label>
  );
}

export default function Calculadora() {
  const [aba, setAba] = useState("imc");
  const [f, setF] = useState({ peso: "", altura: "", idade: "", pesoT: "", alturaT: "", sexo: "h", ativ: "1.55" });
  const [imc, setImc] = useState(null);
  const [tdee, setTdee] = useState(null);
  const [erro, setErro] = useState("");
  const set = (k) => (e) => { setF((o) => ({ ...o, [k]: e.target.value })); setErro(""); };

  const calcIMC = () => {
    const p = num(f.peso), a = num(f.altura) / 100;
    if (!p || !a || p <= 0 || a <= 0) return setErro("Preencha peso e altura corretamente.");
    const v = p / (a * a);
    const [, cls, cor, msg] = FAIXAS.find(([lim]) => v < lim);
    setImc({ v, cls, cor, msg, pct: Math.max(0, Math.min(100, ((v - 15) / (40 - 15)) * 100)), id: Date.now() });
  };
  const calcTDEE = () => {
    const idade = parseInt(f.idade, 10), p = num(f.pesoT), a = num(f.alturaT), fat = parseFloat(f.ativ);
    if (!idade || !p || !a || idade <= 0 || p <= 0 || a <= 0) return setErro("Preencha idade, peso e altura corretamente.");
    const tmb = 10 * p + 6.25 * a - 5 * idade + (f.sexo === "h" ? 5 : -161);
    const t = tmb * fat;
    setTdee({ t: r10(t), tmb: r10(tmb), cut: r10(t - 500), bulk: r10(t + 300), prot: `${Math.round(p * 1.6)} a ${Math.round(p * 2.2)} g`, id: Date.now() });
  };
  const enter = (fn) => (e) => { if (e.key === "Enter") fn(); };
  const imcTxt = imc ? imc.v.toFixed(1).replace(".", ",") : "";

  return (
    <div className="cx-shell">
      <div className="cx-core">
        <div className="cx-tabs" role="tablist" aria-label="Escolha a calculadora">
          {[["imc", "IMC"], ["tdee", "Gasto calórico"]].map(([k, t]) => (
            <button key={k} type="button" role="tab" aria-selected={aba === k} onClick={() => { setAba(k); setErro(""); }}>{t}</button>
          ))}
          <span className="cx-tabs__pill" style={{ transform: `translateX(${aba === "imc" ? 0 : 100}%)` }} aria-hidden="true" />
        </div>

        {aba === "imc" ? (
          <div className="cx-pane" role="tabpanel">
            <div className="cx-row">
              <Campo label="Peso (kg)" placeholder="82" value={f.peso} onChange={set("peso")} onKeyDown={enter(calcIMC)} />
              <Campo label="Altura (cm)" placeholder="178" value={f.altura} onChange={set("altura")} onKeyDown={enter(calcIMC)} />
            </div>
            {erro && <p className="cx-erro" role="alert">{erro}</p>}
            <button className="cx-go" type="button" onClick={calcIMC}>Ver meu resultado</button>

            {imc && (
              <div className="cx-res" key={imc.id}>
                <div className="cx-big">
                  <span className="cx-big__n bl-gold">{imcTxt}</span>
                  <span className="cx-big__l">Seu IMC</span>
                  <span className="cx-tag" style={{ background: imc.cor }}>{imc.cls}</span>
                </div>
                <div className="cx-scale" aria-hidden="true">
                  <div className="cx-scale__bar"><span className="cx-scale__pin" style={{ "--pct": `${imc.pct}%` }} /></div>
                  <div className="cx-scale__ticks"><span>Abaixo</span><span>Ideal</span><span>Sobrepeso</span><span>Obesidade</span></div>
                </div>
                <p className="cx-hint">
                  <span aria-hidden="true">⚠️</span>
                  O IMC não separa músculo de gordura. Se você treina pesado, ele pode te marcar como acima do peso sem motivo.
                  Para um número que reflete o seu corpo de verdade, fale comigo.
                </p>
                <div className="cx-cta">
                  <p>{imc.msg}</p>
                  <BotaoWhats msg={`Oi Fabricio! Calculei meu IMC no seu site (${imcTxt}, ${imc.cls}) e quero saber como melhorar meus resultados.`}>Falar com o Fabricio</BotaoWhats>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="cx-pane" role="tabpanel">
            <div className="cx-field">
              <span>Sexo</span>
              <div className="cx-seg">
                {[["h", "Homem"], ["m", "Mulher"]].map(([v, t]) => (
                  <button key={v} type="button" aria-pressed={f.sexo === v} onClick={() => setF((o) => ({ ...o, sexo: v }))}>{t}</button>
                ))}
              </div>
            </div>
            <div className="cx-row cx-row--3">
              <Campo label="Idade" inputMode="numeric" placeholder="32" value={f.idade} onChange={set("idade")} onKeyDown={enter(calcTDEE)} />
              <Campo label="Peso (kg)" placeholder="82" value={f.pesoT} onChange={set("pesoT")} onKeyDown={enter(calcTDEE)} />
              <Campo label="Altura (cm)" placeholder="178" value={f.alturaT} onChange={set("alturaT")} onKeyDown={enter(calcTDEE)} />
            </div>
            <label className="cx-field">
              <span>Nível de atividade</span>
              <select value={f.ativ} onChange={set("ativ")}>
                {ATIVIDADE.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
              </select>
            </label>
            {erro && <p className="cx-erro" role="alert">{erro}</p>}
            <button className="cx-go" type="button" onClick={calcTDEE}>Ver meu resultado</button>

            {tdee && (
              <div className="cx-res" key={tdee.id}>
                <div className="cx-big">
                  <span className="cx-big__n bl-gold">{fmt(tdee.t)}</span>
                  <span className="cx-big__l">Calorias para manter o peso por dia</span>
                </div>
                <div className="cx-minis">
                  <div><b>{fmt(tdee.tmb)}</b><span>Metabolismo basal</span></div>
                  <div className="is-cut"><b>{fmt(tdee.cut)}</b><span>Para emagrecer</span></div>
                  <div className="is-bulk"><b>{fmt(tdee.bulk)}</b><span>Para ganhar massa</span></div>
                </div>
                <p className="cx-prot">Proteína recomendada: <b>{tdee.prot}</b> por dia para preservar e ganhar músculo</p>
                <div className="cx-cta">
                  <p>Saber o número é só o começo. <b>O resultado vem do plano certo para você.</b> Monto sua estratégia de nutrição e treino com acompanhamento de perto e garantia.</p>
                  <BotaoWhats msg={`Oi Fabricio! Calculei meu gasto calórico no seu site (${fmt(tdee.t)} kcal por dia) e quero um plano para atingir meus objetivos.`}>Quero meu plano</BotaoWhats>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
