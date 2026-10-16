// Telas da participante, portadas do protótipo e ligadas ao banco.
import { S, app } from '../estado.js';
import {
  $, esc, FRENTES, ENVIADAS, FEITO, NOME_PAPEL, ehEquipe, chamado, toast, erros, badge, anel, fmtDT, shell,
  diaHoje, pedeFoto, tipoDesc, semanaNome, playerMidia,
} from '../ui.js';
import * as api from '../lib/api.js';
import { ic } from '../lib/icones.js';
import { fmtLongo, fmtCurto } from '../lib/datas.js';
import { reduzirFoto, enviarFoto, precarregarFotos, urlFoto, blobParaDataUrl } from '../lib/fotos.js';
import { lerPrivado, salvarPrivado, apagarPrivado } from '../lib/privado.js';
import { bannerInstalar, cartaoInstalar } from './instalar.js';

const MOTIVOS_NAO = ['Prefiro não dizer', 'Falta de tempo', 'Não me senti bem', 'Imprevisto'];
const MOTIVOS_IG = ['Meu perfil é fechado', 'Prefiro não me expor', 'Não deu tempo', 'Prefiro não dizer'];
const MEDIDAS = [['cintura', 'Cintura'], ['quadril', 'Quadril'], ['busto', 'Busto'], ['braco', 'Braço'], ['coxa', 'Coxa']];
const POSES = [['frente', 'Frente'], ['costas', 'Costas'], ['perfil', 'Perfil']];
const SENTIR = [['energia', 'Energia'], ['sono', 'Sono'], ['disposicao', 'Disposição'], ['humor', 'Humor']];
const AVISO_URGENCIA = 'Se for urgente, procure atendimento médico agora (SAMU 192). Para apoio emocional a qualquer hora, ligue para o CVV no 188.';
const URGENCIA = ['dor no peito', 'falta de ar', 'desmai', 'sangramento', 'sangrando', 'me machucar', 'não quero mais viver', 'nao quero mais viver', 'suicid', 'me matar', 'tirar minha vida'];
const temUrgencia = (t) => URGENCIA.some((k) => String(t || '').toLowerCase().includes(k));

// ---------------------------------------------------------------------------
// Consultas locais
// ---------------------------------------------------------------------------
const diaPorNumero = (n) => S.dias.find((d) => d.numero === n);
const regDe = (t) => S.registros.find((r) => r.tarefa_id === t.id) || { status: 'nao_iniciada' };
const respostasDe = (t) => (t.privada ? ((S.privados[t.id] || {}).respostas || {}) : (regDe(t).respostas || {}));

// Trava dos dias: o dia fecha quando o seguinte libera (06:00). Exceções: correção pedida pela
// equipe (24 horas) e dia reaberto pelo admin. A regra de verdade está no banco; aqui só a tela.
function reabertoAte(n) {
  const ativas = (S.reaberturas || []).filter((x) => x.dia === n && Date.parse(x.ate) > Date.now());
  return ativas.length ? new Date(Math.max(...ativas.map((x) => Date.parse(x.ate)))) : null;
}
export const diaEncerrado = (n) => diaHoje() > n && !reabertoAte(n);
const ajusteAberto = (r) => !!(r.ajuste_ate && Date.parse(r.ajuste_ate) > Date.now());
const podeRegistrar = (t, n) => !diaEncerrado(n) || ajusteAberto(regDe(t));
const NAO_ENVIADA = ['nao_iniciada', 'em_andamento'];
const avisoEncerrado = (n) => `<div class="notice lock"><strong>${ic('lock')} Dia ${n} encerrado</strong>Cada dia fica aberto até a liberação do dia seguinte, às ${String(S.campanha.liberacao).slice(0, 5)}. O que você enviou continua aqui; o que não foi enviado ficou como não registrado.</div>`;
const avisoReaberto = (n) => `<div class="notice warn"><strong>Dia ${n} reaberto para você</strong>A equipe liberou este dia até ${fmtDT(reabertoAte(n).toISOString())}. Depois disso ele fecha de novo.</div>`;
// Ponto de partida (dia 1): primeiro passo obrigatório antes das outras ações.
// As medidas e fotos ficam só no aparelho; no servidor fica só a marca de que foi feito
// (assim não trava quem instala o app ou troca de celular).
function tarefaPartida() {
  for (const dia of S.dias) for (const tarefa of dia.tarefas) if (tarefa.registro_corpo === 'inicio') return tarefa;
  return null;
}
export function pontoDePartidaFeito() {
  if (S.privado.inicio) return true;
  const t = tarefaPartida();
  return !t || !!((S.privados[t.id] || {}).respostas || {}).ponto_partida_em;
}
async function marcarPartidaNoServidor() {
  const t = tarefaPartida();
  if (!t) return;
  const respostas = { ...((S.privados[t.id] || {}).respostas || {}), ponto_partida_em: new Date().toISOString() };
  try {
    await api.salvarRegistroPrivado(t.id, S.perfil.id, respostas);
    S.privados[t.id] = { ...(S.privados[t.id] || {}), respostas };
  } catch { /* sem rede: o registro local já libera neste aparelho */ }
}

export function telaPrecisaPartida() {
  return shell(`<div class="p-body" style="padding-top:16px"><a class="back" href="#/">Hoje</a>
    <div class="card empty">${ic('lock', 'big')}<h2>Primeiro, o seu ponto de partida</h2>
      <p class="muted">Antes de registrar tarefas, check-ins ou mensagens, faça o seu ponto de partida: medidas com fita métrica e fotos de frente, costas e perfil.</p>
      <p class="small muted">Tudo fica guardado só no seu celular, para você comparar no dia 21. Leva uns 5 minutos.</p>
      <a class="btn block" href="#/privado/inicio">Fazer meu ponto de partida</a></div></div>`, 'hoje');
}

function achar(codigo) {
  for (const dia of S.dias) for (const tarefa of dia.tarefas) if (tarefa.codigo === codigo) return { dia, tarefa };
  return {};
}
const tarefasAte = (n) => S.dias.filter((d) => d.numero <= n).flatMap((d) => d.tarefas.map((t) => ({ dia: d, tarefa: t })));
const ckDoDia = (n) => S.checkins.find((c) => c.dia === n);
const inicioDoTexto = (t) => String(t || '').trim();

function estatisticas(ate) {
  const s = { esperadas: 0, enviadas: 0, revisao: 0, ajuste: 0, nao: 0 };
  tarefasAte(ate).forEach(({ tarefa }) => {
    s.esperadas++;
    const st = regDe(tarefa).status;
    if (ENVIADAS.includes(st)) s.enviadas++;
    if (st === 'aguardando_revisao') s.revisao++;
    if (st === 'precisa_ajuste') s.ajuste++;
    if (st === 'nao_realizada') s.nao++;
  });
  s.pct = s.esperadas ? Math.round((s.enviadas / s.esperadas) * 100) : 0;
  return s;
}

function bolinha(st) {
  if (st === 'registrada' || st === 'aprovada') return 'done';
  if (st === 'aguardando_revisao') return 'wait';
  if (st === 'precisa_ajuste') return 'fix';
  if (st === 'nao_realizada') return 'skip';
  return '';
}

const bannerSimulado = () => (ehEquipe() && S.diaSim
  ? `<div class="notice warn small"><strong>Dia simulado: ${S.diaSim}</strong>Só você, da equipe, vê a jornada neste dia (para testar). As participantes seguem o calendário real.</div>`
  : '');

// ---------------------------------------------------------------------------
// Preparação assíncrona (links das fotos e registro privado do aparelho)
// ---------------------------------------------------------------------------
export async function preparar(rota, arg) {
  if (rota === 'tarefa') {
    const { tarefa } = achar(arg);
    if (tarefa) {
      const r = regDe(tarefa);
      if (r.foto_path) await precarregarFotos([r.foto_path]);
    }
  }
  if (['privado', 'dia', 'hoje', 'progresso', 'tarefa', 'checkin', 'caixinha'].includes(rota) || !rota) {
    S.privado.inicio = await lerPrivado(S.perfil.id, 'inicio').catch(() => null);
    S.privado.final = await lerPrivado(S.perfil.id, 'final').catch(() => null);
  }
}

