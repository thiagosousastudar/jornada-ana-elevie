-- Quem é da equipe e também participa (ex.: a administradora testando o app) pode ter o próprio
-- envio revisado. A revisão continua passando só pela função revisar_registro().

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
         motivo_ajuste = case when p_aprovar then null else trim(p_motivo) end
   where id = p_registro and status = 'aguardando_revisao';
  if not found then raise exception 'Registro não está aguardando revisão'; end if;
end $$;
