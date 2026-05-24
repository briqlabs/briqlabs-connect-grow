-- AI bot configuration table for user-defined prompts
create table if not exists public.ai_bots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  prompt text not null,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.ai_bots enable row level security;

create policy "Users view own bots"
  on public.ai_bots for select
  using (auth.uid() = user_id);

create policy "Users insert own bots"
  on public.ai_bots for insert
  with check (auth.uid() = user_id);

create policy "Users update own bots"
  on public.ai_bots for update
  using (auth.uid() = user_id);

create policy "Users delete own bots"
  on public.ai_bots for delete
  using (auth.uid() = user_id);

create trigger ai_bots_set_updated_at
  before update on public.ai_bots
  for each row execute function public.set_updated_at();
