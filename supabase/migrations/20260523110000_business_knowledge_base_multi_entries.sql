-- Multi-entry business knowledge base tables
create table if not exists public.business_information (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  description text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_information enable row level security;

create policy "Users view own business information"
  on public.business_information for select
  using (auth.uid() = user_id);

create policy "Users insert own business information"
  on public.business_information for insert
  with check (auth.uid() = user_id);

create policy "Users delete own business information"
  on public.business_information for delete
  using (auth.uid() = user_id);

create policy "Users update own business information"
  on public.business_information for update
  using (auth.uid() = user_id);

create trigger business_information_set_updated_at
  before update on public.business_information
  for each row execute function public.set_updated_at();

create table if not exists public.business_files (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  file_name text not null,
  file_path text not null unique,
  mime_type text,
  file_size bigint,
  created_at timestamptz not null default now()
);

alter table public.business_files enable row level security;

create policy "Users view own business files"
  on public.business_files for select
  using (auth.uid() = user_id);

create policy "Users insert own business files"
  on public.business_files for insert
  with check (auth.uid() = user_id);

create policy "Users delete own business files"
  on public.business_files for delete
  using (auth.uid() = user_id);

-- Migrate existing single-row data into multi-entry tables
insert into public.business_information (user_id, name, description, created_at, updated_at)
select user_id, business_name, coalesce(business_info, business_type), created_at, updated_at
from public.business_profiles
where business_name is not null
  and coalesce(business_info, '') <> ''
on conflict do nothing;

insert into public.business_files (user_id, file_name, file_path, created_at)
select user_id, file_name, file_path, created_at
from public.business_profiles
where file_name is not null and file_path is not null
on conflict (file_path) do nothing;