// ---------------------------------------------------------------------------
// Hoje / dia
// ---------------------------------------------------------------------------
function nellyCard(dia) {
  const nl = dia.nelly;
  if (!nl) return '';
  const aprovado = nl.status === 'aprovado';
  if (!aprovado && !ehEquipe()) return '';
  return `<div class="card nelly" style="margin-bottom:14px">
    <div class="nelly-head"><span class="nelly-av">NK</span><div><div class="tiny muted">${esc(nl.formato)} da Dra. Nelly Kim</div><strong>${esc(nl.titulo)}</strong></div></div>
    ${nl.midia_link ? playerMidia(nl) : (ehEquipe() ? '<p class="tiny muted" style="margin:0 0 8px">Ainda sem áudio ou vídeo enviado (só a equipe vê este aviso).</p>' : '')}
    <p class="small" style="margin:0 0 6px">${esc(nl.resumo)}</p>
    ${nl.fecho ? `<p class="small muted" style="margin:0 0 8px"><em>“${esc(nl.fecho)}”</em></p>` : ''}
    ${aprovado ? `<span class="badge b-aprovada">${ic('check')} Aprovado pela Dra. Nelly</span>` : `<span class="badge b-aguardando_revisao">Ainda não aprovado (só a equipe vê)</span>`}
  </div>`;
}

function ctaCard(n) {
  return `<div class="card cta" style="margin-bottom:14px">
    <h3>Quer seguir com acompanhamento?</h3>
    <p class="small">Se você quiser conversar sobre uma avaliação na Eleviê, é só chamar no WhatsApp da clínica. Use a palavra-código <strong>${esc(S.campanha.palavra_codigo || 'Jornada')}</strong>.</p>
    <button class="btn block" data-act="cta" data-n="${n}">${ic('bubble')} Quero agendar minha avaliação</button>
    <p class="tiny muted" style="margin:8px 0 0">Sem compromisso. A jornada continua igual para quem não agendar.</p>
  </div>`;
}

function corpoBanner(n) {
  if (!pontoDePartidaFeito()) return `<a href="#/privado/inicio" style="text-decoration:none"><div class="notice lock"><strong>${ic('lock')} Comece pelo seu ponto de partida</strong>Medidas e fotos de frente, costas e perfil. Ficam só no seu celular, para você comparar no dia 21. As outras tarefas liberam depois deste passo.</div></a>`;
  if (n === 21 && !S.privado.final) return `<a href="#/privado/final" style="text-decoration:none"><div class="notice lock"><strong>${ic('lock')} Hora do seu fechamento</strong>Refaça as medidas e as fotos e veja o seu antes e depois, só para você.</div></a>`;
  return '';
}

function faixaDeDias(atual, hoje) {
  return `<div class="day-strip" id="strip">${S.dias.map((d) => {
    const trancado = d.numero > hoje;
    const pontos = trancado ? '' : `<div class="dots">${d.tarefas.map((t) => `<i class="${bolinha(regDe(t).status)}"></i>`).join('')}</div>`;
    return `<a href="#/dia/${d.numero}" class="${d.numero === atual ? 'on' : ''} ${trancado ? 'lock' : ''}" ${d.numero === atual ? 'data-cur' : ''}>Dia<b>${d.numero}</b>${pontos}</a>`;
  }).join('')}</div>`;
}

export function telaDia(pedido) {
  const c = S.campanha;
  const hoje = diaHoje();
  if (hoje === 0) {
    return shell(`<div class="p-head"><div class="eyebrow">Olá, ${esc(chamado(S.perfil))}</div><h1>Quase lá</h1></div>
      <div class="p-body">${bannerSimulado()}${bannerInstalar()}<div class="card empty">${ic('calendar', 'big')}<h2>A jornada começa em ${fmtCurto(c, 1)}</h2><p class="muted">O dia 1 libera às ${String(c.liberacao).slice(0, 5)}. Enquanto isso, prepare-se: tenha uma fita métrica por perto.</p></div></div>`, 'hoje');
  }
  const limite = Math.min(hoje, 21);
  const n = pedido ? Math.max(1, Math.min(Number(pedido) || limite, 21)) : limite;
  const dia = diaPorNumero(n);
  const ehHoje = n === limite;
  const st = estatisticas(limite);
  const ajustes = tarefasAte(limite).filter(({ tarefa }) => regDe(tarefa).status === 'precisa_ajuste');
  let conteudo;
  if (n > hoje) {
    conteudo = `<div class="card empty">${ic('lock', 'big')}<h2>Dia ${n} · ${esc(dia.tema)}</h2><p class="muted">Libera em ${fmtCurto(c, n)} às ${String(c.liberacao).slice(0, 5)}.</p></div>`;
  } else {
    const ck = ckDoDia(n);
    const encerrado = diaEncerrado(n);
    const selo = (t) => (encerrado && NAO_ENVIADA.includes(regDe(t).status) && !ajusteAberto(regDe(t)) ? '<span class="badge b-nao_iniciada">Não registrada</span>' : badge(regDe(t).status));
    const tarefas = dia.tarefas.map((t) => `<a class="task-card" href="#/tarefa/${t.codigo}">
        <div class="ico ${t.frente}">${ic(FRENTES[t.frente].icone)}</div>
        <div class="t"><div class="t-top"><span class="frente f-${t.frente}">${FRENTES[t.frente].nome}</span>${selo(t)}</div><h3>${esc(t.titulo)}</h3><div class="reg">${esc(tipoDesc(t))}</div></div>
        <div class="trail">${ic('chevron', 'chev')}</div></a>`).join('');
    conteudo = `${encerrado ? avisoEncerrado(n) : (n < hoje && reabertoAte(n) ? avisoReaberto(n) : '')}${corpoBanner(n)}${nellyCard(dia)}
      <div class="sec-title">${ehHoje ? 'Tarefas de hoje' : 'Tarefas do dia'}</div>
      <div class="group">${tarefas}</div>
      <div class="group">
        <a class="task-card" href="#/checkin/${n}"><div class="ico checkin">${ic('bubble')}</div>
          <div class="t"><div class="t-top"><span class="frente f-checkin">Check-in</span>${ck ? '<span class="badge b-registrada">Feito</span>' : `<span class="badge b-nao_iniciada">${encerrado ? 'Não respondido' : 'Pendente'}</span>`}</div><h3>${ck ? 'Check-in respondido' : 'Como foi o seu dia?'}</h3><div class="reg">${ck ? `Você disse: “${esc(ck.palavra)}”` : '2 perguntas rápidas'}</div></div>
          <div class="trail">${ic('chevron', 'chev')}</div></a>
        ${dia.caixinha ? `<a class="task-card" href="#/caixinha/${n}"><div class="ico caixinha">${ic('tray')}</div><div class="t"><span class="frente f-caixinha">Caixinha da Ana</span><h3>${esc(dia.caixinha.pergunta)}</h3><div class="reg">Pode ser anônimo</div></div><div class="trail">${ic('chevron', 'chev')}</div></a>` : ''}
      </div>
      ${dia.cta ? ctaCard(n) : ''}
`;
  }
  const feitosDia = n <= hoje ? dia.tarefas.filter((t) => ENVIADAS.includes(regDe(t).status)).length : 0;
  return shell(`<div class="p-head"><div class="eyebrow">Olá, ${esc(chamado(S.perfil))} · ${fmtLongo(c, n)}</div><h1>${hoje > 21 && ehHoje ? 'Jornada concluída' : ehHoje ? 'Hoje' : 'Dia ' + n}</h1></div>
    <div class="p-body">
      ${bannerSimulado()}
      ${bannerInstalar()}
      ${ajustes.length ? `<a href="#/tarefa/${ajustes[0].tarefa.codigo}" style="text-decoration:none"><div class="notice bad"><strong>${ajustes.length === 1 ? '1 tarefa precisa de ajuste' : ajustes.length + ' tarefas precisam de ajuste'}</strong>Dia ${ajustes[0].dia.numero} · ${esc(ajustes[0].tarefa.titulo)}. Toque para ver o que corrigir.</div></a>` : ''}
      <div class="day-hero">${anel(feitosDia, dia.tarefas.length)}<div class="hero-txt">
        <div class="k">Dia ${n} de 21 · ${esc(semanaNome(dia.semana))}</div><h2>${esc(dia.tema)}</h2>
        <div class="hero-sub">Jornada: ${st.enviadas} de ${st.esperadas} tarefas · ${st.pct}%</div><div class="bar"><i style="width:${st.pct}%"></i></div></div></div>
      ${faixaDeDias(n, hoje)}
      ${conteudo}
    </div>`, 'hoje');
}

