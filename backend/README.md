# Elucia Backend

Django 4.2 REST API powering the Elucia RAG pipeline — OpenAI embeddings stored in Pinecone, retrieved at query time, and fed to `gpt-4o-mini` for manual-grounded answers.

Deployed on **Railway** (`main` branch auto-deploys).

---

## Stack

| | |
|---|---|
| Framework | Django 4.2 + Django REST Framework |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Vector store | Pinecone (cosine similarity, 1536 dimensions) |
| Embeddings | OpenAI `text-embedding-3-small` |
| Completions | OpenAI `gpt-4o-mini` |
| PDF processing | pdfplumber + PyPDF2 |

---

## Environment variables

All variables live in `backend/.env`. The file is gitignored — never commit it.

### Required

| Variable | Description |
|---|---|
| `SECRET_KEY` | Django secret key — generate with `python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"` |
| `DJANGO_SETTINGS_MODULE` | `elucia.settings.development` locally, `elucia.settings.production` on Railway |
| `DB_NAME` | PostgreSQL database name |
| `DB_USER` | PostgreSQL user |
| `DB_PASSWORD` | PostgreSQL password |
| `DB_HOST` | PostgreSQL host (`localhost` locally, Supabase host in prod) |
| `DB_PORT` | PostgreSQL port (`5432`) |
| `OPENAI_API_KEY` | Used for embeddings (`text-embedding-3-small`) and completions (`gpt-4o-mini`) |
| `PINECONE_API_KEY` | Pinecone API key |
| `PINECONE_ENVIRONMENT` | Pinecone environment region |
| `PINECONE_INDEX_NAME` | Pinecone index name — must match the index created below (`elucia-manuals`) |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase anon or service key |

### Deferred (not required)

| Variable | Notes |
|---|---|
| `STRIPE_SECRET_KEY` | Payments deferred to future version |
| `STRIPE_WEBHOOK_SECRET` | Payments deferred |
| `REDIS_URL` | Celery installed but async tasks not active |

---

## Pinecone index setup

Create the index in the [Pinecone dashboard](https://app.pinecone.io) before ingesting:

| Setting | Value |
|---|---|
| Index name | `elucia-manuals` |
| Dimensions | `1536` |
| Metric | cosine |
| Type | Serverless |

Each instrument gets its own namespace: `manual-<instrument_id>`.

---

## Local setup

### 1. Create virtual environment

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements/base.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# edit .env with your keys
export DJANGO_SETTINGS_MODULE=elucia.settings.development
```

### 3. Create the database

```bash
psql -U postgres -c "CREATE USER elucia_user WITH PASSWORD 'your_password';"
psql -U postgres -c "CREATE DATABASE elucia_dev OWNER elucia_user;"
```

Or point `DB_*` vars at your Supabase connection string directly.

### 4. Run migrations

```bash
python manage.py migrate
```

### 5. Start the server

```bash
python manage.py runserver
# → http://localhost:8000/api/
# → http://localhost:8000/admin/
```

---

## Manual ingestion

Ingestion: extract PDF text → chunk to ~500 tokens → embed with `text-embedding-3-small` → upsert to Pinecone.

### Step 1 — Create the instrument record

Use Django Admin at `/admin/manuals/manual/add/` or the shell:

```bash
python manage.py shell
```

```python
from apps.manuals.models import Manual

Manual.objects.create(
    name="Grandmother",
    manufacturer="Moog",
    category="synth",
    pdf_path="../manuals/Moog/Grandmother_ManualV2.pdf",
)
```

Note the `id` — needed for step 2.

### Step 2 — Run the ingest command

```bash
python manage.py ingest_manual <id> path/to/manual.pdf
```

Logs progress at `INFO` level. Each manual takes 2–5 minutes depending on page count. Re-running the same `manual_id` is safe — it overwrites existing vectors in the namespace.

---

## API reference

Base URL: `http://localhost:8000/api/`

### Auth

| Method | Path | Auth |
|---|---|---|
| `POST` | `/api/auth/register/` | None |
| `POST` | `/api/auth/login/` | None |
| `POST` | `/api/auth/logout/` | Required |
| `GET` | `/api/users/me/` | Required |

### Instruments / Manuals

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/manuals/` | List — supports `?category=synth`, `?manufacturer=Moog` |
| `GET` | `/api/manuals/:id/` | Detail |

### Conversations & chat

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/conversations/` | User's conversations |
| `POST` | `/api/conversations/` | `{ "manual": <id>, "title": "..." }` |
| `GET` | `/api/conversations/:id/` | With messages |
| `DELETE` | `/api/conversations/:id/` | |
| `POST` | `/api/conversations/:id/messages/` | Triggers RAG pipeline — `{ "content": "..." }` |

---

## Project structure

```
backend/
├── apps/
│   ├── accounts/           # User auth + UserProfile
│   ├── manuals/            # Manual model + ingest_manual management command
│   ├── chat/               # Conversation + Message models, chat endpoint
│   ├── rag/                # PDF processor, chunker, OpenAI + Pinecone clients, query pipeline
│   └── payments/           # Stub — deferred
├── elucia/
│   └── settings/
│       ├── base.py
│       ├── development.py
│       └── production.py   # SECURE_PROXY_SSL_HEADER set for Railway
├── requirements/
│   ├── base.txt
│   └── development.txt
└── .env                    # Gitignored
```

---

## RAG pipeline

```
User question
  └─ text-embedding-3-small  →  1536-dim vector
       └─ Pinecone query (top 6, namespace=manual-<id>)
            └─ Retrieved chunks (page + section metadata)
                 └─ gpt-4o-mini (system prompt + cited context)
                      └─ Answer saved to Message, returned in response
```

Swap `gpt-4o-mini` → `gpt-4o` in `apps/rag/query_pipeline.py` if answer quality needs improvement.
