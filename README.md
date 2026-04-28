# Elucia

**The instrument, illuminated.** Ask any question about your synth or drum machine and get answers grounded in the official manual — with the relevant controls highlighted live on the instrument image.

Live at **[elucia.xyz](https://elucia.xyz)**

---

## What it does

- Browse a curated library of synthesizers and drum machines
- Ask free-form questions in plain English ("How do I set the filter cutoff?")
- Responses are grounded in the official manual via RAG — no hallucination about controls that don't exist
- Relevant physical controls highlight on the instrument image as you chat
- Chat history saved per session when signed in

---

## Tech stack

### Frontend — Vercel
| | |
|---|---|
| Framework | Next.js 14 (App Router, TypeScript) |
| Styling | Tailwind CSS, Framer Motion |
| Fonts | Inter (body), Instrument Serif (display), DM Mono (labels) |
| Chat | Vercel AI SDK (`ai`, `@ai-sdk/openai`) — streaming |
| Auth | Supabase SSR (`@supabase/ssr`) |
| Markdown | `react-markdown` |
| Validation | Zod |

### Backend — Railway
| | |
|---|---|
| Framework | Django 4.2 + Django REST Framework |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| Vector store | Pinecone (cosine similarity, `text-embedding-3-small`) |
| AI | OpenAI (`gpt-4o-mini` completions, `text-embedding-3-small` embeddings) |
| PDF processing | pdfplumber + PyPDF2 |

---

## Project structure

```
elucia/
├── frontend/                   # Next.js app (deployed on Vercel)
│   ├── app/
│   │   ├── page.tsx            # Home — carousel + quick chat
│   │   ├── instruments/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx    # Instrument detail (hub)
│   │   │       └── chat/
│   │   │           └── page.tsx  # Two-panel chat + instrument visual
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── signup/
│   │   └── api/
│   │       └── chat/
│   │           ├── route.ts    # Streaming chat endpoint (RAG wired)
│   │           └── highlights/ # Control extraction for hotspot highlighting
│   ├── components/
│   │   ├── InstrumentCarousel.tsx
│   │   ├── InstrumentHub.tsx
│   │   ├── InstrumentVisual.tsx  # Image with hotspot overlay
│   │   ├── ChatPanel.tsx
│   │   ├── MessageBubble.tsx     # react-markdown rendering
│   │   ├── HomeQuickChat.tsx
│   │   └── FAQAccordion.tsx
│   ├── lib/
│   │   ├── ai/rag.ts           # Embed → retrieve → assemble context
│   │   ├── hotspots.ts         # Control matching logic
│   │   ├── instrument-content.ts  # Per-instrument FAQs + suggested prompts
│   │   ├── dummy-data.ts       # Fallback instruments when DB unavailable
│   │   └── supabase/           # Server + client Supabase helpers
│   └── public/instruments/     # Instrument images + hotspot JSON
│
├── backend/                    # Django API (deployed on Railway)
│   ├── apps/
│   │   ├── accounts/           # User auth, UserProfile
│   │   ├── manuals/            # Manual model + ingest command
│   │   ├── chat/               # Conversation + Message models
│   │   └── rag/                # PDF processor, chunker, Pinecone client, query pipeline
│   └── elucia/settings/
│       ├── base.py
│       ├── development.py
│       └── production.py       # Railway: SECURE_PROXY_SSL_HEADER set
│
└── docs/
    ├── SETUP.md
    ├── API.md
    └── DEPLOYMENT.md
```

---

## Quick start

### Prerequisites

- Node.js 18+, Python 3.11+, PostgreSQL (or use Supabase)
- OpenAI API key
- Pinecone account + index (see `docs/SETUP.md`)
- Supabase project

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local  # fill in keys
npm run dev
# → http://localhost:3000
```

### Backend

```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements/base.txt
cp .env.example .env  # fill in keys
python manage.py migrate
python manage.py runserver
# → http://localhost:8000/api/
```

See [docs/SETUP.md](docs/SETUP.md) for the full walkthrough including Pinecone setup and manual ingestion.

---

## Environment variables

### Frontend (`frontend/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=           # server-side only — chat + highlights endpoints
PINECONE_API_KEY=
PINECONE_INDEX=
SUPABASE_SERVICE_ROLE_KEY=
```

### Backend (`backend/.env`)

```bash
SECRET_KEY=
DJANGO_SETTINGS_MODULE=elucia.settings.development
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=localhost
DB_PORT=5432
OPENAI_API_KEY=
PINECONE_API_KEY=
PINECONE_ENVIRONMENT=
PINECONE_INDEX_NAME=elucia-manuals
SUPABASE_URL=
SUPABASE_KEY=
```

---

## RAG pipeline

```
User question
  └─ text-embedding-3-small  →  1536-dim vector
       └─ Pinecone query (top 5, namespace = instrument-<id>)
            └─ Retrieved manual chunks (with page + section metadata)
                 └─ gpt-4o-mini (system prompt + chunk context)
                      └─ Streamed response → MessageBubble (react-markdown)
                           └─ /api/chat/highlights extracts control names
                                └─ Matched to hotspot JSON → image highlights
```

---

## Adding an instrument

1. Create the `Instrument` record in Supabase (or `DUMMY_INSTRUMENTS` in `lib/dummy-data.ts` for dev)
2. Add instrument image to `public/instruments/<slug>/`
3. Add `hotspots.json` to `public/instruments/<slug>/` (control name → image coordinates)
4. Add `INSTRUMENT_CONTENT[slug]` entry in `lib/instrument-content.ts` (tagline, FAQs, suggested prompts)
5. Ingest the PDF manual into Pinecone:
   ```bash
   cd backend
   python manage.py ingest_manual <instrument_id> path/to/manual.pdf
   ```

---

## Deployment

| Service | Platform | Branch |
|---|---|---|
| Frontend | Vercel | `main` — auto-deploy |
| Backend | Railway | `main` — auto-deploy |

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for environment variable setup on each platform.

---

## Contact

**Jesse Hernandez**
- GitHub: [@jdez23](https://github.com/jdez23)
- Email: jhernandez12321@gmail.com
