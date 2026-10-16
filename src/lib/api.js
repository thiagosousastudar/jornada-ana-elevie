// Acesso aos dados. Toda regra de permissão está no banco (RLS); aqui só lemos e gravamos.
import { supabase } from './supabase.js';

function ok({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

export async function meuPerfil() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return ok(await supabase.from('perfis').select('*').eq('id', user.id).maybeSingle());
}

export async function salvarPerfil(id, { nome, apelido }) {
  return ok(await supabase.from('perfis').update({ nome, apelido }).eq('id', id).select().single());
}

export async function carregarCampanha(slug) {
  return ok(await supabase.from('campanhas').select('*').eq('slug', slug).maybeSingle());
}

// Dias com tarefas e o conteúdo da Dra. Nelly (a participante só recebe o aprovado: regra no banco).
export async function carregarDias(campanhaId) {
  const dias = ok(await supabase
    .from('dias')
    .select('*, tarefas(*), conteudos_nelly(*)')
    .eq('campanha_id', campanhaId)
    .order('numero'));
  dias.forEach((d) => {
    d.tarefas.sort((a, b) => a.ordem - b.ordem);
    d.nelly = Array.isArray(d.conteudos_nelly) ? d.conteudos_nelly[0] || null : d.conteudos_nelly;
  });
  return dias;
}

export async function minhaInscricao(campanhaId, perfilId) {
  return ok(await supabase.from('inscricoes').select('*').eq('campanha_id', campanhaId).eq('perfil_id', perfilId).maybeSingle());
}

export async function meusConsentimentos(campanhaId, perfilId) {
  const linhas = ok(await supabase.from('consentimentos_atuais').select('*').eq('campanha_id', campanhaId).eq('perfil_id', perfilId));
  return Object.fromEntries(linhas.map((c) => [c.tipo, c]));
}

// Entrada na jornada: inscrição + consentimentos (cada escolha vira uma linha de histórico).
export async function entrarNaJornada(slug, campanhaId, perfilId, escolhas) {
  ok(await supabase.rpc('inscrever', { p_slug: slug }));
  const linhas = Object.entries(escolhas).map(([tipo, aceito]) => ({
    campanha_id: campanhaId,
    perfil_id: perfilId,
    tipo,
    aceito,
    escopo: tipo === 'repost' ? 'Stories de @eleviê e @dra.nellykim durante a campanha' : null,
  }));
  ok(await supabase.from('consentimentos').insert(linhas));
}

export async function meusRegistros(perfilId) {
  return ok(await supabase.from('registros').select('*').eq('perfil_id', perfilId));
}

export async function meusCheckins(campanhaId, perfilId) {
  return ok(await supabase.from('checkins').select('*').eq('campanha_id', campanhaId).eq('perfil_id', perfilId));
}
