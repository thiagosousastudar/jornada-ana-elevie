// Protótipo clicável — Jornada Ana + Eleviê (Fase A).
// Tudo roda no navegador; o estado fica no localStorage só para a demonstração.

(function () {
  'use strict';

  const J = window.JORNADA;
  const KEY = 'jornada-proto-v1';
  const ME = 'p1';
  const REVISOR = 'Equipe Eleviê (demo)';

  // Ícones de traço no estilo SF Symbols (24×24, herdam a cor do texto).
  const ICONS = {
    house: '<path d="M3.5 10.5 12 3.5l8.5 7"/><path d="M5.5 9v10.5a1 1 0 0 0 1 1H10v-6h4v6h3.5a1 1 0 0 0 1-1V9"/>',
    chart: '<path d="M5 20v-6"/><path d="M10 20V9"/><path d="M15 20v-9"/><path d="M20 20V5"/>',
    bubble: '<path d="M20.5 11.5a8 8 0 0 1-11.7 7.1L4 20l1.4-4.3A8 8 0 1 1 20.5 11.5Z"/>',
    tray: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><path d="m4 7 8 6 8-6"/>',
    bell: '<path d="M18 15.5V11a6 6 0 1 0-12 0v4.5L4.5 17.5h15Z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
    fork: '<path d="M7 3v7.5"/><path d="M4.5 3v4.5a2.5 2.5 0 0 0 5 0V3"/><path d="M7 10.5V21"/><path d="M17.5 21V3c-2.5 1.2-3.5 4-3.5 7.5 0 1.5.8 2.5 2 2.5h1.5"/>',
    walk: '<circle cx="13.5" cy="4.5" r="1.8"/><path d="m9.5 21 2.3-6.2 2.7 2.7V21"/><path d="M7 12.5 9.5 9l4-.5 2 3 2.5 1"/><path d="m11.8 14.8-.8-5.8"/>',
    leaf: '<path d="M5 19.5C5 10.5 10.5 5 19.5 4.5 19.5 13.5 14 19 5 19.5Z"/><path d="M5 19.5 13 11.5"/>',
    share: '<path d="M12 3.5v11"/><path d="m8 7.5 4-4 4 4"/><path d="M8.5 10.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5a2 2 0 0 0-2-2h-1.5"/>',
    camera: '<path d="M4 8.5A2 2 0 0 1 6 6.5h1.8l1.5-2h5.4l1.5 2H18a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2Z"/><circle cx="12" cy="12.5" r="3.5"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    chevron: '<path d="m9.5 5.5 6.5 6.5-6.5 6.5"/>',
    back: '<path d="M15 5.5 8.5 12l6.5 6.5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    play: '<path d="M8 5.5v13l10.5-6.5Z" fill="currentColor"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    photo: '<rect x="3.5" y="5" width="17" height="14" rx="3"/><circle cx="9" cy="10" r="1.6"/><path d="m4 17 5-4.5 3.5 3 3-2.5 4.5 4"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 9.5h17"/><path d="M8 3v4"/><path d="M16 3v4"/>',
    download: '<path d="M12 4v11"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M5 19.5h14"/>',
    sparkle: '<path d="M12 3.5c.6 4.4 2.6 6.4 7 7-4.4.6-6.4 2.6-7 7-.6-4.4-2.6-6.4-7-7 4.4-.6 6.4-2.6 7-7Z"/>',
    eyeoff: '<path d="M3.5 3.5 20.5 20.5"/><path d="M10 6.2A9 9 0 0 1 21 12a12 12 0 0 1-2.4 3.2M6.2 7.4A11.5 11.5 0 0 0 3 12s3.3 6 9 6a8.5 8.5 0 0 0 3.6-.8"/>',
    warn: '<path d="M12 4 21 19.5H3Z"/><path d="M12 10v4"/><path d="M12 17v.01"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    person: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
  };
  const ic = (name, cls) => `<svg class="i${cls ? ' ' + cls : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;

  // Emojis usados nos textos da interface viram ícones na hora de desenhar a tela.
  const EMOJI_ICONE = { '🔒': 'lock', '📷': 'camera', '🎥': 'play', '📊': 'chart', '🕶': 'eyeoff', '⚠': 'warn', '📢': 'bell', '🔗': 'link', '📋': 'copy', '📱': 'photo', '💬': 'bubble', '✅': 'check', '🎉': 'sparkle' };
  const decorar = (html) => html
    .replace(/[🔒📷🎥📊🕶⚠📢🔗📋📱💬✅🎉]️?/gu, (m) => ic(EMOJI_ICONE[m.replace('️', '')], 'e'))
    .replace(/⬜/g, '<span class="i e empty-dot"></span>');

  const FRENTES = {
    alimentacao: { nome: 'Alimentação', ic: ic('fork') },
    movimento: { nome: 'Movimento', ic: ic('walk') },
    mentalidade: { nome: 'Mentalidade', ic: ic('leaf') },
    compartilhar: { nome: 'Compartilhar', ic: ic('share') },
  };
  const STATUS = {
    nao_iniciada: 'Não iniciada',
    em_andamento: 'Rascunho salvo',
    aguardando_revisao: 'Aguardando revisão',
    registrada: 'Registrada',
    aprovada: 'Aprovada',
    precisa_ajuste: 'Precisa de ajuste',
    nao_realizada: 'Não realizada',
  };
  const ENVIADAS = ['aguardando_revisao', 'registrada', 'aprovada'];
  const MOTIVOS_NAO = ['Prefiro não dizer', 'Falta de tempo', 'Não me senti bem', 'Imprevisto'];
  const MOTIVOS_IG = ['Meu perfil é fechado', 'Prefiro não me expor', 'Não deu tempo', 'Prefiro não dizer'];
  const MOTIVOS_AJUSTE = [
    'A foto não mostra o que a tarefa pede.',
    'Não dá para ver os itens pedidos no critério.',
    'A foto está escura ou desfocada.',
    'A foto parece ser de outro dia ou de outra tarefa.',
    'A foto mostra rostos de outras pessoas. Envie outra só com a comida ou a atividade.',
  ];
  const FEITO = { sim: 'Sim', parte: 'Em parte', nao: 'Não' };

  // ---------- Utilidades ----------
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const clone = (o) => JSON.parse(JSON.stringify(o));
  const $ = (sel, el) => (el || document).querySelector(sel);
  const $$ = (sel, el) => Array.from((el || document).querySelectorAll(sel));

  function mulberry(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const hash = (s) => Array.from(s).reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
  const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];

  function dayDate(n) {
    const d = new Date(J.campanha.inicio + 'T00:00:00');
    d.setDate(d.getDate() + n - 1);
    return d;
  }
  function stamp(n, h, m) {
    const d = dayDate(n);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
  }
  const nowStamp = () => { const r = new Date(); return stamp(S.simDay, r.getHours(), r.getMinutes()); };
  const DIAS_SEM = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
  const pad = (n) => String(n).padStart(2, '0');
  const fmtDia = (n) => { const d = dayDate(n); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} (${DIAS_SEM[d.getDay()]})`; };
  const fmtLongo = (n) => dayDate(n).toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  const fmtDT = (iso) => { if (!iso) return '—'; const d = new Date(iso); return `${pad(d.getDate())}/${pad(d.getMonth() + 1)} ${pad(d.getHours())}:${pad(d.getMinutes())}`; };

  function plate(seed) {
    const r = mulberry(seed);
    const cols = ['#e4572e', '#f3a712', '#76b041', '#2e8b57', '#ffc914', '#a23b72', '#f18f01', '#5aa469', '#d1495b'];
    let blobs = '';
    for (let i = 0; i < 6; i++) {
      const a = r() * 6.28, dist = r() * 55, x = 150 + Math.cos(a) * dist, y = 150 + Math.sin(a) * dist;
      blobs += `<ellipse cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" rx="${(16 + r() * 20).toFixed(0)}" ry="${(12 + r() * 16).toFixed(0)}" fill="${pick(r, cols)}" transform="rotate(${(r() * 180).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)})"/>`;
    }
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="#c9a77c"/><circle cx="150" cy="150" r="122" fill="#ece6da"/><circle cx="150" cy="150" r="100" fill="#fff"/>${blobs}</svg>`);
  }
  function walk(seed) {
    const r = mulberry(seed);
    const sky = pick(r, ['#bfe3f2', '#d7ecf5', '#f6d9b8']);
    const grass = pick(r, ['#8cc084', '#7bb274', '#a3c97f']);
    const x = (90 + r() * 120).toFixed(0);
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><rect width="300" height="300" fill="${sky}"/><circle cx="${(40 + r() * 220).toFixed(0)}" cy="60" r="22" fill="#fff4c2"/><path d="M0 170 Q80 ${(130 + r() * 30).toFixed(0)} 160 165 T300 150 V300 H0Z" fill="${grass}"/><path d="M${x} 300 L${Number(x) + 70} 300 L160 165 L150 165Z" fill="#d8cbb4"/><circle cx="60" cy="150" r="26" fill="#4f8a55"/><rect x="57" y="165" width="6" height="25" fill="#6b4f3a"/><circle cx="250" cy="140" r="20" fill="#4f8a55"/><rect x="247" y="152" width="6" height="22" fill="#6b4f3a"/></svg>`);
  }
  // Print fictício de um Stories com as marcações.
  function insta(seed) {
    const r = mulberry(seed);
    const bg = pick(r, [['#f9d7c5', '#e9a38b'], ['#d9ead3', '#9cc49a'], ['#f3e1f5', '#c9a0d6']]);
    const tags = J.campanha.instagram.map((i, k) => `<rect x="40" y="${300 + k * 46}" width="220" height="34" rx="17" fill="#fff" opacity=".92"/><text x="150" y="${322 + k * 46}" font-family="sans-serif" font-size="15" font-weight="700" text-anchor="middle" fill="#c13584">${i.usuario}</text>`).join('');
    return 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 533"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs><rect width="300" height="533" fill="url(#g)"/><rect x="12" y="12" width="276" height="4" rx="2" fill="#fff" opacity=".7"/><circle cx="30" cy="38" r="12" fill="#fff"/><circle cx="150" cy="170" r="80" fill="#fff" opacity=".9"/><circle cx="150" cy="170" r="60" fill="${pick(r, ['#76b041', '#f3a712', '#e4572e'])}"/>${tags}<text x="150" y="470" font-family="sans-serif" font-size="14" font-weight="700" text-anchor="middle" fill="#fff">${J.campanha.hashtag}</text></svg>`);
  }
  const fotoSrc = (f) => {
    if (!f) return f;
    if (f.startsWith('plate:')) return plate(Number(f.slice(6)));
    if (f.startsWith('walk:')) return walk(Number(f.slice(5)));
    if (f.startsWith('insta:')) return insta(Number(f.slice(6)));
    return f;
  };
  const pedeFoto = (t) => t.evidencia && t.evidencia.foto !== 'nao' && t.registro.tipo !== 'privado';

  // ---------- Estado ----------
  let S = null;
  let ui = {};

  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch (e) { /* sem storage */ }
    return null;
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {
      // Sem storage ou cheio (fotos ocupam espaço): a demo segue só em memória.
      if (e && e.name === 'QuotaExceededError') toast('Espaço do navegador cheio: as fotos novas não ficarão salvas ao recarregar. Use “Reiniciar dados”.');
    }
  }

  function fakeConsent(rng, em) {
    const c = (aceito) => ({ aceito, em, versao: 'v1.0' });
    return {
      termos: c(true), saude: c(true),
      comunicacoes: c(rng() < 0.75),
      repost: { ...c(rng() < 0.35), escopo: 'Stories de @eleviê e @dra.nellykim durante a campanha' },
      historico: [],
    };
  }

  // Gera (ou completa) o histórico fictício até o dia simulado.
  function seed(simDay, keep) {
    const st = {
      v: 6,
      simDay,
      sessao: keep ? keep.sessao : { logado: false, perfilOk: false, boasVindas: false, metodo: null },
      days: keep ? keep.days : clone(J.days),
      semanas: keep && keep.semanas ? keep.semanas : clone(J.campanha.semanas),
      cta: keep && keep.cta ? keep.cta : {},
      instagram: keep && keep.instagram ? keep.instagram : clone(J.campanha.instagram),
      participantes: J.participantes.map((p) => {
        const antes = keep && keep.participantes.find((x) => x.id === p.id);
        return { id: p.id, nome: antes ? antes.nome : p.nome, apelido: antes ? antes.apelido : '', email: antes ? antes.email : p.email, metodo: antes ? antes.metodo : (p.voce ? null : (hash(p.id) % 3 ? 'google' : 'email')), cidade: p.cidade, engaj: p.engaj, voce: !!p.voce, entrada: stamp(1, 0, 0) };
      }),
      consent: {},
      registros: {},
      checkins: {},
      log: keep ? keep.log : [],
    };
    st.participantes.forEach((p) => {
      const rng = mulberry(hash(p.id));
      const regs = (st.registros[p.id] = {});
      const cks = (st.checkins[p.id] = {});
      if (keep) {
        // Ao mudar o dia simulado, preserva tudo o que já foi feito na demo e só completa o que falta.
        st.consent[p.id] = keep.consent[p.id];
        Object.assign(regs, keep.registros[p.id]);
        Object.assign(cks, keep.checkins[p.id]);
      } else {
        st.consent[p.id] = p.voce ? null : fakeConsent(rng, new Date(dayDate(1).getTime() - 3 * 864e5).toISOString());
      }
      for (let d = 1; d <= simDay; d++) {
        const day = st.days[d - 1];
        if (p.voce && d === simDay) break; // o dia de hoje fica para você fazer na demo
        day.tarefas.forEach((t) => {
          if (regs[t.id]) return;
          const g = genReg(p, d, t, mulberry(hash(p.id + t.id)), simDay);
          if (g) regs[t.id] = g;
        });
        if (!cks[d]) {
          const r = mulberry(hash(p.id + 'ck' + d));
          const chance = d === simDay ? p.engaj * 0.4 : p.engaj * 0.95;
          if (r() < chance) {
            const dd = st.days[d - 1];
            cks[d] = { feito: pick(r, ['sim', 'sim', 'sim', 'parte', 'nao']), palavra: pick(r, J.palavras), em: stamp(d, 20 + Math.floor(r() * 3), Math.floor(r() * 60)) };
            if (dd.enquete) cks[d].enquete = pick(r, dd.enquete.opcoes);
            if (dd.balanco) cks[d].balanco = dd.balanco.perguntas.map(() => pick(r, J.respostasExemplo));
          }
        }
      }
      // Interesse em avaliação (botão dos dias 18 e 21) para as participantes fictícias.
      if (!p.voce && simDay >= 18 && !st.cta[p.id] && rng() < 0.3) st.cta[p.id] = [{ dia: 18, em: stamp(18, 21, 5) }];
      // Na demo, "você" tem um ajuste pendente no dia 3 para mostrar o fluxo de correção.
      if (p.voce && !keep && simDay > 3) {
        regs['d3-ali'] = {
          status: 'precisa_ajuste', respostas: { campos: [''] }, foto: 'plate:303', enviadoEm: stamp(3, 13, 10),
          revisao: { por: REVISOR, em: stamp(4, 9, 40), decisao: 'ajuste', motivo: 'A foto não mostra o prato inteiro — dá para ver só uma parte. Pode enviar outra foto mostrando a refeição completa?' },
          historico: [{ em: stamp(3, 13, 10), acao: 'Enviado pela participante' }, { em: stamp(4, 9, 40), acao: `Ajuste solicitado por ${REVISOR}` }],
        };
      }
    });
    // Caixinha: mensagens fictícias até o dia simulado. As que a equipe ainda não tocou
    // avançam para o estado final quando o dia simulado passa.
    const cx = keep && keep.caixinha ? keep.caixinha.slice() : [];
    J.caixinhaExemplos.forEach((e) => {
      if (e.dia > simDay) return;
      const i = cx.findIndex((c) => c.id === e.id);
      if (i >= 0 && (cx[i].mexido || cx[i].status !== 'nova')) return;
      const novo = cxSeed(e, simDay);
      if (i >= 0) cx[i] = novo; else cx.push(novo);
    });
    st.caixinha = cx;
    return st;
  }

  function cxSeed(e, simDay) {
    const em = stamp(e.dia, 21, 10 + (Math.abs(hash(e.id)) % 40));
    const c = { id: e.id, autorId: e.autor, anonima: e.anonima, dia: e.dia, em, texto: e.texto, sobre: e.sobre, tag: null, status: 'nova', destino: null, historico: [{ em, acao: 'Recebida' }] };
    if (e.dia < simDay - 1) {
      const f = e.final;
      const tri = stamp(e.dia + 1, 9, 30);
      c.tag = e.tag; c.status = f.status; c.destino = f.destino;
      c.historico.push({ em: tri, acao: f.status === 'arquivada' ? 'Arquivada na triagem' : f.destino === 'nelly' ? 'Triagem: clínica, enviada à Dra. Nelly' : 'Triagem: a equipe responde' });
      if (f.resposta) {
        const rem = stamp(e.dia + 1, 15, 0);
        c.resposta = { ...f.resposta, em: rem };
        c.historico.push({ em: rem, acao: `Respondida por ${f.resposta.por}${f.resposta.publica ? ' (publicada no mural)' : ''}` });
      }
    }
    return c;
  }

  function genReg(p, d, t, rng, simDay) {
    const today = d === simDay;
    const chance = today ? p.engaj * 0.55 : p.engaj;
    const em = stamp(d, 7 + Math.floor(rng() * 15), Math.floor(rng() * 60));
    if (rng() > chance) {
      if (!today && rng() < 0.3) return { status: 'nao_realizada', motivo: pick(rng, MOTIVOS_NAO), enviadoEm: em, historico: [{ em, acao: 'Marcada como não realizada' }] };
      return null;
    }
    const reg = { status: 'registrada', respostas: {}, enviadoEm: em, historico: [{ em, acao: 'Enviado pela participante' }] };
    const r = t.registro;
    if (r.tipo === 'autorrelato') {
      reg.respostas = { modo: rng() < 0.8 ? 'fiz' : 'adaptado', opcao: r.opcoes ? pick(rng, r.opcoes) : null };
    } else if (r.tipo === 'texto') {
      reg.respostas = { campos: r.campos.map((c) => (c.obrigatorio || rng() < 0.5 ? pick(rng, J.respostasExemplo) : '')) };
    } else if (r.tipo === 'checklist') {
      const m = r.itens.map((_, i) => i).filter(() => rng() < 0.75);
      reg.respostas = { marcados: m.length >= r.minimo ? m : [0] };
    } else if (r.tipo === 'privado') {
      reg.respostas = { confirmados: r.itens.map((_, i) => i).filter((i) => i === 0 || rng() < 0.6) };
    } else if (r.tipo === 'compartilhar') {
      reg.respostas = { marcou: true, link: rng() < 0.6 ? `https://www.instagram.com/p/${Math.abs(hash(p.id + t.id)).toString(36)}/` : '' };
    }
    if (pedeFoto(t) && (t.evidencia.foto === 'obrigatoria' || rng() < 0.5)) {
      reg.foto = ({ movimento: 'walk:', compartilhar: 'insta:' }[t.frente] || 'plate:') + Math.abs(hash(p.id + t.id));
      if (d >= simDay - 1) {
        reg.status = 'aguardando_revisao';
      } else {
        const ok = rng() < 0.85;
        const rem = stamp(d + 1, 9 + Math.floor(rng() * 6), Math.floor(rng() * 60));
        reg.status = ok ? 'aprovada' : 'precisa_ajuste';
        reg.revisao = { por: REVISOR, em: rem, decisao: ok ? 'aprovada' : 'ajuste', motivo: ok ? '' : pick(rng, MOTIVOS_AJUSTE) };
        reg.historico.push({ em: rem, acao: ok ? `Aprovada por ${REVISOR}` : `Ajuste solicitado por ${REVISOR}` });
      }
    }
    // Compartilhamento sem print precisa ter o link.
    if (r.tipo === 'compartilhar' && !reg.foto && !reg.respostas.link) reg.respostas.link = `https://www.instagram.com/stories/${p.id}/`;
    return reg;
  }

  function init() {
    S = load();
    if (!S || S.v !== 6) { S = seed(5); save(); }
  }

  // ---------- Consultas ----------
  const dayOf = (n) => S.days[n - 1];
  function findTask(id) {
    for (const d of S.days) for (const t of d.tarefas) if (t.id === id) return { day: d, task: t };
    return null;
  }
  const getReg = (pid, tid) => (S.registros[pid] && S.registros[pid][tid]) || { status: 'nao_iniciada' };
  function setReg(pid, tid, reg) { S.registros[pid] = S.registros[pid] || {}; S.registros[pid][tid] = reg; }
  const person = (pid) => S.participantes.find((p) => p.id === pid);
  const isPrivate = (t) => t.registro.tipo === 'privado' || !!t.registro.privado;
  const tasksUpTo = (n) => S.days.slice(0, n).flatMap((d) => d.tarefas.map((t) => ({ day: d, task: t })));

  function stats(pid, upTo) {
    const s = { esperadas: 0, enviadas: 0, revisao: 0, ajuste: 0, nao: 0, pendentes: 0 };
    tasksUpTo(upTo).forEach(({ task }) => {
      s.esperadas++;
      const st = getReg(pid, task.id).status;
      if (ENVIADAS.includes(st)) s.enviadas++;
      if (st === 'aguardando_revisao') s.revisao++;
      if (st === 'precisa_ajuste') s.ajuste++;
      if (st === 'nao_realizada') s.nao++;
      if (st === 'nao_iniciada' || st === 'em_andamento') s.pendentes++;
    });
    s.pct = s.esperadas ? Math.round((s.enviadas / s.esperadas) * 100) : 0;
    return s;
  }
  function dotClass(st) {
    if (st === 'registrada' || st === 'aprovada') return 'done';
    if (st === 'aguardando_revisao') return 'wait';
    if (st === 'precisa_ajuste') return 'fix';
    if (st === 'nao_realizada') return 'skip';
    return '';
  }
  function badge(st, t) {
    const label = STATUS[st] || st;
    if (st === 'registrada' && t && isPrivate(t)) return `<span class="badge b-privada">🔒 Registrada</span>`;
    const title = st === 'registrada' ? ' title="Autorrelato: registrado pela participante, sem verificação"' : '';
    return `<span class="badge b-${st}"${title}>${label}</span>`;
  }
  function tipoDesc(t) {
    const r = t.registro;
    const soFoto = r.tipo === 'texto' && r.campos.every((c) => !c.obrigatorio);
    let base;
    switch (r.tipo) {
      case 'autorrelato': base = 'Marcar que fez'; break;
      case 'texto': base = r.privado ? 'Resposta escrita · só você vê' : r.campos.length > 1 ? `${r.campos.length} respostas curtas` : 'Resposta curta'; break;
      case 'checklist': base = 'Marcar os hábitos do dia'; break;
      case 'privado': return 'Só confirmar · nada é enviado';
      case 'compartilhar': return 'Postar marcando os 3 perfis · link ou print';
      default: base = '';
    }
    if (!pedeFoto(t)) return base;
    if (t.evidencia.foto === 'obrigatoria') return soFoto ? '📷 Foto de comprovação' : `📷 Foto de comprovação + ${base.toLowerCase()}`;
    return `${base} · foto opcional`;
  }

  const igValido = (u) => /^@[a-z0-9._]{1,30}$/.test(u || '');
  // Como a participante prefere ser chamada (apelido ou primeiro nome).
  const chamado = (p) => (p.apelido || p.nome || '').trim().split(/\s+/)[0];
  // Logo do Google (marca usada só no botão de entrar, como pede o guia de marca do Google).
  const GOOGLE_G = '<svg class="g-logo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.1.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
  const semanaLabel = (n) => `Semana ${n} · ${(S.semanas[n - 1] || {}).nome || ''}`;
  const nellyVisivel = (d) => d.nelly && d.nelly.status === 'aprovado';
  const NELLY_STATUS = { rascunho: 'Rascunho', em_revisao: 'Em revisão pela Dra. Nelly', aprovado: 'Aprovado pela Dra. Nelly' };
  const msgCta = () => `Olá! Vim pela ${J.campanha.nome.split(' — ')[0]} e quero conversar sobre uma avaliação. Palavra-código: ${J.campanha.palavraCodigo}.`;

  // ---------- Caixinha ----------
  // Palavras que sugerem dúvida clínica ou urgência. É só um alerta para a triagem: quem decide é a equipe.
  const CX_CLINICA = ['remédio', 'remedio', 'medicação', 'medicacao', 'medicamento', 'dose', 'sintoma', ' dor ', ' dores ', 'exame', 'hormôn', 'hormon', 'tireoide', 'diabetes', 'pressão', 'gravid', 'grávida', 'amament', 'menstrua', 'menopausa', 'climatério', 'anticoncep', 'suplement', 'vitamina', 'injet', 'pellet', 'implante', 'doença', 'doenca', 'parto'];
  const CX_URGENCIA = ['dor no peito', 'falta de ar', 'desmai', 'sangramento', 'sangrando', 'me machucar', 'não quero mais viver', 'nao quero mais viver', 'suicid', 'me matar', 'tirar minha vida'];
  // Normaliza pontuação em espaços para comparar palavras inteiras (ex.: "dor" não casa com "sabotador").
  const cxSinais = (t) => { const x = ' ' + String(t || '').toLowerCase().replace(/[^a-zà-ÿ0-9]+/g, ' ') + ' '; return { clinica: CX_CLINICA.some((k) => x.includes(k)), urgente: CX_URGENCIA.some((k) => x.includes(k)) }; };
  const CX_STATUS_P = { nova: 'Recebida', equipe: 'Recebida pela equipe', nelly: 'Com a Dra. Nelly', respondida: 'Respondida', arquivada: 'Recebida' };
  const CX_ABAS = [['nova', 'Triagem'], ['equipe', 'Equipe responde'], ['nelly', 'Dra. Nelly'], ['respondida', 'Respondidas'], ['arquivada', 'Arquivadas']];
  const CX_MODELO_CONSULTA = `Essa pergunta depende de uma avaliação individual, então o ideal é conversar sobre o seu caso em consulta. Se quiser, você pode agendar uma avaliação na Eleviê com a palavra-código ${J.campanha.palavraCodigo}.`;
  const AVISO_URGENCIA = 'Se for urgente, procure atendimento médico agora (SAMU 192). Para apoio emocional a qualquer hora, ligue para o CVV no 188.';
  function cxVideoNota(r) {
    if (!r || !r.video) return '';
    return S.simDay >= r.video
      ? `<a href="#/dia/${r.video}" class="tiny" style="display:block;margin-top:6px">🎥 Respondida no vídeo da Dra. Nelly do dia ${r.video} ›</a>`
      : `<div class="tiny muted" style="margin-top:6px">🎥 Vai ser respondida no vídeo da Dra. Nelly do dia ${r.video}.</div>`;
  }

  // ---------- Registro privado do corpo (só no aparelho) ----------
  // Simula o armazenamento local do celular: chave separada, nunca entra no estado
  // compartilhado, no painel da equipe ou na exportação.
  const PKEY = 'jornada-privado-v1';
  const MEDIDAS = [['cintura', 'Cintura'], ['quadril', 'Quadril'], ['busto', 'Busto'], ['braco', 'Braço'], ['coxa', 'Coxa']];
  const POSES = [['frente', 'Frente'], ['costas', 'Costas'], ['perfil', 'Perfil']];
  const SENTIR = [['energia', 'Energia'], ['sono', 'Sono'], ['disposicao', 'Disposição'], ['humor', 'Humor']];
  function loadPriv() {
    try { return JSON.parse(localStorage.getItem(PKEY)) || {}; } catch (e) { return {}; }
  }
  function savePriv(p) {
    try { localStorage.setItem(PKEY, JSON.stringify(p)); return true; } catch (e) { return false; }
  }

  // ---------- Navegação ----------
  const go = (h) => { if (location.hash === h) render(); else location.hash = h; };
  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2800);
  }

  function render(keepScroll) {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    const admin = parts[0] === 'a';
    renderDemo(admin);
    const sc = $('#pscroll');
    const top = sc ? sc.scrollTop : 0;
    const winTop = window.scrollY;
    $('#app').innerHTML = decorar(admin ? renderAdmin(parts.slice(1)) : renderParticipant(parts));
    const novo = $('#pscroll');
    if (keepScroll) { if (novo) novo.scrollTop = top; window.scrollTo(0, winTop); }
    else { window.scrollTo(0, 0); const scr = $('.screen') || $('.main'); if (scr) scr.classList.add('enter'); }
    afterRender();
  }

  function renderDemo(admin) {
    const opts = Array.from({ length: 21 }, (_, i) => `<option value="${i + 1}"${i + 1 === S.simDay ? ' selected' : ''}>Dia ${i + 1} · ${fmtDia(i + 1)}</option>`).join('');
    $('#demo').innerHTML = `<div class="demo-bar">
      <strong>Protótipo · dados fictícios</strong>
      <span>Ver como:</span>
      <span class="seg"><button data-act="role" data-v="p" class="${admin ? '' : 'on'}">Participante</button><button data-act="role" data-v="a" class="${admin ? 'on' : ''}">Equipe</button></span>
      <label>Hoje é: <select data-act="simday">${opts}</select></label>
      <span class="spacer"></span>
      <button class="link" data-act="notas">Premissas do protótipo</button>
      <button class="link" data-act="reset">Reiniciar dados</button>
    </div>`;
  }

  // =====================================================================
  // PARTICIPANTE
  // =====================================================================
  function renderParticipant(parts) {
    if (!S.sessao.logado) return pShell(viewLogin());
    if (!S.sessao.perfilOk) return pShell(viewPerfil(false));
    if (!S.sessao.boasVindas) return pShell(viewBoasVindas());
    const [r, a] = parts;
    switch (r) {
      case 'dia': return pShell(viewDia(Number(a) || S.simDay), 'hoje');
      case 'tarefa': return pShell(viewTarefa(a), 'hoje');
      case 'progresso': return pShell(viewProgresso(), 'progresso');
      case 'checkin': return pShell(viewCheckin(Number(a) || S.simDay), 'checkin');
      case 'avisos': return pShell(viewAvisos(), 'avisos');
      case 'perfil': return pShell(viewPerfil(true), 'avisos');
      case 'privado': return pShell(viewPrivado(a), 'progresso');
      case 'caixinha': return pShell(viewCaixinha(Number(a) || S.simDay), 'caixinha');
      default: return pShell(viewDia(S.simDay), 'hoje');
    }
  }

  function pShell(inner, nav) {
    const items = [['hoje', 'house', 'Hoje', '#/hoje'], ['progresso', 'chart', 'Progresso', '#/progresso'], ['checkin', 'bubble', 'Check-in', '#/checkin'], ['caixinha', 'tray', 'Caixinha', '#/caixinha'], ['avisos', 'bell', 'Avisos', '#/avisos']];
    // Barra de abas flutuante em vidro (Liquid Glass).
    const navHtml = nav ? `<nav class="tabbar glass" aria-label="Navegação">${items.map(([k, i, l, h]) => `<a href="${h}" class="${k === nav ? 'on' : ''}" ${k === nav ? 'aria-current="page"' : ''}>${ic(i)}<span>${l}</span></a>`).join('')}</nav>` : '';
    return `<div class="phone-wrap"><div class="phone${nav ? ' has-tabs' : ''}">
      <div class="statusbar" aria-hidden="true"><span>9:41</span><span class="island"></span><span class="sb-r"><i></i><i></i><i></i><b></b></span></div>
      <div class="navbar glass" aria-hidden="true"><span class="nav-title"></span></div>
      <div class="p-scroll" id="pscroll"><div class="screen">${inner}</div></div>
      ${navHtml}
    </div></div>`;
  }

  function viewLogin() {
    const step = ui.loginStep || 'inicio';
    if (step === 'inicio') {
      return `<div class="p-body login">
        <div class="welcome-hero"><div class="logo">${ic('leaf')}</div><h1>Jornada Ana + Eleviê</h1><p class="muted">21 dias de hábitos, no seu ritmo.</p></div>
        <div class="login-btns">
          <button class="btn-google" data-act="google">${GOOGLE_G}<span>Continuar com o Google</span></button>
          <div class="ou"><span>ou</span></div>
          <button class="btn ghost block" data-act="login-email">${ic('tray')} Entrar com código no e-mail</button>
        </div>
        <p class="tiny muted" style="margin-top:18px;text-align:center">Sem senha. Do Google usamos só o seu nome e o seu e-mail. Ao entrar você verá nossa política de privacidade.</p>
        <p class="tiny muted" style="text-align:center">Ainda não se inscreveu? Use o link de inscrição que você recebeu.</p>
        ${step === 'inicio' && ui.googleAberto ? googleSheet() : ''}
      </div>`;
    }
    const body = step === 'email'
      ? `<form data-form="login-email">
          <label class="field"><span>Seu e-mail</span><input class="input" name="email" type="email" autocomplete="email" placeholder="voce@email.com" value="${esc(person(ME).email)}"></label>
          <div data-errfor="email"></div>
          <button class="btn block" type="submit">Receber código de acesso</button>
        </form>
        <p class="small muted" style="margin-top:14px">Sem senha: enviamos um código de 6 dígitos para o seu e-mail a cada acesso.</p>`
      : `<form data-form="login-code">
          <p>Enviamos um código para <strong>${esc(ui.email)}</strong>.</p>
          <label class="field"><span>Código de 6 dígitos</span><input class="input" name="code" inputmode="numeric" maxlength="6" placeholder="000000" autocomplete="one-time-code"></label>
          <div data-errfor="code"></div>
          <div class="notice info small">Na demonstração, qualquer código de 6 números funciona.</div>
          <button class="btn block" type="submit">Entrar</button>
          <p style="text-align:center;margin-top:12px"><button type="button" class="linkbtn" data-act="login-email">Usar outro e-mail</button></p>
        </form>`;
    return `<div class="p-body login">
      <a class="back" href="#" data-act="login-inicio">Entrar</a>
      <div class="welcome-hero" style="padding-top:6px"><div class="logo">${ic('tray')}</div><h1>Código no e-mail</h1></div>
      <div class="card">${body}</div>
      <p class="tiny muted" style="margin-top:14px;text-align:center">Ao entrar você verá nossa política de privacidade. Ainda não se inscreveu? Use o link de inscrição que você recebeu.</p>
    </div>`;
  }

  // Simulação da escolha de conta do Google. Na versão real, abre a tela oficial do Google (OAuth).
  function googleSheet() {
    const me = person(ME);
    const outra = ui.googleOutra;
    return `<div class="sheet-bg" data-act="google-fechar"><div class="sheet" data-stop role="dialog" aria-label="Escolher conta do Google">
      <div class="sheet-head">${GOOGLE_G}<div><strong>Fazer login com o Google</strong><div class="tiny muted">para continuar no Jornada Ana + Eleviê</div></div></div>
      <div class="notice info small" style="margin:0 0 12px">Simulação para o protótipo. Na versão real, esta é a tela oficial do Google.</div>
      ${outra ? `<form data-form="google-outra" novalidate>
          <label class="field"><span>E-mail do Gmail</span><input class="input" name="email" type="email" placeholder="voce@gmail.com" autocomplete="email"><div data-errfor="email"></div></label>
          <label class="field"><span>Nome na conta Google</span><input class="input" name="nome" placeholder="Seu nome" autocomplete="name"><div data-errfor="nome"></div></label>
          <button class="btn block" type="submit">Continuar</button>
        </form>`
      : `<button class="conta" data-act="google-conta"><span class="avatar">${esc(me.nome.trim()[0] || 'C')}</span><span class="conta-t"><strong>${esc(J.participantes[0].nome)}</strong><span>${esc(J.participantes[0].email.replace('@exemplo.com', '@gmail.com'))}</span></span></button>
        <button class="conta" data-act="google-outra"><span class="avatar outra">${ic('person')}</span><span class="conta-t"><strong>Usar outra conta</strong></span></button>`}
      <p class="tiny muted" style="margin:12px 2px 0">O Google vai compartilhar com o app o seu nome, e-mail e foto de perfil. Nada é publicado em seu nome.</p>
    </div></div>`;
  }

  // Nome e apelido: logo depois do primeiro acesso e, depois, em Avisos › Meu perfil.
  function viewPerfil(editando) {
    const me = person(ME);
    const viaGoogle = S.sessao.metodo === 'google';
    return `<div class="p-body login">
      ${editando ? '<a class="back" href="#/avisos">Avisos</a>' : ''}
      <div class="welcome-hero" style="padding-top:${editando ? 4 : 24}px"><div class="logo">${ic('person')}</div><h1>${editando ? 'Meu perfil' : 'Como podemos te chamar?'}</h1>
        <p class="muted">${editando ? 'Seu nome aparece para a Ana e a equipe.' : viaGoogle ? 'Trouxemos o nome da sua conta Google. Confira e ajuste se quiser.' : 'Conte o seu nome para a Ana e a equipe te reconhecerem.'}</p></div>
      <form data-form="perfil" data-editando="${editando ? 1 : 0}" class="card" novalidate>
        <label class="field"><span>Nome completo</span><input class="input" name="nome" autocomplete="name" value="${esc(me.nome)}" placeholder="Seu nome e sobrenome"><div data-errfor="nome"></div></label>
        <label class="field"><span>Como prefere ser chamada? <em>(opcional)</em></span><input class="input" name="apelido" value="${esc(me.apelido || '')}" placeholder="Ex.: Cami"></label>
        <div class="perfil-conta">${viaGoogle ? GOOGLE_G : ic('tray')}<div><div class="tiny muted">${viaGoogle ? 'Conectada com o Google' : 'Acesso por código no e-mail'}</div><strong>${esc(me.email)}</strong></div></div>
        <button class="btn block" type="submit" style="margin-top:16px">${editando ? 'Salvar' : 'Continuar'}</button>
      </form>
    </div>`;
  }

  function viewBoasVindas() {
    return `<div class="p-body" style="padding-top:20px">
      <div class="welcome-hero"><div class="logo">${ic('leaf')}</div><h1>Que bom ter você aqui, ${esc(chamado(person(ME)))}!</h1></div>
      <div class="card">
        <h2>Como funciona</h2>
        <ol class="steps">
          <li>São 3 semanas: <strong>${S.semanas.map((w) => esc(w.nome)).join('</strong>, <strong>')}</strong>. Todo dia, às ${J.campanha.liberacao}, abre um novo dia com <strong>3 tarefas</strong>: alimentação, movimento e mentalidade.</li>
          <li>No dia 1 você faz o seu <strong>ponto de partida</strong> (medidas e fotos de frente, costas e perfil) e no dia 21 o <strong>fechamento</strong>, para ver o seu antes e depois. Esse registro fica <strong>só no seu celular</strong>.</li>
          <li>Em <strong>alimentação e movimento</strong>, você comprova com uma <strong>foto</strong>: do prato, do preparo, do local da caminhada ou do tênis. Cada tarefa mostra antes o que a foto precisa mostrar.</li>
          <li>Nunca pedimos foto do seu corpo. Fotos do corpo, medidas, áudios e a carta para o futuro <strong>ficam só com você</strong>.</li>
          <li>Um dia difícil não apaga o caminho. Dá para marcar "não consegui" sem punição.</li>
        </ol>
      </div>
      <form data-form="consent" class="card">
        <h2>Antes de começar</h2>
        <div class="notice warn"><strong>Aviso de saúde</strong>${esc(J.campanha.avisoSaude)}</div>
        <label class="checkline"><input type="checkbox" name="saude"><span>Li e entendi o aviso de saúde. <em class="tiny muted">(obrigatório)</em></span></label>
        <label class="checkline"><input type="checkbox" name="termos"><span>Aceito as regras da jornada e a <a href="#" data-act="noop">política de privacidade</a>. <em class="tiny muted">(obrigatório)</em></span></label>
        <div data-errfor="obrig"></div>
        <p class="small muted" style="margin:14px 0 8px">Opcionais (você pode mudar depois em Avisos):</p>
        <label class="checkline"><input type="checkbox" name="comunicacoes"><span>Quero receber lembretes e novidades da jornada por e-mail/WhatsApp.</span></label>
        <label class="checkline"><input type="checkbox" name="repost"><span>Autorizo a Eleviê a repostar conteúdos que <strong>eu mesma</strong> publicar marcando a jornada, nos Stories de @eleviê e @dra.nellykim, durante a campanha. Posso revogar quando quiser.</span></label>
        <button class="btn block" type="submit" style="margin-top:8px">Começar a jornada</button>
      </form>
    </div>`;
  }

  function dayStrip(cur) {
    return `<div class="day-strip" id="strip">${S.days.map((d) => {
      const locked = d.n > S.simDay;
      const dots = locked ? '' : `<div class="dots">${d.tarefas.map((t) => `<i class="${dotClass(getReg(ME, t.id).status)}"></i>`).join('')}</div>`;
      return `<a href="#/dia/${d.n}" class="${d.n === cur ? 'on' : ''} ${locked ? 'lock' : ''}" ${d.n === cur ? 'data-cur' : ''}>Dia<b>${d.n}</b>${dots}</a>`;
    }).join('')}</div>`;
  }

  function viewDia(n) {
    const me = person(ME);
    const day = dayOf(n);
    const st = stats(ME, S.simDay);
    const ajustes = tasksUpTo(S.simDay).filter(({ task }) => getReg(ME, task.id).status === 'precisa_ajuste');
    const isHoje = n === S.simDay;
    let content;
    if (n > S.simDay) {
      content = `<div class="card empty">${ic('lock', 'big')}<h2>Dia ${n} · ${esc(day.tema)}</h2><p class="muted">Libera em ${fmtDia(n)} às ${J.campanha.liberacao}.</p></div>`;
    } else {
      const ck = S.checkins[ME][n];
      content = `
        ${corpoBanner(n)}
        ${nellyCard(day)}
        <div class="sec-title">${isHoje ? 'Tarefas de hoje' : 'Tarefas do dia'}</div>
        <div class="group">
        ${day.tarefas.map((t) => {
          const reg = getReg(ME, t.id);
          return `<a class="task-card" href="#/tarefa/${t.id}">
            <div class="ico ${t.frente}">${FRENTES[t.frente].ic}</div>
            <div class="t"><div class="t-top"><span class="frente f-${t.frente}">${FRENTES[t.frente].nome}</span>${badge(reg.status, t)}</div><h3>${esc(t.titulo)}</h3><div class="reg">${esc(tipoDesc(t))}</div></div>
            <div class="trail">${ic('chevron', 'chev')}</div>
          </a>`;
        }).join('')}
        </div>
        <div class="group">
        <a class="task-card" href="#/checkin/${n}">
          <div class="ico checkin">${ic('bubble')}</div>
          <div class="t"><div class="t-top"><span class="frente f-checkin">Check-in</span>${ck ? '<span class="badge b-registrada">Feito</span>' : '<span class="badge b-nao_iniciada">Pendente</span>'}</div><h3>${ck ? 'Check-in respondido' : 'Como foi o seu dia?'}</h3><div class="reg">${ck ? `Você disse: “${esc(ck.palavra)}”` : '2 perguntas rápidas'}</div></div>
          <div class="trail">${ic('chevron', 'chev')}</div>
        </a>
        ${day.caixinha ? `<a class="task-card" href="#/caixinha/${n}"><div class="ico caixinha">${ic('tray')}</div><div class="t"><span class="frente f-caixinha">Caixinha da Ana</span><h3>${esc(day.caixinha.pergunta)}</h3><div class="reg">Pode ser anônimo</div></div><div class="trail">${ic('chevron', 'chev')}</div></a>` : ''}
        </div>
        ${day.cta ? ctaCard(n) : ''}
        ${!isHoje ? `<p class="small muted">Você ainda pode registrar tarefas de dias anteriores.</p>` : ''}`;
    }
    const feitosDia = n <= S.simDay ? day.tarefas.filter((t) => ENVIADAS.includes(getReg(ME, t.id).status)).length : 0;
    return `<div class="p-head"><div class="eyebrow">Olá, ${esc(chamado(me))} · ${fmtLongo(n)}</div><h1>${isHoje ? 'Hoje' : 'Dia ' + n}</h1></div>
      <div class="p-body">
        ${ajustes.length ? `<a href="#/tarefa/${ajustes[0].task.id}" style="text-decoration:none"><div class="notice bad"><strong>${ajustes.length === 1 ? '1 tarefa precisa de ajuste' : ajustes.length + ' tarefas precisam de ajuste'}</strong>Dia ${ajustes[0].day.n} · ${esc(ajustes[0].task.titulo)} — toque para ver o que corrigir.</div></a>` : ''}
        <div class="day-hero">
          ${anel(feitosDia, day.tarefas.length)}
          <div class="hero-txt">
            <div class="k">Dia ${n} de 21 · ${esc(semanaLabel(day.semana))}</div>
            <h2>${esc(day.tema)}</h2>
            <div class="hero-sub">Jornada: ${st.enviadas} de ${st.esperadas} tarefas · ${st.pct}%</div>
            <div class="bar"><i style="width:${st.pct}%"></i></div>
          </div>
        </div>
        ${dayStrip(n)}
        ${content}
      </div>`;
  }

  // Anel de progresso no estilo do app Atividade.
  function anel(feito, total) {
    const r = 26, c = 2 * Math.PI * r, p = total ? feito / total : 0;
    return `<div class="ring" role="img" aria-label="${feito} de ${total} tarefas do dia">
      <svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" class="ring-bg"/><circle cx="32" cy="32" r="${r}" class="ring-fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - p)).toFixed(1)}"/></svg>
      <span><b>${feito}</b><small>/${total}</small></span></div>`;
  }

  function nellyCard(day) {
    if (!nellyVisivel(day)) return '';
    const nl = day.nelly;
    return `<div class="card nelly">
      <div class="nelly-head"><span class="nelly-av">NK</span><div><div class="tiny muted">${esc(nl.formato)} da Dra. Nelly Kim</div><strong>${esc(nl.titulo)}</strong></div></div>
      <div class="player"><span>${ic('play')}</span> ${esc(nl.formato)} · publicado aqui após aprovação</div>
      <p class="small" style="margin:0 0 6px">${esc(nl.resumo)}</p>
      ${nl.fecho ? `<p class="small muted" style="margin:0 0 8px"><em>“${esc(nl.fecho)}”</em></p>` : ''}
      <span class="badge b-aprovada">✓ Aprovado pela Dra. Nelly</span>
    </div>`;
  }

  function ctaCard(n) {
    return `<div class="card cta">
      <h3>Quer seguir com acompanhamento?</h3>
      <p class="small">Se você quiser conversar sobre uma avaliação na Eleviê, é só chamar no WhatsApp da clínica. Use a palavra-código <strong>${esc(J.campanha.palavraCodigo)}</strong>.</p>
      <button class="btn block" data-act="cta" data-n="${n}">💬 Quero agendar minha avaliação</button>
      <p class="tiny muted" style="margin:8px 0 0">Sem compromisso. A jornada continua igual para quem não agendar.</p>
    </div>`;
  }

  function corpoBanner(n) {
    const pv = loadPriv();
    if (n === 1 && !pv.inicio) return `<a href="#/privado/inicio" style="text-decoration:none"><div class="notice lock"><strong>🔒 Comece pelo seu ponto de partida</strong>Medidas e fotos de frente, costas e perfil. Ficam só no seu celular, para você comparar no dia 21.</div></a>`;
    if (n === 21 && !pv.final) return `<a href="#/privado/final" style="text-decoration:none"><div class="notice lock"><strong>🔒 Hora do seu fechamento</strong>Refaça as medidas e as fotos e veja o seu antes e depois, só para você.</div></a>`;
    return '';
  }

  function corpoLink(task) {
    const fase = task.registroCorpo;
    if (!fase) return '';
    const r = loadPriv()[fase];
    const nome = fase === 'inicio' ? 'ponto de partida' : 'fechamento';
    return `<div class="card" style="margin:0 0 12px;background:var(--men-soft);border-color:transparent">
      <strong>🔒 Meu registro de ${nome}</strong>
      <div class="small" style="margin:4px 0 10px">${r ? `✓ Feito em ${fmtDT(r.em)}. Guardado só neste celular.` : 'Medidas e fotos de frente, costas e perfil. Nada é enviado.'}</div>
      <a class="btn sm" href="#/privado/${fase}">${r ? 'Ver ou refazer' : 'Fazer meu registro'}</a>
      ${fase === 'final' && r && loadPriv().inicio ? ' <a class="btn sm ghost" href="#/privado/comparar">Ver antes e depois</a>' : ''}
    </div>`;
  }

  function viewTarefa(id) {
    const f = findTask(id);
    if (!f) return `<div class="p-body"><p>Tarefa não encontrada.</p></div>`;
    const { day, task } = f;
    if (day.n > S.simDay) return `<div class="p-body"><a class="back" href="#/dia/${day.n}">‹ Dia ${day.n}</a><div class="card">Este dia ainda não foi liberado.</div></div>`;
    const reg = getReg(ME, id);
    const r = task.registro;
    const fr = FRENTES[task.frente];
    // Numa correção, a foto recusada não vem pré-carregada: a participante anexa uma nova.
    if (ui.taskId !== id) { ui = { taskId: id, foto: reg.foto && reg.status !== 'precisa_ajuste' ? fotoSrc(reg.foto) : null }; }

    const showForm = ui.editing || ['nao_iniciada', 'em_andamento', 'precisa_ajuste'].includes(reg.status);
    let top = '';
    if (reg.status === 'precisa_ajuste' && reg.revisao) {
      top = `<div class="notice bad"><strong>O que corrigir</strong>${esc(reg.revisao.motivo)}<div class="tiny" style="margin-top:6px">${esc(reg.revisao.por)} · ${fmtDT(reg.revisao.em)}</div></div>`;
    }
    if (reg.status === 'aguardando_revisao') top = `<div class="notice warn"><strong>Recebido! Em revisão</strong>A equipe vai conferir sua foto. Você verá o resultado aqui, sem precisar perguntar no WhatsApp.</div>`;
    if (reg.status === 'aprovada') top = `<div class="notice ok"><strong>Aprovada ✓</strong>Conferida por ${esc(reg.revisao ? reg.revisao.por : 'equipe')} em ${fmtDT(reg.revisao && reg.revisao.em)}.</div>`;
    if (reg.status === 'registrada') top = `<div class="notice ok"><strong>Registrada 💚</strong>${isPrivate(task) ? 'Ficou guardado só para você.' : 'Obrigada por registrar.'} Enviado em ${fmtDT(reg.enviadoEm)}.</div>`;
    if (reg.status === 'nao_realizada') top = `<div class="notice info"><strong>Tudo bem.</strong>Um dia difícil não apaga o caminho.${task.alternativa ? ' ' + esc(task.alternativa) : ''}</div>`;
    if (reg.status === 'em_andamento') top = `<div class="notice info">Rascunho salvo em ${fmtDT(reg.enviadoEm)}. Termine quando puder.</div>`;

    return `<div class="p-body" style="padding-top:16px">
      <a class="back" href="#/dia/${day.n}">‹ Dia ${day.n} · ${esc(day.tema)}</a>
      <span class="frente f-${task.frente}">${fr.ic} ${fr.nome}</span>
      <h1 style="margin-top:6px">${esc(task.titulo)}</h1>
      <p>${esc(task.instrucao)}</p>
      <div class="criterio"><strong>O que você vai registrar:</strong> ${esc(tipoDesc(task))}${pedeFoto(task) && task.evidencia.criterio ? `<br><span class="muted">📷 ${esc(task.evidencia.criterio)}</span>` : ''}</div>
      ${top}
      ${showForm ? taskForm(task, reg) : taskResumo(task, reg)}
    </div>`;
  }

  function taskResumo(task, reg) {
    const canEdit = ['registrada', 'nao_realizada'].includes(reg.status);
    return `${corpoLink(task)}<div class="card">${resumoHtml(task, reg, false)}</div>
      ${canEdit ? `<div class="btn-row" style="margin-top:14px"><button class="btn ghost" data-act="edit-task">Editar registro</button></div>` : ''}
      ${reg.historico ? `<div class="history">${reg.historico.map((h) => `<div>${fmtDT(h.em)} · ${esc(h.acao)}</div>`).join('')}</div>` : ''}`;
  }

  // Resumo do que foi registrado. paraEquipe esconde conteúdo privado.
  function resumoHtml(task, reg, paraEquipe) {
    const r = task.registro;
    const x = reg.respostas || {};
    if (reg.status === 'nao_iniciada') return `<span class="muted">Sem registro.</span>`;
    if (reg.status === 'nao_realizada') return `<span class="muted">Não realizada${reg.motivo ? ' · motivo: ' + esc(reg.motivo) : ''}.</span>`;
    if (paraEquipe && isPrivate(task)) return `<span class="badge b-privada">🔒 Conteúdo privado — não visível para a equipe</span>`;
    return (reg.foto ? `<img class="photo-prev" src="${fotoSrc(reg.foto)}" alt="Foto de comprovação">` : '') + respostasHtml(r, x);
  }

  function respostasHtml(r, x) {
    switch (r.tipo) {
      case 'compartilhar':
        return `<div>${x.marcou ? '✅ Marcou os 3 perfis' : '⬜ Marcações não confirmadas'}</div>${x.link ? `<div class="small" style="margin-top:4px;word-break:break-all">🔗 <a href="${esc(x.link)}" target="_blank" rel="noopener">${esc(x.link)}</a></div>` : ''}`;
      case 'autorrelato':
        return `<div>${x.modo === 'adaptado' ? 'Fiz uma versão adaptada' : 'Fiz'}${x.opcao ? ' · ' + esc(x.opcao) : ''}</div>${x.comentario ? `<div class="muted small">“${esc(x.comentario)}”</div>` : ''}`;
      case 'texto':
        return r.campos.map((c, i) => (x.campos && x.campos[i]) || c.obrigatorio ? `<div style="margin-bottom:6px"><div class="tiny muted">${esc(c.label)}</div>${x.campos && x.campos[i] ? esc(x.campos[i]) : '<span class="muted">—</span>'}</div>` : '').join('');
      case 'checklist':
        return r.itens.map((it, i) => `<div>${(x.marcados || []).includes(i) ? '✅' : '⬜'} ${esc(it)}</div>`).join('');
      case 'privado':
        return r.itens.map((it, i) => `<div>${(x.confirmados || []).includes(i) ? '✅' : '⬜'} ${esc(it)}</div>`).join('') + `<div class="tiny muted" style="margin-top:6px">🔒 Só a confirmação foi registrada. O conteúdo continua no seu celular.</div>`;
      default: return '';
    }
  }

  function legenda(n) {
    const d = dayOf(n);
    return `Dia ${n} de 21 da Jornada Ana + Eleviê: ${d.tema} 💚\n\n${S.instagram.map((i) => i.usuario).join(' ')}\n${J.campanha.hashtag}`;
  }

  function shareKit(task) {
    const n = Number(task.id.split('-')[0].slice(1));
    const rep = (S.consent[ME] || {}).repost;
    return `<div class="share">
        <div class="tiny muted">Ideia para hoje</div>
        <strong>${esc(task.sugestao || '')}</strong>
        <div class="share-tags">${S.instagram.map((i) => `<span class="ig-tag" title="${esc(i.nome)}">${esc(i.usuario)}</span>`).join('')}<span class="ig-tag hash">${esc(J.campanha.hashtag)}</span></div>
        <textarea class="input" id="legenda" rows="5" readonly>${esc(legenda(n))}</textarea>
        <div class="btn-row" style="margin-top:8px"><button type="button" class="btn sm" data-act="copiar-legenda">📋 Copiar texto</button><a class="btn sm ghost" href="https://www.instagram.com/" target="_blank" rel="noopener">Abrir o Instagram</a></div>
        <p class="tiny muted" style="margin:8px 0 0">No Stories, use o adesivo “Menção” para marcar os três perfis. No feed, cole o texto na legenda.</p>
      </div>
      <div class="notice warn small"><strong>Antes de postar</strong>Não poste fotos do seu corpo, medidas nem rostos de crianças. Postar no seu perfil não autoriza a Eleviê a repostar: isso você decide em Avisos › Minhas autorizações${rep && rep.aceito ? ' (hoje: autorizado).' : ' (hoje: não autorizado).'}</div>`;
  }

  function taskForm(task, reg) {
    const r = task.registro;
    const x = reg.respostas || {};
    let fields = '';
    let depois = '';
    if (r.tipo === 'autorrelato') {
      fields = `<div class="field"><span style="display:block;font-weight:700;margin-bottom:8px">Como foi?</span>
        <div class="choices">${[['fiz', 'Fiz ✓'], ['adaptado', 'Fiz uma versão adaptada']].map(([v, l]) => `<label class="choice"><input type="radio" name="modo" value="${v}" ${x.modo === v ? 'checked' : ''} hidden>${l}</label>`).join('')}</div><div data-errfor="modo"></div></div>
        ${r.opcoes ? `<div class="field"><span style="display:block;font-weight:700;margin-bottom:8px">O que você fez?</span><div class="choices">${r.opcoes.map((o) => `<label class="choice"><input type="radio" name="opcao" value="${esc(o)}" ${x.opcao === o ? 'checked' : ''} hidden>${esc(o)}</label>`).join('')}</div><div data-errfor="opcao"></div></div>` : ''}
        <label class="field"><span>Quer comentar algo? <em>(opcional)</em></span><textarea class="input" name="comentario" rows="2">${esc(x.comentario || '')}</textarea></label>`;
    } else if (r.tipo === 'texto') {
      fields = (r.privado ? `<div class="notice lock"><strong>🔒 Só você vê</strong>Esta resposta não aparece para a equipe.</div>` : '') +
        r.campos.map((c, i) => `<label class="field"><span>${esc(c.label)} ${c.obrigatorio ? '' : '<em>(opcional)</em>'}</span><textarea class="input" name="c${i}" rows="${r.campos.length > 2 ? 2 : 3}">${esc((x.campos || [])[i] || '')}</textarea><div data-errfor="c${i}"></div></label>`).join('');
    } else if (r.tipo === 'checklist') {
      fields = r.itens.map((it, i) => `<label class="checkline"><input type="checkbox" name="i${i}" ${(x.marcados || []).includes(i) ? 'checked' : ''}><span>${esc(it)}</span></label>`).join('') +
        `<p class="tiny muted">Marque pelo menos ${r.minimo}.</p><div data-errfor="i0"></div>`;
    } else if (r.tipo === 'compartilhar') {
      fields = shareKit(task);
      depois = `<label class="field"><span>Link do post ou do Stories <em>(ou envie o print acima)</em></span><input class="input" name="link" type="url" inputmode="url" placeholder="https://www.instagram.com/..." value="${esc(x.link || '')}"><div data-errfor="link"></div></label>
        <p class="tiny muted" style="margin-top:-6px">Perfil fechado? Envie o print: a equipe não consegue abrir o link.</p>
        <label class="checkline"><input type="checkbox" name="marcou" ${x.marcou ? 'checked' : ''}><span>Marquei ${S.instagram.map((i) => esc(i.usuario)).join(', ')}</span></label><div data-errfor="marcou"></div>`;
    } else if (r.tipo === 'privado') {
      fields = corpoLink(task) + `<div class="notice lock"><strong>🔒 Fica só com você</strong>Áudios, fotos, medidas e cartas continuam no seu celular. Aqui você só marca que fez.</div>` +
        r.itens.map((it, i) => `<label class="checkline"><input type="checkbox" name="i${i}" ${(x.confirmados || []).includes(i) ? 'checked' : ''}><span>${esc(it)}</span></label>`).join('') + `<div data-errfor="i0"></div>`;
    }
    if (pedeFoto(task)) {
      const ob = task.evidencia.foto === 'obrigatoria';
      const ig = task.frente === 'compartilhar';
      fields = (ig ? fields : '') + `<div class="field"><span style="display:block;font-weight:700;margin-bottom:8px">${ig ? 'Print do post ou do Stories' : 'Foto de comprovação'} ${ob ? '' : '<em>(opcional)</em>'}</span>
        <label class="photo-drop" for="foto-in" id="photo-zone">
          ${ui.foto ? `<img class="photo-prev" src="${ui.foto}" alt="Prévia da foto">` : ''}
          <div><strong>${ui.foto ? 'Trocar foto' : ig ? '📱 Escolher o print' : '📷 Tirar ou escolher foto'}</strong></div>
          <div class="tiny muted">${ig ? 'Um print em que dá para ver as marcações. Só a equipe de revisão vê.' : 'Fotografe a comida ou a atividade, não o seu corpo. Só a equipe de revisão vê.'}</div>
        </label>
        <input id="foto-in" type="file" accept="image/*" ${ig ? '' : 'capture="environment"'} hidden data-act="foto">
        <div data-errfor="foto"></div></div>` + (ig ? depois : fields);
    }
    const naoPanel = ui.naoConsegui
      ? `<div class="card" style="margin-top:14px">
          <h3>${task.frente === 'compartilhar' ? 'Tudo bem não postar hoje' : 'Tudo bem não conseguir hoje'}</h3>
          ${task.alternativa ? `<p class="small">${esc(task.alternativa)}</p>` : ''}
          ${task.frente === 'compartilhar' ? '<p class="small">A jornada continua igual. Se quiser, mande uma mensagem para a Ana na caixinha.</p>' : ''}
          <label class="field"><span>Quer contar o motivo? <em>(opcional)</em></span><select class="input" id="nao-motivo">${(task.frente === 'compartilhar' ? MOTIVOS_IG : MOTIVOS_NAO).map((m) => `<option>${m}</option>`).join('')}</select></label>
          <div class="btn-row"><button class="btn soft" data-act="nao-confirm">Registrar sem punição</button><button class="btn ghost" data-act="nao-cancel">Voltar</button></div>
        </div>`
      : `<p style="text-align:center;margin-top:16px"><button class="linkbtn" data-act="nao-open">${task.frente === 'compartilhar' ? 'Não vou postar hoje' : 'Não consegui fazer hoje'}</button></p>`;
    return `<form data-form="task" data-id="${task.id}" class="card" novalidate>
        ${fields}
        <div class="btn-row" style="margin-top:6px">
          <button class="btn block" type="submit">${reg.status === 'precisa_ajuste' ? 'Reenviar' : 'Enviar'}</button>
          ${r.tipo === 'texto' ? `<button class="btn ghost block" type="button" data-act="draft">Salvar rascunho</button>` : ''}
        </div>
      </form>${naoPanel}`;
  }

  function viewProgresso() {
    const st = stats(ME, S.simDay);
    const pend = tasksUpTo(S.simDay).filter(({ task }) => ['precisa_ajuste', 'em_andamento', 'nao_iniciada'].includes(getReg(ME, task.id).status));
    return `<div class="p-head"><h1>Meu progresso</h1><p class="muted small" style="margin:0">Seu caminho é só seu. Sem ranking, sem comparação.</p></div>
      <div class="p-body">
        <div class="card">
          <div style="display:flex;justify-content:space-between;align-items:baseline"><strong>${st.enviadas} de ${st.esperadas} tarefas</strong><span class="muted small">${st.pct}%</span></div>
          <div class="bar dark" style="margin:8px 0 12px"><i style="width:${st.pct}%"></i></div>
          <div class="cols-3 small">
            <div><b>${st.revisao}</b><br><span class="muted">em revisão</span></div>
            <div><b>${st.ajuste}</b><br><span class="muted">para ajustar</span></div>
            <div><b>${Object.keys(S.checkins[ME]).length}</b><br><span class="muted">check-ins</span></div>
          </div>
        </div>
        <div class="card">
          <h3>Os 21 dias</h3>
          <div class="grid21">${S.days.map((d) => {
            const locked = d.n > S.simDay;
            return `<a href="#/dia/${d.n}" class="${locked ? 'lock' : ''} ${d.n === S.simDay ? 'today' : ''}">${d.n}${locked ? '' : `<div class="dots">${d.tarefas.map((t) => `<i class="${dotClass(getReg(ME, t.id).status)}"></i>`).join('')}</div>`}</a>`;
          }).join('')}</div>
          <p class="tiny muted" style="margin:10px 0 0"><span class="f-dot" style="background:var(--ok)"></span> registrada · <span class="f-dot" style="background:var(--warn)"></span> em revisão · <span class="f-dot" style="background:var(--bad)"></span> ajustar · <span class="f-dot" style="background:var(--ink-3)"></span> não realizada</p>
        </div>
        <a href="#/privado" class="task-card" style="background:var(--men-soft);border-color:transparent"><div class="ico mentalidade">🔒</div><div class="t"><h3 style="margin:0">Meu antes e depois</h3><div class="reg">Medidas e fotos do dia 1 e do dia 21, só no seu celular</div></div><span class="chev">›</span></a>
        <div class="card">
          <h3>Pendências</h3>
          ${pend.length ? pend.map(({ day, task }) => `<a class="task-card" style="box-shadow:none;margin-bottom:8px" href="#/tarefa/${task.id}"><div class="ico ${task.frente}">${FRENTES[task.frente].ic}</div><div class="t"><div class="tiny muted">Dia ${day.n}</div><h3 style="margin:0">${esc(task.titulo)}</h3></div>${badge(getReg(ME, task.id).status, task)}</a>`).join('') : '<p class="muted">Nada pendente. 🎉</p>'}
        </div>
      </div>`;
  }

  function viewCheckin(n) {
    if (n > S.simDay) n = S.simDay;
    const ck = S.checkins[ME][n];
    const day = dayOf(n);
    const enq = day.enquete;
    const bal = day.balanco;
    const final = n === 21;
    const hist = Object.entries(S.checkins[ME]).sort((a, b) => b[0] - a[0]).slice(0, 7);
    const form = ui.editCk || !ck
      ? `<form data-form="checkin" data-n="${n}" class="card" novalidate>
          <div class="field"><span style="display:block;font-weight:700;margin-bottom:8px">Você fez o dia ${n}?</span>
            <div class="choices">${Object.entries(FEITO).map(([v, l]) => `<label class="choice"><input type="radio" name="feito" value="${v}" ${ck && ck.feito === v ? 'checked' : ''} hidden>${l}</label>`).join('')}</div><div data-errfor="feito"></div></div>
          <label class="field"><span>Como você está se sentindo, em uma palavra?</span><input class="input" name="palavra" maxlength="30" value="${esc(ck ? ck.palavra : '')}" placeholder="ex.: leve"><div data-errfor="palavra"></div></label>
          ${enq ? `<div class="field"><span style="display:block;font-weight:700;margin-bottom:8px">📊 Enquete do dia: ${esc(enq.pergunta)} <em class="tiny muted">(opcional)</em></span><div class="choices">${enq.opcoes.map((o) => `<label class="choice"><input type="radio" name="enquete" value="${esc(o)}" ${ck && ck.enquete === o ? 'checked' : ''} hidden>${esc(o)}</label>`).join('')}</div></div>` : ''}
          ${bal ? `<h3 style="margin-top:6px">${esc(bal.titulo)}</h3>${bal.perguntas.map((q, i) => `<label class="field"><span>${esc(q)} <em>(opcional)</em></span><textarea class="input" name="b${i}" rows="2">${esc(ck && ck.balanco ? ck.balanco[i] || '' : '')}</textarea></label>`).join('')}` : ''}
          ${final ? `<h3 style="margin-top:6px">Pesquisa final</h3>
            <label class="field"><span>O que você leva desta jornada?</span><textarea class="input" name="leva" rows="2">${esc(ck && ck.extra ? ck.extra.leva : '')}</textarea></label>
            <label class="field"><span>Que hábito vai continuar?</span><input class="input" name="habito" value="${esc(ck && ck.extra ? ck.extra.habito : '')}"></label>
            <div class="field"><span style="display:block;font-weight:700;margin-bottom:8px">De 1 a 5, como foi a experiência?</span><div class="choices">${[1, 2, 3, 4, 5].map((v) => `<label class="choice"><input type="radio" name="nota" value="${v}" ${ck && ck.extra && ck.extra.nota == v ? 'checked' : ''} hidden>${v}</label>`).join('')}</div></div>` : ''}
          <button class="btn block" type="submit">Enviar check-in</button>
        </form>`
      : `<div class="card"><div class="notice ok" style="margin:0 0 10px"><strong>Check-in do dia ${n} respondido 💚</strong>${FEITO[ck.feito]} · “${esc(ck.palavra)}”${ck.enquete ? ` · enquete: ${esc(ck.enquete)}` : ''} · ${fmtDT(ck.em)}</div>${enq && enq.alerta && ck.enquete === enq.alerta.opcao ? `<div class="notice warn small">${esc(enq.alerta.msg)}</div>` : ''}<button class="btn ghost sm" data-act="edit-ck">Alterar resposta</button></div>`;
    return `<div class="p-head"><h1>Check-in</h1><p class="muted small" style="margin:0">Dia ${n} · ${esc(day.tema)}</p></div>
      <div class="p-body">
        ${bal ? `<div class="notice info"><strong>Domingo de balanço</strong>As perguntas da semana vêm junto com o check-in.</div>` : ''}
        ${form}
        <p class="tiny muted" style="margin:10px 4px">Respondeu aqui? Não precisa repetir no grupo do WhatsApp.</p>
        ${hist.length ? `<div class="card"><h3>Seus últimos check-ins</h3>${hist.map(([d, c]) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--line)"><span>Dia ${d}</span><span class="muted">${FEITO[c.feito]} · “${esc(c.palavra)}”</span></div>`).join('')}</div>` : ''}
      </div>`;
  }

  function viewCaixinha(n) {
    if (n > S.simDay) n = S.simDay;
    const day = dayOf(n);
    const mine = S.caixinha.filter((c) => c.autorId === ME).sort((a, b) => (a.em < b.em ? 1 : -1));
    const mural = S.caixinha.filter((c) => c.status === 'respondida' && c.resposta && c.resposta.publica).sort((a, b) => (a.resposta.em < b.resposta.em ? 1 : -1));
    return `<div class="p-head"><h1>Caixinha</h1><p class="muted small" style="margin:0">Pergunte, conte, desabafe. Pode ser anônimo.</p></div>
      <div class="p-body">
        ${ui.cxUrg ? `<div class="notice bad"><strong>Cuide-se agora</strong>${AVISO_URGENCIA}</div>` : ''}
        ${day.caixinha ? `<div class="notice info"><strong>Caixinha do dia ${n}</strong>${esc(day.caixinha.pergunta)}</div>` : ''}
        <form data-form="caixinha" data-n="${n}" class="card" novalidate>
          <label class="field"><span>Sua mensagem</span><textarea class="input" name="texto" rows="4" maxlength="600" placeholder="Escreva aqui a sua pergunta, dúvida ou o que quiser contar"></textarea><div data-errfor="texto"></div></label>
          <div class="field"><span style="display:block;font-weight:700;margin-bottom:8px">É sobre <em class="tiny muted">(opcional)</em></span>
            <div class="choices"><label class="choice"><input type="radio" name="sobre" value="rotina" hidden>A jornada e a rotina</label><label class="choice"><input type="radio" name="sobre" value="saude" hidden>A minha saúde</label></div></div>
          <div class="field"><span style="display:block;font-weight:700;margin-bottom:8px">Como enviar?</span>
            <div class="choices"><label class="choice"><input type="radio" name="identidade" value="nome" hidden>Com meu nome</label><label class="choice"><input type="radio" name="identidade" value="anonima" hidden>🕶 Anônima</label></div>
            <div data-errfor="identidade"></div>
            <p class="tiny muted" style="margin:0">Anônima: a equipe e a Dra. Nelly não veem o seu nome. Só você vê a mensagem na sua lista. Se for algo sério, com nome a equipe consegue te procurar.</p></div>
          <div class="notice warn small"><strong>Sobre a sua saúde</strong>A Dra. Nelly responde em tom geral, aqui ou nos vídeos. Orientação para o seu caso, só em consulta. ${AVISO_URGENCIA}</div>
          <button class="btn block" type="submit">Enviar para a caixinha</button>
        </form>
        <div class="card"><h3>Minhas mensagens</h3>${mine.length ? mine.map((c) => `<div class="cx-mine">
            <div class="tiny muted">Dia ${c.dia} · ${fmtDT(c.em)}${c.anonima ? ' · 🕶 anônima' : ''}</div>
            <div style="margin:4px 0">${esc(c.texto)}</div>
            <span class="badge ${c.status === 'respondida' ? 'b-aprovada' : c.status === 'nelly' ? 'b-privada' : 'b-nao_iniciada'}">${CX_STATUS_P[c.status]}</span>
            ${c.resposta ? `<div class="cx-resp"><div class="tiny muted">${esc(c.resposta.por)} · ${fmtDT(c.resposta.em)}</div>${esc(c.resposta.texto)}${cxVideoNota(c.resposta)}</div>` : ''}
          </div>`).join('') : '<p class="small muted" style="margin:0">Você ainda não enviou mensagens.</p>'}</div>
        <div class="card"><h3>Respostas para todas</h3><p class="tiny muted">Perguntas respondidas e publicadas sem o nome de quem perguntou.</p>
          ${mural.length ? mural.map((c) => `<div class="cx-mine"><div style="font-weight:700">“${esc(c.texto)}”</div><div class="cx-resp"><div class="tiny muted">${esc(c.resposta.por)}</div>${esc(c.resposta.texto)}${cxVideoNota(c.resposta)}</div></div>`).join('') : '<p class="small muted" style="margin:0">Ainda não há respostas publicadas.</p>'}</div>
      </div>`;
  }

  function viewAvisos() {
    const c = S.consent[ME] || {};
    const opt = (k, label) => {
      const v = c[k] || { aceito: false };
      return `<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--line)">
        <div><div style="font-weight:700">${label}</div><div class="tiny muted">${v.aceito ? 'Autorizado' : 'Não autorizado'}${v.em ? ' · ' + fmtDT(v.em) : ''}</div></div>
        <button class="btn sm ${v.aceito ? 'ghost' : 'soft'}" data-act="consent-toggle" data-k="${k}">${v.aceito ? 'Revogar' : 'Autorizar'}</button></div>`;
    };
    const semana = dayOf(S.simDay).semana;
    const conteudos = S.days.slice(0, S.simDay).filter(nellyVisivel).reverse();
    return `<div class="p-head"><h1>Avisos</h1></div>
      <div class="p-body">
        <div class="card"><div class="tiny muted">Foco da semana</div><h3 style="margin:4px 0">${esc(semanaLabel(semana))}</h3><p style="margin:0">${esc((S.semanas[semana - 1] || {}).foco || '')}</p></div>
        <div class="card"><h3>Conteúdos da Dra. Nelly</h3>${conteudos.length ? conteudos.map((d) => `<a href="#/dia/${d.n}" style="display:block;text-decoration:none;color:inherit;padding:8px 0;border-bottom:1px solid var(--line)"><div class="tiny muted">Dia ${d.n} · ${esc(d.nelly.formato)}</div><strong>${esc(d.nelly.titulo)}</strong></a>`).join('') : '<p class="small muted" style="margin:0">O primeiro conteúdo chega no dia 2.</p>'}</div>
        <div class="card"><h3>Aviso de saúde</h3><p class="small" style="margin:0">${esc(J.campanha.avisoSaude)}</p></div>
        <div class="card"><h3>Precisa de ajuda?</h3>
          <p class="small"><strong>Dúvidas sobre o app ou as tarefas:</strong> fale com a equipe pelo WhatsApp da jornada.</p>
          <p class="small" style="margin:0"><strong>Dúvidas sobre a sua saúde:</strong> a equipe não responde perguntas clínicas individuais. Elas são encaminhadas à Dra. Nelly ou à consulta.</p>
        </div>
        <div class="card"><h3>Avaliação na Eleviê</h3><p class="small">Quer conversar sobre uma avaliação? Chame no WhatsApp da clínica com a palavra-código <strong>${esc(J.campanha.palavraCodigo)}</strong>.</p><button class="btn soft sm" data-act="cta" data-n="0">💬 Falar com a clínica</button></div>
        <a class="task-card perfil-row" href="#/perfil"><span class="avatar">${esc((person(ME).nome || '?').trim()[0])}</span><div class="t"><h3 style="margin:0">${esc(person(ME).nome)}</h3><div class="reg">${S.sessao.metodo === 'google' ? 'Google · ' : ''}${esc(person(ME).email)}</div></div><div class="trail">${ic('chevron', 'chev')}</div></a>
        <div class="card"><h3>Minhas autorizações</h3>
          ${opt('comunicacoes', 'Lembretes e novidades')}
          ${opt('repost', 'Repost dos meus conteúdos')}
          <p class="tiny muted" style="margin:10px 0 0">Participação aceita em ${fmtDT(c.termos && c.termos.em)} (termos ${esc(c.termos ? c.termos.versao : '')}).</p>
        </div>
        <p style="text-align:center"><button class="linkbtn" data-act="logout">Sair</button></p>
      </div>`;
  }

  function viewPrivado(fase) {
    const pv = loadPriv();
    const aviso = `<div class="notice lock"><strong>🔒 Fica só neste celular</strong>Não é enviado para a Eleviê, para a Ana nem para a Dra. Nelly. Se você trocar de celular ou limpar o navegador, perde o registro: use “Baixar minhas fotos” para guardar na sua galeria.</div>`;
    const back = `<a class="back" href="#/progresso">‹ Meu progresso</a>`;

    if (fase === 'inicio' || fase === 'final') {
      if (fase === 'final' && S.simDay < 21) {
        return `<div class="p-body" style="padding-top:16px">${back}<div class="card" style="text-align:center"><div style="font-size:2rem">🔒</div><h2>Fechamento no dia 21</h2><p class="muted">O registro de fechamento abre no último dia da jornada, ${fmtDia(21)}.</p></div></div>`;
      }
      const r = pv[fase] || {};
      if (ui.privFase !== fase) ui = { privFase: fase, pfotos: { ...(r.fotos || {}) } };
      const titulo = fase === 'inicio' ? 'Meu ponto de partida' : 'Meu fechamento';
      const dicas = fase === 'inicio'
        ? 'Use roupa justa ou de ginástica, fique de frente para uma parede lisa e com boa luz. No dia 21, repita igual: mesma roupa, mesmo lugar, mesmo horário.'
        : 'Repita como no dia 1: mesma roupa, mesmo lugar, mesma luz. Meça nos mesmos pontos.';
      return `<div class="p-body" style="padding-top:16px">${back}
        <span class="frente f-mentalidade">🔒 Registro privado · Dia ${fase === 'inicio' ? 1 : 21}</span>
        <h1 style="margin-top:6px">${titulo}</h1>
        ${aviso}
        <div class="criterio">${dicas}</div>
        <form data-form="privado" data-fase="${fase}" class="card" novalidate>
          <h3>Fotos</h3>
          <div class="poses">${POSES.map(([k, l]) => `<label class="pose" for="pf-${k}" id="pose-${k}">${ui.pfotos[k] ? `<img src="${ui.pfotos[k]}" alt="${l}">` : '<span class="pose-ic">📷</span>'}<b>${l}</b></label><input id="pf-${k}" type="file" accept="image/*" capture="user" hidden data-act="pfoto" data-pose="${k}">`).join('')}</div>
          <h3 style="margin-top:16px">Medidas com fita métrica <em class="tiny muted">(cm, opcional)</em></h3>
          <div class="medidas">${MEDIDAS.map(([k, l]) => `<label class="field"><span>${l}</span><input class="input" name="m-${k}" type="number" inputmode="decimal" step="0.1" min="0" value="${esc(r.medidas && r.medidas[k] != null ? r.medidas[k] : '')}"></label>`).join('')}</div>
          <h3 style="margin-top:6px">Como estou me sentindo <em class="tiny muted">(1 = muito baixo, 5 = ótimo)</em></h3>
          ${SENTIR.map(([k, l]) => `<div class="field"><span style="display:block;font-weight:700;margin-bottom:6px">${l}</span><div class="choices">${[1, 2, 3, 4, 5].map((v) => `<label class="choice"><input type="radio" name="s-${k}" value="${v}" ${r.sentir && r.sentir[k] == v ? 'checked' : ''} hidden>${v}</label>`).join('')}</div></div>`).join('')}
          <label class="field"><span>Quer anotar algo para você? <em>(opcional)</em></span><textarea class="input" name="nota" rows="2">${esc(r.nota || '')}</textarea></label>
          <div data-errfor="priv"></div>
          <button class="btn block" type="submit">Guardar só no meu celular</button>
        </form>
      </div>`;
    }

    if (fase === 'comparar') {
      const a = pv.inicio, b = pv.final;
      if (!a || !b) return `<div class="p-body" style="padding-top:16px">${back}<div class="card">Para comparar, faça o registro do dia 1 e o do dia 21.</div></div>`;
      const dif = (x, y) => { if (x == null || y == null || x === '' || y === '') return '—'; const d = Math.round((Number(y) - Number(x)) * 10) / 10; return (d > 0 ? '+' : '') + d + ' cm'; };
      return `<div class="p-body" style="padding-top:16px">${back}
        <h1>Meu antes e depois</h1>
        <div class="notice ok"><strong>A comparação mais importante é como você está se sentindo.</strong>Os números são só uma parte da história, e ficam só com você.</div>
        <div class="card"><h3>Como me sinto</h3>
          ${SENTIR.map(([k, l]) => `<div class="cmp-row"><span>${l}</span><span class="muted">Dia 1: <b>${a.sentir && a.sentir[k] || '—'}</b></span><span>Dia 21: <b>${b.sentir && b.sentir[k] || '—'}</b></span></div>`).join('')}
        </div>
        <div class="card"><h3>Fotos</h3>${POSES.map(([k, l]) => `<div class="tiny muted" style="margin:8px 0 4px;font-weight:700">${l}</div><div class="cmp-fotos"><figure>${a.fotos && a.fotos[k] ? `<img src="${a.fotos[k]}" alt="${l} dia 1">` : '<div class="pose-vazia">sem foto</div>'}<figcaption>Dia 1</figcaption></figure><figure>${b.fotos && b.fotos[k] ? `<img src="${b.fotos[k]}" alt="${l} dia 21">` : '<div class="pose-vazia">sem foto</div>'}<figcaption>Dia 21</figcaption></figure></div>`).join('')}</div>
        <div class="card"><h3>Medidas</h3>${MEDIDAS.map(([k, l]) => `<div class="cmp-row"><span>${l}</span><span class="muted">${a.medidas && a.medidas[k] != null && a.medidas[k] !== '' ? a.medidas[k] + ' cm' : '—'} → ${b.medidas && b.medidas[k] != null && b.medidas[k] !== '' ? b.medidas[k] + ' cm' : '—'}</span><b>${dif(a.medidas && a.medidas[k], b.medidas && b.medidas[k])}</b></div>`).join('')}</div>
      </div>`;
    }

    // painel do registro privado
    const item = (f, titulo, dia) => {
      const r = pv[f];
      const bloqueado = f === 'final' && S.simDay < 21;
      return `<div class="card"><div class="tiny muted">Dia ${dia}</div><h3 style="margin:2px 0 6px">${titulo}</h3>
        <p class="small muted" style="margin:0 0 10px">${r ? `✓ Feito em ${fmtDT(r.em)} · ${Object.values(r.fotos || {}).filter(Boolean).length} foto(s)` : bloqueado ? `Abre em ${fmtDia(21)}.` : 'Ainda não feito.'}</p>
        ${bloqueado ? '' : `<a class="btn sm ${r ? 'ghost' : ''}" href="#/privado/${f}">${r ? 'Ver ou refazer' : 'Fazer agora'}</a>`}</div>`;
    };
    const temFotos = ['inicio', 'final'].some((f) => pv[f] && Object.values(pv[f].fotos || {}).some(Boolean));
    return `<div class="p-head"><h1>Meu antes e depois</h1></div>
      <div class="p-body">
        ${aviso}
        ${item('inicio', 'Ponto de partida', 1)}
        ${item('final', 'Fechamento', 21)}
        ${pv.inicio && pv.final ? '<a class="btn block" href="#/privado/comparar">Ver meu antes e depois</a>' : ''}
        <div class="btn-row" style="margin-top:14px">
          ${temFotos ? '<button class="btn ghost sm" data-act="priv-baixar">Baixar minhas fotos</button>' : ''}
          ${pv.inicio || pv.final ? '<button class="btn ghost sm" data-act="priv-apagar">Apagar meu registro</button>' : ''}
        </div>
      </div>`;
  }

  // =====================================================================
  // EQUIPE
  // =====================================================================
  function pendingReviews() {
    const out = [];
    S.participantes.forEach((p) => tasksUpTo(S.simDay).forEach(({ day, task }) => {
      const reg = getReg(p.id, task.id);
      if (reg.status === 'aguardando_revisao') out.push({ p, day, task, reg });
    }));
    return out.sort((a, b) => (a.reg.enviadoEm < b.reg.enviadoEm ? -1 : 1));
  }

  function renderAdmin(parts) {
    const [r, a] = parts;
    const nRev = pendingReviews().length;
    const nCx = S.caixinha.filter((c) => c.status === 'nova').length;
    const nav = [['painel', 'Painel', 'grid'], ['revisao', 'Revisão de evidências', 'photo'], ['caixinha', 'Caixinha', 'tray'], ['checkins', 'Check-ins', 'bubble'], ['dias', 'Configurar dias', 'calendar'], ['exportar', 'Exportar', 'download']];
    const cur = r === 'participante' ? 'painel' : (r || 'painel');
    let main;
    switch (r) {
      case 'participante': main = viewAdmPart(a); break;
      case 'revisao': main = viewRevisao(); break;
      case 'caixinha': main = viewAdmCaixinha(); break;
      case 'checkins': main = viewAdmCheckins(Number(a) || S.simDay); break;
      case 'dias': main = a ? viewDiaEdit(Number(a)) : viewDias(); break;
      case 'exportar': main = viewExportar(); break;
      default: main = viewPainel();
    }
    return `<div class="admin">
      <aside class="side">
        <div class="brand"><span class="brand-ic">${ic('leaf')}</span><span>Jornada Ana + Eleviê<small>${esc(J.campanha.nome.split('— ')[1] || '')} · Dia ${S.simDay} de 21</small></span></div>
        ${nav.map(([k, l, i]) => `<a href="#/a/${k}" class="${cur === k ? 'on' : ''}"><span class="side-l">${ic(i)}${l}</span>${k === 'revisao' && nRev ? `<span class="count">${nRev}</span>` : ''}${k === 'caixinha' && nCx ? `<span class="count">${nCx}</span>` : ''}</a>`).join('')}
        <hr>
        <span class="soon">Calendário editorial <span class="tiny">Fase B</span></span>
        <span class="soon">Métricas de campanha <span class="tiny">Fase B</span></span>
      </aside>
      <main class="main">${main}</main>
    </div>`;
  }

  function viewPainel() {
    const ps = S.participantes;
    const n = S.simDay;
    const ativasHoje = ps.filter((p) => dayOf(n).tarefas.some((t) => getReg(p.id, t.id).status !== 'nao_iniciada')).length;
    const tot = ps.reduce((acc, p) => { const s = stats(p.id, n); acc.e += s.esperadas; acc.env += s.enviadas; acc.aj += s.ajuste; acc.rv += s.revisao; return acc; }, { e: 0, env: 0, aj: 0, rv: 0 });
    const ckHoje = ps.filter((p) => S.checkins[p.id][n]).length;

    const adesao = S.days.map((d) => {
      if (d.n > n) return `<div class="col fut" title="Dia ${d.n}: ainda não liberado"><i style="height:4%"></i><span>${d.n}</span></div>`;
      let env = 0;
      ps.forEach((p) => d.tarefas.forEach((t) => { if (ENVIADAS.includes(getReg(p.id, t.id).status)) env++; }));
      const pct = Math.round((env / (ps.length * d.tarefas.length)) * 100);
      return `<div class="col" title="Dia ${d.n}: ${pct}% das tarefas registradas"><i style="height:${Math.max(pct, 2)}%"></i><span>${d.n}</span></div>`;
    }).join('');

    const filtro = ui.filtro || 'todas';
    const busca = (ui.busca || '').toLowerCase();
    const rows = ps.filter((p) => {
      if (busca && !p.nome.toLowerCase().includes(busca)) return false;
      const s = stats(p.id, n);
      const hoje = dayOf(n).tarefas.some((t) => getReg(p.id, t.id).status !== 'nao_iniciada');
      if (filtro === 'sem_hoje') return !hoje;
      if (filtro === 'ajuste') return s.ajuste > 0;
      if (filtro === 'revisao') return s.revisao > 0;
      if (filtro === 'sem_ck') return !S.checkins[p.id][n];
      return true;
    }).map((p) => {
      const s = stats(p.id, n);
      const regs = Object.values(S.registros[p.id] || {});
      const ult = regs.reduce((m, r) => (r.enviadoEm && r.enviadoEm > m ? r.enviadoEm : m), '');
      const ck = S.checkins[p.id][n];
      return `<tr class="click" data-act="open-part" data-id="${p.id}">
        <td><strong>${esc(p.nome)}</strong>${p.voce ? ' <span class="tiny muted">(você na demo)</span>' : ''}<div class="tiny muted">${esc(p.cidade)}</div></td>
        <td><div class="mini-bar"><div class="bar dark"><i style="width:${s.pct}%"></i></div></div><span class="tiny muted">${s.enviadas}/${s.esperadas} · ${s.pct}%</span></td>
        <td><div class="dots" style="justify-content:flex-start;gap:5px">${dayOf(n).tarefas.map((t) => `<i class="${dotClass(getReg(p.id, t.id).status)}" style="width:10px;height:10px" title="${FRENTES[t.frente].nome}: ${STATUS[getReg(p.id, t.id).status]}"></i>`).join('')}</div></td>
        <td>${ck ? `<span class="badge b-registrada">${FEITO[ck.feito]}</span> <span class="tiny muted">“${esc(ck.palavra)}”</span>` : '<span class="badge b-nao_iniciada">Pendente</span>'}</td>
        <td>${s.revisao ? `<span class="badge b-aguardando_revisao">${s.revisao} em revisão</span> ` : ''}${s.ajuste ? `<span class="badge b-precisa_ajuste">${s.ajuste} ajuste</span> ` : ''}${s.nao ? `<span class="badge b-nao_realizada">${s.nao} não realizadas</span>` : ''}${!s.revisao && !s.ajuste && !s.nao ? '<span class="tiny muted">—</span>' : ''}</td>
        <td class="tiny muted">${ult ? fmtDT(ult) : 'sem registro'}</td>
      </tr>`;
    }).join('');

    const fopts = [['todas', 'Todas'], ['sem_hoje', 'Sem registro hoje'], ['sem_ck', 'Check-in pendente'], ['revisao', 'Com item em revisão'], ['ajuste', 'Com ajuste pendente']];
    return `<div class="main-head"><div><h1>Painel</h1><p class="muted">Dia ${n} · ${esc(dayOf(n).tema)} · ${fmtDia(n)}</p></div></div>
      <div class="kpis">
        <div class="kpi"><div class="l">Participantes inscritas</div><div class="v">${ps.length}</div><div class="s">inscrições confirmadas</div></div>
        <div class="kpi"><div class="l">Ativas hoje</div><div class="v">${ativasHoje}</div><div class="s">registraram ao menos 1 tarefa</div></div>
        <div class="kpi"><div class="l">Tarefas registradas</div><div class="v">${tot.e ? Math.round((tot.env / tot.e) * 100) : 0}%</div><div class="s">${tot.env} de ${tot.e} esperadas até hoje</div></div>
        <div class="kpi"><div class="l">Aguardando revisão</div><div class="v">${tot.rv}</div><div class="s"><a href="#/a/revisao">abrir fila</a></div></div>
        <div class="kpi"><div class="l">Correções em aberto</div><div class="v">${tot.aj}</div><div class="s">devolvidas para ajuste</div></div>
        <div class="kpi"><div class="l">Check-ins hoje</div><div class="v">${ckHoje}/${ps.length}</div><div class="s"><a href="#/a/checkins">ver respostas</a></div></div>
        <div class="kpi"><div class="l">Caixinha</div><div class="v">${S.caixinha.filter((c) => c.status === 'nova').length}</div><div class="s">para triagem · ${S.caixinha.filter((c) => c.status === 'nelly').length} com a Dra. Nelly · <a href="#/a/caixinha">abrir</a></div></div>
        <div class="kpi"><div class="l">Compartilharam hoje</div><div class="v">${ps.filter((p) => ENVIADAS.includes(getReg(p.id, 'd' + n + '-com').status)).length}/${ps.length}</div><div class="s">postaram marcando os 3 perfis</div></div>
        <div class="kpi"><div class="l">Interesse em avaliação</div><div class="v">${Object.values(S.cta).filter((x) => x && x.length).length}</div><div class="s">tocaram em “agendar” · código ${esc(J.campanha.palavraCodigo)}</div></div>
      </div>
      <div class="card" style="margin-bottom:18px"><h3>Adesão por dia <span class="tiny muted">(% das tarefas registradas)</span></h3><div class="adesao">${adesao}</div></div>
      <div class="filters">
        <input class="input" placeholder="Buscar participante" data-act="busca" value="${esc(ui.busca || '')}">
        <select class="input" data-act="filtro">${fopts.map(([v, l]) => `<option value="${v}" ${v === filtro ? 'selected' : ''}>${l}</option>`).join('')}</select>
        <span class="tiny muted">Mostramos fatos (“sem registro”, “pendente”), nunca rótulos sobre a pessoa.</span>
      </div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Participante</th><th>Progresso</th><th>Hoje</th><th>Check-in hoje</th><th>Pendências</th><th>Última atividade</th></tr></thead><tbody>${rows || '<tr><td colspan="6" class="muted">Nenhuma participante neste filtro.</td></tr>'}</tbody></table></div>`;
  }

  function viewAdmPart(pid) {
    const p = person(pid);
    if (!p) return '<p>Participante não encontrada.</p>';
    const c = S.consent[pid] || {};
    const s = stats(pid, S.simDay);
    const cons = (k, l) => { const v = c[k]; return `<dt>${l}</dt><dd>${v ? (v.aceito ? `✅ Sim · ${fmtDT(v.em)}` : `— Não · ${fmtDT(v.em)}`) : '—'}${k === 'repost' && v && v.escopo ? `<div class="tiny muted">Escopo: ${esc(v.escopo)}</div>` : ''}</dd>`; };
    const rows = S.days.slice(0, S.simDay).map((d) => `<tr>
        <td><strong>Dia ${d.n}</strong><div class="tiny muted">${esc(d.tema)}</div></td>
        ${d.tarefas.map((t) => { const reg = getReg(pid, t.id); return `<td class="taskcell"><div style="margin-bottom:4px">${badge(reg.status, t)}</div>${reg.status !== 'nao_iniciada' ? `<div class="tiny">${resumoHtml(t, reg, true).replace(/class="photo-prev"/, 'style="width:56px;height:56px;object-fit:cover;border-radius:8px"')}</div>` : ''}</td>`; }).join('')}
        <td class="tiny">${S.checkins[pid][d.n] ? `${FEITO[S.checkins[pid][d.n].feito]} · “${esc(S.checkins[pid][d.n].palavra)}”` : '<span class="muted">—</span>'}</td>
      </tr>`).reverse().join('');
    return `<a class="back" href="#/a/painel">‹ Painel</a>
      <div class="main-head"><div><h1>${esc(p.nome)}</h1><p class="muted">${p.apelido ? `Prefere “${esc(p.apelido)}” · ` : ''}${esc(p.email)} · acesso ${p.metodo === 'google' ? 'pelo Google' : p.metodo === 'email' ? 'por código no e-mail' : 'ainda não feito'} · ${esc(p.cidade)} · inscrita em ${fmtDT(p.entrada)}</p></div></div>
      <div class="two-col" style="margin-bottom:16px">
        <div class="card"><h3>Participação</h3>
          <div class="bar dark" style="margin:8px 0"><i style="width:${s.pct}%"></i></div>
          <p class="small">${s.enviadas} de ${s.esperadas} tarefas registradas · ${s.revisao} em revisão · ${s.ajuste} para ajuste · ${s.nao} não realizadas</p>
          <p class="tiny muted" style="margin:0">Conteúdos privados (áudios, carta, reflexões marcadas como privadas) não aparecem para a equipe. Medidas e fotos do corpo (dias 1 e 21) ficam só no celular da participante: a equipe não tem acesso.</p>${S.cta[pid] && S.cta[pid].length ? `<div class="notice ok small" style="margin:10px 0 0">Tocou em “agendar avaliação” no dia ${S.cta[pid][0].dia}.</div>` : ''}</div>
        <div class="card"><h3>Consentimentos</h3><dl class="kv">${cons('termos', 'Regras e privacidade')}${cons('saude', 'Aviso de saúde')}${cons('comunicacoes', 'Comunicações')}${cons('repost', 'Repost')}</dl>
          ${c.repost && c.repost.aceito ? '' : '<div class="notice warn small" style="margin:10px 0 0">Sem autorização de repost: não compartilhar conteúdos desta participante.</div>'}</div>
      </div>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Dia</th><th>Alimentação</th><th>Movimento</th><th>Mentalidade</th><th>Compartilhar</th><th>Check-in</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function revItems(all) {
    const fd = ui.revDia || 'todos';
    const ff = ui.revFrente || 'todas';
    return (all || pendingReviews()).filter((x) => (fd === 'todos' || String(x.day.n) === fd) && (ff === 'todas' || x.task.frente === ff));
  }

  function viewRevisao() {
    const all = pendingReviews();
    const fd = ui.revDia || 'todos';
    const ff = ui.revFrente || 'todas';
    const items = revItems(all);
    const dias = [...new Set(all.map((x) => x.day.n))].sort((a, b) => a - b);
    const modo = ui.revModo || 'grade';
    const sel = ui.sel || {};
    const nSel = items.filter((x) => sel[x.p.id + '|' + x.task.id]).length;

    const lista = () => items.map(({ p, day, task, reg }) => {
      const key = p.id + '|' + task.id;
      const aj = ui.ajusteKey === key;
      return `<div class="card review" id="rev-${key.replace('|', '-')}">
        <div><img src="${fotoSrc(reg.foto)}" alt="Foto de comprovação"></div>
        <div>
          <div class="tiny muted">${esc(p.nome)}${p.voce ? ' (você na demo)' : ''} · enviado em ${fmtDT(reg.enviadoEm)}</div>
          <h3 style="margin:4px 0">Dia ${day.n} · ${esc(task.titulo)}</h3>
          <span class="frente f-${task.frente}">${FRENTES[task.frente].nome}</span>
          <div class="criterio" style="margin-top:10px"><strong>Critério publicado:</strong> ${esc(task.evidencia.criterio || '—')}</div>
          <div class="small">${respostasHtml(task.registro, reg.respostas || {})}</div>
          ${reg.historico && reg.historico.length > 1 ? `<div class="history">${reg.historico.map((h) => `<div>${fmtDT(h.em)} · ${esc(h.acao)}</div>`).join('')}</div>` : ''}
          ${aj ? `<div style="margin-top:12px">
              <div class="choices">${MOTIVOS_AJUSTE.map((m) => `<button type="button" class="choice" data-act="motivo-quick" data-v="${esc(m)}">${esc(m)}</button>`).join('')}</div>
              <label class="field"><span>O que a participante precisa corrigir? <em>(obrigatório)</em></span><textarea class="input" id="motivo-txt" rows="2"></textarea><div data-errfor="motivo"></div></label>
              <div class="btn-row"><button class="btn warn sm" data-act="ajuste-confirm" data-key="${key}">Enviar pedido de ajuste</button><button class="btn ghost sm" data-act="ajuste-cancel">Cancelar</button></div>
            </div>`
          : `<div class="btn-row" style="margin-top:12px"><button class="btn sm" data-act="aprovar" data-key="${key}">Aprovar</button><button class="btn ghost sm" data-act="ajuste-open" data-key="${key}">Pedir ajuste</button></div>`}
        </div>
      </div>`;
    }).join('');

    const grade = () => `<div class="rev-grid">${items.map(({ p, day, task, reg }) => {
      const key = p.id + '|' + task.id;
      return `<div class="rev-tile ${sel[key] ? 'on' : ''}">
        <label class="rev-pic"><input type="checkbox" data-act="sel" data-key="${key}" ${sel[key] ? 'checked' : ''}><img src="${fotoSrc(reg.foto)}" alt="Foto de comprovação"></label>
        <div class="rev-info">
          <div class="tiny muted">${esc(p.nome.split(' ')[0])} · Dia ${day.n}</div>
          <div class="small" style="font-weight:700"><span class="f-dot fd-${task.frente}"></span> ${esc(task.titulo)}</div>
          <div class="tiny muted" title="${esc(task.evidencia.criterio)}">${esc(task.evidencia.criterio)}</div>
          <div class="btn-row" style="margin-top:8px"><button class="btn sm" data-act="aprovar" data-key="${key}">Aprovar</button><button class="btn ghost sm" data-act="ajuste-open" data-key="${key}">Ajuste</button></div>
        </div>
      </div>`;
    }).join('')}</div>`;

    return `<div class="main-head"><div><h1>Revisão de evidências</h1><p class="muted">${all.length} fotos aguardando · mais antigas primeiro</p></div>
        <span class="seg-light"><button data-act="rev-modo" data-v="grade" class="${modo === 'grade' ? 'on' : ''}">Grade</button><button data-act="rev-modo" data-v="lista" class="${modo === 'lista' ? 'on' : ''}">Detalhe</button></span></div>
      <div class="filters">
        <select class="input" data-act="rev-dia"><option value="todos">Todos os dias</option>${dias.map((d) => `<option value="${d}" ${String(d) === fd ? 'selected' : ''}>Dia ${d}</option>`).join('')}</select>
        <select class="input" data-act="rev-frente">${[['todas', 'Todas as frentes'], ['alimentacao', 'Alimentação'], ['movimento', 'Movimento'], ['compartilhar', 'Compartilhar (prints)']].map(([v, l]) => `<option value="${v}" ${v === ff ? 'selected' : ''}>${l}</option>`).join('')}</select>
        ${modo === 'grade' && items.length ? `<button class="btn ghost sm" data-act="sel-todas">${nSel === items.length ? 'Limpar seleção' : 'Selecionar todas'}</button>
          <button class="btn sm" data-act="aprovar-sel" ${nSel ? '' : 'disabled'}>Aprovar selecionadas (${nSel})</button>` : ''}
      </div>
      <div class="notice info small">A foto é uma evidência de apoio, não prova da execução. Aprove quando atender ao critério publicado; ao pedir ajuste, diga exatamente o que falta. ${modo === 'grade' ? 'Na grade, marque as fotos que estão ok e aprove de uma vez; use “Ajuste” só nas que precisam de correção.' : ''}</div>
      ${items.length ? (modo === 'grade' ? grade() : lista()) : '<div class="card"><p class="muted" style="margin:0">Nenhuma foto aguardando revisão. 🎉</p></div>'}`;
  }

  function viewAdmCaixinha() {
    const aba = ui.cxAba || 'nova';
    const fd = ui.cxDia || 'todos';
    // Possível urgência sempre no topo; depois, as mais antigas primeiro.
    const lista = S.caixinha.filter((c) => c.status === aba && (fd === 'todos' || String(c.dia) === fd))
      .sort((a, b) => (cxSinais(b.texto).urgente - cxSinais(a.texto).urgente) || (a.em < b.em ? -1 : 1));
    const dias = [...new Set(S.caixinha.map((c) => c.dia))].sort((a, b) => a - b);
    const tags = {};
    S.caixinha.forEach((c) => { if (c.tag) tags[c.tag] = (tags[c.tag] || 0) + 1; });
    const topo = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const max = topo.length ? topo[0][1] : 1;
    const proxVideos = (c) => S.days.filter((d) => d.nelly && d.n >= Math.max(c.dia, S.simDay)).map((d) => d.n);

    const card = (c) => {
      const p = person(c.autorId);
      const sin = cxSinais(c.texto);
      const autor = c.anonima ? '<span class="badge b-privada">🕶 Anônima</span>' : `<strong>${esc(p ? p.nome : '—')}</strong>`;
      const urg = sin.urgente ? `<div class="notice bad small"><strong>⚠ Possível urgência</strong>${c.anonima ? 'Mensagem anônima: não dá para contatar quem enviou. Responda com orientação para procurar atendimento e publique um aviso geral no mural, se fizer sentido.' : `Entre em contato hoje com ${esc(p.nome)} (${esc(p.email)}) e oriente a procurar atendimento. `}${AVISO_URGENCIA}</div>` : '';
      const tagSel = `<select class="input cx-tag" data-act="cx-tag" data-id="${c.id}"><option value="">Tema…</option>${J.temasCaixinha.map((t) => `<option ${c.tag === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
      let acoes = '';
      if (c.status === 'nova') {
        acoes = `<div class="btn-row">${tagSel}<button class="btn sm" data-act="cx-triar" data-id="${c.id}" data-dest="equipe">Equipe responde</button><button class="btn sm soft" data-act="cx-triar" data-id="${c.id}" data-dest="nelly">Clínica → Dra. Nelly</button><button class="btn sm ghost" data-act="cx-triar" data-id="${c.id}" data-dest="arquivada">Arquivar</button></div>`;
      } else if (c.status === 'equipe') {
        acoes = `${sin.clinica ? '<div class="notice warn small">Parece uma dúvida clínica. A equipe não responde casos de saúde: envie para a Dra. Nelly.</div>' : ''}
          <label class="field"><span>Resposta da equipe</span><textarea class="input" id="cx-r-${c.id}" rows="3"></textarea><div data-errfor="cx-${c.id}"></div></label>
          <label class="tiny" style="display:block;margin-bottom:10px"><input type="checkbox" id="cx-pub-${c.id}"> Publicar no mural “Respostas para todas” (sem o nome de quem perguntou)</label>
          <div class="btn-row">${tagSel}<button class="btn sm" data-act="cx-responder" data-id="${c.id}">Responder</button><button class="btn sm soft" data-act="cx-triar" data-id="${c.id}" data-dest="nelly">Enviar para a Dra. Nelly</button></div>`;
      } else if (c.status === 'nelly') {
        const vids = proxVideos(c);
        acoes = `<div class="notice info small">Responda em tom geral, sem citar medicamentos, doses ou preços. Orientação individual, só em consulta.</div>
          <div class="choices"><button type="button" class="choice" data-act="cx-modelo" data-id="${c.id}">Usar resposta “orientar consulta”</button></div>
          <label class="field"><span>Onde responder</span><select class="input" id="cx-video-${c.id}"><option value="">Por escrito, aqui na caixinha</option>${vids.map((n) => `<option value="${n}">No vídeo do dia ${n}: ${esc(dayOf(n).nelly.titulo)}</option>`).join('')}</select></label>
          <label class="field"><span>Resposta da Dra. Nelly</span><textarea class="input" id="cx-r-${c.id}" rows="3"></textarea><div data-errfor="cx-${c.id}"></div></label>
          <label class="tiny" style="display:block;margin-bottom:10px"><input type="checkbox" id="cx-pub-${c.id}"> Publicar no mural para todas (sem o nome de quem perguntou)</label>
          <div class="btn-row">${tagSel}<button class="btn sm" data-act="cx-responder" data-id="${c.id}">Responder como Dra. Nelly</button><button class="btn sm ghost" data-act="cx-triar" data-id="${c.id}" data-dest="equipe">Devolver para a equipe</button></div>`;
      } else if (c.status === 'respondida') {
        acoes = `<div class="cx-resp"><div class="tiny muted">${esc(c.resposta.por)} · ${fmtDT(c.resposta.em)} · ${c.resposta.publica ? '📢 no mural' : 'só para quem perguntou'}</div>${esc(c.resposta.texto)}${c.resposta.video ? `<div class="tiny muted" style="margin-top:4px">🎥 Pauta do vídeo do dia ${c.resposta.video}</div>` : ''}</div>
          <div class="btn-row" style="margin-top:8px">${tagSel}<button class="btn sm ghost" data-act="cx-publicar" data-id="${c.id}">${c.resposta.publica ? 'Tirar do mural' : 'Publicar no mural'}</button></div>`;
      } else {
        acoes = `<div class="btn-row">${tagSel}<button class="btn sm ghost" data-act="cx-triar" data-id="${c.id}" data-dest="nova">Reabrir</button></div>`;
      }
      return `<div class="card cx" id="cx-${c.id}">
        <div class="cx-head">${autor}<span class="tiny muted">Dia ${c.dia} · ${fmtDT(c.em)}</span>
          ${c.sobre === 'saude' ? '<span class="badge b-aguardando_revisao">marcou: saúde</span>' : ''}
          ${sin.clinica && c.status === 'nova' ? '<span class="badge b-privada">parece clínica</span>' : ''}
          ${dayOf(c.dia).caixinha && c.dia ? `<span class="tiny muted">· caixinha do dia: “${esc(dayOf(c.dia).caixinha.pergunta.split('?')[0])}?”</span>` : ''}</div>
        ${urg}
        <blockquote class="cx-txt">${esc(c.texto)}</blockquote>
        ${acoes}
        <div class="history">${c.historico.map((h) => `<div>${fmtDT(h.em)} · ${esc(h.acao)}</div>`).join('')}</div>
      </div>`;
    };

    return `<div class="main-head"><div><h1>Caixinha</h1><p class="muted">Perguntas e mensagens das participantes. Dúvidas clínicas vão para a Dra. Nelly.</p></div>
        <select class="input" style="width:auto" data-act="cx-dia"><option value="todos">Todos os dias</option>${dias.map((d) => `<option value="${d}" ${String(d) === fd ? 'selected' : ''}>Dia ${d}</option>`).join('')}</select></div>
      <div class="two-col" style="margin-bottom:16px">
        <div class="card"><h3>Temas mais comuns</h3><p class="tiny muted">Para a Ana e a Dra. Nelly escolherem o que responder nos Stories e nos vídeos.</p>
          ${topo.length ? topo.map(([t, n]) => `<div class="poll-row"><span>${esc(t)}</span><div class="bar dark"><i style="width:${Math.round((n / max) * 100)}%"></i></div><b>${n}</b></div>`).join('') : '<p class="small muted" style="margin:0">Os temas aparecem conforme a equipe classifica as mensagens.</p>'}</div>
        <div class="card"><h3>Como funciona</h3><ol class="small" style="margin:0;padding-left:18px">
          <li><strong>Triagem:</strong> a equipe lê, escolhe o tema e decide: a equipe responde, vai para a Dra. Nelly (dúvida de saúde) ou arquiva (desabafo, relato).</li>
          <li><strong>Dra. Nelly</strong> responde em tom geral, por escrito ou como pauta de um vídeo.</li>
          <li><strong>Mural:</strong> respostas úteis para todas podem ser publicadas, sem o nome de quem perguntou.</li>
          <li><strong>Anônimas:</strong> ninguém da equipe vê quem enviou.</li></ol></div>
      </div>
      <div class="filters"><span class="seg-light">${CX_ABAS.map(([k, l]) => `<button data-act="cx-aba" data-v="${k}" class="${aba === k ? 'on' : ''}">${l} (${S.caixinha.filter((c) => c.status === k && (fd === 'todos' || String(c.dia) === fd)).length})</button>`).join('')}</span></div>
      ${lista.length ? lista.map(card).join('') : '<div class="card"><p class="muted" style="margin:0">Nada aqui. 🎉</p></div>'}`;
  }

  function viewAdmCheckins(n) {
    if (n > S.simDay) n = S.simDay;
    const ps = S.participantes;
    const resp = ps.filter((p) => S.checkins[p.id][n]);
    const pend = ps.filter((p) => !S.checkins[p.id][n]);
    const day = dayOf(n);
    const bal = day.balanco;
    const enq = day.enquete;
    const opts = Array.from({ length: S.simDay }, (_, i) => `<option value="${i + 1}" ${i + 1 === n ? 'selected' : ''}>Dia ${i + 1} · ${esc(dayOf(i + 1).tema)}</option>`).join('');
    const cont = { sim: 0, parte: 0, nao: 0 };
    resp.forEach((p) => cont[S.checkins[p.id][n].feito]++);
    return `<div class="main-head"><div><h1>Check-ins</h1><p class="muted">${resp.length} responderam · ${pend.length} pendentes</p></div>
        <select class="input" style="width:auto" data-act="ck-dia">${opts}</select></div>
      <div class="kpis">
        <div class="kpi"><div class="l">Fez o dia</div><div class="v">${cont.sim}</div></div>
        <div class="kpi"><div class="l">Em parte</div><div class="v">${cont.parte}</div></div>
        <div class="kpi"><div class="l">Não</div><div class="v">${cont.nao}</div></div>
        <div class="kpi"><div class="l">Pendentes</div><div class="v">${pend.length}</div></div>
      </div>
      <div class="two-col">
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Respondeu</th><th>Fez o dia?</th><th>Em uma palavra</th><th>Hora</th></tr></thead><tbody>
          ${resp.map((p) => { const c = S.checkins[p.id][n]; return `<tr><td>${esc(p.nome)}</td><td>${FEITO[c.feito]}</td><td>“${esc(c.palavra)}”</td><td class="tiny muted">${fmtDT(c.em)}</td></tr>`; }).join('') || '<tr><td colspan="4" class="muted">Ninguém respondeu ainda.</td></tr>'}
        </tbody></table></div>
        <div class="card"><h3>Pendentes</h3>${pend.map((p) => `<div style="padding:5px 0;border-bottom:1px solid var(--line)">${esc(p.nome)}</div>`).join('') || '<p class="muted">Todas responderam.</p>'}
          <p class="tiny muted" style="margin:10px 0 0">As palavras não são interpretadas automaticamente. Dúvidas clínicas vão para a Dra. Nelly.</p></div>
      </div>
      ${enq ? (() => {
        const tot = resp.filter((p) => S.checkins[p.id][n].enquete).length;
        return `<h2 style="margin-top:22px">📊 Enquete: ${esc(enq.pergunta)}</h2><div class="card">${enq.opcoes.map((o) => {
          const c = resp.filter((p) => S.checkins[p.id][n].enquete === o).length;
          const pct = tot ? Math.round((c / tot) * 100) : 0;
          return `<div class="poll-row"><span>${esc(o)}</span><div class="bar dark"><i style="width:${pct}%"></i></div><b>${c} · ${pct}%</b></div>`;
        }).join('')}<p class="tiny muted" style="margin:8px 0 0">${tot} resposta(s). Resultado agregado, sem interpretação individual.</p></div>`;
      })() : ''}
      ${bal ? `<h2 style="margin-top:22px">${esc(bal.titulo)}</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Participante</th>${bal.perguntas.map((q) => `<th>${esc(q)}</th>`).join('')}</tr></thead><tbody>
        ${resp.filter((p) => S.checkins[p.id][n].balanco).map((p) => `<tr><td>${esc(p.nome)}</td>${bal.perguntas.map((_, i) => `<td>${esc(S.checkins[p.id][n].balanco[i] || '—')}</td>`).join('')}</tr>`).join('') || '<tr><td colspan="3" class="muted">Sem respostas.</td></tr>'}
      </tbody></table></div>` : ''}`;
  }

  function viewDias() {
    const rows = S.days.map((d) => {
      const last = S.log.filter((l) => l.dia === d.n).slice(-1)[0];
      return `<tr class="click" data-act="open-dia" data-n="${d.n}">
        <td><strong>${d.n}</strong></td><td class="tiny muted">${fmtDia(d.n)}</td>
        <td><strong>${esc(d.tema)}</strong><div class="tiny muted">${esc(semanaLabel(d.semana))}</div>${d.nelly ? `<div class="tiny" style="margin-top:4px">🎥 Dra. Nelly · <span class="badge ${d.nelly.status === 'aprovado' ? 'b-aprovada' : 'b-aguardando_revisao'}">${NELLY_STATUS[d.nelly.status]}</span></div>` : ''}${d.enquete ? '<div class="tiny muted">📊 enquete no check-in</div>' : ''}${d.cta ? '<div class="tiny muted">💬 botão de avaliação</div>' : ''}</td>
        ${d.tarefas.map((t) => `<td class="taskcell">${esc(t.titulo)}<div class="tiny muted">${esc(tipoDesc(t))}</div></td>`).join('')}
        <td class="tiny muted">${last ? `${fmtDT(last.em)}<br>${esc(last.por)}` : '—'}</td>
      </tr>`;
    }).join('');
    return `<div class="main-head"><div><h1>Configurar dias</h1><p class="muted">${esc(J.campanha.nome)} · início ${fmtDia(1)} · libera às ${J.campanha.liberacao} (${J.campanha.fuso})</p></div></div>
      <form data-form="instagram" class="card" style="margin-bottom:16px"><h3>Perfis marcados no compartilhamento</h3><p class="small muted">Aparecem no texto pronto que as participantes copiam todos os dias.</p><div class="cols-3">${S.instagram.map((i, k) => `<label class="field"><span>${esc(i.nome)}</span><input class="input ${igValido(i.usuario) ? '' : 'err'}" name="ig${k}" value="${esc(i.usuario)}">${igValido(i.usuario) ? '' : '<div class="err-msg">O Instagram não aceita acentos ou espaços no @. Confirme o perfil correto.</div>'}</label>`).join('')}</div><button class="btn sm" type="submit">Salvar perfis</button></form>
      <form data-form="semanas" class="card" style="margin-bottom:16px"><h3>Semanas</h3><p class="small muted">Se a Ana preferir outros temas para as semanas, é só trocar aqui.</p><div class="cols-3">${S.semanas.map((w, i) => `<div><label class="field"><span>Semana ${i + 1}</span><input class="input" name="w${i}" value="${esc(w.nome)}"></label><label class="field"><span>Foco</span><textarea class="input" name="f${i}" rows="2">${esc(w.foco)}</textarea></label></div>`).join('')}</div><button class="btn sm" type="submit">Salvar semanas</button></form>
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Dia</th><th>Data</th><th>Tema</th><th>Alimentação</th><th>Movimento</th><th>Mentalidade</th><th>Compartilhar</th><th>Última alteração</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  function viewDiaEdit(n) {
    const d = dayOf(n);
    if (!d) return '<p>Dia não encontrado.</p>';
    const hist = S.log.filter((l) => l.dia === n).slice().reverse();
    const taskEd = (t, ti) => {
      const r = t.registro;
      let extra = '';
      if (r.tipo === 'texto') {
        extra = r.campos.map((c, i) => `<div style="display:flex;gap:10px;align-items:center;margin-bottom:8px"><input class="input" name="t${ti}-c${i}" value="${esc(c.label)}"><label class="tiny" style="white-space:nowrap"><input type="checkbox" name="t${ti}-o${i}" ${c.obrigatorio ? 'checked' : ''}> obrigatório</label></div>`).join('') +
          `<label class="tiny"><input type="checkbox" name="t${ti}-priv" ${r.privado ? 'checked' : ''}> resposta privada (equipe não vê)</label>`;
      } else if (r.tipo === 'checklist') {
        extra = `<label class="field"><span>Itens (um por linha)</span><textarea class="input" name="t${ti}-itens" rows="3">${esc(r.itens.join('\n'))}</textarea></label><label class="field"><span>Mínimo para registrar</span><input class="input" type="number" min="1" name="t${ti}-min" value="${r.minimo}" style="width:90px"></label>`;
      } else if (r.tipo === 'privado') {
        extra = `<label class="field"><span>Itens de confirmação (um por linha)</span><textarea class="input" name="t${ti}-itens" rows="3">${esc(r.itens.join('\n'))}</textarea></label>`;
      } else if (r.tipo === 'autorrelato') {
        extra = `<label class="field"><span>Opções de atividade (separadas por vírgula, opcional)</span><input class="input" name="t${ti}-opc" value="${esc((r.opcoes || []).join(', '))}"></label>`;
      }
      const ev = t.evidencia || { foto: 'nao', criterio: '' };
      const fotoEd = r.tipo === 'privado'
        ? `<div class="notice lock small" style="margin:10px 0 0">Tarefa privada: não pede foto (fotos do corpo, medidas e áudios ficam no celular).</div>`
        : `<div class="criterio" style="margin-top:10px"><label class="field" style="margin-bottom:8px"><span>📷 Foto de comprovação</span>
            <select class="input" name="t${ti}-foto">${[['obrigatoria', 'Obrigatória'], ['opcional', 'Opcional'], ['nao', 'Não pedir foto']].map(([v, l]) => `<option value="${v}" ${ev.foto === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
            <label class="field" style="margin:0"><span>Critério da foto <em>(a participante vê antes de enviar)</em></span><textarea class="input" name="t${ti}-crit" rows="2">${esc(ev.criterio || '')}</textarea></label></div>`;
      return `<div class="card">
        <span class="frente f-${t.frente}">${FRENTES[t.frente].ic} ${FRENTES[t.frente].nome}</span>
        <label class="field" style="margin-top:8px"><span>Título</span><input class="input" name="t${ti}-tit" value="${esc(t.titulo)}"></label>
        <label class="field"><span>Instrução</span><textarea class="input" name="t${ti}-ins" rows="2">${esc(t.instrucao)}</textarea></label>
        <label class="field"><span>Mensagem de ajuda / alternativa segura <em>(opcional)</em></span><input class="input" name="t${ti}-alt" value="${esc(t.alternativa || '')}"></label>
        <div class="criterio"><strong>Registro:</strong> ${esc(tipoDesc(t))}</div>
        ${extra}
        ${fotoEd}
      </div>`;
    };
    return `<a class="back" href="#/a/dias">‹ Configurar dias</a>
      <form data-form="dia" data-n="${n}">
        <div class="main-head"><div><h1>Dia ${n}</h1><p class="muted">${fmtDia(n)} · ${esc(semanaLabel(d.semana))}</p></div>
          <div class="btn-row">${n > 1 ? `<a class="btn ghost sm" href="#/a/dias/${n - 1}">‹ Dia ${n - 1}</a>` : ''}${n < 21 ? `<a class="btn ghost sm" href="#/a/dias/${n + 1}">Dia ${n + 1} ›</a>` : ''}<button class="btn sm" type="submit">Salvar alterações</button></div></div>
        <div class="notice info small">As alterações valem na hora para as participantes e ficam registradas (quem e quando). Na Fase B, textos de saúde passam pela aprovação da Dra. Nelly antes de publicar.</div>
        <label class="field"><span>Tema do dia</span><input class="input" name="tema" value="${esc(d.tema)}"></label>
        ${d.nelly ? `<div class="card nelly" style="margin-bottom:16px"><h3>🎥 Conteúdo da Dra. Nelly</h3><div class="two-col"><div><label class="field"><span>Título</span><input class="input" name="nl-tit" value="${esc(d.nelly.titulo)}"></label><label class="field"><span>Situação</span><select class="input" name="nl-status">${Object.entries(NELLY_STATUS).map(([v, l]) => `<option value="${v}" ${d.nelly.status === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div><label class="field"><span>Resumo (aparece para as participantes)</span><textarea class="input" name="nl-res" rows="4">${esc(d.nelly.resumo)}</textarea></label></div><p class="tiny muted" style="margin:0">Só aparece para as participantes quando estiver “Aprovado pela Dra. Nelly”.</p></div>` : ''}
        <div class="cols-3">${d.tarefas.map(taskEd).join('')}</div>
      </form>
      <div class="card" style="margin-top:16px"><h3>Histórico de alterações</h3>${hist.length ? hist.map((h) => `<div class="small" style="padding:4px 0">${fmtDT(h.em)} · <strong>${esc(h.por)}</strong> · ${esc(h.resumo)}</div>`).join('') : '<p class="muted small" style="margin:0">Nenhuma alteração desde o cadastro inicial.</p>'}</div>`;
  }

  function viewExportar() {
    return `<div class="main-head"><div><h1>Exportar</h1><p class="muted">Arquivos CSV (abrem no Excel ou Google Planilhas).</p></div></div>
      <div class="two-col">
        <div class="card"><h3>Registros de tarefas</h3><p class="small muted">Uma linha por participante × tarefa até o dia ${S.simDay}: status, data de envio, revisão e motivo de ajuste.</p><button class="btn" data-act="csv-reg">Baixar registros.csv</button></div>
        <div class="card"><h3>Check-ins</h3><p class="small muted">Uma linha por participante × dia: respondeu, fez o dia, palavra e horário.</p><button class="btn" data-act="csv-ck">Baixar checkins.csv</button></div>
      </div>
      <div class="notice lock small" style="margin-top:16px"><strong>🔒 O que não sai na exportação</strong>Respostas de tarefas privadas, fotos e e-mails. A exportação traz apenas o necessário para acompanhar adesão e pendências.</div>`;
  }

  // ---------- CSV ----------
  function csv(rows) {
    return '﻿' + rows.map((r) => r.map((v) => { const s = String(v == null ? '' : v); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';')).join('\n');
  }
  function download(name, content) {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([content], { type: 'text/csv;charset=utf-8' }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ---------- Ações ----------
  function afterRender() {
    const sc = $('#pscroll');
    if (sc) {
      const phone = sc.closest('.phone');
      const h1 = $('.screen h1');
      const t = $('.nav-title');
      if (t) t.textContent = h1 ? h1.textContent : '';
      const upd = () => phone.classList.toggle('scrolled', sc.scrollTop > 48);
      sc.addEventListener('scroll', upd, { passive: true });
      upd();
    }
    const strip = $('#strip');
    const cur = strip && $('[data-cur]', strip);
    if (cur) strip.scrollLeft = cur.offsetLeft - strip.clientWidth / 2 + cur.clientWidth / 2;
  }

  function showErrs(form, errs) {
    $$('[data-errfor]', form).forEach((e) => { e.textContent = ''; e.className = ''; });
    $$('.err', form).forEach((e) => e.classList.remove('err'));
    errs.forEach(([name, msg]) => {
      const el = $(`[data-errfor="${name}"]`, form);
      if (el) { el.textContent = msg; el.className = 'err-msg'; }
      const inp = form.querySelector(`[name="${name}"]`);
      if (inp && inp.classList.contains('input')) inp.classList.add('err');
    });
    const first = $('.err-msg', form);
    if (first) first.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }

  function collectTask(form, task) {
    const r = task.registro;
    const fd = new FormData(form);
    const errs = [];
    const resp = {};
    if (r.tipo === 'autorrelato') {
      resp.modo = fd.get('modo');
      if (!resp.modo) errs.push(['modo', 'Escolha uma opção.']);
      if (r.opcoes) { resp.opcao = fd.get('opcao'); if (!resp.opcao) errs.push(['opcao', 'Conte qual atividade você fez.']); }
      resp.comentario = String(fd.get('comentario') || '').trim();
    } else if (r.tipo === 'texto') {
      resp.campos = r.campos.map((_, i) => String(fd.get('c' + i) || '').trim());
      r.campos.forEach((c, i) => { if (c.obrigatorio && !resp.campos[i]) errs.push(['c' + i, 'Este campo é obrigatório.']); });
    } else if (r.tipo === 'checklist') {
      resp.marcados = r.itens.map((_, i) => (fd.get('i' + i) ? i : -1)).filter((i) => i >= 0);
      if (resp.marcados.length < r.minimo) errs.push(['i0', `Marque pelo menos ${r.minimo} item para registrar.`]);
    } else if (r.tipo === 'privado') {
      resp.confirmados = r.itens.map((_, i) => (fd.get('i' + i) ? i : -1)).filter((i) => i >= 0);
      if (!resp.confirmados.length) errs.push(['i0', 'Marque pelo menos um item para registrar.']);
    } else if (r.tipo === 'compartilhar') {
      resp.link = String(fd.get('link') || '').trim();
      resp.marcou = !!fd.get('marcou');
      if (resp.link && !/^https?:\/\/(www\.)?instagram\.com\//i.test(resp.link)) errs.push(['link', 'O link precisa ser do Instagram (instagram.com/...).']);
      else if (!resp.link && !ui.foto) errs.push(['link', 'Cole o link do post ou envie o print.']);
      if (!resp.marcou) errs.push(['marcou', 'Confirme que marcou os três perfis.']);
    }
    if (pedeFoto(task) && task.evidencia.foto === 'obrigatoria' && !ui.foto) errs.unshift(['foto', 'Esta tarefa pede uma foto de comprovação. Anexe para enviar.']);
    return { resp, errs };
  }

  // Conclui o login (Google ou código no e-mail) e segue para o perfil, se ainda não foi preenchido.
  function entrar(metodo, email, nomeGoogle) {
    const me = person(ME);
    me.email = email;
    me.metodo = metodo;
    if (nomeGoogle) me.nome = nomeGoogle;
    else if (!S.sessao.perfilOk) me.nome = '';
    S.sessao.logado = true;
    S.sessao.metodo = metodo;
    save();
    ui = {};
    go('#/hoje');
  }

  function submitTask(form, draft) {
    const { day, task } = findTask(form.dataset.id);
    const { resp, errs } = collectTask(form, task);
    const prev = getReg(ME, task.id);
    const em = nowStamp();
    const hist = (prev.historico || []).slice();
    if (draft) {
      setReg(ME, task.id, { status: 'em_andamento', respostas: resp, foto: ui.foto || null, enviadoEm: em, historico: hist });
      save(); toast('Rascunho salvo.'); ui.editing = false; render(); return;
    }
    if (errs.length) { showErrs(form, errs); return; }
    // Toda foto de comprovação passa pela revisão; sem foto, fica como autorrelato.
    const status = ui.foto ? 'aguardando_revisao' : 'registrada';
    hist.push({ em, acao: prev.status === 'precisa_ajuste' ? 'Corrigido e reenviado pela participante' : prev.status === 'registrada' ? 'Registro editado' : 'Enviado pela participante' });
    setReg(ME, task.id, { status, respostas: resp, foto: ui.foto || null, enviadoEm: em, historico: hist });
    save();
    ui = {};
    toast(status === 'aguardando_revisao' ? 'Recebido! Sua foto foi para a revisão da equipe.' : 'Registrado! 💚');
    go('#/dia/' + day.n);
  }

  // Reduz a imagem antes de guardar (menos espaço e upload mais rápido).
  function shrink(file, max, cb) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        cb(c.toDataURL('image/jpeg', 0.75));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function readPhoto(file) {
    shrink(file, 720, (url) => {
        ui.foto = url;
        const zone = $('#photo-zone');
        if (zone) {
          zone.innerHTML = `<img class="photo-prev" src="${ui.foto}" alt="Prévia da foto"><div><strong>Trocar foto</strong></div><div class="tiny muted">Foto pronta para enviar</div>`;
          const e = $('[data-errfor="foto"]'); if (e) { e.textContent = ''; e.className = ''; }
        }
    });
  }

  function decide(key, aprovar, motivo, silencioso) {
    const [pid, tid] = key.split('|');
    const reg = getReg(pid, tid);
    const em = nowStamp();
    reg.status = aprovar ? 'aprovada' : 'precisa_ajuste';
    reg.revisao = { por: REVISOR, em, decisao: aprovar ? 'aprovada' : 'ajuste', motivo: motivo || '' };
    reg.historico = (reg.historico || []).concat({ em, acao: aprovar ? `Aprovada por ${REVISOR}` : `Ajuste solicitado por ${REVISOR}` });
    setReg(pid, tid, reg);
    save();
    ui.ajusteKey = null;
    if (ui.sel) delete ui.sel[key];
    if (!silencioso) { toast(aprovar ? 'Aprovada.' : 'Pedido de ajuste enviado à participante.'); render(true); }
  }

  function saveDia(form) {
    const n = Number(form.dataset.n);
    const d = dayOf(n);
    const fd = new FormData(form);
    const before = JSON.stringify(d);
    d.tema = String(fd.get('tema') || d.tema).trim();
    if (d.nelly) {
      d.nelly.titulo = String(fd.get('nl-tit') || d.nelly.titulo).trim();
      d.nelly.resumo = String(fd.get('nl-res') || d.nelly.resumo).trim();
      d.nelly.status = String(fd.get('nl-status') || d.nelly.status);
    }
    d.tarefas.forEach((t, ti) => {
      const g = (k) => fd.get(`t${ti}-${k}`);
      t.titulo = String(g('tit') || t.titulo).trim();
      t.instrucao = String(g('ins') || t.instrucao).trim();
      t.alternativa = String(g('alt') || '').trim() || undefined;
      const r = t.registro;
      if (r.tipo === 'texto') {
        r.campos.forEach((c, i) => { c.label = String(g('c' + i) || c.label).trim(); c.obrigatorio = !!g('o' + i); });
        r.privado = !!g('priv');
      } else if (r.tipo === 'checklist' || r.tipo === 'privado') {
        const itens = String(g('itens') || '').split('\n').map((s) => s.trim()).filter(Boolean);
        if (itens.length) r.itens = itens;
        if (r.tipo === 'checklist') r.minimo = Math.max(1, Math.min(r.itens.length, Number(g('min')) || 1));
      } else if (r.tipo === 'autorrelato') {
        const o = String(g('opc') || '').split(',').map((s) => s.trim()).filter(Boolean);
        r.opcoes = o.length ? o : null;
      }
      if (r.tipo !== 'privado' && g('foto')) t.evidencia = { foto: String(g('foto')), criterio: String(g('crit') || '').trim() };
    });
    if (JSON.stringify(d) === before) { toast('Nada mudou.'); return; }
    S.log.push({ dia: n, em: nowStamp(), por: 'Ana (demo)', resumo: 'Conteúdo do dia atualizado' });
    save();
    toast('Dia ' + n + ' salvo.');
    render();
  }

  function openNotas() {
    $('#modal').innerHTML = `<div class="modal-bg" data-act="close-modal"><div class="modal" data-stop>
      <h2>Premissas deste protótipo</h2>
      <p class="small muted">Decisões que adotamos para poder desenhar. Todas precisam ser validadas com Ana, a equipe e a Dra. Nelly.</p>
      <ul class="small">
        <li><strong>Foto de comprovação obrigatória em alimentação e movimento</strong> (padrão), com critério específico por dia. Exceções: balanços semanais e agenda de movimento (sem foto), cardápio base, refeição social e plano B de movimento (opcional). Mentalidade não pede foto.</li>
        <li><strong>Foto da comida ou da atividade, nunca do corpo.</strong> Para movimento: local, tênis, tapete ou tela do app/relógio. Evitar rostos de outras pessoas e de crianças.</li>
        <li><strong>Toda foto passa pela revisão.</strong> A equipe aprova em lote na grade e só detalha as que precisam de ajuste. Tarefas sem foto ficam “Registrada”, nunca “Aprovada”.</li>
        <li><strong>A equipe pode mudar a exigência</strong> (obrigatória, opcional ou sem foto) por tarefa em Configurar dias.</li>
        <li><strong>Privado de verdade.</strong> Fotos e medidas do corpo, áudios e a carta nunca sobem: só a confirmação. Reflexões marcadas como privadas ficam salvas, mas a equipe não lê.</li>
        <li><strong>Liberação por data da campanha</strong> (todas começam juntas, numa segunda-feira, às ${J.campanha.liberacao}). Dias anteriores continuam abertos para registro.</li>
        <li><strong>Antes e depois privado.</strong> Medidas e fotos de frente, costas e perfil nos dias 1 e 21 ficam só no aparelho da participante (como pede o documento dos 21 dias, por causa das regras de publicidade médica). A comparação aparece só para ela. Nada vai para a equipe nem para a exportação.</li>
        <li><strong>Conteúdo da Dra. Nelly</strong> nos dias 2, 7, 14, 18 e 21 só aparece depois de aprovado. No protótipo, o do dia 18 (hormônios) está em revisão para mostrar essa regra.</li>
        <li><strong>Enquetes dos Stories viram enquete no check-in</strong> (dias 4, 7, 10, 14 e 16). Os balanços de domingo (dias 7 e 14) também vão no check-in.</li>
        <li><strong>Botão de avaliação</strong> nos dias 18 e 21 e em Avisos, com a palavra-código “${esc(J.campanha.palavraCodigo)}”. O número de WhatsApp da clínica ainda precisa ser informado.</li>
        <li><strong>Login com o Google</strong> (opção principal) ou código no e-mail, sem senha. Do Google usamos só nome e e-mail (escopos openid, email e profile). Depois do primeiro acesso a participante confirma o nome e diz como prefere ser chamada. Se um dia virar app na App Store, a Apple exige também “Entrar com a Apple” quando há login social.</li>
        <li><strong>Público:</strong> os textos seguem o documento, que fala com mães. O dia 12 tem uma alternativa para quem não é mãe.</li>
        <li><strong>Compartilhar o dia</strong> é uma 4ª tarefa diária: postar no Instagram marcando a clínica, a Dra. Nelly e a Ana (${S.instagram.map((i) => esc(i.usuario)).join(', ')}) com ${esc(J.campanha.hashtag)}. Comprovação por link ou print (o print vai para a revisão). Quem tem perfil fechado ou não quer se expor marca “Não vou postar hoje”, sem punição. O @ da clínica com acento não existe no Instagram e precisa ser confirmado.</li>
        <li><strong>Caixinha:</strong> mensagens com nome ou anônimas. A equipe faz a triagem (equipe responde, Dra. Nelly ou arquivar). Respostas úteis podem ir para o mural sem o nome. Palavras de alerta (ex.: dor no peito) mostram aviso de urgência com SAMU 192 e CVV 188. Na versão real, o vínculo das anônimas com a autora fica protegido e só serve para ela ver as próprias mensagens.</li>
      </ul>
      <h3>Em aberto</h3>
      <ul class="small">
        <li>Quem faz a triagem da caixinha e em quanto tempo responde; se mensagens com sinal de urgência disparam aviso imediato para a equipe.</li>
        <li>Número de participantes e prazo da revisão: com foto em 2 tarefas por dia, 100 participantes geram cerca de 200 fotos por dia para a equipe.</li>
        <li>Prazo de retenção das fotos de comprovação após a campanha.</li>
        <li>Canal de lembretes (push, e-mail ou WhatsApp).</li>
        <li>Fase B: calendário editorial com aprovação clínica e métricas de campanha.</li>
      </ul>
      <button class="btn" data-act="close-modal">Fechar</button>
    </div></div>`;
  }

  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    const act = el.dataset.act;
    // Toque fora da folha do Google fecha; dentro dela, segue normal (inclui o botão de enviar).
    if (act === 'google-fechar') { if (!e.target.closest('[data-stop]')) { ui = {}; render(true); } return; }
    if (act === 'close-modal') { if (e.target.closest('[data-stop]') && el.classList.contains('modal-bg')) return; $('#modal').innerHTML = ''; return; }
    if (['simday', 'busca', 'filtro', 'rev-dia', 'rev-frente', 'ck-dia', 'foto', 'pfoto', 'sel', 'cx-tag', 'cx-dia'].includes(act)) return; // tratados em change/input
    e.preventDefault();
    switch (act) {
      case 'noop': break;
      case 'role': go(el.dataset.v === 'a' ? '#/a/painel' : '#/hoje'); break;
      case 'notas': openNotas(); break;
      case 'reset':
        if (confirm('Voltar o protótipo ao estado inicial? Os registros feitos na demo serão apagados deste navegador.')) { S = seed(5); save(); savePriv({}); ui = {}; go('#/hoje'); }
        break;
      case 'login-inicio': ui = {}; render(); break;
      case 'login-email': ui = { loginStep: 'email' }; render(); break;
      case 'google': ui = { googleAberto: true }; render(true); break;
      case 'google-outra': ui = { googleAberto: true, googleOutra: true }; render(true); break;
      case 'google-conta': {
        const base = J.participantes[0];
        entrar('google', base.email.replace('@exemplo.com', '@gmail.com'), base.nome);
        break;
      }
      case 'cta': {
        S.cta[ME] = (S.cta[ME] || []).concat({ dia: Number(el.dataset.n) || S.simDay, em: nowStamp() });
        save();
        // Na versão real abre wa.me/<número da clínica>?text=<mensagem>.
        if (J.campanha.whatsappClinica) window.open('https://wa.me/' + J.campanha.whatsappClinica + '?text=' + encodeURIComponent(msgCta()), '_blank', 'noopener');
        else alert('Na versão real, abre o WhatsApp da clínica com a mensagem pronta:\n\n“' + msgCta() + '”');
        break;
      }
      case 'cx-aba': ui.cxAba = el.dataset.v; render(); break;
      case 'cx-triar': {
        const c = S.caixinha.find((x) => x.id === el.dataset.id);
        const dest = el.dataset.dest;
        const sel = document.querySelector(`[data-act="cx-tag"][data-id="${c.id}"]`);
        if (sel && sel.value) c.tag = sel.value;
        c.status = dest; c.mexido = true;
        if (dest === 'equipe' || dest === 'nelly') c.destino = dest;
        const acao = { equipe: 'Triagem: a equipe responde', nelly: 'Triagem: clínica, enviada à Dra. Nelly', arquivada: 'Arquivada na triagem', nova: 'Reaberta para triagem' }[dest];
        c.historico.push({ em: nowStamp(), acao: acao + ' · Equipe (demo)' });
        save();
        toast({ equipe: 'Fica com a equipe.', nelly: 'Enviada para a Dra. Nelly.', arquivada: 'Arquivada.', nova: 'Reaberta.' }[dest]);
        render(true);
        break;
      }
      case 'cx-modelo': { const t = $('#cx-r-' + el.dataset.id); if (t) { t.value = CX_MODELO_CONSULTA; t.focus(); } break; }
      case 'cx-responder': {
        const c = S.caixinha.find((x) => x.id === el.dataset.id);
        const t = $('#cx-r-' + c.id);
        const vSel = $('#cx-video-' + c.id);
        const video = vSel && vSel.value ? Number(vSel.value) : null;
        let texto = t ? t.value.trim() : '';
        if (!texto && video) texto = `Obrigada pela pergunta! Vou falar sobre isso, em tom geral, no vídeo do dia ${video}.`;
        if (!texto) { const er = $(`[data-errfor="cx-${c.id}"]`); er.textContent = 'Escreva a resposta ou escolha um vídeo.'; er.className = 'err-msg'; t.classList.add('err'); return; }
        const nelly = c.status === 'nelly';
        const em = nowStamp();
        const publica = !!($('#cx-pub-' + c.id) || {}).checked;
        const sel = document.querySelector(`[data-act="cx-tag"][data-id="${c.id}"]`);
        if (sel && sel.value) c.tag = sel.value;
        c.resposta = { texto, por: nelly ? 'Dra. Nelly Kim (demo)' : 'Equipe Eleviê (demo)', em, publica, video };
        c.status = 'respondida'; c.mexido = true;
        c.historico.push({ em, acao: `Respondida por ${c.resposta.por}${publica ? ' (publicada no mural)' : ''}` });
        save(); toast('Resposta enviada.'); render(true);
        break;
      }
      case 'cx-publicar': {
        const c = S.caixinha.find((x) => x.id === el.dataset.id);
        c.resposta.publica = !c.resposta.publica;
        c.historico.push({ em: nowStamp(), acao: c.resposta.publica ? 'Publicada no mural' : 'Retirada do mural' });
        save(); render(true);
        break;
      }
      case 'priv-apagar':
        if (confirm('Apagar seu registro privado (fotos e medidas) deste celular? Não dá para desfazer.')) { savePriv({}); toast('Registro privado apagado.'); render(); }
        break;
      case 'priv-baixar': {
        const pv = loadPriv();
        ['inicio', 'final'].forEach((f) => POSES.forEach(([k]) => {
          const url = pv[f] && pv[f].fotos && pv[f].fotos[k];
          if (!url) return;
          const a = document.createElement('a');
          a.href = url; a.download = `jornada-dia${f === 'inicio' ? 1 : 21}-${k}.jpg`;
          document.body.appendChild(a); a.click(); a.remove();
        }));
        break;
      }
      case 'logout': S.sessao.logado = false; save(); ui = {}; go('#/hoje'); break;
      case 'edit-task': ui.editing = true; render(); break;
      case 'nao-open': ui.naoConsegui = true; render(); break;
      case 'nao-cancel': ui.naoConsegui = false; render(); break;
      case 'nao-confirm': {
        const id = ui.taskId;
        const { day } = findTask(id);
        const prev = getReg(ME, id);
        const em = nowStamp();
        setReg(ME, id, { status: 'nao_realizada', motivo: $('#nao-motivo').value, enviadoEm: em, historico: (prev.historico || []).concat({ em, acao: 'Marcada como não realizada' }) });
        save(); ui = {}; toast('Registrado. Amanhã é um novo dia. 💚'); go('#/dia/' + day.n);
        break;
      }
      case 'draft': submitTask(el.closest('form'), true); break;
      case 'copiar-legenda': {
        const t = $('#legenda');
        const ok = () => toast('Texto copiado. Agora é só colar no Instagram.');
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t.value).then(ok, () => { t.select(); document.execCommand('copy'); ok(); });
        else { t.select(); document.execCommand('copy'); ok(); }
        break;
      }
      case 'edit-ck': ui.editCk = true; render(); break;
      case 'consent-toggle': {
        const c = S.consent[ME];
        const k = el.dataset.k;
        const em = nowStamp();
        const novo = !(c[k] && c[k].aceito);
        c[k] = { ...(c[k] || {}), aceito: novo, em, versao: 'v1.0' };
        c.historico.push({ k, aceito: novo, em });
        save(); toast(novo ? 'Autorização registrada.' : 'Autorização revogada.'); render();
        break;
      }
      case 'open-part': go('#/a/participante/' + el.dataset.id); break;
      case 'open-dia': go('#/a/dias/' + el.dataset.n); break;
      case 'aprovar': decide(el.dataset.key, true); break;
      case 'ajuste-open': {
        ui.ajusteKey = el.dataset.key; ui.revModo = 'lista'; render();
        const card = document.getElementById('rev-' + el.dataset.key.replace('|', '-'));
        if (card) card.scrollIntoView({ block: 'start' });
        const t = $('#motivo-txt'); if (t) t.focus({ preventScroll: true });
        break;
      }
      case 'rev-modo': ui.revModo = el.dataset.v; ui.ajusteKey = null; render(); break;
      case 'sel-todas': {
        const its = revItems();
        const todas = its.every((x) => (ui.sel || {})[x.p.id + '|' + x.task.id]);
        ui.sel = {};
        if (!todas) its.forEach((x) => { ui.sel[x.p.id + '|' + x.task.id] = true; });
        render(true);
        break;
      }
      case 'aprovar-sel': {
        const keys = Object.keys(ui.sel || {}).filter((k) => ui.sel[k]);
        keys.forEach((k) => decide(k, true, '', true));
        ui.sel = {};
        toast(keys.length + (keys.length === 1 ? ' foto aprovada.' : ' fotos aprovadas.'));
        render(true);
        break;
      }
      case 'ajuste-cancel': ui.ajusteKey = null; render(true); break;
      case 'motivo-quick': { const t = $('#motivo-txt'); t.value = el.dataset.v; t.focus(); break; }
      case 'ajuste-confirm': {
        const t = $('#motivo-txt');
        if (!t.value.trim()) { const er = $('[data-errfor="motivo"]'); er.textContent = 'Diga o que precisa ser corrigido.'; er.className = 'err-msg'; t.classList.add('err'); return; }
        decide(el.dataset.key, false, t.value.trim());
        break;
      }
      case 'csv-reg': {
        const rows = [['participante', 'dia', 'tema', 'frente', 'tarefa', 'tipo_registro', 'foto_exigida', 'enviou_foto', 'privada', 'status', 'enviado_em', 'revisado_por', 'revisado_em', 'motivo_ajuste', 'motivo_nao_realizada']];
        S.participantes.forEach((p) => tasksUpTo(S.simDay).forEach(({ day, task }) => {
          const r = getReg(p.id, task.id);
          rows.push([p.nome, day.n, day.tema, FRENTES[task.frente].nome, task.titulo, task.registro.tipo, pedeFoto(task) ? task.evidencia.foto : 'nao', r.foto ? 'sim' : 'não', isPrivate(task) ? 'sim' : 'não', STATUS[r.status], fmtDT(r.enviadoEm).replace('—', ''), r.revisao ? r.revisao.por : '', r.revisao ? fmtDT(r.revisao.em) : '', r.revisao ? r.revisao.motivo : '', r.motivo || '']);
        }));
        download(`registros_dia${S.simDay}.csv`, csv(rows));
        break;
      }
      case 'csv-ck': {
        const rows = [['participante', 'dia', 'respondeu', 'fez_o_dia', 'palavra', 'respondido_em']];
        S.participantes.forEach((p) => { for (let d = 1; d <= S.simDay; d++) { const c = S.checkins[p.id][d]; rows.push([p.nome, d, c ? 'sim' : 'não', c ? FEITO[c.feito] : '', c ? c.palavra : '', c ? fmtDT(c.em) : '']); } });
        download(`checkins_dia${S.simDay}.csv`, csv(rows));
        break;
      }
      default: break;
    }
  });

  document.addEventListener('change', (e) => {
    const el = e.target;
    const act = el.dataset && el.dataset.act;
    if (act === 'simday') {
      const n = Number(el.value);
      const keep = S;
      S = seed(n, keep);
      save(); ui = {};
      toast(`Agora é o dia ${n} da jornada.`);
      render();
    } else if (act === 'filtro') { ui.filtro = el.value; render(); }
    else if (act === 'rev-dia') { ui.revDia = el.value; ui.sel = {}; render(); }
    else if (act === 'cx-tag') { const c = S.caixinha.find((x) => x.id === el.dataset.id); c.tag = el.value || null; c.mexido = true; save(); }
    else if (act === 'cx-dia') { ui.cxDia = el.value; render(); }
    else if (act === 'rev-frente') { ui.revFrente = el.value; ui.sel = {}; render(); }
    else if (act === 'sel') { ui.sel = ui.sel || {}; ui.sel[el.dataset.key] = el.checked; render(true); }
    else if (act === 'ck-dia') { go('#/a/checkins/' + el.value); }
    else if (act === 'foto' && el.files && el.files[0]) { readPhoto(el.files[0]); }
    else if (act === 'pfoto' && el.files && el.files[0]) {
      const pose = el.dataset.pose;
      shrink(el.files[0], 600, (url) => {
        ui.pfotos = ui.pfotos || {};
        ui.pfotos[pose] = url;
        const slot = $('#pose-' + pose);
        if (slot) slot.innerHTML = `<img src="${url}" alt="${pose}"><b>${POSES.find((p) => p[0] === pose)[1]}</b>`;
      });
    }
  });

  let buscaTimer;
  document.addEventListener('input', (e) => {
    if (e.target.dataset && e.target.dataset.act === 'busca') {
      clearTimeout(buscaTimer);
      const v = e.target.value;
      buscaTimer = setTimeout(() => {
        ui.busca = v; render();
        const inp = $('[data-act="busca"]'); if (inp) { inp.focus(); inp.setSelectionRange(v.length, v.length); }
      }, 250);
    }
  });

  document.addEventListener('submit', (e) => {
    const form = e.target;
    const kind = form.dataset.form;
    if (!kind) return;
    e.preventDefault();
    if (kind === 'google-outra') {
      const fd = new FormData(form);
      const email = String(fd.get('email') || '').trim().toLowerCase();
      const nome = String(fd.get('nome') || '').trim();
      const errs = [];
      if (!/^\S+@(gmail|googlemail)\.com$/.test(email) && !/^\S+@\S+\.\S+$/.test(email)) errs.push(['email', 'Digite um e-mail válido.']);
      if (nome.length < 2) errs.push(['nome', 'Digite o nome da conta.']);
      if (errs.length) { showErrs(form, errs); return; }
      entrar('google', email, nome);
    } else if (kind === 'perfil') {
      const fd = new FormData(form);
      const nome = String(fd.get('nome') || '').trim().replace(/\s+/g, ' ');
      if (nome.length < 2) { showErrs(form, [['nome', 'Digite o seu nome.']]); return; }
      const me = person(ME);
      me.nome = nome;
      me.apelido = String(fd.get('apelido') || '').trim();
      const editando = form.dataset.editando === '1';
      S.sessao.perfilOk = true;
      save();
      toast(editando ? 'Perfil atualizado.' : `Prazer, ${chamado(me)}!`);
      go(editando ? '#/avisos' : '#/hoje');
    } else if (kind === 'login-email') {
      const email = String(new FormData(form).get('email') || '').trim();
      if (!/^\S+@\S+\.\S+$/.test(email)) { showErrs(form, [['email', 'Digite um e-mail válido.']]); return; }
      ui.email = email; ui.loginStep = 2; render();
    } else if (kind === 'login-code') {
      const code = String(new FormData(form).get('code') || '').trim();
      if (!/^\d{6}$/.test(code)) { showErrs(form, [['code', 'O código tem 6 números.']]); return; }
      entrar('email', ui.email, null);
    } else if (kind === 'consent') {
      const fd = new FormData(form);
      if (!fd.get('saude') || !fd.get('termos')) { showErrs(form, [['obrig', 'Para participar, marque os dois itens obrigatórios.']]); return; }
      const em = nowStamp();
      S.consent[ME] = {
        saude: { aceito: true, em, versao: 'v1.0' },
        termos: { aceito: true, em, versao: 'v1.0' },
        comunicacoes: { aceito: !!fd.get('comunicacoes'), em, versao: 'v1.0' },
        repost: { aceito: !!fd.get('repost'), em, versao: 'v1.0', escopo: 'Stories de @eleviê e @dra.nellykim durante a campanha' },
        historico: [],
      };
      S.sessao.boasVindas = true; save(); toast('Bem-vinda à jornada! 🌿'); go('#/hoje');
    } else if (kind === 'task') {
      submitTask(form, false);
    } else if (kind === 'checkin') {
      const fd = new FormData(form);
      const n = Number(form.dataset.n);
      const feito = fd.get('feito');
      const palavra = String(fd.get('palavra') || '').trim();
      const errs = [];
      if (!feito) errs.push(['feito', 'Escolha uma opção.']);
      if (!palavra) errs.push(['palavra', 'Escreva uma palavra.']);
      if (errs.length) { showErrs(form, errs); return; }
      const ck = { feito, palavra, em: nowStamp() };
      if (dayOf(n).enquete && fd.get('enquete')) ck.enquete = String(fd.get('enquete'));
      if (dayOf(n).balanco) ck.balanco = dayOf(n).balanco.perguntas.map((_, i) => String(fd.get('b' + i) || '').trim());
      if (n === 21) ck.extra = { leva: String(fd.get('leva') || '').trim(), habito: String(fd.get('habito') || '').trim(), nota: fd.get('nota') };
      S.checkins[ME][n] = ck;
      save(); ui = {}; toast('Check-in enviado. Obrigada! 💚'); render();
    } else if (kind === 'caixinha') {
      const fd = new FormData(form);
      const texto = String(fd.get('texto') || '').trim();
      const identidade = fd.get('identidade');
      const errs = [];
      if (!texto) errs.push(['texto', 'Escreva a sua mensagem.']);
      if (!identidade) errs.push(['identidade', 'Escolha se envia com seu nome ou anônima.']);
      if (errs.length) { showErrs(form, errs); return; }
      const n = Number(form.dataset.n);
      const em = nowStamp();
      S.caixinha.push({ id: 'cx-' + Date.now(), autorId: ME, anonima: identidade === 'anonima', dia: n, em, texto, sobre: fd.get('sobre') || null, tag: null, status: 'nova', destino: null, mexido: true, historico: [{ em, acao: 'Recebida' }] });
      save();
      ui = { cxUrg: cxSinais(texto).urgente };
      toast(identidade === 'anonima' ? 'Mensagem anônima enviada. 💌' : 'Mensagem enviada. 💌');
      render();
    } else if (kind === 'privado') {
      const fd = new FormData(form);
      const fase = form.dataset.fase;
      const medidas = {};
      MEDIDAS.forEach(([k]) => { const v = String(fd.get('m-' + k) || '').trim(); if (v) medidas[k] = Number(v); });
      const sentir = {};
      SENTIR.forEach(([k]) => { if (fd.get('s-' + k)) sentir[k] = Number(fd.get('s-' + k)); });
      const fotos = { ...(ui.pfotos || {}) };
      if (!Object.keys(medidas).length && !Object.values(fotos).some(Boolean) && !Object.keys(sentir).length) {
        showErrs(form, [['priv', 'Registre pelo menos uma foto, uma medida ou como você está se sentindo.']]);
        return;
      }
      const pv = loadPriv();
      pv[fase] = { em: nowStamp(), medidas, sentir, fotos, nota: String(fd.get('nota') || '').trim() };
      if (!savePriv(pv)) { toast('Sem espaço no navegador para guardar as fotos. Tente fotos menores.'); return; }
      ui = {};
      toast('Guardado só no seu celular. 🔒');
      go(fase === 'final' && pv.inicio ? '#/privado/comparar' : '#/privado');
    } else if (kind === 'instagram') {
      const fd = new FormData(form);
      S.instagram.forEach((i, k) => {
        let u = String(fd.get('ig' + k) || '').trim().toLowerCase().replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/[/?].*$/, '');
        if (u && !u.startsWith('@')) u = '@' + u;
        if (u) i.usuario = u;
      });
      S.log.push({ dia: 0, em: nowStamp(), por: 'Ana (demo)', resumo: 'Perfis do Instagram atualizados' });
      save(); toast(S.instagram.every((i) => igValido(i.usuario)) ? 'Perfis salvos.' : 'Salvo, mas confira os perfis marcados em vermelho.'); render(true);
    } else if (kind === 'semanas') {
      const fd = new FormData(form);
      S.semanas.forEach((w, i) => { w.nome = String(fd.get('w' + i) || w.nome).trim(); w.foco = String(fd.get('f' + i) || w.foco).trim(); });
      S.log.push({ dia: 0, em: nowStamp(), por: 'Ana (demo)', resumo: 'Nomes das semanas atualizados' });
      save(); toast('Semanas salvas.'); render(true);
    } else if (kind === 'dia') {
      saveDia(form);
    }
  });

  window.addEventListener('hashchange', () => {
    const keepTask = ui.taskId && location.hash === '#/tarefa/' + ui.taskId;
    if (!keepTask) { const { filtro, busca, revDia, revFrente, revModo, cxAba, cxDia } = ui; ui = { filtro, busca, revDia, revFrente, revModo, cxAba, cxDia }; }
    render();
  });

  init();
  render();
})();
