-- Run in the Tokyo-family-travel-expenses project only after reviewing the
-- two Auth user IDs. No account is enrolled automatically.
create schema if not exists private;

create table if not exists public.trip_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (length(trim(display_name)) between 1 and 40),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create or replace function private.is_trip_member()
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.trip_members
    where user_id = (select auth.uid()) and active
  );
$$;

revoke all on function private.is_trip_member() from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.is_trip_member() to authenticated;

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references public.trip_members(user_id),
  occurred_on date not null,
  merchant text not null check (length(trim(merchant)) between 1 and 120),
  amount numeric(12,2) not null check (amount > 0),
  currency text not null check (currency in ('JPY', 'TWD')),
  category text not null check (category in ('food', 'transport', 'shopping', 'tickets', 'lodging', 'other')),
  sharing text not null check (sharing in ('shared', 'private')),
  payer_share_percent integer not null default 50 check (payer_share_percent between 0 and 100),
  note text not null default '' check (length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_occurred_on_idx on public.expenses (occurred_on desc);
create index if not exists expenses_created_by_idx on public.expenses (created_by);

alter table public.trip_members enable row level security;
alter table public.expenses enable row level security;

create policy "members can read trip members"
on public.trip_members for select to authenticated
using ((select private.is_trip_member()) and active);

create policy "members see shared and own private expenses"
on public.expenses for select to authenticated
using ((select private.is_trip_member()) and (sharing = 'shared' or created_by = (select auth.uid())));

create policy "members insert only own expenses"
on public.expenses for insert to authenticated
with check ((select private.is_trip_member()) and created_by = (select auth.uid()));

create policy "members delete only own expenses"
on public.expenses for delete to authenticated
using ((select private.is_trip_member()) and created_by = (select auth.uid()));

grant select on public.trip_members to authenticated;
grant select, insert, delete on public.expenses to authenticated;
revoke all on public.trip_members, public.expenses from anon;

-- This trip has exactly two named adults. After both have signed in once, enroll
-- them in the Supabase SQL Editor with the two Auth user IDs:
-- insert into public.trip_members (user_id, display_name) values
--   ('<FIRST_AUTH_USER_UUID>', '<FIRST_NAME>'),
--   ('<SECOND_AUTH_USER_UUID>', '<SECOND_NAME>');