// ---------------------------------------------------------------------------
// Tarefa
// ---------------------------------------------------------------------------
function resumoRegistro(t, r, x) {
  const reg = t.registro;
  let foto = '';
  if (r.foto_path && urlFoto(r.foto_path)) foto = `<img class="photo-prev" src="${urlFoto(r.foto_path)}" alt="Foto de comprovação">`;
  let corpo = '';
  if (r.status === 'nao_realizada') return `<span class="muted">Não realizada${r.motivo_nao ? ' · motivo: ' + esc(r.motivo_nao) : ''}.</span>`;
  switch (reg.tipo) {
    case 'autorrelato':
      corpo = `<div>${x.modo === 'adaptado' ? 'Fiz uma versão adaptada' : 'Fiz'}${x.opcao ? ' · ' + esc(x.opcao) : ''}</div>${x.comentario ? `<div class="muted small">“${esc(x.comentario)}”</div>` : ''}`;
      break;
    case 'texto':
      corpo = reg.campos.map((c, i) => ((x.campos && x.campos[i]) || c.obrigatorio ? `<div style="margin-bottom:6px"><div class="tiny muted">${esc(c.label)}</div>${x.campos && x.campos[i] ? esc(x.campos[i]) : '<span class="muted">—</span>'}</div>` : '')).join('');
      break;
    case 'checklist':
      corpo = reg.itens.map((it, i) => `<div>${(x.marcados || []).includes(i) ? ic('check', 'e') : '<span class="i e empty-dot"></span>'} ${esc(it)}</div>`).join('');
      break;
    case 'privado':
      corpo = reg.itens.map((it, i) => `<div>${(x.confirmados || []).includes(i) ? ic('check', 'e') : '<span class="i e empty-dot"></span>'} ${esc(it)}</div>`).join('')
        + `<div class="tiny muted" style="margin-top:6px">${ic('lock', 'e')} Só a confirmação foi registrada. O conteúdo continua no seu celular.</div>`;
      break;
    case 'compartilhar':
      corpo = `<div>${x.marcou ? ic('check', 'e') + ' Marcou os 3 perfis' : 'Marcações não confirmadas'}</div>${x.link ? `<div class="small" style="margin-top:4px;word-break:break-all">${ic('link', 'e')} <a href="${esc(x.link)}" target="_blank" rel="noopener">${esc(x.link)}</a></div>` : ''}`;
      break;
    default: corpo = '';
  }
  return foto + corpo;
}

function corpoLink(t) {
  const fase = t.registro_corpo;
  if (!fase) return '';
  const r = S.privado[fase];
  const nome = fase === 'inicio' ? 'ponto de partida' : 'fechamento';
  return `<div class="card" style="margin:0 0 12px;background:var(--purple-soft)">
    <strong>${ic('lock', 'e')} Meu registro de ${nome}</strong>
    <div class="small" style="margin:4px 0 10px">${r ? `Feito em ${fmtDT(r.em)}. Guardado só neste celular.` : 'Medidas e fotos de frente, costas e perfil. Nada é enviado.'}</div>
    <a class="btn sm" href="#/privado/${fase}">${r ? 'Ver ou refazer' : 'Fazer meu registro'}</a>
    ${fase === 'final' && r && S.privado.inicio ? ' <a class="btn sm ghost" href="#/privado/comparar">Ver antes e depois</a>' : ''}
  </div>`;
}

function legenda(n) {
  const d = diaPorNumero(n);
  const perfis = (S.campanha.instagram || []).map((i) => i.usuario).join(' ');
  return `Dia ${n} de 21 do Desafio 21 Dias: ${d.tema} 💚\n\n${perfis}\n${S.campanha.hashtag || ''}`;
}

function kitCompartilhar(t, dia) {
  const rep = S.consent.repost;
  const perfis = S.campanha.instagram || [];
  return `<div class="share">
    <div class="tiny muted">Ideia para hoje</div><strong>${esc(t.sugestao || '')}</strong>
    <div class="share-tags">${perfis.map((i) => `<span class="ig-tag" title="${esc(i.nome)}">${esc(i.usuario)}</span>`).join('')}<span class="ig-tag hash">${esc(S.campanha.hashtag || '')}</span></div>
    <textarea class="input" id="legenda" rows="5" readonly>${esc(legenda(dia.numero))}</textarea>
    <div class="btn-row" style="margin-top:8px"><button type="button" class="btn sm" data-act="copiar-legenda">${ic('copy')} Copiar texto</button><a class="btn sm ghost" href="https://www.instagram.com/" target="_blank" rel="noopener">Abrir o Instagram</a></div>
    <p class="tiny muted" style="margin:8px 0 0">No Stories, use o adesivo “Menção” para marcar os três perfis. No feed, cole o texto na legenda.</p>
  </div>
  <div class="notice warn small"><strong>Antes de postar</strong>Não poste fotos do seu corpo, medidas nem rostos de crianças. Postar no seu perfil não autoriza a Eleviê a repostar: isso você decide em Avisos › Minhas autorizações${rep && rep.aceito ? ' (hoje: autorizado).' : ' (hoje: não autorizado).'}</div>`;
}

function formularioTarefa(t, dia, r, x) {
  const reg = t.registro;
  let campos = '';
  let depois = '';
  if (reg.tipo === 'autorrelato') {
    campos = `<div class="field"><span style="display:block;font-weight:600;margin-bottom:8px">Como foi?</span>
      <div class="choices">${[['fiz', 'Fiz'], ['adaptado', 'Fiz uma versão adaptada']].map(([v, l]) => `<label class="choice"><input type="radio" name="modo" value="${v}" ${x.modo === v ? 'checked' : ''} hidden>${l}</label>`).join('')}</div><div data-errfor="modo"></div></div>
      ${reg.opcoes ? `<div class="field"><span style="display:block;font-weight:600;margin-bottom:8px">O que você fez?</span><div class="choices">${reg.opcoes.map((o) => `<label class="choice"><input type="radio" name="opcao" value="${esc(o)}" ${x.opcao === o ? 'checked' : ''} hidden>${esc(o)}</label>`).join('')}</div><div data-errfor="opcao"></div></div>` : ''}
      <label class="field"><span>Quer comentar algo? <em>(opcional)</em></span><textarea class="input" name="comentario" rows="2">${esc(x.comentario || '')}</textarea></label>`;
  } else if (reg.tipo === 'texto') {
    campos = (reg.privado ? `<div class="notice lock"><strong>${ic('lock')} Só você vê</strong>Esta resposta não aparece para a equipe.</div>` : '')
      + reg.campos.map((c, i) => `<label class="field"><span>${esc(c.label)} ${c.obrigatorio ? '' : '<em>(opcional)</em>'}</span><textarea class="input" name="c${i}" rows="${reg.campos.length > 2 ? 2 : 3}">${esc((x.campos || [])[i] || '')}</textarea><div data-errfor="c${i}"></div></label>`).join('');
  } else if (reg.tipo === 'checklist') {
    campos = reg.itens.map((it, i) => `<label class="checkline"><input type="checkbox" name="i${i}" ${(x.marcados || []).includes(i) ? 'checked' : ''}><span>${esc(it)}</span></label>`).join('')
      + `<p class="tiny muted">Marque pelo menos ${reg.minimo}.</p><div data-errfor="i0"></div>`;
  } else if (reg.tipo === 'privado') {
    campos = corpoLink(t) + `<div class="notice lock"><strong>${ic('lock')} Fica só com você</strong>Áudios, fotos, medidas e cartas continuam no seu celular. Aqui você só marca que fez.</div>`
      + reg.itens.map((it, i) => `<label class="checkline"><input type="checkbox" name="i${i}" ${(x.confirmados || []).includes(i) ? 'checked' : ''}><span>${esc(it)}</span></label>`).join('') + '<div data-errfor="i0"></div>';
  } else if (reg.tipo === 'compartilhar') {
    campos = kitCompartilhar(t, dia);
    depois = `<label class="field"><span>Link do post ou do Stories <em>(ou envie o print acima)</em></span><input class="input" name="link" type="url" inputmode="url" placeholder="https://www.instagram.com/..." value="${esc(x.link || '')}"><div data-errfor="link"></div></label>
      <p class="tiny muted" style="margin-top:-6px">Perfil fechado? Envie o print: a equipe não consegue abrir o link.</p>
      <label class="checkline"><input type="checkbox" name="marcou" ${x.marcou ? 'checked' : ''}><span>Marquei ${(S.campanha.instagram || []).map((i) => esc(i.usuario)).join(', ')}</span></label><div data-errfor="marcou"></div>`;
  }
  if (pedeFoto(t)) {
    const ob = t.evidencia.foto === 'obrigatoria';
    const ig = reg.tipo === 'compartilhar';
    const previa = S.ui.fotoUrl || (r.foto_path && r.status !== 'precisa_ajuste' ? urlFoto(r.foto_path) : '');
    const blocoFoto = `<div class="field"><span style="display:block;font-weight:600;margin-bottom:8px">${ig ? 'Print do post ou do Stories' : 'Foto de comprovação'} ${ob ? '' : '<em>(opcional)</em>'}</span>
      <label class="photo-drop" for="foto-in" id="photo-zone">
        ${previa ? `<img class="photo-prev" src="${previa}" alt="Prévia da foto">` : ''}
        <div><strong>${ic(ig ? 'photo' : 'camera')} ${previa ? 'Trocar foto' : ig ? 'Escolher o print' : 'Tirar ou escolher foto'}</strong></div>
        <div class="tiny muted">${ig ? 'Um print em que dá para ver as marcações. Só a equipe de revisão vê.' : 'Fotografe a comida ou a atividade, não o seu corpo. Só a equipe de revisão vê.'}</div>
      </label>
      <input id="foto-in" type="file" accept="image/*" ${ig ? '' : 'capture="environment"'} hidden data-act="foto">
      <div data-errfor="foto"></div></div>`;
    campos = (ig ? campos + blocoFoto + depois : blocoFoto + campos);
  } else {
    campos += depois;
  }
  const ehIg = reg.tipo === 'compartilhar';
  const painelNao = S.ui.naoConsegui
    ? `<div class="card" style="margin-top:14px"><h3>${ehIg ? 'Tudo bem não postar hoje' : 'Tudo bem não conseguir hoje'}</h3>
        ${t.alternativa ? `<p class="small">${esc(t.alternativa)}</p>` : ''}
        ${ehIg ? '<p class="small">A jornada continua igual. Se quiser, mande uma mensagem para a Ana na caixinha.</p>' : ''}
        <label class="field"><span>Quer contar o motivo? <em>(opcional)</em></span><select class="input" id="nao-motivo">${(ehIg ? MOTIVOS_IG : MOTIVOS_NAO).map((m) => `<option>${m}</option>`).join('')}</select></label>
        <div class="btn-row"><button class="btn soft" data-act="nao-confirm">Registrar sem punição</button><button class="btn ghost" data-act="nao-cancel">Voltar</button></div></div>`
    : `<p style="text-align:center;margin-top:16px"><button class="linkbtn" data-act="nao-open">${ehIg ? 'Não vou postar hoje' : 'Não consegui fazer hoje'}</button></p>`;
  return `<form data-form="tarefa" data-codigo="${t.codigo}" class="card" novalidate>
      ${campos}
      <div class="btn-row" style="margin-top:6px">
        <button class="btn block" type="submit">${r.status === 'precisa_ajuste' ? 'Reenviar' : 'Enviar'}</button>
        ${reg.tipo === 'texto' ? '<button class="btn ghost block" type="button" data-act="rascunho">Salvar rascunho</button>' : ''}
      </div></form>${painelNao}`;
}

