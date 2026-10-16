// Login por e-mail e senha. Esqueceu a senha? A participante fala com a equipe pelo WhatsApp
// e a equipe gera uma senha provisória pelo app (função redefinir_senha no banco).
import { supabase } from './supabase.js';

export const SENHA_MINIMA = 6;

// Mensagens do Supabase traduzidas para algo que a participante entenda.
export function traduzirErro(erro) {
  const m = (erro && erro.message) || '';
  if (/invalid login credentials/i.test(m)) return 'E-mail ou senha incorretos.';
  if (/already registered|already been registered/i.test(m)) return 'Este e-mail já tem conta. Use a aba "Entrar".';
  if (/password should be at least/i.test(m)) return `A senha precisa ter pelo menos ${SENHA_MINIMA} caracteres.`;
  if (/email not confirmed/i.test(m)) return 'Seu e-mail ainda não foi confirmado. Fale com a equipe pelo WhatsApp.';
  if (/rate limit|too many/i.test(m)) return 'Muitas tentativas seguidas. Espere um minuto e tente de novo.';
  if (/failed to fetch|network/i.test(m)) return 'Sem conexão. Confira a internet e tente de novo.';
  if (/new password should be different/i.test(m)) return 'A nova senha precisa ser diferente da atual.';
  return m || 'Não foi possível concluir.';
}

export function entrar(email, senha) {
  return supabase.auth.signInWithPassword({ email, password: senha });
}

export function criarConta(email, senha) {
  return supabase.auth.signUp({ email, password: senha });
}

export function trocarSenha(nova) {
  return supabase.auth.updateUser({ password: nova });
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
