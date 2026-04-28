# Elucia Setup Guide

Local development setup from scratch.

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+ (or use Supabase as your local DB)
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key
- A [Pinecone](https://app.pinecone.io) account

---

## 1. Clone

```bash
git clone https://github.com/jdez23/Elucia.git
cd elucia
```

---

## 2. Pinecone index

Before ingesting any manuals, create the index in the [Pinecone dashboard](https://app.pinecone.io):

| Setting | Value |
|---|---|
| Name | `elucia-manuals` |
| Dimensions | `1536` |
| Metric | cosine |
| Type | Serverless |

---

## 3. Backend setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements/base.txt
```

Create `backend/.env`:

```bash
SECRET_KEY=                        # generate: python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
DJANGO_SETTINGS_MODULE=elucia.settings.development

# PostgreSQL — use Supabase connection string or local DB
DB_NAME=elucia_dev
DB_USER=elucia_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

OPENAI_API_KEY=sk-...
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=elucia-manuals

SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_KEY=your-supabase-anon-key
```

If using a local PostgreSQL instead of Supabase:

```bash
psql -U postgres -c "CREATE USER elucia_user WITH PASSWORD 'your_password';"
psql -U postgres -c "CREATE DATABASE elucia_dev OWNER elucia_user;"
```

Run migrations and start:

```bash
python manage.py migrate
python manage.py createsuperuser   # optional — for Django Admin
python manage.py runserver
# → http://localhost:8000/api/
```

---

## 4. Frontend setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Server-side only (not prefixed with NEXT_PUBLIC_)
OPENAI_API_KEY=sk-...
PINECONE_API_KEY=
PINECONE_INDEX=elucia-manuals
SUPABASE_SERVICE_ROLE_KEY=        # service role key from Supabase dashboard
```

Start:

```bash
npm run dev
# → http://localhost:3000
```

---

## 5. Ingest your first manual

```bash
cd backend
source venv/bin/activate
```

Create the instrument record via Django Admin (`/admin/manuals/manual/add/`) or the shell:

```python
python manage.py shell

from apps.manuals.models import Manual
m = Manual.objects.create(
    name="Grandmother",
    manufacturer="Moog",
    category="synth",
    pdf_path="../manuals/Moog/Grandmother_ManualV2.pdf",
)
print(m.id)   # note this ID
```

Run ingestion:

```bash
python manage.py ingest_manual <id> path/to/manual.pdf
```

Ingestion takes 2–5 minutes per manual (one OpenAI API call per chunk, batched to Pinecone in groups of 100).

---

## 6. Add the instrument to the frontend

1. Add the instrument image to `frontend/public/instruments/<slug>/`
2. Create `frontend/public/instruments/<slug>/hotspots.json`:
   ```json
   {
     "controls": [
       { "id": "filter-cutoff", "label": "Filter Cutoff", "x": 42.1, "y": 30.5, "r": 3.5 }
     ]
   }
   ```
3. Add `INSTRUMENT_CONTENT['<slug>']` to `frontend/lib/instrument-content.ts`
4. For development without the backend, add the instrument to `DUMMY_INSTRUMENTS` in `frontend/lib/dummy-data.ts`

---

## Troubleshooting

**Frontend shows dummy instruments only**
The Supabase connection is unavailable or `NEXT_PUBLIC_SUPABASE_URL` is not set. The app gracefully falls back to `DUMMY_INSTRUMENTS` — this is expected in dev if you skip Supabase setup.

**Chat returns no context / generic answers**
The instrument hasn't been ingested into Pinecone yet, or `PINECONE_INDEX` / `PINECONE_API_KEY` are wrong. The chat endpoint catches Pinecone errors and proceeds with no context rather than failing.

**`psycopg2` install fails on macOS**
```bash
brew install postgresql
pip install psycopg2-binary
```

**Supabase connection refused**
Check if your Supabase project is paused (free tier pauses after 1 week of inactivity). Resume it in the Supabase dashboard.

**Rate limit hit in chat**
The in-memory rate limiter allows 20 requests per 24 hours per user/IP. It resets on server restart. For persistent limits, swap to Upstash Redis in `frontend/app/api/chat/route.ts`.
