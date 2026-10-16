-- Jornada Ana + Eleviê — regras de acesso (RLS), proteções e funções.
-- Regra de ouro: o navegador só faz o que a política permite. Ações sensíveis
-- (revisar evidência, enviar à caixinha, mudar papel) passam por funções no banco.

-- ---------------------------------------------------------------------------
-- Funções de papel
-- ---------------------------------------------------------------------------
create or replace function public.meu_papel()
returns public.papel_t language sql stable security definer set search_path = public as $$
  select papel from public.perfis where id = auth.uid()
$$;

create or replace function public.eh_equipe()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.meu_papel() in ('equipe', 'nelly', 'admin'), false)
$$;

create or replace function public.eh_nelly()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.meu_papel() in ('nelly', 'admin'), false)
$$;

create or replace function public.eh_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.meu_papel() = 'admin', false)
$$;

-- ---------------------------------------------------------------------------
-- Perfil criado automaticamente no primeiro login (Google ou código no e-mail)
-- ---------------------------------------------------------------------------
create or replace function public.criar_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome, email, metodo_login)
  values (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''), 120),
    coalesce(new.email, ''),
    case when coalesce(new.raw_app_meta_data ->> 'provider', 'email') = 'google' then 'google' else 'email' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

create trigger ao_criar_usuario
  after insert on auth.users
  for each row execute function public.criar_perfil();

-- ---------------------------------------------------------------------------
-- Proteções de dados (triggers)
-- ---------------------------------------------------------------------------

-- Participante só grava status que fazem sentido para ela e não mexe nos campos de revisão.
create or replace function public.proteger_registro()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  t public.tarefas;
begin
  select * into t from public.tarefas where id = new.tarefa_id;

  -- Respostas de tarefas privadas nunca ficam nesta tabela.
  if t.privada then
    new.respostas := '{}'::jsonb;
  end if;

  if public.eh_equipe() and new.perfil_id <> auth.uid() then
    return new;  -- revisão é feita pela função revisar_registro()
  end if;

  if new.perfil_id <> auth.uid() then
    raise exception 'Sem permissão para este registro';
  end if;
  if not exists (
    select 1 from public.inscricoes i join public.dias d on d.campanha_id = i.campanha_id
    where d.id = t.dia_id and i.perfil_id = auth.uid() and i.status = 'ativa'
  ) then
    raise exception 'Você não está inscrita nesta campanha';
  end if;
  if new.foto_path is not null and split_part(new.foto_path, '/', 1) <> auth.uid()::text then
    raise exception 'Foto inválida';
  end if;
  if new.status not in ('nao_iniciada', 'em_andamento', 'aguardando_revisao', 'registrada', 'nao_realizada') then
    raise exception 'Status inválido para a participante: %', new.status;
  end if;
  if new.status = 'aguardando_revisao' and new.foto_path is null then
    raise exception 'Para ir à revisão é preciso enviar a foto';
  end if;
  if (t.evidencia ->> 'foto') = 'obrigatoria' and new.status in ('aguardando_revisao', 'registrada') and new.foto_path is null then
    raise exception 'Esta tarefa pede foto de comprovação';
  end if;

  if tg_op = 'UPDATE' then
    if old.status = 'aprovada' then
      raise exception 'Registro já aprovado não pode ser alterado';
    end if;
    new.revisado_por := null;
    new.revisado_em := null;
    new.motivo_ajuste := case when new.status = 'precisa_ajuste' then old.motivo_ajuste else null end;
  else
    new.revisado_por := null;
    new.revisado_em := null;
    new.motivo_ajuste := null;
  end if;
  new.enviado_em := now();
  return new;
end $$;

create trigger proteger_registro
  before insert or update on public.registros
  for each row execute function public.proteger_registro();

-- Histórico automático de cada envio.
create or replace function public.registrar_historico()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.historico_registros (registro_id, acao, por)
    values (new.id,
      case new.status
        when 'aguardando_revisao' then 'Enviado para revisão'
        when 'registrada' then 'Registrado'
        when 'nao_realizada' then 'Marcado como não realizado'
        when 'em_andamento' then 'Rascunho salvo'
        when 'aprovada' then 'Aprovado'
        when 'precisa_ajuste' then 'Ajuste solicitado'
        else new.status::text
      end,
      auth.uid());
  end if;
  return new;
end $$;

create trigger historico_registro
  after insert or update on public.registros
  for each row execute function public.registrar_historico();

-- Só a Dra. Nelly (ou admin) aprova conteúdo de saúde.
create or replace function public.proteger_conteudo_nelly()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status = 'aprovado' and (tg_op = 'INSERT' or old.status <> 'aprovado') then
    if not public.eh_nelly() and auth.uid() is not null then
      raise exception 'Somente a Dra. Nelly pode aprovar conteúdo de saúde';
    end if;
    new.aprovado_por := auth.uid();
    new.aprovado_em := now();
  end if;
  -- Qualquer edição de texto depois de aprovado volta para revisão.
  if tg_op = 'UPDATE' and old.status = 'aprovado' and new.status = 'aprovado'
     and (new.titulo, new.resumo, coalesce(new.fecho, '')) is distinct from (old.titulo, old.resumo, coalesce(old.fecho, ''))
     and not public.eh_nelly() then
    new.status := 'em_revisao';
    new.aprovado_por := null;
    new.aprovado_em := null;
  end if;
  new.atualizado_em := now();
  return new;
