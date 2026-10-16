// Peças de interface compartilhadas entre as telas da participante e da equipe.
import { S } from './estado.js';
import { ic } from './lib/icones.js';
import { diaAtual } from './lib/datas.js';

export const $ = (sel, el = document) => el.querySelector(sel);
export const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const FRENTES = {
  alimentacao: { nome: 'Alimentação', icone: 'fork' },
  movimento: { nome: 'Movimento', icone: 'walk' },
  mentalidade: { nome: 'Mentalidade', icone: 'leaf' },
  compartilhar: { nome: 'Compartilhar', icone: 'share' },
};
export const STATUS = {
  nao_iniciada: 'Não iniciada', em_andamento: 'Rascunho salvo', aguardando_revisao: 'Aguardando revisão',
  registrada: 'Registrada', aprovada: 'Aprovada', precisa_ajuste: 'Precisa de ajuste', nao_realizada: 'Não realizada',
};
export const ENVIADAS = ['aguardando_revisao', 'registrada', 'aprovada'];
export const FEITO = { sim: 'Sim', parte: 'Em parte', nao: 'Não' };
export const NOME_PAPEL = { participante: 'participante', equipe: 'equipe', nelly: 'Dra. Nelly', admin: 'administradora' };
export const PAPEIS_EQUIPE = ['equipe', 'nelly', 'admin'];

export const ehEquipe = () => Boolean(S.perfil) && PAPEIS_EQUIPE.includes(S.perfil.papel);
export const chamado = (p) => String((p && (p.apelido || p.nome)) || '').trim().split(/\s+/)[0];

export function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// Mostra as mensagens de erro nos campos [data-errfor="nome"] do formulário.
export function erros(form, lista) {
  form.querySelectorAll('[data-errfor]').forEach((e) => { e.textContent = ''; e.className = ''; });
  lista.forEach(([nome, msg]) => {
    const el = form.querySelector(`[data-errfor="${nome}"]`);
    if (el) { el.textContent = msg; el.className = 'err-msg'; }
  });
  const primeiro = form.querySelector('.err-msg');
  if (primeiro) primeiro.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

export const badge = (st) => `<span class="badge b-${st}">${STATUS[st] || st}</span>`;

export function anel(feito, total) {
  const r = 26, c = 2 * Math.PI * r, p = total ? feito / total : 0;
  return `<div class="ring" role="img" aria-label="${feito} de ${total} tarefas do dia"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" class="ring-bg"/><circle cx="32" cy="32" r="${r}" class="ring-fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - p)).toFixed(1)}"/></svg><span><b>${feito}</b><small>/${total}</small></span></div>`;
}

export const fmtDT = (iso) => (iso
  ? new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  : '—');

export function shell(inner, aba) {
  const abas = [['hoje', 'house', 'Hoje', '#/hoje'], ['progresso', 'chart', 'Progresso', '#/progresso'], ['checkin', 'bubble', 'Check-in', '#/checkin'], ['caixinha', 'tray', 'Caixinha', '#/caixinha'], ['avisos', 'bell', 'Avisos', '#/avisos']];
  if (ehEquipe()) abas.push(['equipe', 'grid', 'Equipe', '#/a']);
  const tab = aba ? `<nav class="tabbar glass" style="grid-template-columns:repeat(${abas.length},1fr)" aria-label="Navegação">${abas.map(([k, i, l, h]) => `<a href="${h}" class="${k === aba ? 'on' : ''}" ${k === aba ? 'aria-current="page"' : ''}>${ic(i)}<span>${l}</span></a>`).join('')}</nav>` : '';
  return `<div class="phone-wrap"><div class="phone${aba ? ' has-tabs' : ''}"><div class="p-scroll" id="pscroll"><div class="screen enter">${inner}</div></div>${tab}</div></div>`;
}

export const carregando = (msg = 'Carregando…') =>
  shell(`<div class="p-body login" style="text-align:center;padding-top:120px"><div class="logo">${ic('leaf')}</div><p class="muted">${esc(msg)}</p></div>`);

export const falha = (msg) => shell(`<div class="p-body login"><div class="welcome-hero"><div class="logo">${ic('warn')}</div><h1>Algo deu errado</h1></div>
  <div class="notice bad"><strong>Não conseguimos carregar</strong>${esc(msg)}</div>
  <button class="btn block" data-act="recarregar">Tentar de novo</button></div>`);

// Dia da jornada em vigor. A equipe pode simular outro dia para testar (só na tela dela).
export function diaHoje() {
  if (ehEquipe() && S.diaSim) return S.diaSim;
  return diaAtual(S.campanha);
}

export const pedeFoto = (t) => Boolean(t.evidencia) && t.evidencia.foto !== 'nao' && !(t.registro && t.registro.tipo === 'privado');

export function tipoDesc(t) {
  const r = t.registro;
  const soFoto = r.tipo === 'texto' && r.campos.every((c) => !c.obrigatorio);
  let base = '';
  switch (r.tipo) {
    case 'autorrelato': base = 'Marcar que fez'; break;
    case 'texto': base = r.privado ? 'Resposta escrita · só você vê' : r.campos.length > 1 ? `${r.campos.length} respostas curtas` : 'Resposta curta'; break;
    case 'checklist': base = 'Marcar os hábitos do dia'; break;
    case 'privado': return 'Só confirmar · nada é enviado';
    case 'compartilhar': base = 'Postar marcando os 3 perfis · link ou print'; break;
    default: base = '';
  }
  if (!pedeFoto(t) || r.tipo === 'compartilhar') return base;
  if (t.evidencia.foto === 'obrigatoria') return soFoto ? 'Foto de comprovação' : `Foto de comprovação + ${base.toLowerCase()}`;
  return `${base} · foto opcional`;
}

export const semanaNome = (n) => `Semana ${n} · ${((S.campanha.semanas || [])[n - 1] || {}).nome || ''}`;
