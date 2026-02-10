-- 20260210120000_fix_rls_recursion.sql
-- Fix: infinite recursion detected in policy for relation "profiles"
--
-- Problem: profiles admin policies query the profiles table itself,
-- which triggers RLS evaluation again, causing infinite recursion.
-- Solution: use SECURITY DEFINER functions that bypass RLS.

-- ========== HELPER FUNCTIONS (bypass RLS) ==========

-- Check if the current user is an admin
create or replace function public.is_admin()
returns boolean as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid() and role = 'admin'
    );
$$ language sql security definer set search_path = public;

-- Get the current user's unit_id
create or replace function public.get_my_unit_id()
returns uuid as $$
    select unit_id from public.profiles
    where id = auth.uid();
$$ language sql security definer set search_path = public;

-- ========== FIX PROFILES POLICIES ==========

-- Drop the recursive policies
drop policy if exists profiles_select_admin on public.profiles;
drop policy if exists profiles_update_admin on public.profiles;
drop policy if exists profiles_select_own on public.profiles;
drop policy if exists profiles_update_own on public.profiles;

-- Recreate: user sees own profile OR admin sees all
create policy profiles_select
on public.profiles for select
using (
    id = auth.uid() or public.is_admin()
);

-- Recreate: user updates own profile OR admin updates all
create policy profiles_update
on public.profiles for update
using (
    id = auth.uid() or public.is_admin()
)
with check (
    id = auth.uid() or public.is_admin()
);

-- ========== FIX PRODUCTS POLICIES ==========

-- Drop the old policies that also queried profiles directly
drop policy if exists products_select on public.products;
drop policy if exists products_insert on public.products;
drop policy if exists products_update on public.products;
drop policy if exists products_delete on public.products;

-- Recreate: admin sees all, user sees only their unit
create policy products_select
on public.products for select
using (
    public.is_admin() or unit_id = public.get_my_unit_id()
);

create policy products_insert
on public.products for insert
with check (
    public.is_admin() or unit_id = public.get_my_unit_id()
);

create policy products_update
on public.products for update
using (
    public.is_admin() or unit_id = public.get_my_unit_id()
);

create policy products_delete
on public.products for delete
using (
    public.is_admin() or unit_id = public.get_my_unit_id()
);