export function telaTarefa(codigo) {
  const { dia, tarefa: t } = achar(codigo);
  if (!t) return shell('<div class="p-body"><a class="back" href="#/hoje">Hoje</a><p>Tarefa não encontrada.</p></div>', 'hoje');
  if (dia.numero > diaHoje()) {
    return shell(`<div class="p-body"><a class="back" href="#/hoje">Hoje</a><div class="card empty">${ic('lock', 'big')}<h2>Este dia ainda não foi liberado</h2><p class="muted">Libera em ${fmtCurto(S.campanha, dia.numero)}.</p></div></div>`, 'hoje');
  }
  const r = regDe(t);
  const x = respostasDe(t);
  const fr = FRENTES[t.frente];
  const travada = !podeRegistrar(t, dia.numero);
  const editando = !travada && (S.ui.editando || ['nao_iniciada', 'em_andamento', 'precisa_ajuste'].includes(r.status));
  const prazoAjuste = diaEncerrado(dia.numero) && ajusteAberto(r)
    ? `<div class="tiny" style="margin-top:6px"><strong>Prazo para corrigir: até ${fmtDT(r.ajuste_ate)}.</strong></div>` : '';
  let topo = '';
  if (r.status === 'precisa_ajuste') topo = `<div class="notice bad"><strong>O que corrigir</strong>${esc(r.motivo_ajuste || 'A equipe pediu um ajuste.')}${r.revisado_em ? `<div class="tiny" style="margin-top:6px">Equipe · ${fmtDT(r.revisado_em)}</div>` : ''}${prazoAjuste}${travada ? '<div class="tiny" style="margin-top:6px">O prazo de 24 horas para corrigir terminou.</div>' : ''}</div>`;
  else if (travada && NAO_ENVIADA.includes(r.status)) topo = '<div class="card"><p class="muted" style="margin:0">Esta tarefa não foi registrada.</p></div>';
  else if (r.status === 'aguardando_revisao') topo = '<div class="notice warn"><strong>Recebido! Em revisão</strong>A equipe vai conferir a sua foto. Você verá o resultado aqui, sem precisar perguntar no WhatsApp.</div>';
  else if (r.status === 'aprovada') topo = `<div class="notice ok"><strong>Aprovada</strong>Conferida pela equipe em ${fmtDT(r.revisado_em)}.</div>`;
  else if (r.status === 'registrada') topo = `<div class="notice ok"><strong>Registrada</strong>${t.privada ? 'Ficou guardado só para você.' : 'Obrigada por registrar.'} Enviado em ${fmtDT(r.enviado_em)}.</div>`;
  else if (r.status === 'nao_realizada') topo = `<div class="notice info"><strong>Tudo bem.</strong>Um dia difícil não apaga o caminho.${t.alternativa ? ' ' + esc(t.alternativa) : ''}</div>`;
  else if (r.status === 'em_andamento') topo = `<div class="notice info">Rascunho salvo em ${fmtDT(r.enviado_em)}. Termine quando puder.</div>`;
  if (travada) topo = avisoEncerrado(dia.numero) + topo;
  else if (diaEncerrado(dia.numero) === false && dia.numero < diaHoje() && reabertoAte(dia.numero)) topo = avisoReaberto(dia.numero) + topo;
  const ev = t.evidencia || {};
  const resumo = travada && NAO_ENVIADA.includes(r.status) ? corpoLink(t) : `${corpoLink(t)}<div class="card">${resumoRegistro(t, r, x)}</div>
    ${!travada && ['registrada', 'nao_realizada'].includes(r.status) ? '<div class="btn-row" style="margin-top:14px"><button class="btn ghost" data-act="editar-tarefa">Editar registro</button></div>' : ''}`;
  return shell(`<div class="p-body" style="padding-top:16px"><a class="back" href="#/dia/${dia.numero}">Dia ${dia.numero} · ${esc(dia.tema)}</a>
    <span class="frente f-${t.frente}">${ic(fr.icone)} ${fr.nome}</span>
    <h1 style="margin-top:6px">${esc(t.titulo)}</h1>
    <p>${esc(t.instrucao)}</p>
    <div class="criterio"><strong>O que você vai registrar:</strong> ${esc(tipoDesc(t))}${pedeFoto(t) && ev.criterio && t.registro.tipo !== 'compartilhar' ? `<br><span class="muted">${ic('camera', 'e')} ${esc(ev.criterio)}</span>` : ''}</div>
    ${topo}${editando ? formularioTarefa(t, dia, r, x) : resumo}</div>`, 'hoje');
}

