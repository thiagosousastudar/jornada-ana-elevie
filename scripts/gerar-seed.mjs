// Gera supabase/seed.sql a partir do conteúdo validado no protótipo (prototipo/data.js).
// Uso: npm run seed:gerar
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const raiz = fileURLToPath(new URL('..', import.meta.url));
const ctx = { window: {} };
vm.runInNewContext(readFileSync(raiz + 'prototipo/data.js', 'utf8'), ctx);
const J = ctx.window.JORNADA;

const SLUG = 'edicao-1';
const txt = (v) => (v == null || v === '' ? 'null' : `'${String(v).replace(/'/g, "''")}'`);
const json = (v) => (v == null ? 'null' : `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`);
const ORDEM = { alimentacao: 1, movimento: 2, mentalidade: 3, compartilhar: 4 };

const c = J.campanha;
const linhas = [];
linhas.push('-- Gerado por scripts/gerar-seed.mjs a partir de prototipo/data.js. Não edite à mão.');
linhas.push('-- Conteúdo da Edição 1 da Jornada Ana + Eleviê (documento "21 dias de desafios").');
linhas.push('begin;');
linhas.push(`insert into public.campanhas (slug, nome, inicio, fuso, liberacao, hashtag, palavra_codigo, whatsapp_clinica, aviso_saude, semanas, instagram)
values (${txt(SLUG)}, ${txt(c.nome)}, ${txt(c.inicio)}, ${txt(c.fuso)}, ${txt(c.liberacao)}, ${txt(c.hashtag)}, ${txt(c.palavraCodigo)}, ${txt(c.whatsappClinica)}, ${txt(c.avisoSaude)}, ${json(c.semanas)}, ${json(c.instagram.map(({ chave, nome, usuario }) => ({ chave, nome, usuario })))})
on conflict (slug) do nothing;`);

for (const d of J.days) {
  linhas.push(`
-- Dia ${d.n}: ${d.tema}
insert into public.dias (campanha_id, numero, semana, tema, enquete, balanco, caixinha, cta)
select id, ${d.n}, ${d.semana}, ${txt(d.tema)}, ${json(d.enquete)}, ${json(d.balanco)}, ${json(d.caixinha)}, ${d.cta ? 'true' : 'false'}
from public.campanhas where slug = ${txt(SLUG)}
on conflict (campanha_id, numero) do nothing;`);
  // Conteúdo de saúde entra "em revisão": a Dra. Nelly aprova no app antes de aparecer.
  if (d.nelly) {
    const n = d.nelly;
    linhas.push(`insert into public.conteudos_nelly (dia_id, formato, titulo, resumo, fecho, status)
select d.id, ${txt(n.formato)}, ${txt(n.titulo)}, ${txt(n.resumo)}, ${txt(n.fecho)}, 'em_revisao'::public.status_nelly_t
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = ${txt(SLUG)} and d.numero = ${d.n}
on conflict (dia_id) do nothing;`);
  }
  for (const t of d.tarefas) {
    linhas.push(`insert into public.tarefas (dia_id, codigo, frente, ordem, titulo, instrucao, sugestao, alternativa, registro, evidencia, registro_corpo)
select d.id, ${txt(t.id)}, ${txt(t.frente)}::public.frente_t, ${ORDEM[t.frente]}, ${txt(t.titulo)}, ${txt(t.instrucao)}, ${txt(t.sugestao)}, ${txt(t.alternativa)}, ${json(t.registro)}, ${json(t.evidencia)}, ${txt(t.registroCorpo)}
from public.dias d join public.campanhas c on c.id = d.campanha_id where c.slug = ${txt(SLUG)} and d.numero = ${d.n}
on conflict (codigo) do nothing;`);
  }
}
linhas.push('commit;');
writeFileSync(raiz + 'supabase/seed.sql', linhas.join('\n') + '\n');
console.log(`seed.sql gerado: ${J.days.length} dias, ${J.days.reduce((s, d) => s + d.tarefas.length, 0)} tarefas, ${J.days.filter((d) => d.nelly).length} conteúdos da Dra. Nelly.`);
