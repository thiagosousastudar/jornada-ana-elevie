// Jornada Ana + Eleviê — app de produção (Vite + Supabase).
// Etapa 1 (fundação): login com e-mail e senha, perfil, entrada na jornada
// (inscrição + consentimentos) e a tela "Hoje" lendo do banco. As demais telas do
// protótipo (envio de tarefas, check-in, caixinha, equipe) são portadas na etapa 2.
import './styles.css';
import './app.css';
import { configurado, CAMPANHA_SLUG } from './lib/supabase.js';
import { entrar, criarConta, trocarSenha, sair, sessaoAtual, aoMudarSessao, traduzirErro, SENHA_MINIMA } from './lib/auth.js';
import * as api from './lib/api.js';
import { diaAtual, fmtLongo, fmtCurto } from './lib/datas.js';
import { ic } from './lib/icones.js';

// WhatsApp da equipe para "esqueci minha senha" (só números, com DDI e DDD).
const WHATSAPP_SUPORTE = String(import.meta.env.VITE_WHATSAPP_SUPORTE || '').replace(/\D/g, '');

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
  if (S.perfil && ['equipe', 'nelly', 'admin'].includes(S.perfil.papel)) abas.push(['equipe', 'grid', 'Equipe', '#/a']);
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

function campoSenha(nome, rotulo, auto, dica) {
  return `<label class="field"><span>${rotulo}</span>
    <div class="senha-wrap"><input class="input" name="${nome}" type="password" autocomplete="${auto}" minlength="${SENHA_MINIMA}"><button type="button" class="ver-senha" data-act="ver-senha" aria-label="Mostrar senha">${ic('eye')}</button></div>
    ${dica ? `<div class="tiny muted" style="margin:6px 4px 0">${dica}</div>` : ''}<div data-errfor="${nome}"></div></label>`;
}

function telaLogin() {
  const aba = S.ui.aba || 'entrar';
  const criando = aba === 'criar';
  return shell(`<div class="p-body login">
    <div class="welcome-hero"><div class="logo">${ic('leaf')}</div><h1>Jornada Ana + Eleviê</h1><p class="muted">21 dias de hábitos, no seu ritmo.</p></div>
    <div class="seg-light seg-full" role="tablist">
      <button type="button" role="tab" data-act="aba" data-v="entrar" class="${criando ? '' : 'on'}" aria-selected="${!criando}">Entrar</button>
      <button type="button" role="tab" data-act="aba" data-v="criar" class="${criando ? 'on' : ''}" aria-selected="${criando}">Criar conta</button>
    </div>
    <form data-form="login" data-aba="${aba}" class="card" novalidate>
      <label class="field"><span>E-mail</span><input class="input" name="email" type="email" inputmode="email" autocomplete="email" placeholder="voce@email.com" value="${esc(S.ui.email || '')}"><div data-errfor="email"></div></label>
      ${campoSenha('senha', criando ? 'Crie uma senha' : 'Senha', criando ? 'new-password' : 'current-password', criando ? `Pelo menos ${SENHA_MINIMA} caracteres. Anote num lugar seguro.` : '')}
      <div data-errfor="geral"></div>
      <button class="btn block" type="submit">${criando ? 'Criar minha conta' : 'Entrar'}</button>
      ${criando ? '' : '<p style="text-align:center;margin:12px 0 0"><button type="button" class="linkbtn" data-act="esqueci">Esqueci minha senha</button></p>'}
    </form>
    <p class="tiny muted" style="margin-top:16px;text-align:center">${criando ? 'Use o mesmo e-mail que você informou na inscrição da jornada.' : 'Primeira vez aqui? Toque em "Criar conta".'}</p>
  </div>`);
}

// Depois que a equipe redefine a senha, a participante cria uma nova no primeiro acesso.
function telaNovaSenha() {
  return shell(`<div class="p-body login">
    <div class="welcome-hero"><div class="logo">${ic('lock')}</div><h1>Crie uma nova senha</h1>
      <p class="muted">Você entrou com uma senha provisória da equipe. Escolha uma nova, só sua.</p></div>
    <form data-form="nova-senha" class="card" novalidate>
      ${campoSenha('nova', 'Nova senha', 'new-password', `Pelo menos ${SENHA_MINIMA} caracteres.`)}
      ${campoSenha('confirma', 'Repita a nova senha', 'new-password', '')}
      <button class="btn block" type="submit">Salvar nova senha</button>
    </form></div>`);
}

