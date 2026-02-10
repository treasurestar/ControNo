-- 20260209140000_admin_policies.sql
-- Admin access for profiles + read access for units

create policy units_select_auth
on public.units for select
using (auth.uid() is not null);

create policy profiles_select_admin
on public.profiles for select
using (
    exists (
        select 1 from public.profiles p
        where p.id = auth.uid() and p.role = 'admin'
    )
);

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
