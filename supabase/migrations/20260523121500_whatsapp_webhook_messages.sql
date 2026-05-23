create table if not exists public.whatsapp_webhook_messages (
  id uuid primary key default gen_random_uuid(),
  event text,
  instance text,
  message_id text,
  phone_number text,
  message text,
  push_name text,
  from_me boolean not null default false,
  raw_timestamp bigint,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.whatsapp_webhook_messages enable row level security;

create policy "Authenticated users can read webhook messages"
  on public.whatsapp_webhook_messages
  for select
  to authenticated
  using (true);

-- Intentionally no insert/update/delete policy for client roles.
-- Writes are expected via service role in edge function.
