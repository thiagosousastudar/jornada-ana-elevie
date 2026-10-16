// Jornada Ana + Eleviê — app de produção (Vite + Supabase).
// Etapa 1 (fundação): login com Google ou código no e-mail, perfil, entrada na jornada
// (inscrição + consentimentos) e a tela "Hoje" lendo do banco. As demais telas do
// protótipo (envio de tarefas, check-in, caixinha, equipe) são portadas na etapa 2.
import './styles.css';
import './app.css';
import { configurado, CAMPANHA_SLUG } from './lib/supabase.js';
import { entrarComGoogle, enviarCodigo, confirmarCodigo, sair, sessaoAtual, aoMudarSessao } from './lib/auth.js';
import * as api from './lib/api.js';
import { diaAtual, fmtLongo, fmtCurto } from './lib/datas.js';
import { ic, GOOGLE_G } from './lib/icones.js';

const $ = (sel) => document.querySelector(sel);
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const FRENTES = {
  alimentacao: { nome: 'Alimentação', icone: 'fork' },
  movimento: { nome: 'Movimento', icone: 'walk' },
  mentalidade: { nome: 'Mentalidade', icone: 'leaf' },
  compartilhar: { nome: 'Compartilhar', icone: 'share' },
};
const STATUS = {
  nao_iniciada: 'Não iniciada', em_andamento: 'Rascunho salvo', aguardando_revisao: 'Aguardando revisão',
  registrada: 'Registrada', aprovada: 'Aprovada', precisa_ajuste: 'Precisa de ajuste', nao_realizada: 'Não realizada',
};
const ENVIADAS = ['aguardando_revisao', 'registrada', 'aprovada'];

// Estado da sessão em memória (o que é de verdade está no banco).
const S = { sessao: null, perfil: null, campanha: null, dias: [], inscricao: null, consent: {}, registros: [], ui: {} };

// ---------------------------------------------------------------------------
// Utilidades de tela
// ---------------------------------------------------------------------------
function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2800);
}

function shell(inner, aba) {
  const abas = [['hoje', 'house', 'Hoje', '#/hoje'], ['avisos', 'bell', 'Avisos', '#/avisos']];
  const tab = aba ? `<nav class="tabbar glass" style="grid-template-columns:repeat(${abas.length},1fr)" aria-label="Navegação">${abas.map(([k, i, l, h]) => `<a href="${h}" class="${k === aba ? 'on' : ''}">${ic(i)}<span>${l}</span></a>`).join('')}</nav>` : '';
  return `<div class="phone-wrap"><div class="phone${aba ? ' has-tabs' : ''}"><div class="p-scroll" id="pscroll"><div class="screen enter">${inner}</div></div>${tab}</div></div>`;
}

function erros(form, lista) {
  form.querySelectorAll('[data-errfor]').forEach((e) => { e.textContent = ''; e.className = ''; });
  lista.forEach(([nome, msg]) => {
    const el = form.querySelector(`[data-errfor="${nome}"]`);
    if (el) { el.textContent = msg; el.className = 'err-msg'; }
  });
}

const carregando = (msg = 'Carregando…') => shell(`<div class="p-body login" style="text-align:center;padding-top:120px"><div class="logo">${ic('leaf')}</div><p class="muted">${esc(msg)}</p></div>`);

function falha(msg) {
  return shell(`<div class="p-body login"><div class="welcome-hero"><div class="logo">${ic('warn')}</div><h1>Algo deu errado</h1></div>
    <div class="notice bad"><strong>Não conseguimos carregar</strong>${esc(msg)}</div>
    <button class="btn block" data-act="recarregar">Tentar de novo</button></div>`);
}

// ---------------------------------------------------------------------------
// Telas
// ---------------------------------------------------------------------------
function telaConfigurar() {
  return shell(`<div class="p-body login"><div class="welcome-hero"><div class="logo">${ic('warn')}</div><h1>Falta configurar</h1>
    <p class="muted">Crie o arquivo <strong>.env.local</strong> a partir de <strong>.env.example</strong> com a URL e a chave pública do Supabase.</p></div>
    <div class="notice info"><strong>Passo a passo</strong>Veja <strong>docs/PRODUCAO.md</strong>.</div></div>`);
}