// ---------------------------------------------------------------------------
// Check-in
// ---------------------------------------------------------------------------
export function telaCheckin(pedido) {
  const hoje = diaHoje();
  if (hoje === 0) return telaDia();
  const limite = Math.min(hoje, 21);
  const n = Math.max(1, Math.min(Number(pedido) || limite, limite));
  const dia = diaPorNumero(n);
  const ck = ckDoDia(n);
  const enq = dia.enquete;
  const bal = dia.balanco;
  const final = n === 21;
  const hist = S.checkins.slice().sort((a, b) => b.dia - a.dia).slice(0, 7);
  const encerrado = diaEncerrado(n);
  const editando = !encerrado && (S.ui.editarCk || !ck);
  const form = encerrado && !ck
    ? `${avisoEncerrado(n)}<div class="card"><p class="muted" style="margin:0">O check-in do dia ${n} não foi respondido.</p></div>`
    : editando
    ? `<form data-form="checkin" data-n="${n}" class="card" novalidate>
        <div class="field"><span style="display:block;font-weight:600;margin-bottom:8px">Você fez o dia ${n}?</span>
          <div class="choices">${Object.entries(FEITO).map(([v, l]) => `<label class="choice"><input type="radio" name="feito" value="${v}" ${ck && ck.feito === v ? 'checked' : ''} hidden>${l}</label>`).join('')}</div><div data-errfor="feito"></div></div>
        <label class="field"><span>Como você está se sentindo, em uma palavra?</span><input class="input" name="palavra" maxlength="30" value="${esc(ck ? ck.palavra : '')}" placeholder="ex.: leve"><div data-errfor="palavra"></div></label>
        ${enq ? `<div class="field"><span style="display:block;font-weight:600;margin-bottom:8px">Enquete do dia: ${esc(enq.pergunta)} <em class="tiny muted">(opcional)</em></span><div class="choices">${enq.opcoes.map((o) => `<label class="choice"><input type="radio" name="enquete" value="${esc(o)}" ${ck && ck.enquete === o ? 'checked' : ''} hidden>${esc(o)}</label>`).join('')}</div></div>` : ''}
        ${bal ? `<h3 style="margin-top:6px">${esc(bal.titulo)}</h3>${bal.perguntas.map((q, i) => `<label class="field"><span>${esc(q)} <em>(opcional)</em></span><textarea class="input" name="b${i}" rows="2">${esc(ck && ck.balanco ? ck.balanco[i] || '' : '')}</textarea></label>`).join('')}` : ''}
        ${final ? `<h3 style="margin-top:6px">Pesquisa final</h3>
          <label class="field"><span>O que você leva desta jornada?</span><textarea class="input" name="leva" rows="2">${esc(ck && ck.extra ? ck.extra.leva : '')}</textarea></label>
          <label class="field"><span>Que hábito vai continuar?</span><input class="input" name="habito" value="${esc(ck && ck.extra ? ck.extra.habito : '')}"></label>
          <div class="field"><span style="display:block;font-weight:600;margin-bottom:8px">De 1 a 5, como foi a experiência?</span><div class="choices">${[1, 2, 3, 4, 5].map((v) => `<label class="choice"><input type="radio" name="nota" value="${v}" ${ck && ck.extra && Number(ck.extra.nota) === v ? 'checked' : ''} hidden>${v}</label>`).join('')}</div></div>` : ''}
        <button class="btn block" type="submit">Enviar check-in</button></form>`
    : `<div class="card"><div class="notice ok" style="margin:0 0 10px"><strong>Check-in do dia ${n} respondido</strong>${FEITO[ck.feito]} · “${esc(ck.palavra)}”${ck.enquete ? ` · enquete: ${esc(ck.enquete)}` : ''} · ${fmtDT(ck.em)}</div>
        ${enq && enq.alerta && ck.enquete === enq.alerta.opcao ? `<div class="notice warn small">${esc(enq.alerta.msg)}</div>` : ''}
        ${encerrado ? '' : '<button class="btn ghost sm" data-act="editar-checkin">Alterar resposta</button>'}</div>`;
  return shell(`<div class="p-head"><h1>Check-in</h1><p class="muted small" style="margin:0">Dia ${n} · ${esc(dia.tema)}</p></div>
    <div class="p-body">${bannerSimulado()}
      ${!encerrado && n < hoje && reabertoAte(n) ? avisoReaberto(n) : ''}
      ${bal && !encerrado ? '<div class="notice info"><strong>Dia de balanço</strong>As perguntas da semana vêm junto com o check-in.</div>' : ''}
      ${form}
      <p class="tiny muted" style="margin:10px 4px">Respondeu aqui? Não precisa repetir no grupo do WhatsApp.</p>
      ${hist.length ? `<div class="card"><h3>Seus últimos check-ins</h3>${hist.map((c) => `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid var(--sep)"><span>Dia ${c.dia}</span><span class="muted">${FEITO[c.feito]} · “${esc(c.palavra)}”</span></div>`).join('')}</div>` : ''}
    </div>`, 'checkin');
}

// ---------------------------------------------------------------------------
// Caixinha
// ---------------------------------------------------------------------------
export function telaCaixinha(pedido) {
  const hoje = diaHoje();
  const limite = Math.max(1, Math.min(hoje, 21));
  const n = Math.max(1, Math.min(Number(pedido) || limite, limite));
  const dia = diaPorNumero(n);
  const minhas = S.caixinha.filter((c) => c.autor_id === S.perfil.id || S.autoria.has(c.id));
  const mural = S.caixinha.filter((c) => c.status === 'respondida' && c.publica && c.resposta_texto);
  const rotuloStatus = { nova: 'Recebida', equipe: 'Recebida pela equipe', nelly: 'Com a Dra. Nelly', respondida: 'Respondida', arquivada: 'Recebida' };
  const video = (c) => {
    if (!c.video_dia) return '';
    return hoje >= c.video_dia
      ? `<a href="#/dia/${c.video_dia}" class="tiny" style="display:block;margin-top:6px">${ic('play', 'e')} Respondida no vídeo da Dra. Nelly do dia ${c.video_dia} ›</a>`
      : `<div class="tiny muted" style="margin-top:6px">${ic('play', 'e')} Vai ser respondida no vídeo da Dra. Nelly do dia ${c.video_dia}.</div>`;
  };
  return shell(`<div class="p-head"><h1>Caixinha</h1><p class="muted small" style="margin:0">Pergunte, conte, desabafe. Pode ser anônimo.</p></div>
    <div class="p-body">
      ${S.ui.urgencia ? `<div class="notice bad"><strong>Cuide-se agora</strong>${AVISO_URGENCIA}</div>` : ''}
      ${dia && dia.caixinha ? `<div class="notice info"><strong>Caixinha do dia ${n}</strong>${esc(dia.caixinha.pergunta)}</div>` : ''}
      <form data-form="caixinha" data-n="${n}" class="card" novalidate>
        <label class="field"><span>Sua mensagem</span><textarea class="input" name="texto" rows="4" maxlength="600" placeholder="Escreva aqui a sua pergunta, dúvida ou o que quiser contar"></textarea><div data-errfor="texto"></div></label>
        <div class="field"><span style="display:block;font-weight:600;margin-bottom:8px">É sobre <em class="tiny muted">(opcional)</em></span>
          <div class="choices"><label class="choice"><input type="radio" name="sobre" value="rotina" hidden>A jornada e a rotina</label><label class="choice"><input type="radio" name="sobre" value="saude" hidden>A minha saúde</label></div></div>
        <div class="field"><span style="display:block;font-weight:600;margin-bottom:8px">Como enviar?</span>
          <div class="choices"><label class="choice"><input type="radio" name="identidade" value="nome" hidden>Com meu nome</label><label class="choice"><input type="radio" name="identidade" value="anonima" hidden>${ic('eyeoff', 'e')} Anônima</label></div>
          <div data-errfor="identidade"></div>
          <p class="tiny muted" style="margin:6px 4px 0">Anônima: a equipe e a Dra. Nelly não veem o seu nome. Só você vê a mensagem na sua lista. Se for algo sério, com nome a equipe consegue te procurar.</p></div>
        <div class="notice warn small"><strong>Sobre a sua saúde</strong>A Dra. Nelly responde em tom geral, aqui ou nos vídeos. Orientação para o seu caso, só em consulta. ${AVISO_URGENCIA}</div>
        <button class="btn block" type="submit">Enviar para a caixinha</button>
      </form>
      <div class="card"><h3>Minhas mensagens</h3>${minhas.length ? minhas.map((c) => `<div class="cx-mine">
          <div class="tiny muted">Dia ${c.dia} · ${fmtDT(c.criado_em)}${c.anonima ? ' · anônima' : ''}</div>
          <div style="margin:4px 0">${esc(c.texto)}</div>
          <span class="badge ${c.status === 'respondida' ? 'b-aprovada' : c.status === 'nelly' ? 'b-privada' : 'b-nao_iniciada'}">${rotuloStatus[c.status]}</span>
          ${c.resposta_texto ? `<div class="cx-resp"><div class="tiny muted">${esc(c.resposta_por_nome || 'Equipe')} · ${fmtDT(c.resposta_em)}</div>${esc(c.resposta_texto)}${video(c)}</div>` : ''}
        </div>`).join('') : '<p class="small muted" style="margin:0">Você ainda não enviou mensagens.</p>'}</div>
      <div class="card"><h3>Respostas para todas</h3><p class="tiny muted">Perguntas respondidas e publicadas sem o nome de quem perguntou.</p>
        ${mural.length ? mural.map((c) => `<div class="cx-mine"><div style="font-weight:600">“${esc(c.texto)}”</div><div class="cx-resp"><div class="tiny muted">${esc(c.resposta_por_nome || 'Equipe')}</div>${esc(c.resposta_texto)}${video(c)}</div></div>`).join('') : '<p class="small muted" style="margin:0">Ainda não há respostas publicadas.</p>'}</div>
    </div>`, 'caixinha');
}

