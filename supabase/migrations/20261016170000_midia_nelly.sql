-- Áudio e vídeo da Dra. Nelly (ex.: áudio do dia 2, vídeos dos dias 7, 14, 18 e 21).
-- Bucket privado: a equipe envia; as participantes só abrem a mídia de conteúdo APROVADO,
-- por link temporário. O caminho fica em conteudos_nelly.midia_url ({dia_id}/{audio|video}-{ts}.{ext}).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('conteudos', 'conteudos', false, 52428800, null)
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit;

create policy conteudos_enviar on storage.objects for insert to authenticated
  with check (bucket_id = 'conteudos' and public.eh_equipe());
create policy conteudos_trocar on storage.objects for update to authenticated
  using (bucket_id = 'conteudos' and public.eh_equipe());
create policy conteudos_apagar on storage.objects for delete to authenticated
  using (bucket_id = 'conteudos' and public.eh_equipe());
create policy conteudos_ler on storage.objects for select to authenticated
  using (bucket_id = 'conteudos' and (
    public.eh_equipe()
    or exists (select 1 from public.conteudos_nelly c where c.midia_url = storage.objects.name and c.status = 'aprovado')
  ));

-- Trocar a mídia também conta como edição: se não for a Dra. Nelly (ou admin), volta para revisão.
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
  -- Qualquer edição de texto ou de mídia depois de aprovado volta para revisão.
  if tg_op = 'UPDATE' and old.status = 'aprovado' and new.status = 'aprovado'
     and (new.titulo, new.resumo, coalesce(new.fecho, ''), coalesce(new.midia_url, ''))
         is distinct from (old.titulo, old.resumo, coalesce(old.fecho, ''), coalesce(old.midia_url, ''))
     and not public.eh_nelly() then
    new.status := 'em_revisao';
    new.aprovado_por := null;
    new.aprovado_em := null;
  end if;
  new.atualizado_em := now();
  return new;
end $$;
