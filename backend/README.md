# Elucia Backend

Django 4.2 REST API powering AI-assisted music gear manual chat via a RAG pipeline (OpenAI embeddings + Pinecone vector search + GPT-4o-mini).

---

## Environment Variables

All variables live in `backend/.env`. The file is gitignored — never commit it.

### Required

| Variable | Description | Status |
|---|---|---|
| `SECRET_KEY` | Django secret key | ⚠️ Replace the current value before any production deploy |
| `DJANGO_SETTINGS_MODULE` | Settings module to load | Set to `elucia.settings.development` |
| `DB_NAME` | PostgreSQL database name | Set |
| `DB_USER` | PostgreSQL user | Set |
| `DB_PASSWORD` | PostgreSQL password | Set |
| `DB_HOST` | PostgreSQL host | Set (`localhost`) |
| `DB_PORT` | PostgreSQL port | Set (`5432`) |
| `OPENAI_API_KEY` | OpenAI API key — used for embeddings (`text-embedding-3-small`) and chat completions (`gpt-4o-mini`) | Set |
| `PINECONE_API_KEY` | Pinecone API key | Set |
| `PINECONE_ENVIRONMENT` | Pinecone environment region | Set |
| `PINECONE_INDEX_NAME` | Pinecone index name | Set (`elucia-manuals`) |

### Not Required for This Version

| Variable | Description |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe — payments deferred |
| `STRIPE_WEBHOOK_SECRET` | Stripe — payments deferred |
| `STRIPE_PRICE_ID` | Stripe — payments deferred |
| `REDIS_URL` | Redis / Celery — async tasks not active |

### Generating a Production `SECRET_KEY`

```bash
python3 -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
```

---

## Pinecone Index Setup

The Pinecone index must exist before ingesting manuals. Create it in the Pinecone dashboard with these settings:

| Setting | Value |
|---|---|
| Index name | `elucia-manuals` (must match `PINECONE_INDEX_NAME`) |
| Dimensions | `1536` |
| Metric | `cosine` |
| Type | Serverless |

---

## Local Setup

### Prerequisites

- Python 3.11+ (the existing venv was built on Python 3.9 which has been removed — see below)
- PostgreSQL running locally
- A Pinecone account with the index created above

### 1. Recreate the Virtual Environment

The existing `venv/` has broken symlinks because Python 3.9 is no longer installed. Recreate it:

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements/development.txt
```

### 2. Configure Environment

Copy `.env.example` (or create `.env`) in `backend/` with the variables listed above. All required keys are already present in the current `.env`.

### 3. Create the Database

```bash
psql -U postgres -c "CREATE USER elucia_user WITH PASSWORD 'your_password';"
psql -U postgres -c "CREATE DATABASE elucia_dev OWNER elucia_user;"
```

### 4. Run Migrations

```bash
cd backend
source venv/bin/activate
python manage.py migrate
```

### 5. Create a Superuser (for Django Admin)

```bash
python manage.py createsuperuser
```

### 6. Start the Development Server

```bash
python manage.py runserver
```

API available at `http://localhost:8000/api/`  
Admin at `http://localhost:8000/admin/`

---

## Ingesting Manuals

Ingestion: extract PDF text → chunk to ~500 tokens → embed with OpenAI `text-embedding-3-small` → upsert to Pinecone.

### Step 1 — Create the Manual record in the database

Use the Django Admin at `/admin/manuals/manual/add/` or the shell:

```bash
python manage.py shell
```

```python
from apps.manuals.models import Manual

Manual.objects.create(
    name="Digitakt",
    manufacturer="Elektron",
    category="drum_machine",
    pdf_path="../manuals/Elektron/Digitakt_Manual.pdf",
)

Manual.objects.create(
    name="Grandmother",
    manufacturer="Moog",
    category="synth",
    pdf_path="../manuals/Moog/Grandmother_ManualV2.pdf",
)

Manual.objects.create(
    name="MPC One",
    manufacturer="Akai",
    category="sampler",
    pdf_path="../manuals/AKAI/MPC/MPC_ONE.pdf",
)
```

Note the `id` of each record — you'll need it for the ingest command.

### Step 2 — Run the ingest command

PDFs are located at `../manuals/` relative to `backend/`.

