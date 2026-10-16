// Área da equipe: painel, revisão de evidências, caixinha, check-ins, configuração e exportação.
import { S, app } from '../estado.js';
import {
  $, esc, FRENTES, STATUS, ENVIADAS, FEITO, NOME_PAPEL, toast, erros, badge, fmtDT, diaHoje, tipoDesc, semanaNome, chamado,
} from '../ui.js';
import * as api from '../lib/api.js';
import { ic } from '../lib/icones.js';
import { fmtCurto } from '../lib/datas.js';
import { precarregarFotos, urlFoto } from '../lib/fotos.js';

const MOTIVOS_AJUSTE = [
  'A foto não mostra o que a tarefa pede.',
  'Não dá para ver os itens pedidos no critério.',
  'A foto está escura ou desfocada.',
  'A foto parece ser de outro dia ou de outra tarefa.',
  'A foto mostra rostos de outras pessoas. Envie outra só com a comida ou a atividade.',
];
const TEMAS = ['Alimentação', 'Movimento', 'Sono e cansaço', 'Emoções', 'Culpa de mãe', 'Sabotadores', 'Hormônios e check-up', 'Saúde (caso individual)', 'Desafio do dia', 'Outro'];
const CX_CLINICA = [' remédio', 'remedio', 'medicação', 'medicacao', 'medicamento', ' dose', 'sintoma', ' dor ', ' dores ', 'exame', 'hormôn', 'hormon', 'tireoide', 'diabetes', 'pressão', 'gravid', 'grávida', 'amament', 'menstrua', 'menopausa', 'climatério', 'anticoncep', 'suplement', 'vitamina', 'injet', 'pellet', 'implante', 'doença', 'doenca', ' parto'];
const CX_URGENCIA = ['dor no peito', 'falta de ar', 'desmai', 'sangramento', 'sangrando', 'me machucar', 'não quero mais viver', 'nao quero mais viver', 'suicid', 'me matar', 'tirar minha vida'];
const AVISO_URGENCIA = 'Se for urgente, procure atendimento médico agora (SAMU 192). Para apoio emocional a qualquer hora, ligue para o CVV no 188.';
const NELLY_STATUS = { rascunho: 'Rascunho', em_revisao: 'Em revisão pela Dra. Nelly', aprovado: 'Aprovado pela Dra. Nelly' };
const CX_ABAS = [['nova', 'Triagem'], ['equipe', 'Equipe responde'], ['nelly', 'Dra. Nelly'], ['respondida', 'Respondidas'], ['arquivada', 'Arquivadas']];

const sinais = (t) => {
  const x = ' ' + String(t || '').toLowerCase().replace(/[^a-zà-ÿ0-9]+/g, ' ') + ' ';
  return { clinica: CX_CLINICA.some((k) => x.includes(k)), urgente: CX_URGENCIA.some((k) => x.includes(k)) };
};
const podeAprovarConteudo = () => ['nelly', 'admin'].includes(S.perfil.papel);

// ---------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------
const perfil = (id) => S.eq.perfis.find((p) => p.id === id);
const todasTarefas = () => S.dias.flatMap((d) => d.tarefas.map((t) => ({ dia: d, tarefa: t })));
const tarefaPorId = (id) => todasTarefas().find((x) => x.tarefa.id === id);
const participantes = () => S.eq.inscricoes.filter((i) => i.status === 'ativa').map((i) => perfil(i.perfil_id)).filter(Boolean);
const regsDe = (pid) => S.eq.registros.filter((r) => r.perfil_id === pid);
const regTarefa = (pid, tarefaId) => S.eq.registros.find((r) => r.perfil_id === pid && r.tarefa_id === tarefaId);
const ckDe = (pid, dia) => S.eq.checkins.find((c) => c.perfil_id === pid && c.dia === dia);
const limiteDia = () => Math.max(1, Math.min(diaHoje(), 21));
const nomeDe = (p) => (p ? (p.nome || p.email) : '—');

function estatisticas(pid, ate) {
  const s = { esperadas: 0, enviadas: 0, revisao: 0, ajuste: 0, nao: 0 };
  todasTarefas().filter((x) => x.dia.numero <= ate).forEach(({ tarefa }) => {
    s.esperadas++;
    const r = regTarefa(pid, tarefa.id);
    const st = r ? r.status : 'nao_iniciada';
    if (ENVIADAS.includes(st)) s.enviadas++;
    if (st === 'aguardando_revisao') s.revisao++;
    if (st === 'precisa_ajuste') s.ajuste++;
    if (st === 'nao_realizada') s.nao++;
  });
  s.pct = s.esperadas ? Math.round((s.enviadas / s.esperadas) * 100) : 0;
  return s;
}

const pendentesRevisao = () => S.eq.registros
  .filter((r) => r.status === 'aguardando_revisao')
  .map((r) => ({ r, ...tarefaPorId(r.tarefa_id), p: perfil(r.perfil_id) }))
  .filter((x) => x.tarefa && x.p)
  .sort((a, b) => (a.r.enviado_em < b.r.enviado_em ? -1 : 1));

function bolinha(st) {
  if (st === 'registrada' || st === 'aprovada') return 'done';
  if (st === 'aguardando_revisao') return 'wait';
  if (st === 'precisa_ajuste') return 'fix';
  if (st === 'nao_realizada') return 'skip';
  return '';
}

export async function carregarEquipe(forcar = false) {
  if (S.eq && !forcar) return;
  S.eq = await api.dadosDaEquipe(S.campanha.id);
}

export async function preparar(sub) {
  await carregarEquipe();
  if (sub === 'revisao') {
    await precarregarFotos(S.eq.registros.filter((r) => r.status === 'aguardando_revisao').map((r) => r.foto_path));
  }
  if (sub === 'participante' || sub === 'caixinha') { /* sem fotos */ }
}

// ---------------------------------------------------------------------------
// Estrutura
// ---------------------------------------------------------------------------
// Menu lateral recolhível no computador (a escolha fica salva neste navegador).
const CHAVE_MENU = 'jornada-menu-recolhido';
const menuRecolhido = () => { try { return localStorage.getItem(CHAVE_MENU) === '1'; } catch { return false; } };
const ICONE_MENU_LATERAL = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="4.5" width="17" height="15" rx="3"/><path d="M9.5 4.5v15"/></svg>';

function estrutura(atual, conteudo) {
  const nRev = pendentesRevisao().length;
  const nCx = S.eq.caixinha.filter((c) => c.status === 'nova').length;
  const itens = [['painel', 'Painel', 'grid'], ['revisao', 'Revisão de evidências', 'photo'], ['caixinha', 'Caixinha', 'tray'], ['checkins', 'Check-ins', 'bubble'],
    ['dias', 'Configurar dias', 'calendar'], ['campanha', 'Campanha', 'leaf'], ['acessos', 'Acessos e senhas', 'lock'], ['exportar', 'Exportar', 'download']];
  const contador = { revisao: nRev, caixinha: nCx };
  const opcoes = ['<option value="">Dia real</option>'].concat(Array.from({ length: 21 }, (_, i) => `<option value="${i + 1}" ${S.diaSim === i + 1 ? 'selected' : ''}>Simular dia ${i + 1}</option>`)).join('');
  const recolhido = menuRecolhido();
  return `<div class="admin ${recolhido ? 'recolhido' : ''}">
    <aside class="side">
      <div class="brand"><span class="brand-ic">${ic('leaf')}</span><span class="brand-t">Desafio 21 Dias<small>${esc(S.campanha.nome)} · Dia ${limiteDia()} de 21</small></span>
        <button type="button" class="side-toggle" data-act="menu-recolher" aria-label="${recolhido ? 'Expandir menu' : 'Recolher menu'}" title="${recolhido ? 'Expandir menu' : 'Recolher menu'}">${ICONE_MENU_LATERAL}</button></div>
      ${itens.map(([k, l, i]) => `<a href="#/a/${k === 'painel' ? '' : k}" class="${atual === k ? 'on' : ''}" title="${l}"><span class="side-l">${ic(i)}<span class="side-txt">${l}</span></span>${contador[k] ? `<span class="count">${contador[k]}</span>` : ''}</a>`).join('')}
      <hr>
      <a href="#/hoje" title="Ver como participante"><span class="side-l">${ic('house')}<span class="side-txt">Ver como participante</span></span></a>
      <div class="side-extra">
        <label class="field" style="margin:12px 8px 0"><span>Testar a jornada</span><select class="input" data-act="dia-sim">${opcoes}</select></label>
        <p class="tiny muted" style="margin:6px 10px">Só muda o que você vê. As participantes seguem o calendário real.</p>
        <p style="margin:12px 8px 0"><button class="linkbtn" data-act="sair">Sair</button></p>
      </div>
    </aside>
    <main class="main enter">${conteudo}</main>
  </div>`;
}