// ---------------------------------------------------------------------------
// Progresso e antes e depois
// ---------------------------------------------------------------------------
export function telaProgresso() {
  const hoje = diaHoje();
  const limite = Math.max(0, Math.min(hoje, 21));
  const st = estatisticas(limite);
  const pend = tarefasAte(limite).filter(({ tarefa }) => ['precisa_ajuste', 'em_andamento', 'nao_iniciada'].includes(regDe(tarefa).status));
  return shell(`<div class="p-head"><h1>Meu progresso</h1><p class="muted small" style="margin:0">Seu caminho é só seu. Sem ranking, sem comparação.</p></div>
    <div class="p-body">
      <div class="card">
        <div style="display:flex;justify-content:space-between;align-items:baseline"><strong>${st.enviadas} de ${st.esperadas} tarefas</strong><span class="muted small">${st.pct}%</span></div>
        <div class="bar dark" style="margin:8px 0 12px"><i style="width:${st.pct}%"></i></div>
        <div class="cols-3 small">
          <div><b>${st.revisao}</b><br><span class="muted">em revisão</span></div>
          <div><b>${st.ajuste}</b><br><span class="muted">para ajustar</span></div>
          <div><b>${S.checkins.length}</b><br><span class="muted">check-ins</span></div>
        </div>
      </div>
      <div class="card"><h3>Os 21 dias</h3>
        <div class="grid21">${S.dias.map((d) => {
          const tr = d.numero > hoje;
          return `<a href="#/dia/${d.numero}" class="${tr ? 'lock' : ''} ${d.numero === limite ? 'today' : ''}">${d.numero}${tr ? '' : `<div class="dots">${d.tarefas.map((t) => `<i class="${bolinha(regDe(t).status)}"></i>`).join('')}</div>`}</a>`;
        }).join('')}</div></div>
      <a href="#/privado" class="task-card" style="background:var(--purple-soft)"><div class="ico mentalidade">${ic('lock')}</div><div class="t"><h3 style="margin:0">Meu antes e depois</h3><div class="reg">Medidas e fotos do dia 1 e do dia 21, só no seu celular</div></div><div class="trail">${ic('chevron', 'chev')}</div></a>
      <div class="card"><h3>Pendências</h3>
        ${pend.length ? pend.map(({ dia, tarefa }) => `<a class="task-card" style="margin-bottom:8px" href="#/tarefa/${tarefa.codigo}"><div class="ico ${tarefa.frente}">${ic(FRENTES[tarefa.frente].icone)}</div><div class="t"><div class="tiny muted">Dia ${dia.numero}</div><h3 style="margin:0">${esc(tarefa.titulo)}</h3></div>${badge(regDe(tarefa).status)}</a>`).join('') : '<p class="muted">Nada pendente.</p>'}</div>
    </div>`, 'progresso');
}

export function telaPrivado(fase) {
  const pv = S.privado;
  const aviso = `<div class="notice lock"><strong>${ic('lock')} Fica só neste celular</strong>Não é enviado para a Eleviê, para a Ana nem para a Dra. Nelly. Se você trocar de celular ou limpar o navegador, perde o registro: use “Baixar minhas fotos” para guardar na sua galeria.</div>`;
  const voltar = '<a class="back" href="#/progresso">Meu progresso</a>';
  if (fase === 'inicio' || fase === 'final') {
    if (fase === 'final' && diaHoje() < 21) {
      return shell(`<div class="p-body" style="padding-top:16px">${voltar}<div class="card empty">${ic('lock', 'big')}<h2>Fechamento no dia 21</h2><p class="muted">O registro de fechamento abre no último dia da jornada, ${fmtCurto(S.campanha, 21)}.</p></div></div>`, 'progresso');
    }
    const r = pv[fase] || {};
    if (S.ui.privFase !== fase) { S.ui.privFase = fase; S.ui.pfotos = { ...(r.fotos || {}) }; }
    const dica = fase === 'inicio'
      ? 'Use roupa justa ou de ginástica, fique de frente para uma parede lisa e com boa luz. No dia 21, repita igual: mesma roupa, mesmo lugar, mesmo horário.'
      : 'Repita como no dia 1: mesma roupa, mesmo lugar, mesma luz. Meça nos mesmos pontos.';
    return shell(`<div class="p-body" style="padding-top:16px">${voltar}
      <span class="frente f-mentalidade">${ic('lock')} Registro privado · Dia ${fase === 'inicio' ? 1 : 21}</span>
      <h1 style="margin-top:6px">${fase === 'inicio' ? 'Meu ponto de partida' : 'Meu fechamento'}</h1>${aviso}
      <div class="criterio">${dica}</div>
      <form data-form="privado" data-fase="${fase}" class="card" novalidate>
        <h3>Fotos</h3>
        <div class="poses">${POSES.map(([k, l]) => `<label class="pose" for="pf-${k}" id="pose-${k}">${S.ui.pfotos[k] ? `<img src="${S.ui.pfotos[k]}" alt="${l}">` : `<span class="pose-ic">${ic('camera')}</span>`}<b>${l}</b></label><input id="pf-${k}" type="file" accept="image/*" hidden data-act="pfoto" data-pose="${k}">`).join('')}</div>
        <h3 style="margin-top:16px">Medidas com fita métrica <em class="tiny muted">(cm, opcional)</em></h3>
        <div class="medidas">${MEDIDAS.map(([k, l]) => `<label class="field"><span>${l}</span><input class="input" name="m-${k}" type="number" inputmode="decimal" step="0.1" min="0" value="${esc(r.medidas && r.medidas[k] != null ? r.medidas[k] : '')}"></label>`).join('')}</div>
        <h3 style="margin-top:6px">Como estou me sentindo <em class="tiny muted">(1 = muito baixo, 5 = ótimo)</em></h3>
        ${SENTIR.map(([k, l]) => `<div class="field"><span style="display:block;font-weight:600;margin-bottom:6px">${l}</span><div class="choices">${[1, 2, 3, 4, 5].map((v) => `<label class="choice"><input type="radio" name="s-${k}" value="${v}" ${r.sentir && r.sentir[k] === v ? 'checked' : ''} hidden>${v}</label>`).join('')}</div></div>`).join('')}
        <label class="field"><span>Quer anotar algo para você? <em>(opcional)</em></span><textarea class="input" name="nota" rows="2">${esc(r.nota || '')}</textarea></label>
        <div data-errfor="priv"></div>
        <button class="btn block" type="submit">Guardar só no meu celular</button>
      </form></div>`, 'progresso');
  }
  if (fase === 'comparar') {
    const a = pv.inicio; const b = pv.final;
    if (!a || !b) return shell(`<div class="p-body" style="padding-top:16px">${voltar}<div class="card">Para comparar, faça o registro do dia 1 e o do dia 21.</div></div>`, 'progresso');
    const dif = (x, y) => { if (x == null || y == null) return '—'; const d = Math.round((y - x) * 10) / 10; return (d > 0 ? '+' : '') + d + ' cm'; };
    return shell(`<div class="p-body" style="padding-top:16px">${voltar}<h1>Meu antes e depois</h1>
      <div class="notice ok"><strong>A comparação mais importante é como você está se sentindo.</strong>Os números são só uma parte da história, e ficam só com você.</div>
      <div class="card"><h3>Como me sinto</h3>${SENTIR.map(([k, l]) => `<div class="cmp-row"><span>${l}</span><span class="muted">Dia 1: <b>${(a.sentir && a.sentir[k]) || '—'}</b></span><span>Dia 21: <b>${(b.sentir && b.sentir[k]) || '—'}</b></span></div>`).join('')}</div>
      <div class="card"><h3>Fotos</h3>${POSES.map(([k, l]) => `<div class="tiny muted" style="margin:8px 0 4px;font-weight:600">${l}</div><div class="cmp-fotos"><figure>${a.fotos && a.fotos[k] ? `<img src="${a.fotos[k]}" alt="${l} dia 1">` : '<div class="pose-vazia">sem foto</div>'}<figcaption>Dia 1</figcaption></figure><figure>${b.fotos && b.fotos[k] ? `<img src="${b.fotos[k]}" alt="${l} dia 21">` : '<div class="pose-vazia">sem foto</div>'}<figcaption>Dia 21</figcaption></figure></div>`).join('')}</div>
      <div class="card"><h3>Medidas</h3>${MEDIDAS.map(([k, l]) => `<div class="cmp-row"><span>${l}</span><span class="muted">${a.medidas && a.medidas[k] != null ? a.medidas[k] + ' cm' : '—'} → ${b.medidas && b.medidas[k] != null ? b.medidas[k] + ' cm' : '—'}</span><b>${dif(a.medidas && a.medidas[k], b.medidas && b.medidas[k])}</b></div>`).join('')}</div></div>`, 'progresso');
  }
  const item = (f, titulo, dia) => {
    const r = pv[f];
    const bloqueado = f === 'final' && diaHoje() < 21;
    return `<div class="card"><div class="tiny muted">Dia ${dia}</div><h3 style="margin:2px 0 6px">${titulo}</h3>
      <p class="small muted" style="margin:0 0 10px">${r ? `Feito em ${fmtDT(r.em)} · ${Object.values(r.fotos || {}).filter(Boolean).length} foto(s)` : bloqueado ? `Abre em ${fmtCurto(S.campanha, 21)}.` : 'Ainda não feito.'}</p>
      ${bloqueado ? '' : `<a class="btn sm ${r ? 'ghost' : ''}" href="#/privado/${f}">${r ? 'Ver ou refazer' : 'Fazer agora'}</a>`}</div>`;
  };
  const temFotos = ['inicio', 'final'].some((f) => pv[f] && Object.values(pv[f].fotos || {}).some(Boolean));
  return shell(`<div class="p-head"><h1>Meu antes e depois</h1></div>
    <div class="p-body">${aviso}${item('inicio', 'Ponto de partida', 1)}${item('final', 'Fechamento', 21)}
      ${pv.inicio && pv.final ? '<a class="btn block" href="#/privado/comparar">Ver meu antes e depois</a>' : ''}
      <div class="btn-row" style="margin-top:14px">${temFotos ? '<button class="btn ghost sm" data-act="priv-baixar">Baixar minhas fotos</button>' : ''}${pv.inicio || pv.final ? '<button class="btn ghost sm" data-act="priv-apagar">Apagar meu registro</button>' : ''}</div>
    </div>`, 'progresso');
}

