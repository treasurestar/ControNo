-- 20260209132458_init.sql
-- ControNo base schema (Supabase Auth + RLS)

create extension if not exists "pgcrypto";

create type public.user_role as enum ('admin', 'user');

create table public.units (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    created_at timestamptz not null default now()
);

create table public.profiles (
    id uuid not null references auth.users(id) on delete cascade,
    name text,
    email text unique,
    unit_id uuid references public.units(id) on delete set null,
    role public.user_role not null default 'user',
    created_at timestamptz not null default now(),
    primary key (id)
);

create table public.products (
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

create or replace function public.set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

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

alter table public.units enable row level security;
alter table public.profiles enable row level security;
alter table public.products enable row level security;

-- Profiles: each user can see/update only their own profile
create policy profiles_select_own
on public.profiles for select
using (auth.uid() is not null and id = auth.uid());

create policy profiles_update_own
on public.profiles for update
using (auth.uid() is not null and id = auth.uid());

-- Products: admin sees all, user sees only their unit
create policy products_select
on public.products for select
using (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
        and (p.role = 'admin' or p.unit_id = products.unit_id)
    )
);

create policy products_insert
on public.products for insert
with check (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
        and (p.role = 'admin' or p.unit_id = products.unit_id)
    )
);

create policy products_update
on public.products for update
using (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
        and (p.role = 'admin' or p.unit_id = products.unit_id)
    )
);

create policy products_delete
on public.products for delete
using (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid()
        and (p.role = 'admin' or p.unit_id = products.unit_id)
    )
);

-- Auto-create profile on auth user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, email, role)
    values (new.id, new.email, 'user')
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
