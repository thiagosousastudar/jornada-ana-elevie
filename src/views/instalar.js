// Instalar o app (PWA): botão nativo quando o navegador oferece e instruções para cada aparelho.
// Também registra o service worker e avisa quando há versão nova.
import { app } from '../estado.js';
import { esc, toast } from '../ui.js';
import { ic } from '../lib/icones.js';

const CHAVE_DISPENSA = 'jornada-instalar-dispensado';
const SEMANA = 7 * 24 * 3600 * 1000;
let eventoInstalacao = null;

// ---------------------------------------------------------------------------
// Ambiente
// ---------------------------------------------------------------------------
export function ambiente() {
  const ua = navigator.userAgent || '';
  const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const android = /Android/i.test(ua);
  // Navegadores dentro de outros apps (Instagram, Facebook, TikTok...) e WebViews do Android não instalam.
  const emApp = /FBAN|FBAV|FB_IAB|Instagram|TikTok|Snapchat|Twitter|LinkedInApp|Line\/|MicroMessenger/i.test(ua) || (android && /; wv\)/.test(ua));
  const safari = ios && /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua) && !emApp;
  const samsung = /SamsungBrowser/i.test(ua);
  return { ios, android, emApp, safari, samsung, celular: ios || android };
}

export function jaInstalado() {
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true;
}

const dispensado = () => {
  try { return Date.now() - Number(localStorage.getItem(CHAVE_DISPENSA) || 0) < SEMANA; } catch { return false; }
};

// ---------------------------------------------------------------------------
// Instruções por aparelho
// ---------------------------------------------------------------------------
const ICONE_COMPARTILHAR = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.5v11"/><path d="m8 7.5 4-4 4 4"/><path d="M8.5 10.5H7a2 2 0 0 0-2 2V19a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5a2 2 0 0 0-2-2h-1.5"/></svg>';
const ICONE_MAIS = '<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>';
const ICONE_MENU = '<svg class="i" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="12" cy="19" r="1.8"/></svg>';

export function instrucoes() {
  const a = ambiente();
  if (a.ios) {
    if (a.emApp) {
      return {
        titulo: 'Instalar no iPhone',
        aviso: 'Você abriu o app dentro de outro aplicativo (como o Instagram). A instalação só funciona no Safari.',
        passos: [
          `Toque em <b>${ICONE_MENU} ••• </b> (ou no ícone ${ICONE_COMPARTILHAR} Compartilhar) no canto da tela.`,
          'Escolha <b>Abrir no Safari</b> (ou <b>Abrir no navegador</b>).',
          `Já no Safari, toque em ${ICONE_COMPARTILHAR} <b>Compartilhar</b> e depois em <b>Adicionar à Tela de Início</b>.`,
        ],
      };
    }
    return {
      titulo: 'Instalar no iPhone',
      aviso: a.safari ? '' : 'No iPhone a instalação funciona melhor pelo Safari. Se não aparecer a opção, abra este endereço no Safari.',
      passos: [
        `Toque no botão ${ICONE_COMPARTILHAR} <b>Compartilhar</b> ${a.safari ? 'na barra do Safari (embaixo ou no alto da tela)' : 'ao lado da barra de endereço'}.`,
        `Role a lista e toque em ${ICONE_MAIS} <b>Adicionar à Tela de Início</b>.`,
        'Toque em <b>Adicionar</b>, no canto superior direito.',
        'O ícone do <b>Desafio 21 Dias</b> aparece na tela inicial. Abra por ele, como um aplicativo.',
      ],
    };
  }
  if (a.android) {
    if (a.emApp) {
      return {
        titulo: 'Instalar no Android',
        aviso: 'Você abriu o app dentro de outro aplicativo (como o Instagram ou o WhatsApp). A instalação só funciona no Chrome.',
        passos: [
          `Toque em ${ICONE_MENU} (três pontinhos) no canto superior.`,
          'Escolha <b>Abrir no Chrome</b> (ou <b>Abrir no navegador</b>).',
          `No Chrome, toque em ${ICONE_MENU} e depois em <b>Instalar app</b>.`,
        ],
      };
    }
    if (a.samsung) {
      return {
        titulo: 'Instalar no Android',
        passos: [
          'Toque no menu <b>☰</b> (três linhas) na barra de baixo.',
          'Toque em <b>Adicionar à tela inicial</b> (ou <b>Instalar app</b>).',
          'Confirme em <b>Adicionar</b>.',
        ],
      };
    }
    return {
      titulo: 'Instalar no Android',
      passos: [
        `Toque em ${ICONE_MENU} (três pontinhos) no canto superior direito do Chrome.`,
        'Toque em <b>Instalar app</b> (ou <b>Adicionar à tela inicial</b>).',
        'Confirme em <b>Instalar</b>.',
        'O ícone do <b>Desafio 21 Dias</b> aparece na tela inicial e na lista de aplicativos.',
      ],
    };
  }
  return {
    titulo: 'Instalar no computador',
    passos: [
      'No <b>Chrome</b> ou no <b>Edge</b>, clique no ícone de instalar na barra de endereço (à direita), ou abra o menu ⋮ e escolha <b>Instalar Desafio 21 Dias</b>.',
      'Confirme em <b>Instalar</b>. O app abre em janela própria.',
      'No <b>Safari do Mac</b>: menu <b>Arquivo › Adicionar ao Dock</b>.',
    ],
  };
}

