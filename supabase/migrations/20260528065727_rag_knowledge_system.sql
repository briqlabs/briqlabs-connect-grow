create extension if not exists vector;

create table if not exists public.knowledge_documents (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  source_type text not null default 'plain_text',
  source_url text,
  raw_content text not null,
  created_at timestamptz not null default now(),
  constraint knowledge_documents_source_type_check
    check (source_type in ('plain_text', 'faq', 'business_profile', 'website', 'website_content', 'file', 'manual'))
);

create table if not exists public.knowledge_chunks (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references auth.users(id) on delete cascade,
  document_id uuid not null references public.knowledge_documents(id) on delete cascade,
  chunk_text text not null,
  embedding vector(768) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references auth.users(id) on delete cascade,
  customer_phone text not null,
  role text not null,
  message text not null,
  created_at timestamptz not null default now(),
  constraint chat_messages_role_check check (role in ('user', 'assistant', 'system'))
);

create table if not exists public.ai_eval_logs (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references auth.users(id) on delete cascade,
  customer_phone text,
  question text not null,
  retrieved_chunks jsonb not null default '[]'::jsonb,
  generated_answer text not null,
  faithfulness_score double precision,
  retrieval_score double precision,
  latency_ms integer not null,
  created_at timestamptz not null default now()
);

grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on public.knowledge_documents to authenticated, service_role;
grant select, insert, update, delete on public.knowledge_chunks to authenticated, service_role;
grant select, insert on public.chat_messages to authenticated, service_role;
grant select, insert on public.ai_eval_logs to authenticated, service_role;

alter table public.knowledge_documents enable row level security;
alter table public.knowledge_chunks enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ai_eval_logs enable row level security;

create policy "Users view own knowledge documents"
  on public.knowledge_documents for select
  using (auth.uid() = business_id);

create policy "Users insert own knowledge documents"
  on public.knowledge_documents for insert
  with check (auth.uid() = business_id);

create policy "Users update own knowledge documents"
  on public.knowledge_documents for update
  using (auth.uid() = business_id)
  with check (auth.uid() = business_id);

create policy "Users delete own knowledge documents"
  on public.knowledge_documents for delete
  using (auth.uid() = business_id);

create policy "Users view own knowledge chunks"
  on public.knowledge_chunks for select
  using (auth.uid() = business_id);

create policy "Users insert own knowledge chunks"
  on public.knowledge_chunks for insert
  with check (auth.uid() = business_id);

create policy "Users update own knowledge chunks"
  on public.knowledge_chunks for update
  using (auth.uid() = business_id)
  with check (auth.uid() = business_id);

create policy "Users delete own knowledge chunks"
  on public.knowledge_chunks for delete
  using (auth.uid() = business_id);

create policy "Users view own chat messages"
  on public.chat_messages for select
  using (auth.uid() = business_id);

create policy "Users insert own chat messages"
  on public.chat_messages for insert
  with check (auth.uid() = business_id);

create policy "Users view own ai eval logs"
  on public.ai_eval_logs for select
  using (auth.uid() = business_id);

create index if not exists knowledge_documents_business_id_idx
  on public.knowledge_documents (business_id);

create index if not exists knowledge_documents_source_type_idx
  on public.knowledge_documents (source_type);

create index if not exists knowledge_documents_fts_idx
  on public.knowledge_documents
  using gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(raw_content, '')));

create index if not exists knowledge_chunks_business_id_idx
  on public.knowledge_chunks (business_id);

create index if not exists knowledge_chunks_document_id_idx
  on public.knowledge_chunks (document_id);

create index if not exists knowledge_chunks_embedding_hnsw_idx
  on public.knowledge_chunks
  using hnsw (embedding vector_cosine_ops);

create index if not exists knowledge_chunks_fts_idx
  on public.knowledge_chunks
  using gin (to_tsvector('english', chunk_text));

create index if not exists knowledge_chunks_metadata_gin_idx
  on public.knowledge_chunks using gin (metadata);

create index if not exists chat_messages_business_phone_created_idx
  on public.chat_messages (business_id, customer_phone, created_at desc);

create index if not exists ai_eval_logs_business_created_idx
  on public.ai_eval_logs (business_id, created_at desc);

create or replace function public.match_knowledge_chunks(
  query_embedding vector(768),
  match_threshold float,
  match_count int,
  business_id uuid
)
returns table (
  chunk_text text,
  similarity float,
  metadata jsonb
)
language sql
stable
set search_path = public
as $$
  select
    kc.chunk_text,
    1 - (kc.embedding <=> query_embedding) as similarity,
    kc.metadata
  from public.knowledge_chunks kc
  where kc.business_id = match_knowledge_chunks.business_id
    and 1 - (kc.embedding <=> query_embedding) >= match_threshold
  order by kc.embedding <=> query_embedding
  limit least(match_count, 50);
$$;

create or replace function public.hybrid_match_knowledge_chunks(
  query_embedding vector(768),
  query_text text,
  match_threshold float,
  match_count int,
  business_id uuid
)
returns table (
  id uuid,
  document_id uuid,
  chunk_text text,
  similarity float,
  text_rank float,
  combined_score float,
  metadata jsonb
)
language sql
stable
set search_path = public
as $$
  with query as (
    select websearch_to_tsquery('english', coalesce(query_text, '')) as tsq
  ),
  vector_matches as (
    select
      kc.id,
      kc.document_id,
      kc.chunk_text,
      1 - (kc.embedding <=> query_embedding) as similarity,
      0::float as text_rank,
      kc.metadata
    from public.knowledge_chunks kc
    where kc.business_id = hybrid_match_knowledge_chunks.business_id
      and 1 - (kc.embedding <=> query_embedding) >= match_threshold
    order by kc.embedding <=> query_embedding
    limit least(match_count * 4, 80)
  ),
  text_matches as (
    select
      kc.id,
      kc.document_id,
      kc.chunk_text,
      0::float as similarity,
      ts_rank_cd(to_tsvector('english', kc.chunk_text), query.tsq)::float as text_rank,
      kc.metadata
    from public.knowledge_chunks kc, query
    where kc.business_id = hybrid_match_knowledge_chunks.business_id
      and query.tsq @@ to_tsvector('english', kc.chunk_text)
    order by ts_rank_cd(to_tsvector('english', kc.chunk_text), query.tsq) desc
    limit least(match_count * 4, 80)
  ),
  unioned as (
    select * from vector_matches
    union all
    select * from text_matches
  ),
  grouped as (
    select
      u.id,
      u.document_id,
      max(u.chunk_text) as chunk_text,
      max(u.similarity) as similarity,
      max(u.text_rank) as text_rank,
      (jsonb_agg(u.metadata order by (u.similarity + u.text_rank) desc)->0) as metadata
    from unioned u
    group by u.id, u.document_id
  )
  select
    g.id,
    g.document_id,
    g.chunk_text,
    g.similarity,
    g.text_rank,
    (g.similarity * 0.75 + least(g.text_rank, 1) * 0.25)::float as combined_score,
    g.metadata
  from grouped g
  order by combined_score desc, similarity desc, text_rank desc
  limit least(match_count, 50);
$$;

grant execute on function public.match_knowledge_chunks(vector(768), float, int, uuid) to authenticated, service_role;
grant execute on function public.hybrid_match_knowledge_chunks(vector(768), text, float, int, uuid) to authenticated, service_role;