// ---------------------------------------------------------------------------
// Painel
// ---------------------------------------------------------------------------
function painel() {
  const ps = participantes();
  const n = limiteDia();
  const dia = S.dias.find((d) => d.numero === n);
  const idsHoje = new Set(dia.tarefas.map((t) => t.id));
  const ativasHoje = ps.filter((p) => regsDe(p.id).some((r) => idsHoje.has(r.tarefa_id))).length;
  const tot = ps.reduce((a, p) => { const s = estatisticas(p.id, n); a.e += s.esperadas; a.env += s.enviadas; a.aj += s.ajuste; return a; }, { e: 0, env: 0, aj: 0 });
  const ckHoje = ps.filter((p) => ckDe(p.id, n)).length;
  const tarefaCom = dia.tarefas.find((t) => t.frente === 'compartilhar');
  const compartilharam = tarefaCom ? ps.filter((p) => { const r = regTarefa(p.id, tarefaCom.id); return r && ENVIADAS.includes(r.status); }).length : 0;
  const interesse = new Set(S.eq.ctas.map((c) => c.perfil_id)).size;
  const adesao = S.dias.map((d) => {
    if (d.numero > n) return `<div class="col fut" title="Dia ${d.numero}: ainda não liberado"><i style="height:4%"></i><span>${d.numero}</span></div>`;
    let env = 0;
    ps.forEach((p) => d.tarefas.forEach((t) => { const r = regTarefa(p.id, t.id); if (r && ENVIADAS.includes(r.status)) env++; }));
    const pct = ps.length ? Math.round((env / (ps.length * d.tarefas.length)) * 100) : 0;
    return `<div class="col" title="Dia ${d.numero}: ${pct}% das tarefas registradas"><i style="height:${Math.max(pct, 2)}%"></i><span>${d.numero}</span></div>`;
  }).join('');
  const filtro = S.filtros.painel || 'todas';
  const busca = (S.filtros.busca || '').toLowerCase();
  const linhas = ps.filter((p) => {
    if (busca && !nomeDe(p).toLowerCase().includes(busca) && !p.email.toLowerCase().includes(busca)) return false;
    const s = estatisticas(p.id, n);
    const hoje = regsDe(p.id).some((r) => idsHoje.has(r.tarefa_id));
    if (filtro === 'sem_hoje') return !hoje;
    if (filtro === 'sem_ck') return !ckDe(p.id, n);
    if (filtro === 'revisao') return s.revisao > 0;
    if (filtro === 'ajuste') return s.ajuste > 0;
    return true;
  }).map((p) => {
    const s = estatisticas(p.id, n);
    const ck = ckDe(p.id, n);
    const ult = regsDe(p.id).reduce((m, r) => (r.enviado_em > m ? r.enviado_em : m), '');
    return `<tr class="click" data-act="abrir-participante" data-id="${p.id}">
      <td><strong>${esc(nomeDe(p))}</strong>${p.papel !== 'participante' ? ` <span class="tiny muted">(${NOME_PAPEL[p.papel]})</span>` : ''}<div class="tiny muted">${esc(p.email)}</div></td>
      <td><div class="mini-bar"><div class="bar dark"><i style="width:${s.pct}%"></i></div></div><span class="tiny muted">${s.enviadas}/${s.esperadas} · ${s.pct}%</span></td>
      <td><div class="dots" style="justify-content:flex-start;gap:5px">${dia.tarefas.map((t) => { const r = regTarefa(p.id, t.id); const st = r ? r.status : 'nao_iniciada'; return `<i class="${bolinha(st)}" style="width:10px;height:10px" title="${FRENTES[t.frente].nome}: ${STATUS[st]}"></i>`; }).join('')}</div></td>
      <td>${ck ? `<span class="badge b-registrada">${FEITO[ck.feito]}</span> <span class="tiny muted">“${esc(ck.palavra)}”</span>` : '<span class="badge b-nao_iniciada">Pendente</span>'}</td>
      <td>${s.revisao ? `<span class="badge b-aguardando_revisao">${s.revisao} em revisão</span> ` : ''}${s.ajuste ? `<span class="badge b-precisa_ajuste">${s.ajuste} ajuste</span> ` : ''}${s.nao ? `<span class="badge b-nao_realizada">${s.nao} não realizadas</span>` : ''}${!s.revisao && !s.ajuste && !s.nao ? '<span class="tiny muted">—</span>' : ''}</td>
      <td class="tiny muted">${ult ? fmtDT(ult) : 'sem registro'}</td></tr>`;
  }).join('');
  const opts = [['todas', 'Todas'], ['sem_hoje', 'Sem registro hoje'], ['sem_ck', 'Check-in pendente'], ['revisao', 'Com item em revisão'], ['ajuste', 'Com ajuste pendente']];
  return `<div class="main-head"><div><h1>Painel</h1><p class="muted">Dia ${n} · ${esc(dia.tema)} · ${fmtCurto(S.campanha, n)}</p></div></div>
    <div class="kpis">
      <div class="kpi"><div class="l">Participantes inscritas</div><div class="v">${ps.length}</div><div class="s">inscrições ativas</div></div>
      <div class="kpi"><div class="l">Ativas hoje</div><div class="v">${ativasHoje}</div><div class="s">registraram ao menos 1 tarefa</div></div>
      <div class="kpi"><div class="l">Tarefas registradas</div><div class="v">${tot.e ? Math.round((tot.env / tot.e) * 100) : 0}%</div><div class="s">${tot.env} de ${tot.e} esperadas até hoje</div></div>
      <div class="kpi"><div class="l">Aguardando revisão</div><div class="v">${pendentesRevisao().length}</div><div class="s"><a href="#/a/revisao">abrir fila</a></div></div>
      <div class="kpi"><div class="l">Correções em aberto</div><div class="v">${tot.aj}</div><div class="s">devolvidas para ajuste</div></div>
      <div class="kpi"><div class="l">Check-ins hoje</div><div class="v">${ckHoje}/${ps.length}</div><div class="s"><a href="#/a/checkins">ver respostas</a></div></div>
      <div class="kpi"><div class="l">Compartilharam hoje</div><div class="v">${compartilharam}/${ps.length}</div><div class="s">postaram marcando os 3 perfis</div></div>
      <div class="kpi"><div class="l">Caixinha</div><div class="v">${S.eq.caixinha.filter((c) => c.status === 'nova').length}</div><div class="s">para triagem · <a href="#/a/caixinha">abrir</a></div></div>
      <div class="kpi"><div class="l">Interesse em avaliação</div><div class="v">${interesse}</div><div class="s">tocaram em “agendar” · código ${esc(S.campanha.palavra_codigo || 'Jornada')}</div></div>
    </div>
    <div class="card" style="margin-bottom:18px"><h3>Adesão por dia <span class="tiny muted">(% das tarefas registradas)</span></h3><div class="adesao">${adesao}</div></div>
    <div class="filters">
      <input class="input" placeholder="Buscar participante" data-act="busca" value="${esc(S.filtros.busca || '')}">
      <select class="input" data-act="filtro-painel">${opts.map(([v, l]) => `<option value="${v}" ${v === filtro ? 'selected' : ''}>${l}</option>`).join('')}</select>
      <span class="tiny muted">Mostramos fatos (“sem registro”, “pendente”), nunca rótulos sobre a pessoa.</span>
    </div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Participante</th><th>Progresso</th><th>Hoje</th><th>Check-in hoje</th><th>Pendências</th><th>Última atividade</th></tr></thead>
      <tbody>${linhas || '<tr><td colspan="6" class="muted">Nenhuma participante neste filtro.</td></tr>'}</tbody></table></div>`;
}