// ---------------------------------------------------------------------------
// Avisos
// ---------------------------------------------------------------------------
export function telaAvisos() {
  const p = S.perfil;
  const c = S.campanha;
  const hoje = Math.max(1, Math.min(diaHoje(), 21));
  const dia = diaPorNumero(hoje);
  const conteudos = S.dias.filter((d) => d.numero <= hoje && d.nelly && d.nelly.status === 'aprovado').reverse();
  const opcao = (tipo, rotulo) => {
    const v = S.consent[tipo];
    const aceito = Boolean(v && v.aceito);
    return `<div style="display:flex;justify-content:space-between;gap:10px;align-items:center;padding:10px 0;border-bottom:1px solid var(--sep)">
      <div><div style="font-weight:600">${rotulo}</div><div class="tiny muted">${aceito ? 'Autorizado' : 'Não autorizado'}${v ? ' · ' + fmtDT(v.em) : ''}</div></div>
      <button class="btn sm ${aceito ? 'ghost' : 'soft'}" data-act="consentimento" data-tipo="${tipo}" data-aceito="${aceito ? 0 : 1}">${aceito ? 'Revogar' : 'Autorizar'}</button></div>`;
  };
  return shell(`<div class="p-head"><h1>Avisos</h1></div><div class="p-body">
    <a class="task-card perfil-row" href="#/perfil"><span class="avatar">${esc((p.nome || '?').trim()[0] || '?')}</span><div class="t"><h3 style="margin:0">${esc(p.nome)}</h3><div class="reg">${esc(p.email)}</div></div><div class="trail">${ic('chevron', 'chev')}</div></a>
    ${cartaoInstalar()}
    ${ehEquipe() ? `<a class="task-card perfil-row" href="#/a"><div class="ico caixinha">${ic('grid')}</div><div class="t"><h3 style="margin:0">Área da equipe</h3><div class="reg">Seu papel: ${esc(NOME_PAPEL[p.papel])}</div></div><div class="trail">${ic('chevron', 'chev')}</div></a>` : ''}
    <div class="card"><div class="tiny muted">Foco da semana</div><h3 style="margin:4px 0">${esc(semanaNome(dia.semana))}</h3><p style="margin:0">${esc(((c.semanas || [])[dia.semana - 1] || {}).foco || '')}</p></div>
    <div class="card"><h3>Conteúdos da Dra. Nelly</h3>${conteudos.length ? conteudos.map((d) => `<a href="#/dia/${d.numero}" style="display:block;text-decoration:none;color:inherit;padding:8px 0;border-bottom:1px solid var(--sep)"><div class="tiny muted">Dia ${d.numero} · ${esc(d.nelly.formato)}</div><strong>${esc(d.nelly.titulo)}</strong></a>`).join('') : '<p class="small muted" style="margin:0">O primeiro conteúdo chega no dia 2.</p>'}</div>
    <div class="card"><h3>Aviso de saúde</h3><p class="small" style="margin:0">${esc(c.aviso_saude)}</p></div>
    <div class="card"><h3>Precisa de ajuda?</h3>
      <p class="small"><strong>Dúvidas sobre o app ou as tarefas:</strong> fale com a equipe pelo WhatsApp da jornada.</p>
      <p class="small" style="margin:0"><strong>Dúvidas sobre a sua saúde:</strong> a equipe não responde perguntas clínicas individuais. Elas são encaminhadas à Dra. Nelly ou à consulta.</p></div>
    <div class="card"><h3>Avaliação na Eleviê</h3><p class="small">Quer conversar sobre uma avaliação? Chame no WhatsApp da clínica com a palavra-código <strong>${esc(c.palavra_codigo || 'Jornada')}</strong>.</p><button class="btn soft sm" data-act="cta" data-n="0">${ic('bubble')} Falar com a clínica</button></div>
    <div class="card"><h3>Minhas autorizações</h3>${opcao('comunicacoes', 'Lembretes e novidades')}${opcao('repost', 'Repost dos meus conteúdos')}
      <p class="tiny muted" style="margin:10px 0 0">Participação aceita em ${fmtDT(S.consent.termos && S.consent.termos.em)}.</p></div>
    <p style="text-align:center"><button class="linkbtn" data-act="sair">Sair</button></p></div>`, 'avisos');
}

// ---------------------------------------------------------------------------
// Gravações
// ---------------------------------------------------------------------------
async function recarregarMeus() {
  const [registros, privados, checkins, caixinha, autoria, reaberturas] = await Promise.all([
    api.meusRegistros(S.perfil.id), api.meusPrivados(S.perfil.id), api.meusCheckins(S.campanha.id, S.perfil.id),
    api.caixinhaVisivel(), api.minhaAutoria(), api.minhasReaberturas(S.campanha.id, S.perfil.id),
  ]);
  S.registros = registros; S.privados = privados; S.checkins = checkins; S.caixinha = caixinha; S.autoria = autoria;
  S.reaberturas = reaberturas;
}
export const recarregarMinhaJornada = recarregarMeus;

