-- 20260210130000_add_approval.sql
-- Adiciona sistema de aprovação de usuários pelo admin.
-- Usuários auto-cadastrados precisam ser aprovados antes de logar.

-- Adicionar coluna approved (padrão false)
alter table public.profiles
add column if not exists approved boolean not null default false;

-- Marcar todos os usuários existentes como aprovados
update public.profiles set approved = true;

-- Atualizar trigger: novos usuários auto-cadastrados entram como não aprovados
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, role, approved)
    values (new.id, new.email, 'user', false)
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer set search_path = public;
