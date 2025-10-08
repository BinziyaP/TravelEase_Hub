-- Agency Registration and Approval System Setup for TravelEase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUIDs (either is fine; keep the one that works for you)
create extension if not exists pgcrypto;
create extension if not exists "uuid-ossp";

-- Agencies table (matches your frontend fields)
create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique,
  agency_name text not null,
  contact_person text not null,
  phone text not null,
  city text not null,
  state text not null,
  address text,
  business_license_number text not null unique,
  description text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  admin_notes text,
  admin_id uuid references auth.users(id),
  approved_at timestamptz,
  rejected_at timestamptz,
  -- license verification fields used by AuthContext.jsx
  license_verified boolean default false,
  license_verification_status text default 'pending' check (license_verification_status in ('pending','verified','failed','error')),
  license_verification_details jsonb,
  license_verified_at timestamptz,
  license_verification_error text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index if not exists idx_agencies_status on public.agencies(status);
create index if not exists idx_agencies_user_id on public.agencies(user_id);
create index if not exists idx_agencies_created_at on public.agencies(created_at);
create index if not exists idx_agencies_business_license on public.agencies(business_license_number);
create index if not exists idx_agencies_city_state on public.agencies(city, state);

-- updated_at trigger
create or replace function public.handle_agency_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists handle_agencies_updated_at on public.agencies;
create trigger handle_agencies_updated_at
  before update on public.agencies
  for each row execute function public.handle_agency_updated_at();

-- RLS (policies for users and admins)
alter table public.agencies enable row level security;

-- Clean up any old policies
do $$
begin
  if exists (select 1 from pg_policies where schemaname='public' and tablename='agencies') then
    drop policy if exists "agencies_self_select" on public.agencies;
    drop policy if exists "agencies_self_insert" on public.agencies;
    drop policy if exists "agencies_self_update" on public.agencies;
    drop policy if exists "agencies_admin_select" on public.agencies;
    drop policy if exists "agencies_admin_update" on public.agencies;
  end if;
end$$;

-- Authenticated user manages their own row
create policy "agencies_self_insert" on public.agencies
for insert to authenticated
with check (user_id = auth.uid());

create policy "agencies_self_select" on public.agencies
for select to authenticated
using (user_id = auth.uid());

create policy "agencies_self_update" on public.agencies
for update to authenticated
using (user_id = auth.uid());

-- Admins (JWT app_metadata.user_type = 'admin') can view/update all
create policy "agencies_admin_select" on public.agencies
for select to authenticated
using ((auth.jwt()->'app_metadata'->>'user_type') = 'admin');

create policy "agencies_admin_update" on public.agencies
for update to authenticated
using ((auth.jwt()->'app_metadata'->>'user_type') = 'admin');

-- RPC used by admin dashboards
create or replace function public.get_agency_stats()
returns json
language plpgsql
security definer
as $$
declare
  result json;
begin
  select json_build_object(
    'total', count(*),
    'pending', count(*) filter (where status = 'pending'),
    'approved', count(*) filter (where status = 'approved'),
    'rejected', count(*) filter (where status = 'rejected')
  ) into result
  from public.agencies;

  return result;
end;
$$;

grant usage on schema public to anon, authenticated;
grant select, insert, update on public.agencies to authenticated;
grant execute on function public.get_agency_stats() to authenticated;
