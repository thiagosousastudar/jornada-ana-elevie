-- Jornada Ana + Eleviê — esquema do banco.
-- Princípios: coletar só o necessário; conteúdo privado da participante fica separado
-- (registros_privados, caixinha_autoria) para que a equipe nunca o leia, nem por engano.
-- Fotos e medidas do corpo (dias 1 e 21) NÃO têm tabela: ficam só no aparelho.


-- ---------------------------------------------------------------------------
-- Tipos
-- ---------------------------------------------------------------------------
create type public.papel_t as enum ('participante', 'equipe', 'nelly', 'admin');
create type public.frente_t as enum ('alimentacao', 'movimento', 'mentalidade', 'compartilhar');
create type public.status_registro_t as enum (
  'nao_iniciada', 'em_andamento', 'aguardando_revisao', 'registrada', 'aprovada', 'precisa_ajuste', 'nao_realizada'
);
create type public.status_nelly_t as enum ('rascunho', 'em_revisao', 'aprovado');
create type public.status_caixinha_t as enum ('nova', 'equipe', 'nelly', 'respondida', 'arquivada');

-- ---------------------------------------------------------------------------
-- Pessoas
-- ---------------------------------------------------------------------------
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null default '',
  apelido text not null default '',
  email text not null,
  papel public.papel_t not null default 'participante',
  metodo_login text,                       -- 'google' ou 'email'
  criado_em timestamptz not null default now(),
  constraint nome_tamanho check (char_length(nome) <= 120),
  constraint apelido_tamanho check (char_length(apelido) <= 40)
);
comment on table public.perfis is 'Uma linha por usuária autenticada. Papel define o acesso (participante, equipe, nelly, admin).';

-- ---------------------------------------------------------------------------
-- Campanha e conteúdo
-- ---------------------------------------------------------------------------
create table public.campanhas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  nome text not null,
  inicio date not null,                    -- dia 1 (segunda-feira)
  fuso text not null default 'America/Sao_Paulo',
  liberacao time not null default '06:00',
  hashtag text,
  palavra_codigo text,
  whatsapp_clinica text,                   -- só números, com DDI (ex.: 5514999999999)
  aviso_saude text not null,
  semanas jsonb not null default '[]',     -- [{nome, foco}]
  instagram jsonb not null default '[]',   -- [{chave, nome, usuario}]
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);

