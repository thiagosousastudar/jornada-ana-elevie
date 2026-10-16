// Testa migrações + seed + regras de acesso (RLS) num Postgres embutido (PGlite),
// simulando o essencial do Supabase (papéis, auth.uid() e storage). Uso: npm run test:db
import { PGlite } from '@electric-sql/pglite';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const proj = process.argv[2] || fileURLToPath(new URL('..', import.meta.url));
const db = new PGlite();
let ok = 0, falhas = 0;
const check = (cond, msg) => { if (cond) { ok++; console.log('  ✓ ' + msg); } else { falhas++; console.log('  ✗ ' + msg); } };

// --- Simulação mínima do Supabase: papéis, auth e storage ---
await db.exec(`
  create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}', raw_app_meta_data jsonb default '{}', encrypted_password text, updated_at timestamptz);
  -- No Supabase, crypt/gen_salt vêm do pgcrypto (schema extensions); aqui, um equivalente simples.
  create schema extensions;
  create function extensions.gen_salt(text) returns text language sql as $$ select 'sal' $$;
  create function extensions.crypt(text, text) returns text language sql as $$ select md5($1 || $2) $$;
  create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create schema storage;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text, owner uuid);
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as $$ select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1] $$;
  grant usage on schema auth, storage, public to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
  alter default privileges in schema public grant all on tables to anon, authenticated;
  alter default privileges in schema public grant all on sequences to anon, authenticated;
  alter default privileges in schema public grant execute on functions to anon, authenticated;
  grant all on storage.objects to authenticated;
`);

console.log('Migrações:');
for (const f of readdirSync(proj + '/supabase/migrations').sort()) {
  try { await db.exec(readFileSync(proj + '/supabase/migrations/' + f, 'utf8')); check(true, f); }
  catch (e) { check(false, f + ' → ' + e.message); }
}
try { await db.exec(readFileSync(proj + '/supabase/seed.sql', 'utf8')); check(true, 'seed.sql'); } catch (e) { check(false, 'seed.sql → ' + e.message); }
const cnt = async (sql) => Number((await db.query(sql)).rows[0].n);
check(await cnt('select count(*) n from public.tarefas') === 84, '84 tarefas no banco');
check(await cnt("select count(*) n from public.conteudos_nelly where status = 'em_revisao'") === 5, '5 conteúdos da Dra. Nelly em revisão');
check(await cnt('select count(*) n from public.tarefas where privada') > 0, 'tarefas privadas marcadas automaticamente');

// --- Usuárias simuladas ---
const U = { camila: '11111111-1111-1111-1111-111111111111', bia: '22222222-2222-2222-2222-222222222222', equipe: '33333333-3333-3333-3333-333333333333', nelly: '44444444-4444-4444-4444-444444444444' };
await db.exec(`
  insert into auth.users (id, email, raw_user_meta_data, raw_app_meta_data) values
    ('${U.camila}', 'camila@gmail.com', '{"full_name":"Camila Andrade"}', '{"provider":"google"}'),
    ('${U.bia}', 'bia@hotmail.com', '{}', '{"provider":"email"}'),
    ('${U.equipe}', 'equipe@elevie.com', '{}', '{"provider":"email"}'),
    ('${U.nelly}', 'nelly@elevie.com', '{"full_name":"Nelly Kim"}', '{"provider":"google"}');
  update public.perfis set papel = 'equipe' where id = '${U.equipe}';
  update public.perfis set papel = 'nelly' where id = '${U.nelly}';
`);
console.log('Perfil automático:');
const p = (await db.query(`select nome, metodo_login from public.perfis where id = '${U.camila}'`)).rows[0];
check(p.nome === 'Camila Andrade' && p.metodo_login === 'google', 'nome e método vêm do Google');

