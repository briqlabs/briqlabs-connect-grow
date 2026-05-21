-- WhatsApp instances table
-- One row per user — tracks their Evolution API instance + connection state

create table public.whatsapp_instances (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  instance_name text not null,           -- unique name used in Evolution API (e.g. "user_<uid>")
  status       text not null default 'pending',
                                         -- pending | qr_ready | connected | disconnected
  connected_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint whatsapp_instances_user_id_unique unique (user_id)
);

alter table public.whatsapp_instances enable row level security;

create policy "Users can view own instance"
  on public.whatsapp_instances for select
  using (auth.uid() = user_id);

create policy "Users can insert own instance"
  on public.whatsapp_instances for insert
  with check (auth.uid() = user_id);

create policy "Users can update own instance"
  on public.whatsapp_instances for update
  using (auth.uid() = user_id);

-- Auto-update updated_at
create trigger whatsapp_instances_updated_at
  before update on public.whatsapp_instances
  for each row execute function public.set_updated_at();