function telaLogin() {
  const passo = S.ui.passo || 'inicio';
  if (passo === 'inicio') {
    return shell(`<div class="p-body login">
      <div class="welcome-hero"><div class="logo">${ic('leaf')}</div><h1>Jornada Ana + Eleviê</h1><p class="muted">21 dias de hábitos, no seu ritmo.</p></div>
      <div class="login-btns">
        <button class="btn-google" data-act="google">${GOOGLE_G}<span>Continuar com o Google</span></button>
        <div class="ou"><span>ou</span></div>
        <button class="btn ghost block" data-act="login-email">${ic('tray')} Entrar com código no e-mail</button>
      </div>
      <p class="tiny muted" style="margin-top:18px;text-align:center">Sem senha. Do Google usamos só o seu nome e o seu e-mail.</p>
    </div>`);
  }
  const corpo = passo === 'email'
    ? `<form data-form="email" novalidate>
        <label class="field"><span>Seu e-mail</span><input class="input" name="email" type="email" autocomplete="email" placeholder="voce@email.com" value="${esc(S.ui.email || '')}"><div data-errfor="email"></div></label>
        <button class="btn block" type="submit">Receber código de acesso</button>
      </form>`
    : `<form data-form="codigo" novalidate>
        <p>Enviamos um código para <strong>${esc(S.ui.email)}</strong>. Confira também o spam.</p>
        <label class="field"><span>Código de 6 dígitos</span><input class="input" name="codigo" inputmode="numeric" maxlength="6" autocomplete="one-time-code" placeholder="000000"><div data-errfor="codigo"></div></label>
        <button class="btn block" type="submit">Entrar</button>
        <p style="text-align:center;margin-top:12px"><button type="button" class="linkbtn" data-act="login-email">Usar outro e-mail</button></p>
      </form>`;
  return shell(`<div class="p-body login"><a class="back" href="#" data-act="login-inicio">Entrar</a>
    <div class="welcome-hero" style="padding-top:6px"><div class="logo">${ic('tray')}</div><h1>Código no e-mail</h1></div>
    <div class="card">${corpo}</div></div>`);
}

function telaPerfil(editando) {
  const p = S.perfil;
  const viaGoogle = p.metodo_login === 'google';
  return shell(`<div class="p-body login">
    ${editando ? '<a class="back" href="#/avisos">Avisos</a>' : ''}
    <div class="welcome-hero"><div class="logo">${ic('person')}</div><h1>${editando ? 'Meu perfil' : 'Como podemos te chamar?'}</h1>
      <p class="muted">${editando ? 'Seu nome aparece para a Ana e a equipe.' : viaGoogle ? 'Trouxemos o nome da sua conta Google. Confira e ajuste se quiser.' : 'Conte o seu nome para a Ana e a equipe te reconhecerem.'}</p></div>
    <form data-form="perfil" data-editando="${editando ? 1 : 0}" class="card" novalidate>
      <label class="field"><span>Nome completo</span><input class="input" name="nome" autocomplete="name" value="${esc(p.nome)}" placeholder="Seu nome e sobrenome"><div data-errfor="nome"></div></label>
      <label class="field"><span>Como prefere ser chamada? <em>(opcional)</em></span><input class="input" name="apelido" maxlength="40" value="${esc(p.apelido)}"></label>
      <div class="perfil-conta">${viaGoogle ? GOOGLE_G : ic('tray')}<div><div class="tiny muted">${viaGoogle ? 'Conectada com o Google' : 'Acesso por código no e-mail'}</div><strong>${esc(p.email)}</strong></div></div>
      <button class="btn block" type="submit" style="margin-top:16px">${editando ? 'Salvar' : 'Continuar'}</button>
    </form></div>`, editando ? 'avisos' : null);
}

const chamado = (p) => (p.apelido || p.nome || '').trim().split(/\s+/)[0];

