-- ============================================================
-- ControNo - Migration Completa (Schema Único)
-- Execute este arquivo no SQL Editor do Supabase para criar
-- toda a estrutura do banco de dados do zero.
-- ============================================================

-- ========== EXTENSÕES ==========
create extension if not exists "pgcrypto";

-- ========== TIPOS ==========
do $$ begin
    create type public.user_role as enum ('admin', 'user');
exception when duplicate_object then null;
end $$;

-- ========== TABELAS ==========

-- Unidades
create table if not exists public.units (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    created_at timestamptz not null default now()
);

-- Perfis (vinculado ao auth.users do Supabase)
create table if not exists public.profiles (
    id uuid not null references auth.users(id) on delete cascade,
    name text,
    email text unique,
    unit_id uuid references public.units(id) on delete set null,
    role public.user_role not null default 'user',
    created_at timestamptz not null default now(),
    primary key (id)
);

-- Produtos
create table if not exists public.products (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    ingredients text,
    responsible text,
    weight text,
    fabrication date not null,
    expiration date not null,
    unit_id uuid references public.units(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    constraint products_expiration_after_fabrication
        check (expiration >= fabrication)
);

-- ========== FUNÇÕES ==========

-- Atualiza updated_at automaticamente ao editar produto
create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

-- Cria perfil automaticamente ao cadastrar usuário no Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, role)
    values (new.id, new.email, 'user')
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer set search_path = public;

-- ========== TRIGGERS ==========

-- Trigger: updated_at em products
drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

-- Trigger: auto-criar profile no signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ========== DADOS INICIAIS ==========

insert into public.units (name) values
    ('BDN Afogados'),
    ('BDN Boa Viagem'),
    ('BDN Guararapes'),
    ('BDN Olinda'),
    ('BDN Tacaruna'),
    ('BRG Boa Viagem'),
    ('BRG RioMar'),
    ('BRG Guararapes')
on conflict do nothing;

-- ========== ROW LEVEL SECURITY ==========

alter table public.units enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;

-- ===== Policies: UNITS =====

-- Qualquer usuário autenticado pode ver as unidades
drop policy if exists units_select_auth on public.units;
create policy units_select_auth
on public.units for select
using (auth.uid() is not null);

-- ===== Policies: PROFILES =====

-- Usuário vê o próprio perfil
drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
on public.profiles for select
using (auth.uid() is not null and id = auth.uid());

-- Usuário atualiza o próprio perfil
drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
on public.profiles for update
using (auth.uid() is not null and id = auth.uid());

-- Admin vê todos os perfis
drop policy if exists profiles_select_admin on public.profiles;
create policy profiles_select_admin
on public.profiles for select
using (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
    )
);

-- Admin atualiza qualquer perfil
drop policy if exists profiles_update_admin on public.profiles;
create policy profiles_update_admin
on public.profiles for update
using (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
    )
)
with check (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
    )
);

-- ===== Policies: PRODUCTS =====

-- Select: admin vê tudo, user vê só da sua unidade
drop policy if exists products_select on public.products;
create policy products_select
on public.products for select
using (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
        and (p.role = 'admin' or p.unit_id = products.unit_id)
    )
);

-- Insert: admin insere em qualquer unidade, user só na sua
drop policy if exists products_insert on public.products;
create policy products_insert
on public.products for insert
with check (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
        and (p.role = 'admin' or p.unit_id = products.unit_id)
    )
);

-- Update: admin edita qualquer, user só da sua unidade
drop policy if exists products_update on public.products;
create policy products_update
on public.products for update
using (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
        and (p.role = 'admin' or p.unit_id = products.unit_id)
    )
);

-- Delete: admin deleta qualquer, user só da sua unidade
drop policy if exists products_delete on public.products;
create policy products_delete
on public.products for delete
using (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
        and (p.role = 'admin' or p.unit_id = products.unit_id)
    )
);

-- ========== USUÁRIO ADMIN ==========
-- Cria o usuário admin no auth.users e o perfil com role 'admin'.
-- IMPORTANTE: Após rodar este SQL, altere a senha pelo painel do
-- Supabase (Authentication > Users) ou via API se necessário.
-- A senha padrão abaixo é temporária: Controno@2026

do $$
declare
    admin_uid uuid;
begin
    -- Cria usuário no auth.users (se ainda não existir)
    if not exists (select 1 from auth.users where email = 'admin@controno.com.br') then
        admin_uid := gen_random_uuid();

        insert into auth.users (
            id,
            instance_id,
            aud,
            role,
            email,
            encrypted_password,
            email_confirmed_at,
            raw_app_meta_data,
            raw_user_meta_data,
            created_at,
            updated_at,
            confirmation_token,
            recovery_token
        ) values (
            admin_uid,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            'admin@controno.com.br',
            crypt('Controno@2026', gen_salt('bf')),
            now(),
            '{"provider": "email", "providers": ["email"]}',
            '{"name": "Administrador"}',
            now(),
            now(),
            '',
            ''
        );

        -- Cria identidade de email para o usuário
        insert into auth.identities (
            id,
            user_id,
            provider_id,
            identity_data,
            provider,
            last_sign_in_at,
            created_at,
            updated_at
        ) values (
            admin_uid,
            admin_uid,
            'admin@controno.com.br',
            jsonb_build_object('sub', admin_uid::text, 'email', 'admin@controno.com.br'),
            'email',
            now(),
            now(),
            now()
        );

        -- Cria perfil admin
        insert into public.profiles (id, name, email, role)
        values (admin_uid, 'Administrador', 'admin@controno.com.br', 'admin')
        on conflict (id) do update set role = 'admin';
    end if;
end $$;