```bash
# Elektron Digitakt (replace <id> with the database ID from step 1)
python manage.py ingest_manual <id> ../manuals/Elektron/Digitakt_Manual.pdf

# Moog Grandmother
python manage.py ingest_manual <id> ../manuals/Moog/Grandmother_ManualV2.pdf

# Akai MPC One
python manage.py ingest_manual <id> ../manuals/AKAI/MPC/MPC_ONE.pdf
```

Ingestion logs progress at `INFO` level. Each manual takes 2–5 minutes depending on page count (one OpenAI embedding call per chunk, rate-limited to Pinecone in batches of 100).

### Re-ingesting a Manual

The ingest command overwrites vectors in the same Pinecone namespace (`manual-<id>`). Re-running it on the same `manual_id` is safe — it will replace existing vectors.

---

## API Reference

Base URL: `http://localhost:8000/api/`

### Auth

| Method | Path | Description | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register/` | Register a new user | None |
| `POST` | `/api/auth/login/` | Login (session cookie) | None |
| `POST` | `/api/auth/logout/` | Logout | Required |
| `GET` | `/api/users/me/` | Current user profile | Required |

**Register**
```json
POST /api/auth/register/
{ "username": "jesse", "email": "jesse@example.com", "password": "...", "password_confirm": "..." }
```

**Login**
```json
POST /api/auth/login/
{ "username": "jesse", "password": "..." }
```

---

### Manuals

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/manuals/` | List all manuals | None |
| `GET` | `/api/manuals/:id/` | Manual detail | None |

Query params for list: `?category=synth`, `?manufacturer=Moog`, `?is_premium=false`, `?search=grandmother`

---

### Conversations & Chat

| Method | Path | Description | Auth |
|---|---|---|---|
| `GET` | `/api/conversations/` | List user's conversations | Optional (session fallback) |
| `POST` | `/api/conversations/` | Create new conversation | Optional |
| `GET` | `/api/conversations/:id/` | Conversation detail with messages | Optional |
| `DELETE` | `/api/conversations/:id/` | Delete conversation | Optional |
| `POST` | `/api/conversations/:id/messages/` | Send a message, get AI response | Optional |

**Create a conversation linked to a manual**
```json
POST /api/conversations/
{ "manual": 1, "title": "Digitakt questions" }
```

**Send a message (triggers RAG pipeline)**
```json
POST /api/conversations/1/messages/
{ "content": "How do I set up a basic beat on the Digitakt?" }
```

Response:
```json
{
  "user_message": { "id": 1, "role": "user", "content": "...", "created_at": "..." },
  "ai_message":   { "id": 2, "role": "assistant", "content": "...", "created_at": "..." }
}
```

The `ai_message.content` is grounded in the manual. If the manual hasn't been ingested yet, the response will say so explicitly.

---

## RAG Pipeline

```
User question
  └─ OpenAI text-embedding-3-small  →  1536-dim vector
       └─ Pinecone query (top 6, namespace=manual-<id>)
            └─ Retrieved chunks (with page numbers in metadata)
                 └─ GPT-4o-mini (system prompt + page-cited context)
                      └─ Answer saved to Message, returned in response
```

Model choices:
- **Embedding:** `text-embedding-3-small` — same model used at ingest time; changing it requires re-ingesting all manuals
- **Completion:** `gpt-4o-mini` — cost-effective for factual Q&A; swap to `gpt-4o` in `query_pipeline.py` if answer quality needs improvement

---

## Project Structure

```
backend/
├── apps/
│   ├── accounts/        # User auth, UserProfile, UsageLog
│   ├── manuals/         # Manual model + CRUD API
│   │   └── management/commands/ingest_manual.py
│   ├── chat/            # Conversation, Message, RAG-wired chat endpoint
│   ├── rag/             # PDF processor, chunker, OpenAI client, Pinecone client, query pipeline
│   │   ├── ingest.py            # ManualIngestion orchestrator
│   │   ├── query_pipeline.py    # RAGQueryPipeline
│   │   ├── openai_client.py     # OpenAI wrapper
│   │   └── pinecone_client.py   # Pinecone wrapper
│   └── payments/        # Empty — deferred for future version
├── elucia/
│   └── settings/
│       ├── base.py          # Shared config
│       └── development.py   # PostgreSQL + external service keys
├── requirements/
│   ├── base.txt
│   └── development.txt
└── .env                 # Gitignored — contains all secrets
```
