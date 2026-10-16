-- Fotos de comprovação (refeições, atividades e prints do Instagram).
-- Bucket privado: as imagens só abrem por link temporário (signed URL).
-- Caminho dos arquivos: {id da participante}/{codigo da tarefa}-{timestamp}.jpg
-- Fotos e medidas do corpo NUNCA são enviadas para cá.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evidencias', 'evidencias', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy evidencias_enviar_propria on storage.objects for insert to authenticated
  with check (bucket_id = 'evidencias' and (storage.foldername(name))[1] = auth.uid()::text);

create policy evidencias_ler on storage.objects for select to authenticated
  using (bucket_id = 'evidencias' and ((storage.foldername(name))[1] = auth.uid()::text or public.eh_equipe()));

create policy evidencias_trocar_propria on storage.objects for update to authenticated
  using (bucket_id = 'evidencias' and (storage.foldername(name))[1] = auth.uid()::text);

create policy evidencias_apagar_propria on storage.objects for delete to authenticated
  using (bucket_id = 'evidencias' and (storage.foldername(name))[1] = auth.uid()::text);
