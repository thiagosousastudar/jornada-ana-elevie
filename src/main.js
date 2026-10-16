// Jornada Ana + Eleviê — app de produção (Vite + Supabase).
// Aqui ficam o acesso (login, perfil, entrada na jornada) e o roteador.
// As telas estão em src/views/participante.js e src/views/equipe.js.
import './styles.css';
import './app.css';
import { configurado, CAMPANHA_SLUG } from './lib/supabase.js';
import { entrar, criarConta, trocarSenha, sair, sessaoAtual, aoMudarSessao, traduzirErro, SENHA_MINIMA } from './lib/auth.js';
import * as api from './lib/api.js';
import { ic } from './lib/icones.js';
import { S, app } from './estado.js';
import { $, esc, toast, erros, shell, carregando, falha, ehEquipe, chamado } from './ui.js';
import * as part from './views/participante.js';
import * as eq from './views/equipe.js';
import * as instalar from './views/instalar.js';

// WhatsApp da equipe para "esqueci minha senha" (só números, com DDI e DDD).
const WHATSAPP_SUPORTE = String(import.meta.env.VITE_WHATSAPP_SUPORTE || '').replace(/\D/g, '');

// ---------------------------------------------------------------------------
// Telas de acesso
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
  const criando = (S.ui.aba || 'entrar') === 'criar';
  return shell(`<div class="p-body login">
    <div class="welcome-hero"><div class="logo">${ic('leaf')}</div><h1>Desafio 21 Dias</h1><p class="muted">21 dias de hábitos, no seu ritmo.</p></div>
    <div class="seg-light seg-full" role="tablist">
      <button type="button" role="tab" data-act="aba" data-v="entrar" class="${criando ? '' : 'on'}" aria-selected="${!criando}">Entrar</button>
      <button type="button" role="tab" data-act="aba" data-v="criar" class="${criando ? 'on' : ''}" aria-selected="${criando}">Criar conta</button>
    </div>
    <form data-form="login" data-aba="${criando ? 'criar' : 'entrar'}" class="card" novalidate>
      <label class="field"><span>E-mail</span><input class="input" name="email" type="email" inputmode="email" autocomplete="email" placeholder="voce@email.com" value="${esc(S.ui.email || '')}"><div data-errfor="email"></div></label>
      ${campoSenha('senha', criando ? 'Crie uma senha' : 'Senha', criando ? 'new-password' : 'current-password', criando ? `Pelo menos ${SENHA_MINIMA} caracteres. Anote num lugar seguro.` : '')}
      <div data-errfor="geral"></div>
      <button class="btn block" type="submit">${criando ? 'Criar minha conta' : 'Entrar'}</button>
      ${criando ? '' : '<p style="text-align:center;margin:12px 0 0"><button type="button" class="linkbtn" data-act="esqueci">Esqueci minha senha</button></p>'}
    </form>
    <p class="tiny muted" style="margin-top:16px;text-align:center">${criando ? 'Use o mesmo e-mail que você informou na inscrição da jornada.' : 'Primeira vez aqui? Toque em "Criar conta".'}</p>
    ${instalar.linkInstalarLogin()}
  </div>`);
}

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

function senhaProvisoria() {
  const letras = 'abcdefghjkmnpqrstuvwxyz23456789';
  const n = crypto.getRandomValues(new Uint32Array(8));
  return Array.from(n, (x) => letras[x % letras.length]).join('');
}

// ---------------------------------------------------------------------------
// Fluxo principal
// ---------------------------------------------------------------------------
async function carregarDados() {
  // Em duas rodadas paralelas (em vez de uma consulta por vez): abre mais rápido no celular.
  const [perfil, campanha] = await Promise.all([api.meuPerfil(), api.carregarCampanha(CAMPANHA_SLUG)]);
  // Sem usuária válida (sessão expirada ou revogada): volta para o login em vez de mostrar erro.
  if (!perfil) { S.sessao = null; return false; }
  if (!campanha) throw new Error(`Campanha "${CAMPANHA_SLUG}" não encontrada. Rode o seed (docs/PRODUCAO.md).`);
  S.perfil = perfil;
  S.campanha = campanha;
  const [dias, inscricao, consent] = await Promise.all([
    api.carregarDias(campanha.id),
    api.minhaInscricao(campanha.id, perfil.id),
    api.meusConsentimentos(campanha.id, perfil.id),
    part.recarregarMinhaJornada(),
  ]);
  S.dias = dias;
  S.inscricao = inscricao;
  S.consent = consent;
  S.eq = null;
  S.diaSim = null;
  if (ehEquipe()) {
    try { S.diaSim = Number(localStorage.getItem('jornada-dia-simulado')) || null; } catch { /* sem storage */ }
  }
  return true;
}

