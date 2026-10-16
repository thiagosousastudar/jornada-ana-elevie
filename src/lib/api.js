// Acesso aos dados. Toda regra de permissão está no banco (RLS); aqui só lemos e gravamos.
import { supabase } from './supabase.js';

function ok({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}

// ---------------------------------------------------------------------------
// Perfil e campanha
// ---------------------------------------------------------------------------
export async function meuPerfil() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return ok(await supabase.from('perfis').select('*').eq('id', user.id).maybeSingle());
}

export async function salvarPerfil(id, { nome, apelido }) {
  return ok(await supabase.from('perfis').update({ nome, apelido }).eq('id', id).select().single());
}

export async function limparTrocarSenha(id) {
  return ok(await supabase.from('perfis').update({ trocar_senha: false }).eq('id', id).select().single());
}

export async function redefinirSenha(email, senha) {
  return ok(await supabase.rpc('redefinir_senha', { p_email: email, p_senha: senha }));
}

export async function carregarCampanha(slug) {
  return ok(await supabase.from('campanhas').select('*').eq('slug', slug).maybeSingle());
}

// Dias com tarefas e o conteúdo da Dra. Nelly (a participante só recebe o aprovado: regra no banco).
export async function carregarDias(campanhaId) {
  const dias = ok(await supabase.from('dias').select('*, tarefas(*), conteudos_nelly(*)').eq('campanha_id', campanhaId).order('numero'));
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

export async function registrarConsentimento(campanhaId, perfilId, tipo, aceito) {
  const escopo = tipo === 'repost' ? 'Stories da clínica, da Dra. Nelly e da Ana durante a campanha' : null;
  return ok(await supabase.from('consentimentos').insert({ campanha_id: campanhaId, perfil_id: perfilId, tipo, aceito, escopo }));
}

// Entrada na jornada: inscrição + consentimentos (cada escolha vira uma linha de histórico).
export async function entrarNaJornada(slug, campanhaId, perfilId, escolhas) {
  ok(await supabase.rpc('inscrever', { p_slug: slug }));
  const linhas = Object.entries(escolhas).map(([tipo, aceito]) => ({
    campanha_id: campanhaId, perfil_id: perfilId, tipo, aceito,
    escopo: tipo === 'repost' ? 'Stories da clínica, da Dra. Nelly e da Ana durante a campanha' : null,
  }));
  ok(await supabase.from('consentimentos').insert(linhas));
}

// ---------------------------------------------------------------------------
// Participante
// ---------------------------------------------------------------------------
export async function meusRegistros(perfilId) {
  return ok(await supabase.from('registros').select('*').eq('perfil_id', perfilId));
}

export async function meusPrivados(perfilId) {
  const linhas = ok(await supabase.from('registros_privados').select('*').eq('perfil_id', perfilId));
  return Object.fromEntries(linhas.map((l) => [l.tarefa_id, l]));
}

export async function salvarRegistro(linha) {
  return ok(await supabase.from('registros').upsert(linha, { onConflict: 'tarefa_id,perfil_id' }).select().single());
}

export async function salvarRegistroPrivado(tarefaId, perfilId, respostas) {
  return ok(await supabase.from('registros_privados').upsert(
    { tarefa_id: tarefaId, perfil_id: perfilId, respostas, atualizado_em: new Date().toISOString() },
    { onConflict: 'tarefa_id,perfil_id' },
  ));
}

export async function meusCheckins(campanhaId, perfilId) {
  return ok(await supabase.from('checkins').select('*').eq('campanha_id', campanhaId).eq('perfil_id', perfilId));
}

export async function salvarCheckin(linha) {
  return ok(await supabase.from('checkins').upsert(linha, { onConflict: 'campanha_id,perfil_id,dia' }).select().single());
}

export async function caixinhaVisivel() {
  return ok(await supabase.from('caixinha').select('*').order('criado_em', { ascending: false }));
}

export async function minhaAutoria() {
  const linhas = ok(await supabase.from('caixinha_autoria').select('mensagem_id'));
  return new Set(linhas.map((l) => l.mensagem_id));
}

export async function enviarCaixinha(campanhaId, dia, texto, sobre, anonima) {
  return ok(await supabase.rpc('enviar_caixinha', { p_campanha: campanhaId, p_dia: dia, p_texto: texto, p_sobre: sobre, p_anonima: anonima }));
}

export async function registrarCta(campanhaId, perfilId, dia) {
  return ok(await supabase.from('cta_cliques').insert({ campanha_id: campanhaId, perfil_id: perfilId, dia }));
}

// ---------------------------------------------------------------------------
// Equipe
// ---------------------------------------------------------------------------
export async function dadosDaEquipe(campanhaId) {
  const [inscricoes, perfis, registros, checkins, caixinha, consent, ctas, alteracoes, historico] = await Promise.all([
    supabase.from('inscricoes').select('*').eq('campanha_id', campanhaId),
    supabase.from('perfis').select('id, nome, apelido, email, papel, criado_em'),
    supabase.from('registros').select('*'),
    supabase.from('checkins').select('*').eq('campanha_id', campanhaId),
    supabase.from('caixinha').select('*').eq('campanha_id', campanhaId).order('criado_em', { ascending: true }),
    supabase.from('consentimentos_atuais').select('*').eq('campanha_id', campanhaId),
    supabase.from('cta_cliques').select('*').eq('campanha_id', campanhaId),
    supabase.from('alteracoes').select('*').eq('campanha_id', campanhaId).order('em', { ascending: false }).limit(200),
    supabase.from('caixinha_historico').select('*').order('em', { ascending: true }),
  ]);
  return {
    inscricoes: ok(inscricoes), perfis: ok(perfis), registros: ok(registros), checkins: ok(checkins),
    caixinha: ok(caixinha), consent: ok(consent), ctas: ok(ctas), alteracoes: ok(alteracoes), historicoCaixinha: ok(historico),
  };
}

export async function revisarRegistro(registroId, aprovar, motivo) {
  return ok(await supabase.rpc('revisar_registro', { p_registro: registroId, p_aprovar: aprovar, p_motivo: motivo || null }));
}

export async function atualizarCaixinha(id, campos) {
  return ok(await supabase.from('caixinha').update(campos).eq('id', id).select().single());
}

export async function atualizarDia(id, campos) {
  return ok(await supabase.from('dias').update(campos).eq('id', id));
}

export async function atualizarTarefa(id, campos) {
  return ok(await supabase.from('tarefas').update(campos).eq('id', id));
}

export async function atualizarNelly(diaId, campos) {
  return ok(await supabase.from('conteudos_nelly').update(campos).eq('dia_id', diaId));
}

export async function atualizarCampanha(id, campos) {
  return ok(await supabase.from('campanhas').update(campos).eq('id', id).select().single());
}

export async function registrarAlteracao(campanhaId, dia, por, resumo) {
  return ok(await supabase.from('alteracoes').insert({ campanha_id: campanhaId, dia, por, resumo }));
}

export async function definirPapel(email, papel) {
  return ok(await supabase.rpc('definir_papel', { p_email: email, p_papel: papel }));
}