function telaBoasVindas() {
  const c = S.campanha;
  return shell(`<div class="p-body login">
    <div class="welcome-hero"><div class="logo">${ic('leaf')}</div><h1>Que bom ter você aqui, ${esc(chamado(S.perfil))}!</h1></div>
    <div class="card"><h2>Como funciona</h2><ol class="steps">
      <li>São 3 semanas: <strong>${c.semanas.map((w) => esc(w.nome)).join('</strong>, <strong>')}</strong>. Todo dia, às ${String(c.liberacao).slice(0, 5)}, abre um novo dia com as tarefas de alimentação, movimento, mentalidade e o compartilhamento.</li>
      <li>Em alimentação e movimento você comprova com uma foto do prato, do preparo ou da atividade. Nunca pedimos foto do seu corpo.</li>
      <li>No dia 1 e no dia 21 você faz o seu antes e depois, que fica <strong>só no seu celular</strong>.</li>
      <li>Um dia difícil não apaga o caminho: dá para marcar "não consegui" sem punição.</li>
    </ol></div>
    <form data-form="consent" class="card" novalidate>
      <h2>Antes de começar</h2>
      <div class="notice warn"><strong>Aviso de saúde</strong>${esc(c.aviso_saude)}</div>
      <label class="checkline"><input type="checkbox" name="saude"><span>Li e entendi o aviso de saúde. <em class="tiny muted">(obrigatório)</em></span></label>
      <label class="checkline"><input type="checkbox" name="termos"><span>Aceito as regras da jornada e a política de privacidade. <em class="tiny muted">(obrigatório)</em></span></label>
      <div data-errfor="obrig"></div>
      <p class="small muted" style="margin:14px 4px 8px">Opcionais (você pode mudar depois):</p>
      <label class="checkline"><input type="checkbox" name="comunicacoes"><span>Quero receber lembretes e novidades da jornada.</span></label>
      <label class="checkline"><input type="checkbox" name="repost"><span>Autorizo a Eleviê a repostar conteúdos que <strong>eu mesma</strong> publicar marcando a jornada. Posso revogar quando quiser.</span></label>
      <button class="btn block" type="submit" style="margin-top:8px">Começar a jornada</button>
    </form></div>`);
}

function badge(st) { return `<span class="badge b-${st}">${STATUS[st] || st}</span>`; }

function anel(feito, total) {
  const r = 26, c = 2 * Math.PI * r, p = total ? feito / total : 0;
  return `<div class="ring" role="img" aria-label="${feito} de ${total} tarefas do dia"><svg viewBox="0 0 64 64"><circle cx="32" cy="32" r="${r}" class="ring-bg"/><circle cx="32" cy="32" r="${r}" class="ring-fg" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${(c * (1 - p)).toFixed(1)}"/></svg><span><b>${feito}</b><small>/${total}</small></span></div>`;
}

function telaHoje() {
  const c = S.campanha;
  const hoje = diaAtual(c);
  if (hoje === 0) {
    return shell(`<div class="p-head"><div class="eyebrow">Olá, ${esc(chamado(S.perfil))}</div><h1>Quase lá</h1></div>
      <div class="p-body"><div class="card empty">${ic('calendar', 'big')}<h2>A jornada começa em ${fmtCurto(c, 1)}</h2><p class="muted">O dia 1 libera às ${String(c.liberacao).slice(0, 5)}. Enquanto isso, prepare-se: tenha uma fita métrica por perto.</p></div></div>`, 'hoje');
  }
  const n = Math.min(hoje, 21);
  const dia = S.dias.find((d) => d.numero === n);
  const reg = (t) => S.registros.find((r) => r.tarefa_id === t.id) || { status: 'nao_iniciada' };
  const feitos = dia.tarefas.filter((t) => ENVIADAS.includes(reg(t).status)).length;
  const semana = c.semanas[dia.semana - 1] || {};
  return shell(`<div class="p-head"><div class="eyebrow">Olá, ${esc(chamado(S.perfil))} · ${fmtLongo(c, n)}</div><h1>${hoje > 21 ? 'Jornada concluída' : 'Hoje'}</h1></div>
    <div class="p-body">
      <div class="day-hero">${anel(feitos, dia.tarefas.length)}<div class="hero-txt"><div class="k">Dia ${n} de 21 · Semana ${dia.semana} · ${esc(semana.nome || '')}</div><h2>${esc(dia.tema)}</h2></div></div>
      ${dia.nelly && dia.nelly.status === 'aprovado' ? `<div class="card nelly" style="margin-bottom:14px"><div class="nelly-head"><span class="nelly-av">NK</span><div><div class="tiny muted">${esc(dia.nelly.formato)} da Dra. Nelly Kim</div><strong>${esc(dia.nelly.titulo)}</strong></div></div><p class="small" style="margin:0">${esc(dia.nelly.resumo)}</p></div>` : ''}
      <div class="sec-title">Tarefas de hoje</div>
      <div class="group">${dia.tarefas.map((t) => `<a class="task-card" href="#/tarefa/${t.codigo}">
        <div class="ico ${t.frente}">${ic(FRENTES[t.frente].icone)}</div>
        <div class="t"><div class="t-top"><span class="frente f-${t.frente}">${FRENTES[t.frente].nome}</span>${badge(reg(t).status)}</div><h3>${esc(t.titulo)}</h3></div>
        <div class="trail">${ic('chevron', 'chev')}</div></a>`).join('')}</div>
    </div>`, 'hoje');
}

