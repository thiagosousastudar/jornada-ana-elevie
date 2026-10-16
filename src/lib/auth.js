import { supabase } from './supabase.js';

// Do Google pedimos só o básico: nome, e-mail e foto (escopos padrão openid, email, profile).
export function entrarComGoogle() {
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