function ficha(id) {
  const p = perfil(id);
  if (!p) return '<p>Participante não encontrada.</p>';
  const n = limiteDia();
  const s = estatisticas(id, n);
  const c = (tipo, rotulo) => { const v = S.eq.consent.find((x) => x.perfil_id === id && x.tipo === tipo); return `<dt>${rotulo}</dt><dd>${v ? (v.aceito ? `Sim · ${fmtDT(v.em)}` : `Não · ${fmtDT(v.em)}`) : '—'}</dd>`; };
  const repost = S.eq.consent.find((x) => x.perfil_id === id && x.tipo === 'repost');
  const linhas = S.dias.filter((d) => d.numero <= n).slice().reverse().map((d) => `<tr><td><strong>Dia ${d.numero}</strong><div class="tiny muted">${esc(d.tema)}</div></td>
    ${['alimentacao', 'movimento', 'mentalidade', 'compartilhar'].map((f) => {
      const t = d.tarefas.find((x) => x.frente === f);
      if (!t) return '<td></td>';
      const r = regTarefa(id, t.id);
      const st = r ? r.status : 'nao_iniciada';
      return `<td class="taskcell">${badge(st)}${t.privada && r ? `<div class="tiny muted">${ic('lock', 'e')} conteúdo privado</div>` : ''}</td>`;
    }).join('')}
    <td class="tiny">${(() => { const ck = ckDe(id, d.numero); return ck ? `${FEITO[ck.feito]} · “${esc(ck.palavra)}”` : '<span class="muted">—</span>'; })()}</td></tr>`).join('');
  return `<a class="back" href="#/a">Painel</a>
    <div class="main-head"><div><h1>${esc(nomeDe(p))}</h1><p class="muted">${p.apelido ? `Prefere “${esc(p.apelido)}” · ` : ''}${esc(p.email)} · ${NOME_PAPEL[p.papel]}</p></div></div>
    <div class="two-col" style="margin-bottom:16px">
      <div class="card"><h3>Participação</h3><div class="bar dark" style="margin:8px 0"><i style="width:${s.pct}%"></i></div>
        <p class="small">${s.enviadas} de ${s.esperadas} tarefas registradas · ${s.revisao} em revisão · ${s.ajuste} para ajuste · ${s.nao} não realizadas</p>
        <p class="tiny muted" style="margin:0">Conteúdos privados (áudios, carta, reflexões privadas) e medidas e fotos do corpo (dias 1 e 21) não aparecem para a equipe.</p></div>
      <div class="card"><h3>Consentimentos</h3><dl class="kv">${c('termos', 'Regras e privacidade')}${c('saude', 'Aviso de saúde')}${c('comunicacoes', 'Comunicações')}${c('repost', 'Repost')}</dl>
        ${repost && repost.aceito ? '' : '<div class="notice warn small" style="margin:10px 0 0">Sem autorização de repost: não compartilhar conteúdos desta participante.</div>'}</div>
    </div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Dia</th><th>Alimentação</th><th>Movimento</th><th>Mentalidade</th><th>Compartilhar</th><th>Check-in</th></tr></thead><tbody>${linhas}</tbody></table></div>`;
}

// ---------------------------------------------------------------------------
// Revisão de evidências
// ---------------------------------------------------------------------------
function itensRevisao() {
  const fd = S.filtros.revDia || 'todos';
  const ff = S.filtros.revFrente || 'todas';
  return pendentesRevisao().filter((x) => (fd === 'todos' || String(x.dia.numero) === fd) && (ff === 'todas' || x.tarefa.frente === ff));
}

function revisao() {
  const todos = pendentesRevisao();
  const itens = itensRevisao();
  const fd = S.filtros.revDia || 'todos';
  const ff = S.filtros.revFrente || 'todas';
  const modo = S.filtros.revModo || 'grade';
  const sel = S.ui.sel || {};
  const nSel = itens.filter((x) => sel[x.r.id]).length;
  const dias = [...new Set(todos.map((x) => x.dia.numero))].sort((a, b) => a - b);
  const grade = () => `<div class="rev-grid">${itens.map(({ r, dia, tarefa, p }) => `<div class="rev-tile ${sel[r.id] ? 'on' : ''}">
    <label class="rev-pic"><input type="checkbox" data-act="sel" data-id="${r.id}" ${sel[r.id] ? 'checked' : ''}><img src="${urlFoto(r.foto_path)}" alt="Foto de comprovação"></label>
    <div class="rev-info"><div class="tiny muted">${esc(chamado(p) || p.email)} · Dia ${dia.numero}</div>
      <div class="small" style="font-weight:600"><span class="f-dot fd-${tarefa.frente}"></span> ${esc(tarefa.titulo)}</div>
      <div class="tiny muted" title="${esc(tarefa.evidencia.criterio)}">${esc(tarefa.evidencia.criterio)}</div>
      <div class="btn-row" style="margin-top:8px"><button class="btn sm" data-act="aprovar" data-id="${r.id}">Aprovar</button><button class="btn ghost sm" data-act="ajuste-abrir" data-id="${r.id}">Ajuste</button></div></div></div>`).join('')}</div>`;
  const lista = () => itens.map(({ r, dia, tarefa, p }) => {
    const aberto = S.ui.ajusteId === r.id;
    return `<div class="card review" id="rev-${r.id}" style="margin-bottom:14px">
      <div><img src="${urlFoto(r.foto_path)}" alt="Evidência enviada"></div>
      <div><div class="tiny muted">${esc(nomeDe(p))} · enviado em ${fmtDT(r.enviado_em)}</div>
        <h3 style="margin:4px 0">Dia ${dia.numero} · ${esc(tarefa.titulo)}</h3><span class="frente f-${tarefa.frente}">${FRENTES[tarefa.frente].nome}</span>
        <div class="criterio" style="margin-top:10px"><strong>Critério publicado:</strong> ${esc(tarefa.evidencia.criterio || '—')}</div>
        ${aberto ? `<div style="margin-top:12px"><div class="choices">${MOTIVOS_AJUSTE.map((m) => `<button type="button" class="choice" data-act="motivo-rapido" data-v="${esc(m)}">${esc(m)}</button>`).join('')}</div>
          <label class="field"><span>O que a participante precisa corrigir? <em>(obrigatório)</em></span><textarea class="input" id="motivo-txt" rows="2"></textarea><div data-errfor="motivo"></div></label>
          <div class="btn-row"><button class="btn warn sm" data-act="ajuste-enviar" data-id="${r.id}">Enviar pedido de ajuste</button><button class="btn ghost sm" data-act="ajuste-cancelar">Cancelar</button></div></div>`
        : `<div class="btn-row" style="margin-top:12px"><button class="btn sm" data-act="aprovar" data-id="${r.id}">Aprovar</button><button class="btn ghost sm" data-act="ajuste-abrir" data-id="${r.id}">Pedir ajuste</button></div>`}
      </div></div>`;
  }).join('');
  return `<div class="main-head"><div><h1>Revisão de evidências</h1><p class="muted">${todos.length} fotos aguardando · mais antigas primeiro</p></div>
      <span class="seg-light"><button data-act="rev-modo" data-v="grade" class="${modo === 'grade' ? 'on' : ''}">Grade</button><button data-act="rev-modo" data-v="lista" class="${modo === 'lista' ? 'on' : ''}">Detalhe</button></span></div>
    <div class="filters">
      <select class="input" data-act="rev-dia"><option value="todos">Todos os dias</option>${dias.map((d) => `<option value="${d}" ${String(d) === fd ? 'selected' : ''}>Dia ${d}</option>`).join('')}</select>
      <select class="input" data-act="rev-frente">${[['todas', 'Todas as frentes'], ['alimentacao', 'Alimentação'], ['movimento', 'Movimento'], ['compartilhar', 'Compartilhar (prints)']].map(([v, l]) => `<option value="${v}" ${v === ff ? 'selected' : ''}>${l}</option>`).join('')}</select>
      ${modo === 'grade' && itens.length ? `<button class="btn ghost sm" data-act="sel-todas">${nSel === itens.length ? 'Limpar seleção' : 'Selecionar todas'}</button><button class="btn sm" data-act="aprovar-sel" ${nSel ? '' : 'disabled'}>Aprovar selecionadas (${nSel})</button>` : ''}
    </div>
    <div class="notice info small">A foto é uma evidência de apoio, não prova da execução. Aprove quando atender ao critério publicado; ao pedir ajuste, diga exatamente o que falta.</div>
    ${itens.length ? (modo === 'grade' ? grade() : lista()) : '<div class="card"><p class="muted" style="margin:0">Nenhuma foto aguardando revisão.</p></div>'}`;
}

