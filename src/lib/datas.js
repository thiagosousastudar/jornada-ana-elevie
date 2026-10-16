// Dia da jornada calculado no fuso da campanha (America/Sao_Paulo), com liberação às 06:00.

function partesNoFuso(data, fuso) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: fuso, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(data);
  const v = Object.fromEntries(p.map((x) => [x.type, x.value]));
  return { data: `${v.year}-${v.month}-${v.day}`, hora: `${v.hour === '24' ? '00' : v.hour}:${v.minute}` };
}

const diasEntre = (a, b) => Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 864e5);

// Retorna o dia liberado (1..21), 0 se ainda não começou e 22 se já terminou.
export function diaAtual(campanha, agora = new Date()) {
  const { data, hora } = partesNoFuso(agora, campanha.fuso);
  let n = diasEntre(campanha.inicio, data) + 1;
  if (hora < String(campanha.liberacao).slice(0, 5)) n -= 1; // antes das 06:00 vale o dia anterior
  return Math.max(0, Math.min(22, n));
}

export function dataDoDia(campanha, n) {
  const d = new Date(campanha.inicio + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n - 1);
  return d;
}

export const fmtLongo = (campanha, n) =>
  dataDoDia(campanha, n).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });

export const fmtCurto = (campanha, n) =>
  dataDoDia(campanha, n).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
