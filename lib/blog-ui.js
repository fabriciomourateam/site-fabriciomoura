// Bento do blog: linhas que alternam 7+5, 4+4+4, 5+7, 4+4+4 (de 12 colunas).
// A última linha sempre fecha certinho (1 cartão = largura toda; 2 cartões = metade cada).
const LINHAS = [[7, 5], [4, 4, 4], [5, 7], [4, 4, 4]];
export function bento(n) {
  const out = [];
  let r = 0;
  while (out.length < n) {
    const linha = LINHAS[r++ % LINHAS.length];
    const falta = n - out.length;
    if (falta >= linha.length) out.push(...linha);
    else out.push(...(falta === 1 ? [12] : Array(falta).fill(12 / falta)));
  }
  return out;
}