function telaTarefa(codigo) {
  let tarefa = null, dia = null;
  S.dias.forEach((d) => d.tarefas.forEach((t) => { if (t.codigo === codigo) { tarefa = t; dia = d; } }));
  if (!tarefa) return shell('<div class="p-body"><p>Tarefa não encontrada.</p></div>', 'hoje');
  const ev = tarefa.evidencia || {};
  return shell(`<div class="p-body" style="padding-top:16px"><a class="back" href="#/hoje">Dia ${dia.numero}</a>
    <span class="frente f-${tarefa.frente}">${ic(FRENTES[tarefa.frente].icone)} ${FRENTES[tarefa.frente].nome}</span>
    <h1 style="margin-top:6px">${esc(tarefa.titulo)}</h1>
    <p>${esc(tarefa.instrucao)}</p>
    ${tarefa.sugestao ? `<div class="criterio"><strong>Ideia para hoje:</strong> ${esc(tarefa.sugestao)}</div>` : ''}
    ${ev.foto && ev.foto !== 'nao' ? `<div class="criterio"><strong>Foto de comprovação ${ev.foto === 'obrigatoria' ? '(obrigatória)' : '(opcional)'}:</strong> ${esc(ev.criterio)}</div>` : ''}
    <div class="notice info"><strong>Envio em breve</strong>O registro desta tarefa pelo app chega na próxima atualização.</div></div>`, 'hoje');
}

function telaAvisos() {
  const p = S.perfil;
  return shell(`<div class="p-head"><h1>Avisos</h1></div><div class="p-body">
    <a class="task-card perfil-row" href="#/perfil"><span class="avatar">${esc((p.nome || '?').trim()[0] || '?')}</span><div class="t"><h3 style="margin:0">${esc(p.nome)}</h3><div class="reg">${p.metodo_login === 'google' ? 'Google · ' : ''}${esc(p.email)}</div></div><div class="trail">${ic('chevron', 'chev')}</div></a>
    <div class="card"><h3>Aviso de saúde</h3><p class="small" style="margin:0">${esc(S.campanha.aviso_saude)}</p></div>
    <div class="card"><h3>Precisa de ajuda?</h3><p class="small" style="margin:0">Dúvidas sobre o app: fale com a equipe pelo WhatsApp da jornada. Dúvidas sobre a sua saúde vão para a Dra. Nelly ou para a consulta.</p></div>
    <p style="text-align:center"><button class="linkbtn" data-act="sair">Sair</button></p></div>`, 'avisos');
}

function telaEquipe() {
  return `<div class="admin"><aside class="side"><div class="brand"><span class="brand-ic">${ic('leaf')}</span><span>Jornada Ana + Eleviê<small>${esc(S.campanha ? S.campanha.nome : '')}</small></span></div>
      <a href="#/a" class="on"><span class="side-l">${ic('grid')}Painel</span></a><hr><a href="#/hoje"><span class="side-l">${ic('house')}Ver como participante</span></a></aside>
    <main class="main enter"><div class="main-head"><div><h1>Olá, ${esc(chamado(S.perfil))}</h1><p class="muted">Papel: ${esc(S.perfil.papel)}</p></div></div>
      <div class="notice info"><strong>Área da equipe</strong>Painel, revisão de evidências, caixinha e configuração dos dias chegam na etapa 2 (portados do protótipo).</div></main></div>`;
}

// ---------------------------------------------------------------------------
// Fluxo principal
// ---------------------------------------------------------------------------
async function carregarDados() {
  S.perfil = await api.meuPerfil();
  S.campanha = await api.carregarCampanha(CAMPANHA_SLUG);
  if (!S.campanha) throw new Error(`Campanha "${CAMPANHA_SLUG}" não encontrada. Rode o seed (docs/PRODUCAO.md).`);
  S.dias = await api.carregarDias(S.campanha.id);
  S.inscricao = await api.minhaInscricao(S.campanha.id, S.perfil.id);
  S.consent = await api.meusConsentimentos(S.campanha.id, S.perfil.id);
  S.registros = await api.meusRegistros(S.perfil.id);
}