create table public.inscricoes (
  campanha_id uuid not null references public.campanhas (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  status text not null default 'ativa' check (status in ('ativa', 'encerrada', 'removida')),
  entrada timestamptz not null default now(),
  primary key (campanha_id, perfil_id)
);

create table public.dias (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid not null references public.campanhas (id) on delete cascade,
  numero int not null check (numero between 1 and 21),
  semana int not null check (semana between 1 and 3),
  tema text not null,
  enquete jsonb,                           -- {pergunta, opcoes[], alerta?}
  balanco jsonb,                           -- {titulo, perguntas[]}
  caixinha jsonb,                          -- {pergunta, tag}
  cta boolean not null default false,      -- botão "agendar avaliação"
  unique (campanha_id, numero)
);

create table public.conteudos_nelly (
  dia_id uuid primary key references public.dias (id) on delete cascade,
  formato text not null default 'Vídeo',
  titulo text not null,
  resumo text not null,
  fecho text,
  midia_url text,
  status public.status_nelly_t not null default 'rascunho',
  aprovado_por uuid references public.perfis (id),
  aprovado_em timestamptz,
  atualizado_em timestamptz not null default now()
);
comment on table public.conteudos_nelly is 'Conteúdo de saúde. Só aparece para participantes quando aprovado pela Dra. Nelly (ver trigger).';

create table public.tarefas (
  id uuid primary key default gen_random_uuid(),
  dia_id uuid not null references public.dias (id) on delete cascade,
  codigo text not null unique,             -- ex.: d1-ali, d1-com
  frente public.frente_t not null,
  ordem int not null,
  titulo text not null,
  instrucao text not null,
  sugestao text,
  alternativa text,
  registro jsonb not null,                 -- {tipo, campos|itens|opcoes|minimo|privado}
  evidencia jsonb not null default '{"foto": "nao", "criterio": ""}',
  registro_corpo text check (registro_corpo in ('inicio', 'final')),
  privada boolean generated always as (
    (registro ->> 'tipo') = 'privado' or coalesce((registro ->> 'privado')::boolean, false)
  ) stored,
  unique (dia_id, frente)
);

-- ---------------------------------------------------------------------------
-- Participação
-- ---------------------------------------------------------------------------
create table public.registros (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references public.tarefas (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  status public.status_registro_t not null,
  respostas jsonb not null default '{}',   -- sempre vazio em tarefas privadas
  foto_path text,                          -- caminho no bucket "evidencias"
  motivo_nao text,
  enviado_em timestamptz not null default now(),
  revisado_por uuid references public.perfis (id),
  revisado_em timestamptz,
  motivo_ajuste text,
  unique (tarefa_id, perfil_id)
);
create index registros_perfil_idx on public.registros (perfil_id);
create index registros_revisao_idx on public.registros (status) where status = 'aguardando_revisao';

-- Respostas de tarefas privadas: só a própria participante lê (nem a equipe).
create table public.registros_privados (
  tarefa_id uuid not null references public.tarefas (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  respostas jsonb not null default '{}',
  atualizado_em timestamptz not null default now(),
  primary key (tarefa_id, perfil_id)
);

create table public.historico_registros (
  id bigint generated always as identity primary key,
  registro_id uuid not null references public.registros (id) on delete cascade,
  acao text not null,
  por uuid references public.perfis (id) on delete set null,
  em timestamptz not null default now()
);

create table public.checkins (
  campanha_id uuid not null references public.campanhas (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  dia int not null check (dia between 1 and 21),
  feito text not null check (feito in ('sim', 'parte', 'nao')),
  palavra text not null check (char_length(palavra) between 1 and 30),
  enquete text,
  balanco jsonb,
  extra jsonb,                             -- pesquisa final (dia 21)
  em timestamptz not null default now(),
  primary key (campanha_id, perfil_id, dia)
);

-- Consentimentos: histórico (nunca sobrescreve); o estado atual é a linha mais recente.
create table public.consentimentos (
  id bigint generated always as identity primary key,
  campanha_id uuid not null references public.campanhas (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  tipo text not null check (tipo in ('termos', 'saude', 'comunicacoes', 'repost')),
  aceito boolean not null,
  versao text not null default 'v1.0',
  escopo text,
  em timestamptz not null default now()
);
create index consentimentos_idx on public.consentimentos (perfil_id, campanha_id, tipo, em desc);

create view public.consentimentos_atuais with (security_invoker = on) as
  select distinct on (campanha_id, perfil_id, tipo) *
  from public.consentimentos
  order by campanha_id, perfil_id, tipo, em desc, id desc;

-- ---------------------------------------------------------------------------
-- Caixinha de perguntas
-- ---------------------------------------------------------------------------
create table public.caixinha (
  id uuid primary key default gen_random_uuid(),
  campanha_id uuid not null references public.campanhas (id) on delete cascade,
  autor_id uuid references public.perfis (id) on delete set null,  -- NULL quando anônima
  anonima boolean not null default false,
  dia int not null check (dia between 1 and 21),
  texto text not null check (char_length(texto) between 1 and 600),
  sobre text check (sobre in ('rotina', 'saude')),
  tag text,
  status public.status_caixinha_t not null default 'nova',
  resposta_texto text,
  resposta_por_nome text,
  respondida_por uuid references public.perfis (id) on delete set null,
  resposta_em timestamptz,
  publica boolean not null default false,
  video_dia int check (video_dia between 1 and 21),
  criado_em timestamptz not null default now(),
  constraint anonima_sem_autor check (not anonima or autor_id is null)
);
-- Vínculo da mensagem anônima com a autora: só ela enxerga (para ver as próprias mensagens).
create table public.caixinha_autoria (
  mensagem_id uuid primary key references public.caixinha (id) on delete cascade,
  autor_id uuid not null references public.perfis (id) on delete cascade
);
create table public.caixinha_historico (
  id bigint generated always as identity primary key,
  mensagem_id uuid not null references public.caixinha (id) on delete cascade,
  acao text not null,
  por uuid references public.perfis (id) on delete set null,
  em timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Métricas e auditoria
-- ---------------------------------------------------------------------------
create table public.cta_cliques (
  id bigint generated always as identity primary key,
  campanha_id uuid not null references public.campanhas (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  dia int,
  em timestamptz not null default now()
);

create table public.alteracoes (
  id bigint generated always as identity primary key,
  campanha_id uuid not null references public.campanhas (id) on delete cascade,
  dia int,
  por uuid references public.perfis (id) on delete set null,
  resumo text not null,
  em timestamptz not null default now()
);
