-- Login por e-mail e senha. Quem esquece a senha fala com a equipe pelo WhatsApp;
-- a equipe gera uma senha provisória e a participante cria uma nova no próximo acesso.

alter table public.perfis add column if not exists trocar_senha boolean not null default false;
comment on column public.perfis.trocar_senha is 'true depois que a equipe redefine a senha: o app pede uma senha nova no próximo acesso.';

-- A própria pessoa limpa o aviso depois de criar a nova senha.
grant update (trocar_senha) on public.perfis to authenticated;

-- Equipe redefine a senha de participantes; a de alguém da equipe, só um admin.
create or replace function public.redefinir_senha(p_email text, p_senha text)
returns void
language plpgsql security definer
set search_path = public, extensions, auth
as $$
declare
  alvo uuid;
  papel_alvo public.papel_t;
begin
  if not public.eh_equipe() then
    raise exception 'Somente a equipe redefine senhas';
  end if;
  if char_length(coalesce(p_senha, '')) < 6 then
    raise exception 'A senha precisa ter pelo menos 6 caracteres';
  end if;

  select u.id, p.papel into alvo, papel_alvo
  from auth.users u left join public.perfis p on p.id = u.id
  where lower(u.email) = lower(trim(p_email));

  if alvo is null then
    raise exception 'Nenhuma conta com este e-mail';
  end if;
  if coalesce(papel_alvo, 'participante') <> 'participante' and not public.eh_admin() then
    raise exception 'Só um admin redefine a senha de alguém da equipe';
  end if;

  update auth.users
     set encrypted_password = extensions.crypt(p_senha, extensions.gen_salt('bf')),
         updated_at = now()
   where id = alvo;
  update public.perfis set trocar_senha = true where id = alvo;
end $$;

revoke execute on function public.redefinir_senha(text, text) from public, anon;
grant execute on function public.redefinir_senha(text, text) to authenticated;
