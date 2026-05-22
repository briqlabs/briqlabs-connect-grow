
-- Business profiles table
create table public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  business_name text not null,
  business_type text not null,
  business_info text,
  file_path text,
  file_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.business_profiles enable row level security;

create policy "Users view own business profile"
  on public.business_profiles for select
  using (auth.uid() = user_id);

create policy "Users insert own business profile"
  on public.business_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users update own business profile"
  on public.business_profiles for update
  using (auth.uid() = user_id);

create trigger business_profiles_set_updated_at
  before update on public.business_profiles
  for each row execute function public.set_updated_at();

-- Private storage bucket for uploaded brochures / menus
insert into storage.buckets (id, name, public)
values ('business-assets', 'business-assets', false);

create policy "Users read own business assets"
  on storage.objects for select
  using (bucket_id = 'business-assets' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users upload own business assets"
  on storage.objects for insert
  with check (bucket_id = 'business-assets' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users update own business assets"
  on storage.objects for update
  using (bucket_id = 'business-assets' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users delete own business assets"
  on storage.objects for delete
  using (bucket_id = 'business-assets' and auth.uid()::text = (storage.foldername(name))[1]);