end $$;

create trigger proteger_conteudo_nelly
  before insert or update on public.conteudos_nelly
  for each row execute function public.proteger_conteudo_nelly();

-- Quem responde a caixinha fica registrado; o nome exibido depende do papel.
create or replace function public.proteger_caixinha()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.resposta_texto is distinct from old.resposta_texto and new.resposta_texto is not null then
    new.respondida_por := auth.uid();
    new.resposta_em := now();
    new.resposta_por_nome := case when public.meu_papel() = 'nelly' then 'Dra. Nelly Kim' else 'Equipe Eleviê' end;
    new.status := 'respondida';
  end if;
  -- Nunca revelar a autora de uma mensagem anônima.
  new.autor_id := old.autor_id;
  new.anonima := old.anonima;
  if new.status is distinct from old.status then
    insert into public.caixinha_historico (mensagem_id, acao, por) values (new.id, 'Status: ' || new.status, auth.uid());
  end if;
  return new;
end $$;

create trigger proteger_caixinha
  before update on public.caixinha
  for each row execute function public.proteger_caixinha();

-- ---------------------------------------------------------------------------
-- Funções chamadas pelo app (RPC)
-- ---------------------------------------------------------------------------

-- Inscreve a usuária logada na campanha ativa.
create or replace function public.inscrever(p_slug text)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  c uuid;
begin
  if auth.uid() is null then raise exception 'Faça login'; end if;
  select id into c from public.campanhas where slug = p_slug and ativa;
  if c is null then raise exception 'Campanha não encontrada ou encerrada'; end if;
  insert into public.inscricoes (campanha_id, perfil_id) values (c, auth.uid())
  on conflict (campanha_id, perfil_id) do nothing;
  return c;
end $$;

-- Equipe aprova ou pede ajuste (com motivo obrigatório).
create or replace function public.revisar_registro(p_registro uuid, p_aprovar boolean, p_motivo text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_equipe() then raise exception 'Somente a equipe revisa evidências'; end if;
  if not p_aprovar and coalesce(trim(p_motivo), '') = '' then
    raise exception 'Informe o que a participante precisa corrigir';
  end if;
  update public.registros
     set status = case when p_aprovar then 'aprovada' else 'precisa_ajuste' end::public.status_registro_t,
         revisado_por = auth.uid(),
         revisado_em = now(),
         motivo_ajuste = case when p_aprovar then null else trim(p_motivo) end
   where id = p_registro and status = 'aguardando_revisao';
  if not found then raise exception 'Registro não está aguardando revisão'; end if;
end $$;

-- Envio para a caixinha. Anônima: a autoria vai para uma tabela que só a autora lê.
create or replace function public.enviar_caixinha(p_campanha uuid, p_dia int, p_texto text, p_sobre text, p_anonima boolean)
returns uuid language plpgsql security definer set search_path = public as $$
declare
  m uuid;
begin
  if auth.uid() is null then raise exception 'Faça login'; end if;
  if not exists (select 1 from public.inscricoes where campanha_id = p_campanha and perfil_id = auth.uid() and status = 'ativa') then
    raise exception 'Você não está inscrita nesta campanha';
  end if;
  insert into public.caixinha (campanha_id, autor_id, anonima, dia, texto, sobre)
  values (p_campanha, case when p_anonima then null else auth.uid() end, p_anonima, p_dia, trim(p_texto), p_sobre)
  returning id into m;
  if p_anonima then
    insert into public.caixinha_autoria (mensagem_id, autor_id) values (m, auth.uid());
  end if;
  insert into public.caixinha_historico (mensagem_id, acao) values (m, 'Recebida');
  return m;
end $$;

-- Admin define o papel de alguém pelo e-mail (equipe, nelly, admin, participante).
create or replace function public.definir_papel(p_email text, p_papel public.papel_t)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_admin() then raise exception 'Somente admin'; end if;
  update public.perfis set papel = p_papel where lower(email) = lower(trim(p_email));
  if not found then raise exception 'Nenhuma conta com este e-mail (a pessoa precisa entrar no app uma vez)'; end if;
end $$;

-- ---------------------------------------------------------------------------
-- RLS: ativar em todas as tabelas
-- ---------------------------------------------------------------------------
alter table public.perfis enable row level security;
alter table public.campanhas enable row level security;
alter table public.inscricoes enable row level security;
alter table public.dias enable row level security;
alter table public.conteudos_nelly enable row level security;
alter table public.tarefas enable row level security;
alter table public.registros enable row level security;
alter table public.registros_privados enable row level security;
alter table public.historico_registros enable row level security;
alter table public.checkins enable row level security;
alter table public.consentimentos enable row level security;
alter table public.caixinha enable row level security;
alter table public.caixinha_autoria enable row level security;
alter table public.caixinha_historico enable row level security;
alter table public.cta_cliques enable row level security;
alter table public.alteracoes enable row level security;

-- Perfis: cada uma vê e edita o próprio nome/apelido; a equipe vê todas.
create policy perfis_ler on public.perfis for select to authenticated
  using (id = auth.uid() or public.eh_equipe());
create policy perfis_editar_proprio on public.perfis for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
revoke update on public.perfis from authenticated;
grant update (nome, apelido) on public.perfis to authenticated;

-- Campanha e conteúdo: leitura para quem está logada; edição pela equipe.
create policy campanhas_ler on public.campanhas for select to authenticated using (true);
create policy campanhas_editar on public.campanhas for update to authenticated
  using (public.eh_equipe()) with check (public.eh_equipe());

create policy dias_ler on public.dias for select to authenticated using (true);
create policy dias_editar on public.dias for update to authenticated
  using (public.eh_equipe()) with check (public.eh_equipe());

create policy tarefas_ler on public.tarefas for select to authenticated using (true);
create policy tarefas_editar on public.tarefas for update to authenticated
  using (public.eh_equipe()) with check (public.eh_equipe());

create policy nelly_ler on public.conteudos_nelly for select to authenticated
  using (status = 'aprovado' or public.eh_equipe());
create policy nelly_editar on public.conteudos_nelly for update to authenticated
  using (public.eh_equipe()) with check (public.eh_equipe());
create policy nelly_criar on public.conteudos_nelly for insert to authenticated
  with check (public.eh_equipe());

create policy inscricoes_ler on public.inscricoes for select to authenticated
  using (perfil_id = auth.uid() or public.eh_equipe());
create policy inscricoes_editar on public.inscricoes for update to authenticated
  using (public.eh_equipe()) with check (public.eh_equipe());

-- Registros: a participante cuida dos seus; a equipe lê todos (revisão via função).
create policy registros_ler on public.registros for select to authenticated
  using (perfil_id = auth.uid() or public.eh_equipe());
create policy registros_criar on public.registros for insert to authenticated
  with check (perfil_id = auth.uid());
create policy registros_editar on public.registros for update to authenticated
  using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());

