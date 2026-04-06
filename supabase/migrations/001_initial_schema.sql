-- Enable pgvector
create extension if not exists vector;

-- Instruments
create table if not exists instruments (
  id           uuid primary key default gen_random_uuid(),
  slug         text unique not null,
  name         text not null,
  manufacturer text not null,
  category     text not null check (category in ('synth', 'drum_machine', 'sampler', 'groovebox', 'other')),
  description  text,
  image_path   text,
  manual_path  text,
  is_published boolean default false,
  created_at   timestamptz default now()
);

-- RAG document chunks with vector embeddings
create table if not exists document_chunks (
  id             uuid primary key default gen_random_uuid(),
  instrument_id  uuid references instruments(id) on delete cascade,
  content        text not null,
  embedding      vector(1536),
  chunk_index    int not null,
  section_title  text,
  page_start     int,
  page_end       int,
  metadata       jsonb default '{}'::jsonb,
  unique(instrument_id, chunk_index)
);

create index if not exists document_chunks_embedding_idx
  on document_chunks
  using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create index if not exists document_chunks_instrument_idx
  on document_chunks (instrument_id);

-- Chat sessions (one per user per instrument conversation)
create table if not exists chat_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references auth.users(id) on delete cascade,
  instrument_id uuid references instruments(id) on delete cascade,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists chat_sessions_user_idx on chat_sessions (user_id);

-- Chat messages
create table if not exists chat_messages (
  id                   uuid primary key default gen_random_uuid(),
  session_id           uuid references chat_sessions(id) on delete cascade,
  role                 text not null check (role in ('user', 'assistant')),
  content              text not null,
  highlighted_controls jsonb default '[]'::jsonb,
  sources              jsonb default '[]'::jsonb,
  created_at           timestamptz default now()
);

create index if not exists chat_messages_session_idx on chat_messages (session_id, created_at);

-- Row Level Security
alter table chat_sessions enable row level security;
alter table chat_messages enable row level security;

create policy "Users own their chat sessions"
  on chat_sessions for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users own their chat messages"
  on chat_messages for all
  using (
    session_id in (
      select id from chat_sessions where user_id = auth.uid()
    )
  );

-- Instruments are readable by anyone (anon or authenticated)
alter table instruments enable row level security;
create policy "Instruments are publicly readable"
  on instruments for select
  using (is_published = true);

alter table document_chunks enable row level security;
create policy "Chunks are readable by authenticated users"
  on document_chunks for select
  to authenticated
  using (true);

-- Cosine similarity search function
create or replace function match_chunks(
  query_embedding vector(1536),
  match_instrument_id uuid,
  match_count int default 5
)
returns table (
  id            uuid,
  content       text,
  section_title text,
  page_start    int,
  similarity    float
)
language sql stable as $$
  select
    id,
    content,
    section_title,
    page_start,
    1 - (embedding <=> query_embedding) as similarity
  from document_chunks
  where instrument_id = match_instrument_id
    and embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;

-- Seed instruments
insert into instruments (slug, name, manufacturer, category, description, image_path, manual_path, is_published)
values
  (
    'moog-grandmother',
    'Grandmother',
    'Moog',
    'synth',
    'A semi-modular analog synthesizer with a built-in spring reverb and an Arpeggiator/Sequencer. No patching required — just plug in and play.',
    '/instruments/moog-grandmother/main.jpg',
    'manuals/Moog/Grandmother_ManualV2.pdf',
    true
  ),
  (
    'akai-mpc-one',
    'MPC One',
    'AKAI',
    'sampler',
    'A standalone music production center with a 7-inch touchscreen, 16 velocity-sensitive pads, and deep sampling capabilities.',
    '/instruments/akai-mpc-one/main.jpg',
    'manuals/AKAI/MPC_One_Reference_Manual.pdf',
    true
  )
on conflict (slug) do nothing;
