-- Users (extends Supabase Auth users)
create table users (
  id uuid primary key references auth.users(id),
  plan_type text default 'free',
  created_at timestamp default now()
);

-- Manuals (each product manual)
create table manuals (
  id uuid primary key default uuid_generate_v4(),
  title text,
  brand text,
  category text,
  cover_image_url text,
  created_at timestamp default now()
);

-- Manual Chunks (individual content blocks with vector embeddings)
create table manual_chunks (
  id uuid primary key default uuid_generate_v4(),
  manual_id uuid references manuals(id),
  content text,
  page_number int,
  embedding vector(1536), -- OpenAI embedding size
  created_at timestamp default now()
);

-- Queries (user-submitted questions + AI responses)
create table queries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  manual_id uuid references manuals(id),
  question text,
  response text,
  created_at timestamp default now()
);

-- Patch Suggestions (Pro-only feature)
create table patch_suggestions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  input_description text,
  result text,
  created_at timestamp default now()
);

-- Workflow Guides (Pro-only feature)
create table workflow_guides (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  gear_type text,
  topic text,
  result text,
  created_at timestamp default now()
);