let rodada = 0;

async function render() {
  const minha = ++rodada;
  const alvo = $('#app');
  const pintar = (html) => { if (minha === rodada) { alvo.innerHTML = html; depoisDeRenderizar(); } };
  if (!configurado) { pintar(telaConfigurar()); return; }
  if (!S.sessao) { pintar(telaLogin()); return; }
  if (!S.perfil) {
    pintar(carregando());
    let carregou = false;
    try { carregou = await carregarDados(); } catch (e) { pintar(falha(e.message)); return; }
    if (minha !== rodada) return;
    if (!carregou) { pintar(telaLogin()); return; }
  }
  const [rota, a1, a2] = location.hash.replace(/^#\/?/, '').split('/');
  try {
    if (S.perfil.trocar_senha) { pintar(telaNovaSenha()); return; }
    if (!S.perfil.nome) { pintar(telaPerfil(false)); return; }
    if (rota === 'a' && ehEquipe()) {
      await eq.preparar(a1);
      pintar(eq.telaEquipe(a1, a2));
      return;
    }
    if (!S.inscricao || !(S.consent.termos && S.consent.termos.aceito)) { pintar(telaBoasVindas()); return; }
    await part.preparar(rota, a1);
    // Primeiro passo obrigatório: sem o ponto de partida, as outras ações mostram o aviso.
    if (['tarefa', 'checkin', 'caixinha'].includes(rota) && !part.pontoDePartidaFeito()) {
      pintar(part.telaPrecisaPartida());
      return;
    }
    switch (rota) {
      case 'tarefa': pintar(part.telaTarefa(a1)); break;
      case 'dia': pintar(part.telaDia(a1)); break;
      case 'checkin': pintar(part.telaCheckin(a1)); break;
      case 'caixinha': pintar(part.telaCaixinha(a1)); break;
      case 'progresso': pintar(part.telaProgresso()); break;
      case 'privado': pintar(part.telaPrivado(a1)); break;
      case 'avisos': pintar(part.telaAvisos()); break;
      case 'perfil': pintar(telaPerfil(true)); break;
      default: pintar(part.telaDia());
    }
    if (minha === rodada) instalar.explicarNaPrimeiraVez();
  } catch (e) {
    pintar(falha(e.message));
  }
}
app.render = render;

function depoisDeRenderizar() {
  const faixa = $('#strip');
  const atual = faixa && faixa.querySelector('[data-cur]');
  if (atual) faixa.scrollLeft = atual.offsetLeft - faixa.clientWidth / 2 + atual.clientWidth / 2;
}

// ---------------------------------------------------------------------------
// Eventos
// ---------------------------------------------------------------------------
const cliques = {
  aba: (el) => {
    const campo = $('[data-form=login] [name=email]');
    S.ui = { aba: el.dataset.v, email: campo ? campo.value.trim() : S.ui.email };
    render();
  },
  'ver-senha': (el) => {
    const input = el.parentElement.querySelector('input');
    const mostrar = input.type === 'password';
    input.type = mostrar ? 'text' : 'password';
    el.setAttribute('aria-label', mostrar ? 'Esconder senha' : 'Mostrar senha');
    el.innerHTML = ic(mostrar ? 'eyeoff' : 'eye');
  },
  esqueci: () => {
    const campo = $('[data-form=login] [name=email]');
    const email = campo ? campo.value.trim() : '';
    if (!WHATSAPP_SUPORTE) { toast('Fale com a equipe pelo grupo da jornada no WhatsApp.'); return; }
    const msg = `Olá! Esqueci minha senha do app Desafio 21 Dias. ${email ? 'Meu e-mail de cadastro é: ' + email : 'Pode me ajudar?'}`;
    window.open(`https://wa.me/${WHATSAPP_SUPORTE}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  },
  sair: async () => { await sair(); },
  recarregar: () => { S.perfil = null; render(); },
  ...part.cliques,
  ...eq.cliques,
  ...instalar.cliques,
};

document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]');
  if (!el || el.matches('input, select, textarea')) return;
  const fn = cliques[el.dataset.act];
  if (!fn) return;
  e.preventDefault();
  try { await fn(el, e); } catch (err) { toast(traduzirErro(err)); }
});

const mudancas = { ...part.mudancas, ...eq.mudancas };
document.addEventListener('change', async (e) => {
  const el = e.target;
  const fn = el.dataset && mudancas[el.dataset.act];
  if (!fn) return;
  try { await fn(el, e); } catch (err) { toast(traduzirErro(err)); }
});
document.addEventListener('input', (e) => { if (e.target.dataset && e.target.dataset.act === 'busca') eq.aoDigitar(e.target); });

const envios = {
  login: async (form, fd) => {
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
    if (criando && !data.session) erros(form, [['geral', 'Conta criada! Confirme pelo link que enviamos ao seu e-mail e depois entre.']]);
  },

  'nova-senha': async (form, fd) => {
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
  },

  redefinir: async (form, fd) => {
    const email = String(fd.get('email') || '').trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(email)) { erros(form, [['email', 'Digite o e-mail da participante.']]); return; }
    const senha = senhaProvisoria();
    try { await api.redefinirSenha(email, senha); } catch (err) { erros(form, [['email', traduzirErro(err)]]); return; }
    S.ui.provisoria = { email, senha };
    render();
  },

  perfil: async (form, fd) => {
    const nome = String(fd.get('nome') || '').trim().replace(/\s+/g, ' ');
    if (nome.length < 2) { erros(form, [['nome', 'Digite o seu nome.']]); return; }
    S.perfil = await api.salvarPerfil(S.perfil.id, { nome, apelido: String(fd.get('apelido') || '').trim() });
    const editando = form.dataset.editando === '1';
    toast(editando ? 'Perfil atualizado.' : `Prazer, ${chamado(S.perfil)}!`);
    if (editando) location.hash = '#/avisos'; else render();
  },

  consent: async (form, fd) => {
    if (!fd.get('saude') || !fd.get('termos')) { erros(form, [['obrig', 'Para participar, marque os dois itens obrigatórios.']]); return; }
    await api.entrarNaJornada(CAMPANHA_SLUG, S.campanha.id, S.perfil.id, {
      saude: true, termos: true, comunicacoes: Boolean(fd.get('comunicacoes')), repost: Boolean(fd.get('repost')),
    });
    S.inscricao = await api.minhaInscricao(S.campanha.id, S.perfil.id);
    S.consent = await api.meusConsentimentos(S.campanha.id, S.perfil.id);
    toast('Bem-vinda à jornada!');
    location.hash = '#/hoje';
    render();
  },
  ...part.envios,
  ...eq.envios,
};

document.addEventListener('submit', async (e) => {
  const form = e.target;
  const tipo = form.dataset.form;
  if (!tipo || !envios[tipo]) return;
  e.preventDefault();
  const botao = form.querySelector('[type=submit]');
  if (botao) botao.disabled = true;
  try {
    await envios[tipo](form, new FormData(form));
  } catch (err) {
    toast(traduzirErro(err));
  } finally {
    if (botao) botao.disabled = false;
  }
});

window.addEventListener('hashchange', () => { S.ui = {}; render(); window.scrollTo(0, 0); });

async function iniciar() {
  document.body.classList.add('app-real');
  if (!configurado) { render(); return; }
  $('#app').innerHTML = carregando();
  S.sessao = await sessaoAtual();
  aoMudarSessao((sessao) => {
    const mudou = (sessao && sessao.user.id) !== (S.sessao && S.sessao.user.id);
    S.sessao = sessao;
    if (mudou) { S.perfil = null; S.eq = null; S.ui = {}; render(); }
  });
  render();
}

instalar.iniciarPWA();
iniciar();