async function render() {
  const app = $('#app');
  if (!configurado) { app.innerHTML = telaConfigurar(); return; }
  if (!S.sessao) { app.innerHTML = telaLogin(); return; }
  if (!S.perfil) {
    app.innerHTML = carregando();
    try { await carregarDados(); } catch (e) { app.innerHTML = falha(e.message); return; }
  }
  const [rota, arg] = location.hash.replace(/^#\/?/, '').split('/');
  const equipe = ['equipe', 'nelly', 'admin'].includes(S.perfil.papel);
  if (!S.perfil.nome) { app.innerHTML = telaPerfil(false); return; }
  if (rota === 'a' && equipe) { app.innerHTML = telaEquipe(); return; }
  if (!S.inscricao || !(S.consent.termos && S.consent.termos.aceito)) { app.innerHTML = telaBoasVindas(); return; }
  if (rota === 'tarefa') app.innerHTML = telaTarefa(arg);
  else if (rota === 'avisos') app.innerHTML = telaAvisos();
  else if (rota === 'perfil') app.innerHTML = telaPerfil(true);
  else app.innerHTML = telaHoje();
}

document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  e.preventDefault();
  const act = el.dataset.act;
  try {
    if (act === 'google') { el.disabled = true; const { error } = await entrarComGoogle(); if (error) throw error; }
    else if (act === 'login-email') { S.ui = { passo: 'email', email: S.ui.email }; render(); }
    else if (act === 'login-inicio') { S.ui = {}; render(); }
    else if (act === 'sair') { await sair(); }
    else if (act === 'recarregar') { S.perfil = null; render(); }
  } catch (err) { el.disabled = false; toast(err.message || 'Não foi possível concluir.'); }
});

document.addEventListener('submit', async (e) => {
  const form = e.target;
  const tipo = form.dataset.form;
  if (!tipo) return;
  e.preventDefault();
  const fd = new FormData(form);
  const botao = form.querySelector('[type=submit]');
  if (botao) botao.disabled = true;
  try {
    if (tipo === 'email') {
      const email = String(fd.get('email') || '').trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) { erros(form, [['email', 'Digite um e-mail válido.']]); return; }
      const { error } = await enviarCodigo(email);
      if (error) throw error;
      S.ui = { passo: 'codigo', email };
      render();
    } else if (tipo === 'codigo') {
      const codigo = String(fd.get('codigo') || '').trim();
      if (!/^\d{6}$/.test(codigo)) { erros(form, [['codigo', 'O código tem 6 números.']]); return; }
      const { error } = await confirmarCodigo(S.ui.email, codigo);
      if (error) { erros(form, [['codigo', 'Código inválido ou expirado. Peça um novo.']]); return; }
    } else if (tipo === 'perfil') {
      const nome = String(fd.get('nome') || '').trim().replace(/\s+/g, ' ');
      if (nome.length < 2) { erros(form, [['nome', 'Digite o seu nome.']]); return; }
      S.perfil = await api.salvarPerfil(S.perfil.id, { nome, apelido: String(fd.get('apelido') || '').trim() });
      toast(form.dataset.editando === '1' ? 'Perfil atualizado.' : `Prazer, ${chamado(S.perfil)}!`);
      if (form.dataset.editando === '1') location.hash = '#/avisos'; else render();
    } else if (tipo === 'consent') {
      if (!fd.get('saude') || !fd.get('termos')) { erros(form, [['obrig', 'Para participar, marque os dois itens obrigatórios.']]); return; }
      await api.entrarNaJornada(CAMPANHA_SLUG, S.campanha.id, S.perfil.id, {
        saude: true, termos: true, comunicacoes: !!fd.get('comunicacoes'), repost: !!fd.get('repost'),
      });
      S.inscricao = await api.minhaInscricao(S.campanha.id, S.perfil.id);
      S.consent = await api.meusConsentimentos(S.campanha.id, S.perfil.id);
      toast('Bem-vinda à jornada!');
      location.hash = '#/hoje';
      render();
    }
  } catch (err) {
    toast(err.message || 'Não foi possível concluir.');
  } finally {
    if (botao) botao.disabled = false;
  }
});

window.addEventListener('hashchange', render);

async function iniciar() {
  document.body.classList.add('app-real');
  if (!configurado) { render(); return; }
  $('#app').innerHTML = carregando();
  S.sessao = await sessaoAtual();
  aoMudarSessao((sessao) => {
    const mudou = (sessao && sessao.user.id) !== (S.sessao && S.sessao.user.id);
    S.sessao = sessao;
    if (mudou) { S.perfil = null; S.ui = {}; render(); }
  });
  // Limpa o ?code= do retorno do Google depois que a sessão foi criada.
  if (location.search.includes('code=')) history.replaceState(null, '', location.pathname + (location.hash || '#/hoje'));
  render();
}

iniciar();