function telaPerfil(editando) {
  const p = S.perfil;
  return shell(`<div class="p-body login">
    ${editando ? '<a class="back" href="#/avisos">Avisos</a>' : ''}
    <div class="welcome-hero"><div class="logo">${ic('person')}</div><h1>${editando ? 'Meu perfil' : 'Como podemos te chamar?'}</h1>
      <p class="muted">${editando ? 'Seu nome aparece para a Ana e a equipe.' : 'Conte o seu nome para a Ana e a equipe te reconhecerem.'}</p></div>
    <form data-form="perfil" data-editando="${editando ? 1 : 0}" class="card" novalidate>
      <label class="field"><span>Nome completo</span><input class="input" name="nome" autocomplete="name" value="${esc(p.nome)}" placeholder="Seu nome e sobrenome"><div data-errfor="nome"></div></label>
      <label class="field"><span>Como prefere ser chamada? <em>(opcional)</em></span><input class="input" name="apelido" maxlength="40" value="${esc(p.apelido)}"></label>
      <div class="perfil-conta">${ic('tray')}<div><div class="tiny muted">Entra com e-mail e senha</div><strong>${esc(p.email)}</strong></div></div>
      <button class="btn block" type="submit" style="margin-top:16px">${editando ? 'Salvar' : 'Continuar'}</button>
    </form>
    ${editando ? `<form data-form="nova-senha" data-editando="1" class="card" novalidate>
      <h3>Trocar senha</h3>
      ${campoSenha('nova', 'Nova senha', 'new-password', `Pelo menos ${SENHA_MINIMA} caracteres.`)}
      ${campoSenha('confirma', 'Repita a nova senha', 'new-password', '')}
      <button class="btn ghost block" type="submit">Trocar senha</button>
    </form>` : ''}</div>`, editando ? 'avisos' : null);
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

const NOME_PAPEL = { participante: 'participante', equipe: 'equipe', nelly: 'Dra. Nelly', admin: 'administradora' };
const ehEquipe = () => ['equipe', 'nelly', 'admin'].includes(S.perfil.papel);

function telaAvisos() {
  const p = S.perfil;
  return shell(`<div class="p-head"><h1>Avisos</h1></div><div class="p-body">
    <a class="task-card perfil-row" href="#/perfil"><span class="avatar">${esc((p.nome || '?').trim()[0] || '?')}</span><div class="t"><h3 style="margin:0">${esc(p.nome)}</h3><div class="reg">${esc(p.email)}</div></div><div class="trail">${ic('chevron', 'chev')}</div></a>
    ${ehEquipe() ? `<a class="task-card perfil-row" href="#/a"><div class="ico caixinha">${ic('grid')}</div><div class="t"><h3 style="margin:0">Área da equipe</h3><div class="reg">Seu papel: ${esc(NOME_PAPEL[S.perfil.papel])}</div></div><div class="trail">${ic('chevron', 'chev')}</div></a>` : ''}
    <div class="card"><h3>Aviso de saúde</h3><p class="small" style="margin:0">${esc(S.campanha.aviso_saude)}</p></div>
    <div class="card"><h3>Precisa de ajuda?</h3><p class="small" style="margin:0">Dúvidas sobre o app: fale com a equipe pelo WhatsApp da jornada. Dúvidas sobre a sua saúde vão para a Dra. Nelly ou para a consulta.</p></div>
    <p style="text-align:center"><button class="linkbtn" data-act="sair">Sair</button></p></div>`, 'avisos');
}

function telaEquipe() {
  return `<div class="admin"><aside class="side"><div class="brand"><span class="brand-ic">${ic('leaf')}</span><span>Jornada Ana + Eleviê<small>${esc(S.campanha ? S.campanha.nome : '')}</small></span></div>
      <a href="#/a" class="on"><span class="side-l">${ic('grid')}Painel</span></a><hr><a href="#/hoje"><span class="side-l">${ic('house')}Ver como participante</span></a></aside>
    <main class="main enter"><div class="main-head"><div><h1>Olá, ${esc(chamado(S.perfil))}</h1><p class="muted">Papel: ${esc(S.perfil.papel)}</p></div></div>
      <div class="notice info"><strong>Área da equipe</strong>Painel, revisão de evidências, caixinha e configuração dos dias chegam na etapa 3 (portados do protótipo).</div>
      <div class="card" style="max-width:560px">
        <h2>Redefinir senha</h2>
        <p class="small muted">Quando uma participante avisar no WhatsApp que esqueceu a senha: digite o e-mail dela, gere uma senha provisória e mande para ela. No próximo acesso o app pede uma senha nova.</p>
        <form data-form="redefinir" novalidate>
          <label class="field"><span>E-mail da participante</span><input class="input" name="email" type="email" autocomplete="off" placeholder="participante@email.com"><div data-errfor="email"></div></label>
          <button class="btn" type="submit">Gerar senha provisória</button>
        </form>
        ${S.ui.provisoria ? `<div class="notice ok" style="margin:16px 0 0"><strong>Senha redefinida</strong>
          E-mail: ${esc(S.ui.provisoria.email)}<br>Senha provisória: <b class="senha-prov">${esc(S.ui.provisoria.senha)}</b>
          <div class="btn-row" style="margin-top:10px"><button class="btn sm" data-act="copiar-provisoria">${ic('copy')} Copiar mensagem para o WhatsApp</button></div></div>` : ''}
      </div></main></div>`;
}

function senhaProvisoria() {
  const letras = 'abcdefghjkmnpqrstuvwxyz23456789';
  const n = crypto.getRandomValues(new Uint32Array(8));
  return Array.from(n, (x) => letras[x % letras.length]).join('');
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
  const equipe = ehEquipe();
  if (S.perfil.trocar_senha) { app.innerHTML = telaNovaSenha(); return; }
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
    if (act === 'aba') {
      const email = document.querySelector('[data-form=login] [name=email]');
      S.ui = { aba: el.dataset.v, email: email ? email.value.trim() : S.ui.email };
      render();
    } else if (act === 'ver-senha') {
      const input = el.parentElement.querySelector('input');
      const mostrar = input.type === 'password';
      input.type = mostrar ? 'text' : 'password';
      el.setAttribute('aria-label', mostrar ? 'Esconder senha' : 'Mostrar senha');
      el.innerHTML = ic(mostrar ? 'eyeoff' : 'eye');
    } else if (act === 'esqueci') {
      const campo = document.querySelector('[data-form=login] [name=email]');
      const email = campo ? campo.value.trim() : '';
      if (!WHATSAPP_SUPORTE) { toast('Fale com a equipe pelo grupo da jornada no WhatsApp.'); return; }
      const msg = `Olá! Esqueci minha senha do app da Jornada Ana + Eleviê. ${email ? 'Meu e-mail de cadastro é: ' + email : 'Pode me ajudar?'}`;
      window.open(`https://wa.me/${WHATSAPP_SUPORTE}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
    } else if (act === 'copiar-provisoria') {
      const p = S.ui.provisoria;
      const msg = `Olá! Sua senha provisória do app da Jornada Ana + Eleviê é: ${p.senha}\nEntre com o seu e-mail (${p.email}) e essa senha. O app vai pedir para você criar uma senha nova.`;
      await navigator.clipboard.writeText(msg);
      toast('Mensagem copiada. Cole na conversa do WhatsApp.');
    }
    else if (act === 'sair') { await sair(); }
    else if (act === 'recarregar') { S.perfil = null; render(); }
  } catch (err) { el.disabled = false; toast(traduzirErro(err)); }
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
    if (tipo === 'login') {
      const criando = form.dataset.aba === 'criar';
      const email = String(fd.get('email') || '').trim().toLowerCase();
      const senha = String(fd.get('senha') || '');
      const lista = [];
      if (!/^\S+@\S+\.\S+$/.test(email)) lista.push(['email', 'Digite um e-mail válido.']);
      if (senha.length < SENHA_MINIMA) lista.push(['senha', criando ? `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.` : 'Digite a sua senha.']);
      if (lista.length) { erros(form, lista); return; }
      S.ui.email = email;
      const { data, error } = criando ? await criarConta(email, senha) : await entrar(email, senha);
      if (error) { erros(form, [['geral', traduzirErro(error)]]); return; }
      // Se o projeto exigir confirmação de e-mail, a conta é criada sem sessão.
      if (criando && !data.session) { erros(form, [['geral', 'Conta criada! Confirme pelo link que enviamos ao seu e-mail e depois entre.']]); return; }
    } else if (tipo === 'nova-senha') {
      const nova = String(fd.get('nova') || '');
      const confirma = String(fd.get('confirma') || '');
      if (nova.length < SENHA_MINIMA) { erros(form, [['nova', `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`]]); return; }
      if (nova !== confirma) { erros(form, [['confirma', 'As duas senhas não estão iguais.']]); return; }
      const { error } = await trocarSenha(nova);
      if (error) { erros(form, [['nova', traduzirErro(error)]]); return; }
      if (S.perfil.trocar_senha) S.perfil = await api.limparTrocarSenha(S.perfil.id);
      form.reset();
      toast('Senha salva.');
      render();
    } else if (tipo === 'redefinir') {
      const email = String(fd.get('email') || '').trim().toLowerCase();
      if (!/^\S+@\S+\.\S+$/.test(email)) { erros(form, [['email', 'Digite o e-mail da participante.']]); return; }
      const senha = senhaProvisoria();
      try { await api.redefinirSenha(email, senha); } catch (err) { erros(form, [['email', traduzirErro(err)]]); return; }
      S.ui.provisoria = { email, senha };
      render();
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
    toast(traduzirErro(err));
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
  render();
}

iniciar();
