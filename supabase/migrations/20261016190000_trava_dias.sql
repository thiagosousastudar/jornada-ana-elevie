-- Trava dos dias encerrados (aprovada em 16/10/2026):
-- - Cada dia aceita registros e check-in até a liberação do dia seguinte (06:00, no fuso da campanha).
-- - Pedido de ajuste da equipe reabre só aquela tarefa por 24 horas (registros.ajuste_ate).
-- - Admin pode reabrir um dia para uma participante, como exceção (tabela reaberturas, 24 horas).
-- A regra vale no banco e usa o horário do servidor: trocar a hora do celular não reabre nada.

alter table public.registros add column if not exists ajuste_ate timestamptz;

create table public.reaberturas (
  id bigint generated always as identity primary key,
  campanha_id uuid not null references public.campanhas (id) on delete cascade,
  perfil_id uuid not null references public.perfis (id) on delete cascade,
  dia int not null check (dia between 1 and 21),
  ate timestamptz not null,
  motivo text not null check (char_length(motivo) between 1 and 300),
  por uuid references public.perfis (id) on delete set null,
  em timestamptz not null default now()
);
create index reaberturas_idx on public.reaberturas (perfil_id, campanha_id, dia);
alter table public.reaberturas enable row level security;
create policy reaberturas_ler on public.reaberturas for select to authenticated
  using (perfil_id = auth.uid() or public.eh_equipe());

-- Momento em que o dia fecha: a liberação do dia seguinte.
create or replace function public.dia_fecha_em(p_campanha uuid, p_dia int)
returns timestamptz language sql stable security definer set search_path = public as $$
  select ((c.inicio + p_dia)::timestamp + c.liberacao) at time zone c.fuso
  from public.campanhas c where c.id = p_campanha
$$;

create or replace function public.dia_aberto(p_perfil uuid, p_campanha uuid, p_dia int)
returns boolean language sql stable security definer set search_path = public as $$
  select now() < public.dia_fecha_em(p_campanha, p_dia)
      or exists (select 1 from public.reaberturas r
                  where r.perfil_id = p_perfil and r.campanha_id = p_campanha and r.dia = p_dia and r.ate > now())
$$;

create or replace function public.proteger_registro()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  t public.tarefas;
  d public.dias;
begin
  select * into t from public.tarefas where id = new.tarefa_id;

  -- Respostas de tarefas privadas nunca ficam nesta tabela.
  if t.privada then
    new.respostas := '{}'::jsonb;
  end if;

  -- Revisão feita pela função oficial (marcada só dentro da própria transação).
  if current_setting('app.revisando', true) = '1' then
    return new;
  end if;

  if public.eh_equipe() and new.perfil_id <> auth.uid() then
    return new;
  end if;

  if new.perfil_id <> auth.uid() then
    raise exception 'Sem permissão para este registro';
  end if;
  if not exists (
    select 1 from public.inscricoes i join public.dias dd on dd.campanha_id = i.campanha_id
    where dd.id = t.dia_id and i.perfil_id = auth.uid() and i.status = 'ativa'
  ) then
    raise exception 'Você não está inscrita nesta campanha';
  end if;

  -- Dia encerrado: só passa a correção pedida pela equipe, dentro das 24 horas.
  select * into d from public.dias where id = t.dia_id;
  if not public.dia_aberto(new.perfil_id, d.campanha_id, d.numero) then
    -- (ajuste_ate só existe enquanto a correção está pendente: precisa_ajuste ou rascunho dela)
    if not (tg_op = 'UPDATE' and old.ajuste_ate is not null and old.ajuste_ate > now()) then
      raise exception 'Este dia já foi encerrado. Não dá mais para registrar.';
    end if;
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
    -- O prazo do ajuste continua valendo enquanto a correção não for enviada (ex.: rascunho).
    new.ajuste_ate := case when new.status in ('precisa_ajuste', 'em_andamento') then old.ajuste_ate else null end;
  else
    new.revisado_por := null;
    new.revisado_em := null;
    new.motivo_ajuste := null;
    new.ajuste_ate := null;
  end if;
  new.enviado_em := now();
  return new;
end $$;

-- Pedido de ajuste abre 24 horas para a correção.
create or replace function public.revisar_registro(p_registro uuid, p_aprovar boolean, p_motivo text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.eh_equipe() then raise exception 'Somente a equipe revisa evidências'; end if;
  if not p_aprovar and coalesce(trim(p_motivo), '') = '' then
    raise exception 'Informe o que a participante precisa corrigir';
  end if;
  perform set_config('app.revisando', '1', true);
  update public.registros
     set status = case when p_aprovar then 'aprovada' else 'precisa_ajuste' end::public.status_registro_t,
         revisado_por = auth.uid(),
         revisado_em = now(),
         motivo_ajuste = case when p_aprovar then null else trim(p_motivo) end,
         ajuste_ate = case when p_aprovar then null else now() + interval '24 hours' end
   where id = p_registro and status = 'aguardando_revisao';
  if not found then raise exception 'Registro não está aguardando revisão'; end if;
end $$;

-- Check-in também trava com o dia.
create or replace function public.proteger_checkin()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if current_setting('app.revisando', true) = '1' then
    return new;
  end if;
  if public.eh_equipe() and new.perfil_id <> auth.uid() then
    return new;
  end if;
  if not public.dia_aberto(new.perfil_id, new.campanha_id, new.dia) then
    raise exception 'Este dia já foi encerrado. Não dá mais para responder o check-in.';
  end if;
  return new;
end $$;

drop trigger if exists proteger_checkin on public.checkins;
create trigger proteger_checkin
  before insert or update on public.checkins
  for each row execute function public.proteger_checkin();

-- Exceção: admin reabre um dia para uma participante por 24 horas (fica no histórico).
create or replace function public.reabrir_dia(p_perfil uuid, p_campanha uuid, p_dia int, p_motivo text)
returns timestamptz language plpgsql security definer set search_path = public as $$
declare
  limite timestamptz := now() + interval '24 hours';
begin
  if not public.eh_admin() then raise exception 'Somente admin reabre um dia'; end if;
  if coalesce(trim(p_motivo), '') = '' then raise exception 'Informe o motivo da reabertura'; end if;
  if not exists (select 1 from public.inscricoes where perfil_id = p_perfil and campanha_id = p_campanha) then
    raise exception 'Esta pessoa não está inscrita na campanha';
  end if;
  if now() < public.dia_fecha_em(p_campanha, p_dia) then
    raise exception 'O dia % ainda está aberto', p_dia;
  end if;
  insert into public.reaberturas (campanha_id, perfil_id, dia, ate, motivo, por)
  values (p_campanha, p_perfil, p_dia, limite, trim(p_motivo), auth.uid());
  insert into public.alteracoes (campanha_id, dia, por, resumo)
  values (p_campanha, p_dia, auth.uid(), 'Reabriu o dia ' || p_dia || ' para uma participante por 24h: ' || trim(p_motivo));
  return limite;
end $$;

revoke execute on function public.reabrir_dia(uuid, uuid, int, text) from public, anon;
grant execute on function public.reabrir_dia(uuid, uuid, int, text) to authenticated;