function coletar(form, fd, t) {
  const reg = t.registro;
  const lista = [];
  const resp = {};
  if (reg.tipo === 'autorrelato') {
    resp.modo = fd.get('modo');
    if (!resp.modo) lista.push(['modo', 'Escolha uma opção.']);
    if (reg.opcoes) { resp.opcao = fd.get('opcao'); if (!resp.opcao) lista.push(['opcao', 'Conte qual atividade você fez.']); }
    resp.comentario = String(fd.get('comentario') || '').trim();
  } else if (reg.tipo === 'texto') {
    resp.campos = reg.campos.map((_, i) => String(fd.get('c' + i) || '').trim());
    reg.campos.forEach((c, i) => { if (c.obrigatorio && !resp.campos[i]) lista.push(['c' + i, 'Este campo é obrigatório.']); });
  } else if (reg.tipo === 'checklist') {
    resp.marcados = reg.itens.map((_, i) => (fd.get('i' + i) ? i : -1)).filter((i) => i >= 0);
    if (resp.marcados.length < reg.minimo) lista.push(['i0', `Marque pelo menos ${reg.minimo} item para registrar.`]);
  } else if (reg.tipo === 'privado') {
    resp.confirmados = reg.itens.map((_, i) => (fd.get('i' + i) ? i : -1)).filter((i) => i >= 0);
    if (!resp.confirmados.length) lista.push(['i0', 'Marque pelo menos um item para registrar.']);
  } else if (reg.tipo === 'compartilhar') {
    resp.link = String(fd.get('link') || '').trim();
    resp.marcou = Boolean(fd.get('marcou'));
    const temFoto = Boolean(S.ui.fotoBlob || (S.ui.fotoAtual));
    if (resp.link && !/^https?:\/\/([a-z0-9-]+\.)?instagram\.com\//i.test(resp.link)) lista.push(['link', 'O link precisa ser do Instagram (instagram.com/...).']);
    else if (!resp.link && !temFoto) lista.push(['link', 'Cole o link do post ou envie o print.']);
    if (!resp.marcou) lista.push(['marcou', 'Confirme que marcou os três perfis.']);
  }
  const temFoto = Boolean(S.ui.fotoBlob || S.ui.fotoAtual);
  if (pedeFoto(t) && t.evidencia.foto === 'obrigatoria' && !temFoto) lista.unshift(['foto', 'Esta tarefa pede uma foto de comprovação. Anexe para enviar.']);
  return { resp, lista };
}

async function gravarTarefa(form, { rascunho }) {
  const { dia, tarefa: t } = achar(form.dataset.codigo);
  const r = regDe(t);
  S.ui.fotoAtual = r.foto_path && r.status !== 'precisa_ajuste' ? r.foto_path : null;
  const { resp, lista } = coletar(form, new FormData(form), t);
  if (!rascunho && lista.length) { erros(form, lista); return false; }
  let caminho = S.ui.fotoAtual;
  if (S.ui.fotoBlob) caminho = await enviarFoto(S.perfil.id, t.codigo, S.ui.fotoBlob);
  const status = rascunho ? 'em_andamento' : (caminho ? 'aguardando_revisao' : 'registrada');
  if (t.privada) {
    const marca = ((S.privados[t.id] || {}).respostas || {}).ponto_partida_em;
    await api.salvarRegistroPrivado(t.id, S.perfil.id, marca ? { ...resp, ponto_partida_em: marca } : resp);
  }
  await api.salvarRegistro({
    tarefa_id: t.id, perfil_id: S.perfil.id, status, respostas: t.privada ? {} : resp, foto_path: caminho, motivo_nao: null,
  });
  await recarregarMeus();
  S.ui = {};
  toast(rascunho ? 'Rascunho salvo.' : status === 'aguardando_revisao' ? 'Recebido! Sua foto foi para a revisão da equipe.' : 'Registrado!');
  location.hash = `#/dia/${dia.numero}`;
  app.render();
  return true;
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------
export const cliques = {
  'editar-tarefa': () => { S.ui.editando = true; app.render(); },
  'editar-checkin': () => { S.ui.editarCk = true; app.render(); },
  'nao-open': () => { S.ui.naoConsegui = true; app.render(); },
  'nao-cancel': () => { S.ui.naoConsegui = false; app.render(); },
  rascunho: async (el) => { await gravarTarefa(el.closest('form'), { rascunho: true }); },
  'nao-confirm': async () => {
    const form = $('[data-form=tarefa]');
    const { dia, tarefa: t } = achar(form.dataset.codigo);
    await api.salvarRegistro({
      tarefa_id: t.id, perfil_id: S.perfil.id, status: 'nao_realizada', respostas: {}, foto_path: null, motivo_nao: $('#nao-motivo').value,
    });
    await recarregarMeus();
    S.ui = {};
    toast('Registrado. Amanhã é um novo dia.');
    location.hash = `#/dia/${dia.numero}`;
    app.render();
  },
  'copiar-legenda': async () => {
    const t = $('#legenda');
    try { await navigator.clipboard.writeText(t.value); } catch { t.select(); document.execCommand('copy'); }
    toast('Texto copiado. Agora é só colar no Instagram.');
  },
  cta: async (el) => {
    const n = Number(el.dataset.n) || diaHoje();
    api.registrarCta(S.campanha.id, S.perfil.id, n).catch(() => {});
    const numero = String(S.campanha.whatsapp_clinica || '').replace(/\D/g, '');
    const msg = `Olá! Vim pelo Desafio 21 Dias e quero conversar sobre uma avaliação. Palavra-código: ${S.campanha.palavra_codigo || 'Jornada'}.`;
    if (numero) window.open(`https://wa.me/${numero}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    else toast('Fale com a clínica pelo WhatsApp e use a palavra-código ' + (S.campanha.palavra_codigo || 'Jornada') + '.');
  },
  consentimento: async (el) => {
    await api.registrarConsentimento(S.campanha.id, S.perfil.id, el.dataset.tipo, el.dataset.aceito === '1');
    S.consent = await api.meusConsentimentos(S.campanha.id, S.perfil.id);
    toast(el.dataset.aceito === '1' ? 'Autorização registrada.' : 'Autorização revogada.');
    app.render();
  },
  'priv-apagar': async () => {
    if (!confirm('Apagar seu registro privado (fotos e medidas) deste celular? Não dá para desfazer.')) return;
    await apagarPrivado(S.perfil.id);
    S.privado = { inicio: null, final: null };
    toast('Registro privado apagado.');
    app.render();
  },
  'priv-baixar': () => {
    ['inicio', 'final'].forEach((f) => POSES.forEach(([k]) => {
      const url = S.privado[f] && S.privado[f].fotos && S.privado[f].fotos[k];
      if (!url) return;
      const a = document.createElement('a');
      a.href = url; a.download = `jornada-dia${f === 'inicio' ? 1 : 21}-${k}.jpg`;
      document.body.appendChild(a); a.click(); a.remove();
    }));
  },
};

export const mudancas = {
  foto: async (el) => {
    const arquivo = el.files && el.files[0];
    if (!arquivo) return;
    try {
      const blob = await reduzirFoto(arquivo);
      S.ui.fotoBlob = blob;
      if (S.ui.fotoUrl) URL.revokeObjectURL(S.ui.fotoUrl);
      S.ui.fotoUrl = URL.createObjectURL(blob);
      const zona = $('#photo-zone');
      if (zona) zona.innerHTML = `<img class="photo-prev" src="${S.ui.fotoUrl}" alt="Prévia da foto"><div><strong>Trocar foto</strong></div><div class="tiny muted">Foto pronta para enviar</div>`;
      const e = $('[data-errfor="foto"]');
      if (e) { e.textContent = ''; e.className = ''; }
    } catch (err) { toast(err.message); }
  },
  pfoto: async (el) => {
    const arquivo = el.files && el.files[0];
    if (!arquivo) return;
    try {
      const url = await blobParaDataUrl(await reduzirFoto(arquivo, 900, 0.8));
      S.ui.pfotos = S.ui.pfotos || {};
      S.ui.pfotos[el.dataset.pose] = url;
      const slot = $('#pose-' + el.dataset.pose);
      if (slot) slot.innerHTML = `<img src="${url}" alt="${el.dataset.pose}"><b>${POSES.find((p) => p[0] === el.dataset.pose)[1]}</b>`;
    } catch (err) { toast(err.message); }
  },
};

export const envios = {
  tarefa: (form) => gravarTarefa(form, { rascunho: false }),

  checkin: async (form, fd) => {
    const n = Number(form.dataset.n);
    const dia = diaPorNumero(n);
    const feito = fd.get('feito');
    const palavra = String(fd.get('palavra') || '').trim();
    const lista = [];
    if (!feito) lista.push(['feito', 'Escolha uma opção.']);
    if (!palavra) lista.push(['palavra', 'Escreva uma palavra.']);
    if (lista.length) { erros(form, lista); return; }
    const linha = { campanha_id: S.campanha.id, perfil_id: S.perfil.id, dia: n, feito, palavra, em: new Date().toISOString() };
    if (dia.enquete && fd.get('enquete')) linha.enquete = String(fd.get('enquete'));
    if (dia.balanco) linha.balanco = dia.balanco.perguntas.map((_, i) => String(fd.get('b' + i) || '').trim());
    if (n === 21) linha.extra = { leva: String(fd.get('leva') || '').trim(), habito: String(fd.get('habito') || '').trim(), nota: Number(fd.get('nota')) || null };
    await api.salvarCheckin(linha);
    S.checkins = await api.meusCheckins(S.campanha.id, S.perfil.id);
    S.ui = {};
    toast('Check-in enviado. Obrigada!');
    app.render();
  },

  caixinha: async (form, fd) => {
    const texto = inicioDoTexto(fd.get('texto'));
    const identidade = fd.get('identidade');
    const lista = [];
    if (!texto) lista.push(['texto', 'Escreva a sua mensagem.']);
    if (!identidade) lista.push(['identidade', 'Escolha se envia com seu nome ou anônima.']);
    if (lista.length) { erros(form, lista); return; }
    await api.enviarCaixinha(S.campanha.id, Number(form.dataset.n), texto, fd.get('sobre') || null, identidade === 'anonima');
    const [caixinha, autoria] = await Promise.all([api.caixinhaVisivel(), api.minhaAutoria()]);
    S.caixinha = caixinha; S.autoria = autoria;
    S.ui = { urgencia: temUrgencia(texto) };
    toast(identidade === 'anonima' ? 'Mensagem anônima enviada.' : 'Mensagem enviada.');
    app.render();
  },

  privado: async (form, fd) => {
    const fase = form.dataset.fase;
    const medidas = {};
    MEDIDAS.forEach(([k]) => { const v = String(fd.get('m-' + k) || '').trim(); if (v) medidas[k] = Number(v); });
    const sentir = {};
    SENTIR.forEach(([k]) => { if (fd.get('s-' + k)) sentir[k] = Number(fd.get('s-' + k)); });
    const fotos = { ...(S.ui.pfotos || {}) };
    if (!Object.keys(medidas).length && !Object.values(fotos).some(Boolean) && !Object.keys(sentir).length) {
      erros(form, [['priv', 'Registre pelo menos uma foto, uma medida ou como você está se sentindo.']]);
      return;
    }
    try {
      await salvarPrivado(S.perfil.id, fase, { medidas, sentir, fotos, nota: String(fd.get('nota') || '').trim() });
    } catch { toast('Sem espaço no navegador para guardar as fotos. Tente fotos menores.'); return; }
    S.privado[fase] = await lerPrivado(S.perfil.id, fase);
    if (fase === 'inicio') await marcarPartidaNoServidor();
    S.ui = {};
    // Ponto de partida feito: volta para a tela do dia, já com tudo liberado.
    if (fase === 'inicio') {
      toast('Ponto de partida guardado só no seu celular. Agora as tarefas estão liberadas!');
      location.hash = '#/';
    } else {
      toast('Guardado só no seu celular.');
      location.hash = S.privado.inicio ? '#/privado/comparar' : '#/privado';
    }
    app.render();
  },
};
