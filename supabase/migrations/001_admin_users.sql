create table if not exists public.admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  restaurant_id text not null,
  role text not null check (role in ('owner', 'admin', 'staff')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists admin_users_restaurant_id_idx
  on public.admin_users (restaurant_id);

create or replace function public.set_admin_users_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists admin_users_set_updated_at on public.admin_users;
create trigger admin_users_set_updated_at
before update on public.admin_users
for each row
execute function public.set_admin_users_updated_at();

alter table public.admin_users enable row level security;

grant select on public.admin_users to authenticated;
grant select, insert, update, delete on public.admin_users to service_role;

drop policy if exists "admin_users_select_self" on public.admin_users;
create policy "admin_users_select_self"
on public.admin_users
for select
to authenticated
using (id = auth.uid());

drop policy if exists "admin_users_select_same_restaurant_admin" on public.admin_users;
create policy "admin_users_select_same_restaurant_admin"
on public.admin_users
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users viewer
    where viewer.id = auth.uid()
      and viewer.restaurant_id = admin_users.restaurant_id
      and viewer.role in ('owner', 'admin')
  )
);