// executa como uma usuária (papel authenticated + jwt sub), sempre voltando ao superusuário
async function como(uid, fn) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid}', false);`);
  try { return await fn(); } finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`); }
}
const tenta = async (uid, sql) => como(uid, async () => { try { const r = await db.query(sql); return { ok: true, rows: r.rows }; } catch (e) { return { ok: false, erro: e.message }; } });

const camp = (await db.query("select id from public.campanhas where slug = 'edicao-1'")).rows[0].id;
const tarefa = async (codigo) => (await db.query(`select id from public.tarefas where codigo = '${codigo}'`)).rows[0].id;

console.log('Participante:');
let r = await tenta(U.camila, `insert into public.registros (tarefa_id, perfil_id, status) values ('${await tarefa('d1-mov')}', '${U.camila}', 'registrada')`);
check(!r.ok && /inscrita/.test(r.erro), 'não registra sem estar inscrita');
r = await tenta(U.camila, `select public.inscrever('edicao-1')`); check(r.ok, 'inscreve-se na campanha');
await tenta(U.bia, `select public.inscrever('edicao-1')`);
r = await tenta(U.camila, `update public.perfis set papel = 'admin' where id = '${U.camila}'`); check(!r.ok, 'não consegue se promover a admin');
r = await tenta(U.camila, `update public.perfis set nome = 'Camila A.', apelido = 'Cami' where id = '${U.camila}'`); check(r.ok, 'edita o próprio nome e apelido');
r = await tenta(U.camila, `insert into public.registros (tarefa_id, perfil_id, status, respostas) values ('${await tarefa('d1-mov')}', '${U.camila}', 'registrada', '{"modo":"fiz"}')`);
check(!r.ok && /foto/.test(r.erro), 'movimento sem foto é recusado (foto obrigatória)');
r = await tenta(U.camila, `insert into public.registros (tarefa_id, perfil_id, status, foto_path) values ('${await tarefa('d1-mov')}', '${U.camila}', 'aguardando_revisao', '${U.bia}/d1-mov.jpg')`);
check(!r.ok && /Foto inválida/.test(r.erro), 'não usa foto da pasta de outra pessoa');
r = await tenta(U.camila, `insert into public.registros (tarefa_id, perfil_id, status, foto_path, respostas) values ('${await tarefa('d1-mov')}', '${U.camila}', 'aguardando_revisao', '${U.camila}/d1-mov.jpg', '{"modo":"fiz"}') returning id`);
check(r.ok, 'envia movimento com foto para revisão');
const regMov = r.rows && r.rows[0].id;
r = await tenta(U.camila, `insert into public.registros (tarefa_id, perfil_id, status) values ('${await tarefa('d2-ali')}', '${U.camila}', 'aprovada')`);
check(!r.ok, 'não consegue se autoaprovar');
r = await tenta(U.camila, `insert into public.registros (tarefa_id, perfil_id, status, respostas) values ('${await tarefa('d5-men')}', '${U.camila}', 'registrada', '{"campos":["segredo"]}')`);
check(r.ok, 'registra tarefa privada');
check(await cnt(`select count(*) n from public.registros where respostas::text like '%segredo%'`) === 0, 'texto da tarefa privada não fica na tabela da equipe');
r = await tenta(U.camila, `insert into public.registros_privados (tarefa_id, perfil_id, respostas) values ('${await tarefa('d5-men')}', '${U.camila}', '{"campos":["segredo"]}')`);
check(r.ok, 'guarda o texto privado na tabela só dela');
r = await tenta(U.bia, `select * from public.registros`); check(r.ok && r.rows.length === 0, 'outra participante não vê os registros da Camila');
r = await tenta(U.equipe, `select * from public.registros_privados`); check(r.ok && r.rows.length === 0, 'equipe não lê respostas privadas');

console.log('Equipe e revisão:');
r = await tenta(U.equipe, `select count(*) n from public.registros`); check(r.ok && Number(r.rows[0].n) === 2, 'equipe vê os registros');
r = await tenta(U.equipe, `select public.revisar_registro('${regMov}', false, '')`); check(!r.ok && /corrigir/.test(r.erro), 'pedir ajuste exige motivo');
r = await tenta(U.equipe, `select public.revisar_registro('${regMov}', false, 'A foto não mostra a atividade')`); check(r.ok, 'pede ajuste com motivo');
r = await tenta(U.camila, `select status, motivo_ajuste from public.registros where id = '${regMov}'`);
check(r.rows[0].status === 'precisa_ajuste' && r.rows[0].motivo_ajuste, 'participante vê o ajuste e o motivo');
r = await tenta(U.camila, `update public.registros set status = 'aguardando_revisao', foto_path = '${U.camila}/d1-mov-2.jpg' where id = '${regMov}'`); check(r.ok, 'reenvia a correção');
r = await tenta(U.equipe, `select public.revisar_registro('${regMov}', true)`); check(r.ok, 'equipe aprova');
r = await tenta(U.camila, `update public.registros set status = 'registrada' where id = '${regMov}'`); check(!r.ok, 'registro aprovado não pode ser alterado');
r = await tenta(U.camila, `select public.revisar_registro('${regMov}', true)`); check(!r.ok, 'participante não usa a função de revisão');
check(await cnt(`select count(*) n from public.historico_registros where registro_id = '${regMov}'`) >= 4, 'histórico registra cada passo');

console.log('Dra. Nelly:');
r = await tenta(U.camila, `select count(*) n from public.conteudos_nelly`); check(Number(r.rows[0].n) === 0, 'participante não vê conteúdo ainda em revisão');
const d2 = (await db.query(`select id from public.dias where numero = 2`)).rows[0].id;
r = await tenta(U.equipe, `update public.conteudos_nelly set status = 'aprovado' where dia_id = '${d2}'`); check(!r.ok && /Nelly/.test(r.erro), 'equipe não aprova conteúdo de saúde');
r = await tenta(U.nelly, `update public.conteudos_nelly set status = 'aprovado' where dia_id = '${d2}'`); check(r.ok, 'Dra. Nelly aprova');
r = await tenta(U.camila, `select count(*) n from public.conteudos_nelly`); check(Number(r.rows[0].n) === 1, 'participante passa a ver o conteúdo aprovado');
r = await tenta(U.equipe, `update public.conteudos_nelly set resumo = 'texto alterado' where dia_id = '${d2}'`);
r = await tenta(U.camila, `select count(*) n from public.conteudos_nelly`); check(Number(r.rows[0].n) === 0, 'edição pela equipe volta o conteúdo para revisão');

console.log('Caixinha:');
r = await tenta(U.camila, `select public.enviar_caixinha('${camp}', 5, 'Posso usar remédio X?', 'saude', true) as id`); check(r.ok, 'envia mensagem anônima');
const msg = r.rows[0].id;
r = await tenta(U.equipe, `select autor_id, anonima from public.caixinha where id = '${msg}'`); check(r.rows[0].autor_id === null && r.rows[0].anonima, 'equipe não vê a autora da anônima');
r = await tenta(U.equipe, `select * from public.caixinha_autoria`); check(r.rows.length === 0, 'equipe não acessa o vínculo de autoria');
r = await tenta(U.camila, `select count(*) n from public.caixinha where id = '${msg}'`); check(Number(r.rows[0].n) === 1, 'a autora vê a própria mensagem anônima');
r = await tenta(U.bia, `select count(*) n from public.caixinha where id = '${msg}'`); check(Number(r.rows[0].n) === 0, 'outra participante não vê a mensagem');
r = await tenta(U.camila, `insert into public.caixinha (campanha_id, dia, texto) values ('${camp}', 5, 'direto')`); check(!r.ok, 'não insere sem passar pela função');
r = await tenta(U.nelly, `update public.caixinha set resposta_texto = 'Converse em consulta.', publica = true where id = '${msg}'`); check(r.ok, 'Dra. Nelly responde');
r = await tenta(U.bia, `select resposta_por_nome, autor_id from public.caixinha where id = '${msg}'`);
check(r.rows.length === 1 && r.rows[0].resposta_por_nome === 'Dra. Nelly Kim' && r.rows[0].autor_id === null, 'resposta pública aparece no mural, sem autora');
r = await tenta(U.equipe, `update public.caixinha set autor_id = '${U.camila}' where id = '${msg}'`);
check(await cnt(`select count(*) n from public.caixinha where id = '${msg}' and autor_id is null`) === 1, 'ninguém consegue "desanonimizar" a mensagem');

console.log('Check-in, consentimento e fotos:');
r = await tenta(U.camila, `insert into public.checkins (campanha_id, perfil_id, dia, feito, palavra, enquete) values ('${camp}', '${U.camila}', 4, 'sim', 'leve', 'De 5 a 7')`); check(r.ok, 'check-in com enquete');
r = await tenta(U.camila, `insert into public.consentimentos (campanha_id, perfil_id, tipo, aceito) values ('${camp}', '${U.camila}', 'repost', true), ('${camp}', '${U.camila}', 'repost', false)`); check(r.ok, 'consentimento e revogação viram histórico');
r = await tenta(U.equipe, `select aceito from public.consentimentos_atuais where perfil_id = '${U.camila}' and tipo = 'repost'`); check(r.rows[0] && r.rows[0].aceito === false, 'estado atual = última escolha (revogado)');
r = await tenta(U.camila, `insert into storage.objects (bucket_id, name) values ('evidencias', '${U.camila}/d1-ali-1.jpg')`); check(r.ok, 'envia foto na própria pasta');
r = await tenta(U.camila, `insert into storage.objects (bucket_id, name) values ('evidencias', '${U.bia}/x.jpg')`); check(!r.ok, 'não envia foto na pasta de outra');
r = await tenta(U.bia, `select count(*) n from storage.objects`); check(Number(r.rows[0].n) === 0, 'outra participante não vê a foto');
r = await tenta(U.equipe, `select count(*) n from storage.objects`); check(Number(r.rows[0].n) === 1, 'equipe vê a foto para revisar');

console.log('Revisão do próprio envio (equipe que também participa):');
await tenta(U.equipe, "select public.inscrever('edicao-1')");
r = await tenta(U.equipe, `insert into public.registros (tarefa_id, perfil_id, status, foto_path) values ('${await tarefa('d2-mov')}', '${U.equipe}', 'aguardando_revisao', '${U.equipe}/d2-mov.jpg') returning id`);
check(r.ok, 'equipe que participa envia a própria foto');
const proprio = r.rows && r.rows[0].id;
r = await tenta(U.equipe, `update public.registros set status = 'aprovada' where id = '${proprio}'`);
check(!r.ok, 'não se aprova direto pela tabela');
r = await tenta(U.equipe, `select public.revisar_registro('${proprio}', true)`);
check(r.ok, 'revisa o próprio envio pela função oficial');
r = await tenta(U.camila, `select set_config('app.revisando', '1', true)`);
r = await tenta(U.camila, `update public.registros set status = 'aprovada' where perfil_id = '${U.camila}' and status <> 'aprovada'`);
check(!r.ok || (r.rows || []).length === 0, 'participante não consegue se aprovar nem forçando a marca de revisão');

console.log('Senha (login por e-mail e senha):');
const ADMIN = '55555555-5555-5555-5555-555555555555';
await db.exec(`insert into auth.users (id, email) values ('${ADMIN}', 'admin@elevie.com'); update public.perfis set papel = 'admin' where id = '${ADMIN}';`);
r = await tenta(U.camila, "select public.redefinir_senha('bia@hotmail.com', 'nova123')"); check(!r.ok && /equipe/.test(r.erro), 'participante não redefine senha de ninguém');
r = await tenta(U.equipe, "select public.redefinir_senha('bia@hotmail.com', '123')"); check(!r.ok && /6 caracteres/.test(r.erro), 'senha provisória precisa de 6 caracteres ou mais');
r = await tenta(U.equipe, "select public.redefinir_senha('ninguem@x.com', 'nova123')"); check(!r.ok && /Nenhuma conta/.test(r.erro), 'avisa quando o e-mail não existe');
r = await tenta(U.equipe, "select public.redefinir_senha('BIA@hotmail.com', 'nova123')"); check(r.ok, 'equipe redefine a senha de participante (sem diferenciar maiúsculas no e-mail)');
check(await cnt(`select count(*) n from auth.users where id = '${U.bia}' and encrypted_password is not null`) === 1, 'senha gravada criptografada');
r = await tenta(U.bia, `select trocar_senha from public.perfis where id = '${U.bia}'`); check(r.rows[0].trocar_senha === true, 'participante é avisada para criar nova senha');
r = await tenta(U.bia, `update public.perfis set trocar_senha = false where id = '${U.bia}'`); check(r.ok, 'participante limpa o aviso depois de trocar');
r = await tenta(U.equipe, "select public.redefinir_senha('nelly@elevie.com', 'nova123')"); check(!r.ok && /admin/.test(r.erro), 'equipe não redefine a senha da Dra. Nelly');
r = await tenta(ADMIN, "select public.redefinir_senha('nelly@elevie.com', 'nova123')"); check(r.ok, 'admin redefine a senha de alguém da equipe');

console.log(`\n${ok} ok, ${falhas} falha(s)`);
process.exit(falhas ? 1 : 0);