create policy privados_dona on public.registros_privados for all to authenticated
  using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());

create policy historico_ler on public.historico_registros for select to authenticated
  using (public.eh_equipe() or exists (
    select 1 from public.registros r where r.id = registro_id and r.perfil_id = auth.uid()));

-- Check-ins
create policy checkins_ler on public.checkins for select to authenticated
  using (perfil_id = auth.uid() or public.eh_equipe());
create policy checkins_criar on public.checkins for insert to authenticated
  with check (perfil_id = auth.uid() and exists (
    select 1 from public.inscricoes i where i.campanha_id = checkins.campanha_id and i.perfil_id = auth.uid() and i.status = 'ativa'));
create policy checkins_editar on public.checkins for update to authenticated
  using (perfil_id = auth.uid()) with check (perfil_id = auth.uid());

-- Consentimentos: cada nova escolha é uma nova linha (histórico).
create policy consent_ler on public.consentimentos for select to authenticated
  using (perfil_id = auth.uid() or public.eh_equipe());
create policy consent_criar on public.consentimentos for insert to authenticated
  with check (perfil_id = auth.uid());

-- Caixinha: participante vê as próprias (inclusive anônimas) e o mural; equipe vê tudo, sem autoria das anônimas.
create policy caixinha_ler on public.caixinha for select to authenticated
  using (
    public.eh_equipe()
    or autor_id = auth.uid()
    or exists (select 1 from public.caixinha_autoria a where a.mensagem_id = id and a.autor_id = auth.uid())
    or (status = 'respondida' and publica)
  );
create policy caixinha_editar on public.caixinha for update to authenticated
  using (public.eh_equipe()) with check (public.eh_equipe());
-- Inserção só pela função enviar_caixinha().

create policy autoria_dona on public.caixinha_autoria for select to authenticated
  using (autor_id = auth.uid());

create policy caixinha_hist_ler on public.caixinha_historico for select to authenticated
  using (public.eh_equipe());

-- Métricas e auditoria
create policy cta_criar on public.cta_cliques for insert to authenticated
  with check (perfil_id = auth.uid());
create policy cta_ler on public.cta_cliques for select to authenticated
  using (public.eh_equipe());

create policy alteracoes_ler on public.alteracoes for select to authenticated using (public.eh_equipe());
create policy alteracoes_criar on public.alteracoes for insert to authenticated
  with check (public.eh_equipe() and por = auth.uid());

-- Funções: liberar só para usuárias logadas.
revoke execute on function public.inscrever(text) from public, anon;
revoke execute on function public.revisar_registro(uuid, boolean, text) from public, anon;
revoke execute on function public.enviar_caixinha(uuid, int, text, text, boolean) from public, anon;
revoke execute on function public.definir_papel(text, public.papel_t) from public, anon;
grant execute on function public.inscrever(text) to authenticated;
grant execute on function public.revisar_registro(uuid, boolean, text) to authenticated;
grant execute on function public.enviar_caixinha(uuid, int, text, text, boolean) to authenticated;
grant execute on function public.definir_papel(text, public.papel_t) to authenticated;