// ---------------------------------------------------------------------------
// Caixinha
// ---------------------------------------------------------------------------
function caixinha() {
  const aba = S.filtros.cxAba || 'nova';
  const fd = S.filtros.cxDia || 'todos';
  const todas = S.eq.caixinha;
  const lista = todas.filter((c) => c.status === aba && (fd === 'todos' || String(c.dia) === fd))
    .sort((a, b) => (sinais(b.texto).urgente - sinais(a.texto).urgente) || (a.criado_em < b.criado_em ? -1 : 1));
  const dias = [...new Set(todas.map((c) => c.dia))].sort((a, b) => a - b);
  const tags = {};
  todas.forEach((c) => { if (c.tag) tags[c.tag] = (tags[c.tag] || 0) + 1; });
  const topo = Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = topo.length ? topo[0][1] : 1;
  const videos = S.dias.filter((d) => d.nelly && d.numero >= 1);
  const historico = (c) => S.eq.historicoCaixinha.filter((h) => h.mensagem_id === c.id);
  const card = (c) => {
    const p = c.autor_id ? perfil(c.autor_id) : null;
    const s = sinais(c.texto);
    const autor = c.anonima ? `<span class="badge b-privada">${ic('eyeoff', 'e')} Anônima</span>` : `<strong>${esc(nomeDe(p))}</strong>`;
    const urg = s.urgente ? `<div class="notice bad small"><strong>${ic('warn')} Possível urgência</strong>${c.anonima ? 'Mensagem anônima: não dá para contatar quem enviou. Responda com orientação para procurar atendimento e publique um aviso geral no mural, se fizer sentido.' : `Entre em contato hoje com ${esc(nomeDe(p))} (${esc(p ? p.email : '')}) e oriente a procurar atendimento. `}${AVISO_URGENCIA}</div>` : '';
    const tag = `<select class="input cx-tag" data-act="cx-tag" data-id="${c.id}"><option value="">Tema…</option>${TEMAS.map((t) => `<option ${c.tag === t ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select>`;
    let acoes = '';
    if (c.status === 'nova') {
      acoes = `<div class="btn-row">${tag}<button class="btn sm" data-act="cx-triar" data-id="${c.id}" data-dest="equipe">Equipe responde</button><button class="btn sm soft" data-act="cx-triar" data-id="${c.id}" data-dest="nelly">Clínica → Dra. Nelly</button><button class="btn sm ghost" data-act="cx-triar" data-id="${c.id}" data-dest="arquivada">Arquivar</button></div>`;
    } else if (c.status === 'equipe') {
      acoes = `${s.clinica ? '<div class="notice warn small">Parece uma dúvida clínica. A equipe não responde casos de saúde: envie para a Dra. Nelly.</div>' : ''}
        <label class="field"><span>Resposta da equipe</span><textarea class="input" id="cx-r-${c.id}" rows="3"></textarea><div data-errfor="cx-${c.id}"></div></label>
        <label class="tiny" style="display:block;margin-bottom:10px"><input type="checkbox" id="cx-pub-${c.id}"> Publicar no mural (sem o nome de quem perguntou)</label>
        <div class="btn-row">${tag}<button class="btn sm" data-act="cx-responder" data-id="${c.id}">Responder</button><button class="btn sm soft" data-act="cx-triar" data-id="${c.id}" data-dest="nelly">Enviar para a Dra. Nelly</button></div>`;
    } else if (c.status === 'nelly') {
      acoes = `<div class="notice info small">Responda em tom geral, sem citar medicamentos, doses ou preços. Orientação individual, só em consulta.</div>
        <div class="choices"><button type="button" class="choice" data-act="cx-modelo" data-id="${c.id}">Usar resposta “orientar consulta”</button></div>
        <label class="field"><span>Onde responder</span><select class="input" id="cx-video-${c.id}"><option value="">Por escrito, aqui na caixinha</option>${videos.map((d) => `<option value="${d.numero}">No vídeo do dia ${d.numero}: ${esc(d.nelly.titulo)}</option>`).join('')}</select></label>
        <label class="field"><span>Resposta da Dra. Nelly</span><textarea class="input" id="cx-r-${c.id}" rows="3"></textarea><div data-errfor="cx-${c.id}"></div></label>
        <label class="tiny" style="display:block;margin-bottom:10px"><input type="checkbox" id="cx-pub-${c.id}"> Publicar no mural para todas (sem o nome de quem perguntou)</label>
        <div class="btn-row">${tag}<button class="btn sm" data-act="cx-responder" data-id="${c.id}">Responder</button><button class="btn sm ghost" data-act="cx-triar" data-id="${c.id}" data-dest="equipe">Devolver para a equipe</button></div>`;
    } else if (c.status === 'respondida') {
      acoes = `<div class="cx-resp"><div class="tiny muted">${esc(c.resposta_por_nome || 'Equipe')} · ${fmtDT(c.resposta_em)} · ${c.publica ? 'no mural' : 'só para quem perguntou'}</div>${esc(c.resposta_texto)}${c.video_dia ? `<div class="tiny muted" style="margin-top:4px">Pauta do vídeo do dia ${c.video_dia}</div>` : ''}</div>
        <div class="btn-row" style="margin-top:8px">${tag}<button class="btn sm ghost" data-act="cx-publicar" data-id="${c.id}">${c.publica ? 'Tirar do mural' : 'Publicar no mural'}</button></div>`;
    } else {
      acoes = `<div class="btn-row">${tag}<button class="btn sm ghost" data-act="cx-triar" data-id="${c.id}" data-dest="nova">Reabrir</button></div>`;
    }
    return `<div class="card cx" style="margin-bottom:14px"><div class="cx-head">${autor}<span class="tiny muted">Dia ${c.dia} · ${fmtDT(c.criado_em)}</span>
        ${c.sobre === 'saude' ? '<span class="badge b-aguardando_revisao">marcou: saúde</span>' : ''}${s.clinica && c.status === 'nova' ? '<span class="badge b-privada">parece clínica</span>' : ''}</div>
      ${urg}<blockquote class="cx-txt">${esc(c.texto)}</blockquote>${acoes}
      <div class="history">${historico(c).map((h) => `<div>${fmtDT(h.em)} · ${esc(h.acao)}</div>`).join('')}</div></div>`;
  };
  return `<div class="main-head"><div><h1>Caixinha</h1><p class="muted">Perguntas e mensagens das participantes. Dúvidas clínicas vão para a Dra. Nelly.</p></div>
      <select class="input" style="width:auto" data-act="cx-dia"><option value="todos">Todos os dias</option>${dias.map((d) => `<option value="${d}" ${String(d) === fd ? 'selected' : ''}>Dia ${d}</option>`).join('')}</select></div>
    <div class="two-col" style="margin-bottom:16px">
      <div class="card"><h3>Temas mais comuns</h3><p class="tiny muted">Para a Ana e a Dra. Nelly escolherem o que responder nos Stories e nos vídeos.</p>
        ${topo.length ? topo.map(([t, n]) => `<div class="poll-row"><span>${esc(t)}</span><div class="bar dark"><i style="width:${Math.round((n / max) * 100)}%"></i></div><b>${n}</b></div>`).join('') : '<p class="small muted" style="margin:0">Os temas aparecem conforme a equipe classifica as mensagens.</p>'}</div>
      <div class="card"><h3>Como funciona</h3><ol class="small" style="margin:0;padding-left:18px">
        <li><strong>Triagem:</strong> a equipe lê, escolhe o tema e decide: a equipe responde, vai para a Dra. Nelly (dúvida de saúde) ou arquiva.</li>
        <li><strong>Dra. Nelly</strong> responde em tom geral, por escrito ou como pauta de um vídeo.</li>
        <li><strong>Mural:</strong> respostas úteis podem ser publicadas, sem o nome de quem perguntou.</li>
        <li><strong>Anônimas:</strong> ninguém da equipe vê quem enviou.</li></ol></div>
    </div>
    <div class="filters"><span class="seg-light">${CX_ABAS.map(([k, l]) => `<button data-act="cx-aba" data-v="${k}" class="${aba === k ? 'on' : ''}">${l} (${todas.filter((c) => c.status === k && (fd === 'todos' || String(c.dia) === fd)).length})</button>`).join('')}</span></div>
    ${lista.length ? lista.map(card).join('') : '<div class="card"><p class="muted" style="margin:0">Nada aqui.</p></div>'}`;
}

// ---------------------------------------------------------------------------
// Check-ins
// ---------------------------------------------------------------------------
function checkins(pedido) {
  const n = Math.max(1, Math.min(Number(pedido) || limiteDia(), limiteDia()));
  const dia = S.dias.find((d) => d.numero === n);
  const ps = participantes();
  const resp = ps.filter((p) => ckDe(p.id, n));
  const pend = ps.filter((p) => !ckDe(p.id, n));
  const cont = { sim: 0, parte: 0, nao: 0 };
  resp.forEach((p) => { cont[ckDe(p.id, n).feito]++; });
  const enq = dia.enquete;
  const bal = dia.balanco;
  const opts = S.dias.filter((d) => d.numero <= limiteDia()).map((d) => `<option value="${d.numero}" ${d.numero === n ? 'selected' : ''}>Dia ${d.numero} · ${esc(d.tema)}</option>`).join('');
  return `<div class="main-head"><div><h1>Check-ins</h1><p class="muted">${resp.length} responderam · ${pend.length} pendentes</p></div><select class="input" style="width:auto" data-act="ck-dia">${opts}</select></div>
    <div class="kpis"><div class="kpi"><div class="l">Fez o dia</div><div class="v">${cont.sim}</div></div><div class="kpi"><div class="l">Em parte</div><div class="v">${cont.parte}</div></div><div class="kpi"><div class="l">Não</div><div class="v">${cont.nao}</div></div><div class="kpi"><div class="l">Pendentes</div><div class="v">${pend.length}</div></div></div>
    <div class="two-col">
      <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Respondeu</th><th>Fez o dia?</th><th>Em uma palavra</th><th>Hora</th></tr></thead><tbody>
        ${resp.map((p) => { const c = ckDe(p.id, n); return `<tr><td>${esc(nomeDe(p))}</td><td>${FEITO[c.feito]}</td><td>“${esc(c.palavra)}”</td><td class="tiny muted">${fmtDT(c.em)}</td></tr>`; }).join('') || '<tr><td colspan="4" class="muted">Ninguém respondeu ainda.</td></tr>'}</tbody></table></div>
      <div class="card"><h3>Pendentes</h3>${pend.map((p) => `<div style="padding:5px 0;border-bottom:1px solid var(--sep)">${esc(nomeDe(p))}</div>`).join('') || '<p class="muted">Todas responderam.</p>'}
        <p class="tiny muted" style="margin:10px 0 0">As palavras não são interpretadas automaticamente. Dúvidas clínicas vão para a Dra. Nelly.</p></div>
    </div>
    ${enq ? (() => {
      const tot = resp.filter((p) => ckDe(p.id, n).enquete).length;
      return `<h2 style="margin-top:22px">Enquete: ${esc(enq.pergunta)}</h2><div class="card">${enq.opcoes.map((o) => {
        const c = resp.filter((p) => ckDe(p.id, n).enquete === o).length;
        const pct = tot ? Math.round((c / tot) * 100) : 0;
        return `<div class="poll-row"><span>${esc(o)}</span><div class="bar dark"><i style="width:${pct}%"></i></div><b>${c} · ${pct}%</b></div>`;
      }).join('')}<p class="tiny muted" style="margin:8px 0 0">${tot} resposta(s). Resultado agregado, sem interpretação individual.</p></div>`;
    })() : ''}
    ${bal ? `<h2 style="margin-top:22px">${esc(bal.titulo)}</h2><div class="tbl-wrap"><table class="tbl"><thead><tr><th>Participante</th>${bal.perguntas.map((q) => `<th>${esc(q)}</th>`).join('')}</tr></thead><tbody>
      ${resp.filter((p) => ckDe(p.id, n).balanco).map((p) => `<tr><td>${esc(nomeDe(p))}</td>${bal.perguntas.map((_, i) => `<td>${esc((ckDe(p.id, n).balanco || [])[i] || '—')}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${bal.perguntas.length + 1}" class="muted">Sem respostas.</td></tr>`}</tbody></table></div>` : ''}`;
}

// ---------------------------------------------------------------------------
// Configurar dias, campanha, acessos e exportação
// ---------------------------------------------------------------------------
function dias() {
  const ultima = (n) => S.eq.alteracoes.find((a) => a.dia === n);
  const linhas = S.dias.map((d) => {
    const u = ultima(d.numero);
    return `<tr class="click" data-act="abrir-dia" data-n="${d.numero}"><td><strong>${d.numero}</strong></td><td class="tiny muted" style="white-space:nowrap">${fmtCurto(S.campanha, d.numero)}</td>
      <td><strong>${esc(d.tema)}</strong><div class="tiny muted">${esc(semanaNome(d.semana))}</div>
        ${d.nelly ? `<div class="tiny" style="margin-top:4px">${ic('play', 'e')} Dra. Nelly · <span class="badge ${d.nelly.status === 'aprovado' ? 'b-aprovada' : 'b-aguardando_revisao'}">${NELLY_STATUS[d.nelly.status]}</span></div>` : ''}
        ${d.enquete ? '<div class="tiny muted">enquete no check-in</div>' : ''}${d.cta ? '<div class="tiny muted">botão de avaliação</div>' : ''}</td>
      ${['alimentacao', 'movimento', 'mentalidade', 'compartilhar'].map((f) => { const t = d.tarefas.find((x) => x.frente === f); return `<td class="taskcell">${t ? `${esc(t.titulo)}<div class="tiny muted">${esc(tipoDesc(t))}</div>` : ''}</td>`; }).join('')}
      <td class="tiny muted">${u ? `${fmtDT(u.em)}<br>${esc(u.resumo)}` : '—'}</td></tr>`;
  }).join('');
  return `<div class="main-head"><div><h1>Configurar dias</h1><p class="muted">${esc(S.campanha.nome)} · início ${fmtCurto(S.campanha, 1)} · libera às ${String(S.campanha.liberacao).slice(0, 5)}</p></div></div>
    <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Dia</th><th>Data</th><th>Tema</th><th>Alimentação</th><th>Movimento</th><th>Mentalidade</th><th>Compartilhar</th><th>Última alteração</th></tr></thead><tbody>${linhas}</tbody></table></div>`;
}

function diaEditar(n) {
  const d = S.dias.find((x) => x.numero === n);
  if (!d) return '<p>Dia não encontrado.</p>';
  const nl = d.nelly;
  const tarefa = (t, i) => {
    const ev = t.evidencia || { foto: 'nao', criterio: '' };
    const foto = t.registro.tipo === 'privado'
      ? `<div class="notice lock small" style="margin:10px 0 0">Tarefa privada: não pede foto (fotos do corpo, medidas e áudios ficam no celular).</div>`
      : `<div class="criterio" style="margin-top:10px"><label class="field" style="margin-bottom:8px"><span>Foto de comprovação</span><select class="input" name="t${i}-foto">${[['obrigatoria', 'Obrigatória'], ['opcional', 'Opcional'], ['nao', 'Não pedir foto']].map(([v, l]) => `<option value="${v}" ${ev.foto === v ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
        <label class="field" style="margin:0"><span>Critério da foto <em>(a participante vê antes de enviar)</em></span><textarea class="input" name="t${i}-crit" rows="2">${esc(ev.criterio || '')}</textarea></label></div>`;
    return `<div class="card"><span class="frente f-${t.frente}">${ic(FRENTES[t.frente].icone)} ${FRENTES[t.frente].nome}</span>
      <label class="field" style="margin-top:8px"><span>Título</span><input class="input" name="t${i}-tit" value="${esc(t.titulo)}"></label>
      <label class="field"><span>Instrução</span><textarea class="input" name="t${i}-ins" rows="3">${esc(t.instrucao)}</textarea></label>
      <label class="field"><span>Mensagem de ajuda / alternativa <em>(opcional)</em></span><input class="input" name="t${i}-alt" value="${esc(t.alternativa || '')}"></label>
      <div class="criterio"><strong>Registro:</strong> ${esc(tipoDesc(t))}</div>${foto}</div>`;
  };
  const statusOpcoes = Object.entries(NELLY_STATUS).map(([v, l]) => `<option value="${v}" ${nl && nl.status === v ? 'selected' : ''} ${v === 'aprovado' && !podeAprovarConteudo() ? 'disabled' : ''}>${l}</option>`).join('');
  return `<a class="back" href="#/a/dias">Configurar dias</a>
    <form data-form="dia" data-n="${n}">
      <div class="main-head"><div><h1>Dia ${n}</h1><p class="muted">${fmtCurto(S.campanha, n)} · ${esc(semanaNome(d.semana))}</p></div>
        <div class="btn-row">${n > 1 ? `<a class="btn ghost sm" href="#/a/dias/${n - 1}">Dia ${n - 1}</a>` : ''}${n < 21 ? `<a class="btn ghost sm" href="#/a/dias/${n + 1}">Dia ${n + 1}</a>` : ''}<button class="btn sm" type="submit">Salvar alterações</button></div></div>
      <div class="notice info small">As alterações valem na hora para as participantes e ficam registradas. O texto de saúde da Dra. Nelly só aparece depois de aprovado por ela; se alguém da equipe editar, volta para revisão.</div>
      <label class="field"><span>Tema do dia</span><input class="input" name="tema" value="${esc(d.tema)}"></label>
      ${nl ? `<div class="card nelly" style="margin-bottom:16px"><h3>${ic('play')} Conteúdo da Dra. Nelly</h3>
        <div class="two-col"><div><label class="field"><span>Título</span><input class="input" name="nl-tit" value="${esc(nl.titulo)}"></label>
          <label class="field"><span>Situação</span><select class="input" name="nl-status">${statusOpcoes}</select></label></div>
          <label class="field"><span>Resumo (aparece para as participantes)</span><textarea class="input" name="nl-res" rows="5">${esc(nl.resumo)}</textarea></label></div>
        <p class="tiny muted" style="margin:0">Só ${esc(NOME_PAPEL.nelly)} ou admin podem marcar como aprovado.</p></div>` : ''}
      <div class="cols-3">${d.tarefas.map(tarefa).join('')}</div>
    </form>`;
}

function campanha() {
  const c = S.campanha;
  return `<div class="main-head"><div><h1>Campanha</h1><p class="muted">${esc(c.nome)}</p></div></div>
    <form data-form="campanha" class="card" style="margin-bottom:16px" novalidate>
      <h3>Datas e contatos</h3>
      <div class="two-col">
        <label class="field"><span>Início (dia 1)</span><input class="input" type="date" name="inicio" value="${esc(c.inicio)}"></label>
        <label class="field"><span>Libera às</span><input class="input" type="time" name="liberacao" value="${esc(String(c.liberacao).slice(0, 5))}"></label>
        <label class="field"><span>WhatsApp da clínica <em>(só números, com DDI e DDD)</em></span><input class="input" name="whatsapp" inputmode="numeric" placeholder="5514999999999" value="${esc(c.whatsapp_clinica || '')}"></label>
        <label class="field"><span>Palavra-código dos agendamentos</span><input class="input" name="palavra" value="${esc(c.palavra_codigo || '')}"></label>
        <label class="field"><span>Hashtag</span><input class="input" name="hashtag" value="${esc(c.hashtag || '')}"></label>
      </div>
      <div data-errfor="geral"></div>
      <h3 style="margin-top:8px">Perfis marcados no Instagram</h3>
      <p class="small muted">Aparecem no texto pronto que as participantes copiam todos os dias. O Instagram não aceita acento nem espaço no @.</p>
      <div class="cols-3">${(c.instagram || []).map((i, k) => `<label class="field"><span>${esc(i.nome)}</span><input class="input" name="ig${k}" value="${esc(i.usuario)}"></label>`).join('')}</div>
      <h3 style="margin-top:8px">Semanas</h3>
      <div class="cols-3">${(c.semanas || []).map((w, k) => `<div><label class="field"><span>Semana ${k + 1}</span><input class="input" name="w${k}" value="${esc(w.nome)}"></label><label class="field"><span>Foco</span><textarea class="input" name="f${k}" rows="2">${esc(w.foco)}</textarea></label></div>`).join('')}</div>
      <h3 style="margin-top:8px">Aviso de saúde</h3>
      <label class="field"><textarea class="input" name="aviso" rows="3">${esc(c.aviso_saude)}</textarea></label>
      <button class="btn" type="submit">Salvar campanha</button>
    </form>`;
}

function acessos() {
  const admin = S.perfil.papel === 'admin';
  const equipe = S.eq.perfis.filter((p) => p.papel !== 'participante');
  return `<div class="main-head"><div><h1>Acessos e senhas</h1><p class="muted">Quem é da equipe e como ajudar quem esqueceu a senha.</p></div></div>
    <div class="two-col">
      <div class="card"><h2>Redefinir senha</h2>
        <p class="small muted">Quando uma participante avisar no WhatsApp que esqueceu a senha: digite o e-mail dela, gere uma senha provisória e mande para ela. No próximo acesso o app pede uma senha nova.</p>
        <form data-form="redefinir" novalidate>
          <label class="field"><span>E-mail da participante</span><input class="input" name="email" type="email" autocomplete="off" placeholder="participante@email.com"><div data-errfor="email"></div></label>
          <button class="btn" type="submit">Gerar senha provisória</button>
        </form>
        ${S.ui.provisoria ? `<div class="notice ok" style="margin:16px 0 0"><strong>Senha redefinida</strong>
          E-mail: ${esc(S.ui.provisoria.email)}<br>Senha provisória: <b class="senha-prov">${esc(S.ui.provisoria.senha)}</b>
          <div class="btn-row" style="margin-top:10px"><button class="btn sm" data-act="copiar-provisoria">${ic('copy')} Copiar mensagem para o WhatsApp</button></div></div>` : ''}
      </div>
      <div class="card"><h2>Equipe</h2>
        ${equipe.map((p) => `<div style="display:flex;justify-content:space-between;gap:10px;padding:8px 0;border-bottom:1px solid var(--sep)"><div><strong>${esc(nomeDe(p))}</strong><div class="tiny muted">${esc(p.email)}</div></div><span class="badge b-privada">${NOME_PAPEL[p.papel]}</span></div>`).join('') || '<p class="muted small">Ninguém ainda.</p>'}
        ${admin ? `<form data-form="papel" style="margin-top:14px" novalidate>
          <p class="small muted">A pessoa precisa criar a conta no app antes. Depois, defina o papel pelo e-mail.</p>
          <label class="field"><span>E-mail</span><input class="input" name="email" type="email" placeholder="pessoa@email.com"><div data-errfor="email"></div></label>
          <label class="field"><span>Papel</span><select class="input" name="papel"><option value="equipe">Equipe (revisa e responde)</option><option value="nelly">Dra. Nelly (aprova conteúdo de saúde)</option><option value="admin">Administradora</option><option value="participante">Participante (remove o acesso à equipe)</option></select></label>
          <button class="btn ghost" type="submit">Definir papel</button></form>` : '<p class="tiny muted" style="margin-top:12px">Só uma administradora define papéis.</p>'}
      </div>
    </div>`;
}

function exportar() {
  return `<div class="main-head"><div><h1>Exportar</h1><p class="muted">Arquivos CSV (abrem no Excel ou Google Planilhas).</p></div></div>
    <div class="two-col">
      <div class="card"><h3>Registros de tarefas</h3><p class="small muted">Uma linha por participante e tarefa: status, data de envio, se tinha foto, quem revisou e o motivo do ajuste.</p><button class="btn" data-act="csv-registros">Baixar registros.csv</button></div>
      <div class="card"><h3>Check-ins</h3><p class="small muted">Uma linha por participante e dia: respondeu, fez o dia, palavra e enquete.</p><button class="btn" data-act="csv-checkins">Baixar checkins.csv</button></div>
    </div>
    <div class="notice lock small" style="margin-top:16px"><strong>${ic('lock')} O que não sai na exportação</strong>Respostas de tarefas privadas, fotos, medidas do corpo e e-mails. A exportação traz apenas o necessário para acompanhar adesão e pendências.</div>`;
}

// ---------------------------------------------------------------------------
// Roteamento da área da equipe
// ---------------------------------------------------------------------------
export function telaEquipe(sub, arg) {
  switch (sub) {
    case 'participante': return estrutura('painel', ficha(arg));
    case 'revisao': return estrutura('revisao', revisao());
    case 'caixinha': return estrutura('caixinha', caixinha());
    case 'checkins': return estrutura('checkins', checkins(arg));
    case 'dias': return estrutura('dias', arg ? diaEditar(Number(arg)) : dias());
    case 'campanha': return estrutura('campanha', campanha());
    case 'acessos': return estrutura('acessos', acessos());
    case 'exportar': return estrutura('exportar', exportar());
    default: return estrutura('painel', painel());
  }
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------
async function atualizar(mensagem) {
  await carregarEquipe(true);
  if (mensagem) toast(mensagem);
  app.render();
}

const csv = (linhas) => '﻿' + linhas.map((l) => l.map((v) => { const s = String(v == null ? '' : v); return /[";\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';')).join('\n');
function baixar(nome, conteudo) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([conteudo], { type: 'text/csv;charset=utf-8' }));
  a.download = nome;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}

async function triar(id, dest) {
  const el = document.querySelector(`[data-act="cx-tag"][data-id="${id}"]`);
  const campos = { status: dest };
  if (el && el.value) campos.tag = el.value;
  await api.atualizarCaixinha(id, campos);
  await atualizar({ equipe: 'Fica com a equipe.', nelly: 'Enviada para a Dra. Nelly.', arquivada: 'Arquivada.', nova: 'Reaberta.' }[dest]);
}

export const cliques = {
  'menu-recolher': () => {
    try { localStorage.setItem(CHAVE_MENU, menuRecolhido() ? '0' : '1'); } catch { /* sem storage */ }
    app.render();
  },
  'abrir-participante': (el) => { location.hash = `#/a/participante/${el.dataset.id}`; },
  'abrir-dia': (el) => { location.hash = `#/a/dias/${el.dataset.n}`; },
  aprovar: async (el) => {
    await api.revisarRegistro(el.dataset.id, true);
    delete S.ui.sel;
    await atualizar('Aprovada.');
  },
  'aprovar-sel': async () => {
    const ids = Object.keys(S.ui.sel || {}).filter((k) => S.ui.sel[k]);
    for (const id of ids) await api.revisarRegistro(id, true);
    S.ui.sel = {};
    await atualizar(`${ids.length} ${ids.length === 1 ? 'foto aprovada' : 'fotos aprovadas'}.`);
  },
  'sel-todas': () => {
    const its = itensRevisao();
    const todas = its.every((x) => (S.ui.sel || {})[x.r.id]);
    S.ui.sel = {};
    if (!todas) its.forEach((x) => { S.ui.sel[x.r.id] = true; });
    app.render();
  },
  'ajuste-abrir': (el) => { S.ui.ajusteId = el.dataset.id; S.filtros.revModo = 'lista'; app.render(); const t = $('#motivo-txt'); if (t) t.focus(); const c = document.getElementById('rev-' + el.dataset.id); if (c) c.scrollIntoView({ block: 'start' }); },
  'ajuste-cancelar': () => { S.ui.ajusteId = null; app.render(); },
  'motivo-rapido': (el) => { const t = $('#motivo-txt'); t.value = el.dataset.v; t.focus(); },
  'ajuste-enviar': async (el) => {
    const t = $('#motivo-txt');
    if (!t.value.trim()) { const e = $('[data-errfor="motivo"]'); e.textContent = 'Diga o que precisa ser corrigido.'; e.className = 'err-msg'; t.classList.add('err'); return; }
    await api.revisarRegistro(el.dataset.id, false, t.value.trim());
    S.ui.ajusteId = null;
    await atualizar('Pedido de ajuste enviado à participante.');
  },
  'rev-modo': (el) => { S.filtros.revModo = el.dataset.v; S.ui.ajusteId = null; app.render(); },
  'cx-aba': (el) => { S.filtros.cxAba = el.dataset.v; app.render(); },
  'cx-triar': (el) => triar(el.dataset.id, el.dataset.dest),
  'cx-modelo': (el) => {
    const t = $('#cx-r-' + el.dataset.id);
    t.value = `Essa pergunta depende de uma avaliação individual, então o ideal é conversar sobre o seu caso em consulta. Se quiser, você pode agendar uma avaliação na Eleviê com a palavra-código ${S.campanha.palavra_codigo || 'Jornada'}.`;
    t.focus();
  },
  'cx-responder': async (el) => {
    const id = el.dataset.id;
    const t = $('#cx-r-' + id);
    const sel = $('#cx-video-' + id);
    const video = sel && sel.value ? Number(sel.value) : null;
    let texto = t ? t.value.trim() : '';
    if (!texto && video) texto = `Obrigada pela pergunta! Vou falar sobre isso, em tom geral, no vídeo do dia ${video}.`;
    if (!texto) { const e = $(`[data-errfor="cx-${id}"]`); e.textContent = 'Escreva a resposta ou escolha um vídeo.'; e.className = 'err-msg'; t.classList.add('err'); return; }
    const tagEl = document.querySelector(`[data-act="cx-tag"][data-id="${id}"]`);
    const campos = { resposta_texto: texto, publica: Boolean(($('#cx-pub-' + id) || {}).checked), video_dia: video };
    if (tagEl && tagEl.value) campos.tag = tagEl.value;
    await api.atualizarCaixinha(id, campos);
    await atualizar('Resposta enviada.');
  },
  'cx-publicar': async (el) => {
    const c = S.eq.caixinha.find((x) => x.id === el.dataset.id);
    await api.atualizarCaixinha(c.id, { publica: !c.publica });
    await atualizar(c.publica ? 'Retirada do mural.' : 'Publicada no mural.');
  },
  'copiar-provisoria': async () => {
    const p = S.ui.provisoria;
    const msg = `Olá! Sua senha provisória do app Desafio 21 Dias é: ${p.senha}\nEntre com o seu e-mail (${p.email}) e essa senha. O app vai pedir para você criar uma senha nova.`;
    await navigator.clipboard.writeText(msg);
    toast('Mensagem copiada. Cole na conversa do WhatsApp.');
  },
  'csv-registros': () => {
    const linhas = [['participante', 'dia', 'tema', 'frente', 'tarefa', 'foto_exigida', 'enviou_foto', 'privada', 'status', 'enviado_em', 'motivo_ajuste', 'motivo_nao_realizada']];
    participantes().forEach((p) => regsDe(p.id).forEach((r) => {
      const x = tarefaPorId(r.tarefa_id);
      if (!x) return;
      linhas.push([nomeDe(p), x.dia.numero, x.dia.tema, FRENTES[x.tarefa.frente].nome, x.tarefa.titulo, x.tarefa.evidencia.foto, r.foto_path ? 'sim' : 'não', x.tarefa.privada ? 'sim' : 'não', STATUS[r.status], r.enviado_em, r.motivo_ajuste || '', r.motivo_nao || '']);
    }));
    baixar('registros.csv', csv(linhas));
  },
  'csv-checkins': () => {
    const linhas = [['participante', 'dia', 'fez_o_dia', 'palavra', 'enquete', 'respondido_em']];
    participantes().forEach((p) => S.eq.checkins.filter((c) => c.perfil_id === p.id).sort((a, b) => a.dia - b.dia).forEach((c) => {
      linhas.push([nomeDe(p), c.dia, FEITO[c.feito], c.palavra, c.enquete || '', c.em]);
    }));
    baixar('checkins.csv', csv(linhas));
  },
};

export const mudancas = {
  'dia-sim': (el) => {
    const n = Number(el.value) || null;
    S.diaSim = n;
    try { if (n) localStorage.setItem('jornada-dia-simulado', String(n)); else localStorage.removeItem('jornada-dia-simulado'); } catch { /* sem storage */ }
    app.render();
  },
  'filtro-painel': (el) => { S.filtros.painel = el.value; app.render(); },
  'rev-dia': (el) => { S.filtros.revDia = el.value; S.ui.sel = {}; app.render(); },
  'rev-frente': (el) => { S.filtros.revFrente = el.value; S.ui.sel = {}; app.render(); },
  sel: (el) => { S.ui.sel = S.ui.sel || {}; S.ui.sel[el.dataset.id] = el.checked; app.render(); },
  'cx-dia': (el) => { S.filtros.cxDia = el.value; app.render(); },
  'cx-tag': async (el) => { try { await api.atualizarCaixinha(el.dataset.id, { tag: el.value || null }); const c = S.eq.caixinha.find((x) => x.id === el.dataset.id); if (c) c.tag = el.value || null; } catch (e) { toast(e.message); } },
  'ck-dia': (el) => { location.hash = `#/a/checkins/${el.value}`; },
};

let buscaTimer;
export function aoDigitar(el) {
  if (el.dataset.act !== 'busca') return;
  clearTimeout(buscaTimer);
  const v = el.value;
  buscaTimer = setTimeout(() => {
    S.filtros.busca = v;
    app.render();
    const campo = $('[data-act="busca"]');
    if (campo) { campo.focus(); campo.setSelectionRange(v.length, v.length); }
  }, 250);
}

export const envios = {
  dia: async (form, fd) => {
    const n = Number(form.dataset.n);
    const d = S.dias.find((x) => x.numero === n);
    const mudou = [];
    const tema = String(fd.get('tema') || '').trim();
    if (tema && tema !== d.tema) { await api.atualizarDia(d.id, { tema }); mudou.push('tema'); }
    if (d.nelly) {
      const campos = {};
      const tit = String(fd.get('nl-tit') || '').trim();
      const res = String(fd.get('nl-res') || '').trim();
      const st = String(fd.get('nl-status') || d.nelly.status);
      if (tit && tit !== d.nelly.titulo) campos.titulo = tit;
      if (res && res !== d.nelly.resumo) campos.resumo = res;
      if (st !== d.nelly.status) campos.status = st;
      if (Object.keys(campos).length) {
        // Editar o texto sem ser a Dra. Nelly devolve o conteúdo para revisão (regra do banco).
        if ((campos.titulo || campos.resumo) && !podeAprovarConteudo() && !campos.status) campos.status = 'em_revisao';
        await api.atualizarNelly(d.id, campos);
        mudou.push('conteúdo da Dra. Nelly');
      }
    }
    for (let i = 0; i < d.tarefas.length; i++) {
      const t = d.tarefas[i];
      const campos = {};
      const tit = String(fd.get(`t${i}-tit`) || '').trim();
      const ins = String(fd.get(`t${i}-ins`) || '').trim();
      const alt = String(fd.get(`t${i}-alt`) || '').trim() || null;
      if (tit && tit !== t.titulo) campos.titulo = tit;
      if (ins && ins !== t.instrucao) campos.instrucao = ins;
      if (alt !== (t.alternativa || null)) campos.alternativa = alt;
      const foto = fd.get(`t${i}-foto`);
      if (foto && t.registro.tipo !== 'privado') {
        const criterio = String(fd.get(`t${i}-crit`) || '').trim();
        if (foto !== t.evidencia.foto || criterio !== (t.evidencia.criterio || '')) campos.evidencia = { foto, criterio };
      }
      if (Object.keys(campos).length) { await api.atualizarTarefa(t.id, campos); mudou.push(FRENTES[t.frente].nome.toLowerCase()); }
    }
    if (!mudou.length) { toast('Nada mudou.'); return; }
    await api.registrarAlteracao(S.campanha.id, n, S.perfil.id, `Atualizou: ${mudou.join(', ')}`);
    S.dias = await api.carregarDias(S.campanha.id);
    await atualizar(`Dia ${n} salvo.`);
  },

  campanha: async (form, fd) => {
    const c = S.campanha;
    const instagram = (c.instagram || []).map((i, k) => {
      let u = String(fd.get('ig' + k) || '').trim().toLowerCase().replace(/^https?:\/\/(www\.)?instagram\.com\//, '').replace(/[/?].*$/, '');
      if (u && !u.startsWith('@')) u = '@' + u;
      return { ...i, usuario: u || i.usuario };
    });
    const invalidos = instagram.filter((i) => !/^@[a-z0-9._]{1,30}$/.test(i.usuario));
    if (invalidos.length) { erros(form, [['geral', `O Instagram não aceita acento nem espaço: confira ${invalidos.map((i) => i.usuario).join(', ')}.`]]); return; }
    const inicio = String(fd.get('inicio') || c.inicio);
    const campos = {
      inicio,
      liberacao: String(fd.get('liberacao') || '06:00'),
      whatsapp_clinica: String(fd.get('whatsapp') || '').replace(/\D/g, '') || null,
      palavra_codigo: String(fd.get('palavra') || '').trim() || null,
      hashtag: String(fd.get('hashtag') || '').trim() || null,
      aviso_saude: String(fd.get('aviso') || '').trim() || c.aviso_saude,
      instagram,
      semanas: (c.semanas || []).map((w, k) => ({ nome: String(fd.get('w' + k) || w.nome).trim(), foco: String(fd.get('f' + k) || w.foco).trim() })),
    };
    S.campanha = await api.atualizarCampanha(c.id, campos);
    await api.registrarAlteracao(c.id, null, S.perfil.id, 'Atualizou a campanha');
    await atualizar('Campanha salva.');
  },

  papel: async (form, fd) => {
    const email = String(fd.get('email') || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) { erros(form, [['email', 'Digite um e-mail válido.']]); return; }
    try { await api.definirPapel(email, String(fd.get('papel'))); } catch (e) { erros(form, [['email', e.message]]); return; }
    form.reset();
    await atualizar('Papel atualizado.');
  },
};

export { chamado };
