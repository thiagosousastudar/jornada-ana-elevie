import { supabase } from './supabase.js';

// Pergunta ao Supabase se o login com Google está ativo antes de sair do app:
// se não estiver, o redirecionamento cairia numa página de erro do Supabase.
async function googleAtivo() {
  try {
    const r = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: import.meta.env.VITE_SUPABASE_ANON_KEY },
    });
    const cfg = await r.json();
    return Boolean(cfg.external && cfg.external.google);
  } catch {
    return true; // na dúvida, tenta: o Supabase responde se não estiver ativo
  }
}

// Do Google pedimos só o básico: nome, e-mail e foto (escopos padrão openid, email, profile).
export async function entrarComGoogle() {
  if (!(await googleAtivo())) {
    return { error: new Error('O login com Google ainda não está disponível. Use o código no e-mail.') };
  }
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin + window.location.pathname,
      queryParams: { prompt: 'select_account' },
    },
  });
}

// Código de 6 dígitos no e-mail (o template do e-mail precisa mostrar {{ .Token }}; ver docs/PRODUCAO.md).
export function enviarCodigo(email) {
  return supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
}

export function confirmarCodigo(email, token) {
  return supabase.auth.verifyOtp({ email, token, type: 'email' });
}

export function sair() {
  return supabase.auth.signOut();
}

export async function sessaoAtual() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function aoMudarSessao(cb) {
  return supabase.auth.onAuthStateChange((_evento, sessao) => cb(sessao));
}
