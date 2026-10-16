-- Exclusão de cadastro pelo admin (painel › Acessos e senhas).
-- Apaga a conta de login e tudo que depende dela (perfil, inscrição, registros, check-ins,
-- consentimentos, cliques, autoria da caixinha). Perguntas da caixinha que já estão no
-- mural continuam lá, sem autora; as demais são apagadas.
-- As fotos de comprovação ficam no Storage: o app as apaga logo depois, com a política abaixo.

-- Durante a exclusão, o banco precisa poder desvincular a autora (normalmente proibido).
create or replace function public.proteger_caixinha()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if current_setting('app.excluindo', true) = '1' then
    return new;
  end if;
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

create or replace function public.excluir_cadastro(p_email text)
returns uuid
language plpgsql security definer
set search_path = public, auth
as $$
declare
  alvo uuid;
  papel_alvo public.papel_t;
  camp uuid;
begin
  if not public.eh_admin() then
    raise exception 'Somente admin exclui cadastros';
  end if;

  select u.id, p.papel into alvo, papel_alvo
  from auth.users u left join public.perfis p on p.id = u.id
  where lower(u.email) = lower(trim(p_email));

  if alvo is null then
    raise exception 'Nenhuma conta com este e-mail';
  end if;
  if alvo = auth.uid() then
    raise exception 'Você não pode excluir a sua própria conta';
  end if;

  perform set_config('app.excluindo', '1', true);
  perform set_config('app.revisando', '1', true);

  -- Caixinha: o que está no mural fica, sem autora; o resto sai.
  delete from public.caixinha c
   where not c.publica
     and (c.autor_id = alvo or exists (select 1 from public.caixinha_autoria a where a.mensagem_id = c.id and a.autor_id = alvo));
  update public.caixinha set autor_id = null where autor_id = alvo;

  -- Referências que não apagam em cascata (trabalho feito por alguém da equipe).
  update public.registros set revisado_por = null where revisado_por = alvo;
  update public.conteudos_nelly set aprovado_por = null where aprovado_por = alvo;

  -- Anotação no histórico, sem dados pessoais.
  select coalesce(
    (select i.campanha_id from public.inscricoes i where i.perfil_id = alvo limit 1),
    (select c.id from public.campanhas c where c.ativa order by c.criado_em limit 1)
  ) into camp;
  if camp is not null then
    insert into public.alteracoes (campanha_id, dia, por, resumo)
    values (camp, null, auth.uid(), 'Cadastro excluído (' || coalesce(papel_alvo::text, 'participante') || ')');
  end if;

  -- A conta de login: perfil e dados ligados saem em cascata.
  delete from auth.users where id = alvo;
  return alvo;
end $$;

revoke execute on function public.excluir_cadastro(text) from public, anon;
grant execute on function public.excluir_cadastro(text) to authenticated;

-- Admin apaga as fotos de comprovação de um cadastro excluído.
create policy evidencias_apagar_admin on storage.objects for delete to authenticated
  using (bucket_id = 'evidencias' and public.eh_admin());