// ---------------------------------------------------------------------------
// Peças de tela
// ---------------------------------------------------------------------------
export function bannerInstalar() {
  const a = ambiente();
  if (jaInstalado() || !a.celular || dispensado()) return '';
  return `<div class="install-banner">
    <div class="install-ic">${ic('house')}</div>
    <div class="install-t"><strong>Instale o app</strong><span>Abre direto da tela inicial.</span></div>
    <button class="btn sm" data-act="${eventoInstalacao ? 'instalar-agora' : 'instalacao-abrir'}">${eventoInstalacao ? 'Instalar' : 'Como fazer'}</button>
    <button class="install-x" data-act="dispensar-instalacao" aria-label="Agora não">×</button>
  </div>`;
}

export function cartaoInstalar() {
  if (jaInstalado()) {
    return `<div class="card"><h3>App instalado</h3><p class="small muted" style="margin:0">Você está usando o Desafio 21 Dias como aplicativo.</p></div>`;
  }
  return `<div class="card"><h3>Instalar o app</h3>
    <p class="small">Coloque o Desafio 21 Dias na tela inicial do celular e abra como um aplicativo, sem digitar o endereço.</p>
    <div class="btn-row">
      ${eventoInstalacao ? '<button class="btn" data-act="instalar-agora">Instalar agora</button>' : ''}
      <button class="btn ${eventoInstalacao ? 'ghost' : ''}" data-act="instalacao-abrir">Ver como instalar</button>
    </div></div>`;
}

export const linkInstalarLogin = () => (!jaInstalado() && ambiente().celular
  ? '<p style="text-align:center;margin:10px 0 0"><button class="linkbtn" data-act="instalacao-abrir">Instalar o app no celular</button></p>' : '');

function abrirFolha() {
  fecharFolha();
  const i = instrucoes();
  const el = document.createElement('div');
  el.id = 'folha-instalar';
  el.className = 'modal-bg install';
  el.setAttribute('data-act', 'fechar-instalacao');
  el.innerHTML = `<div class="modal" data-stop role="dialog" aria-modal="true" aria-label="${esc(i.titulo)}">
    <h2 style="margin-top:6px">${esc(i.titulo)}</h2>
    ${i.aviso ? `<div class="notice warn small"><strong>Atenção</strong>${esc(i.aviso)}</div>` : ''}
    <ol class="steps">${i.passos.map((p) => `<li>${p}</li>`).join('')}</ol>
    <button class="btn block" data-act="fechar-instalacao">Entendi</button>
  </div>`;
  document.body.appendChild(el);
}

function fecharFolha() {
  const el = document.getElementById('folha-instalar');
  if (el) el.remove();
}

// ---------------------------------------------------------------------------
// Ações
// ---------------------------------------------------------------------------
export const cliques = {
  'instalacao-abrir': () => abrirFolha(),
  'fechar-instalacao': (el, e) => {
    // Toque dentro da folha não fecha; só o fundo ou o botão.
    if (e && el.id === 'folha-instalar' && e.target.closest('[data-stop]')) return;
    fecharFolha();
  },
  'dispensar-instalacao': () => {
    try { localStorage.setItem(CHAVE_DISPENSA, String(Date.now())); } catch { /* sem storage */ }
    app.render();
  },
  'instalar-agora': async () => {
    if (!eventoInstalacao) { abrirFolha(); return; }
    eventoInstalacao.prompt();
    const { outcome } = await eventoInstalacao.userChoice;
    eventoInstalacao = null;
    if (outcome === 'accepted') toast('App instalado. Procure o Desafio 21 Dias na tela inicial.');
    app.render();
  },
};

// ---------------------------------------------------------------------------
// Service worker, atualização e evento de instalação
// ---------------------------------------------------------------------------
function avisarNovaVersao(registro) {
  if (document.getElementById('barra-atualizar')) return;
  const el = document.createElement('div');
  el.id = 'barra-atualizar';
  el.className = 'update-bar glass';
  el.innerHTML = '<span>Tem uma versão nova do app.</span><button class="btn sm" type="button">Atualizar</button>';
  el.querySelector('button').addEventListener('click', () => {
    if (registro.waiting) registro.waiting.postMessage('ATUALIZAR');
    else window.location.reload();
  });
  document.body.appendChild(el);
}

export function iniciarPWA() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    eventoInstalacao = e;
    app.render();
  });
  window.addEventListener('appinstalled', () => { eventoInstalacao = null; app.render(); });

  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return;
  window.addEventListener('load', async () => {
    try {
      const registro = await navigator.serviceWorker.register('/sw.js');
      if (registro.waiting && navigator.serviceWorker.controller) avisarNovaVersao(registro);
      registro.addEventListener('updatefound', () => {
        const novo = registro.installing;
        if (!novo) return;
        novo.addEventListener('statechange', () => {
          if (novo.state === 'installed' && navigator.serviceWorker.controller) avisarNovaVersao(registro);
        });
      });
      let recarregando = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (recarregando) return;
        recarregando = true;
        window.location.reload();
      });
    } catch { /* o app funciona normalmente sem o service worker */ }
  });
}
