# Elucia

An AI-powered assistant that helps musicians understand and use complex synthesizers and drum machines. Ask any question about your instrument in plain English and get answers grounded in the official manual — with the relevant hardware controls highlighted live on an image of the device.

## What it does

- **Natural language Q&A** — ask anything about a supported instrument
- **RAG-grounded answers** — responses cite the official PDF manual, never hallucinate controls
- **Live control highlighting** — the AI returns a list of control IDs; the frontend highlights them on the instrument image
- **Quick-chat home screen** — try a question before navigating to the full chat

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion |
| AI | OpenAI `gpt-4o` for chat, `text-embedding-3-small` for embeddings |
| Database | Supabase (Postgres + pgvector) |
| Auth | Supabase Auth |
| Backend (legacy) | Django + DRF (accounts, chat, manuals, payments, RAG apps) |

## Project structure

```text
elucia/
├── frontend/                      # Next.js app (primary)
│   ├── app/
│   │   ├── page.tsx               # Home — carousel + quick chat
│   │   ├── instruments/[slug]/    # Instrument detail + chat
│   │   └── api/                   # Route handlers (chat, highlights, ingest)
│   ├── components/
│   │   ├── InstrumentCarousel.tsx
│   │   ├── HomeQuickChat.tsx
│   │   ├── InstrumentHub.tsx
│   │   └── ChatPanel.tsx
│   ├── lib/
│   │   ├── ai/rag.ts              # Embed → retrieve → assemble → prompt
│   │   ├── instrument-content.ts  # FAQs and suggested prompts per instrument
│   │   ├── hotspots.ts            # Control ID → coordinates mapping
│   │   └── dummy-data.ts          # Fallback instruments when Supabase is offline
│   └── public/instruments/        # Instrument images at /instruments/{slug}/main.png
└── backend/                       # Django (accounts, payments — not yet migrated)
```

## Getting started

### Prerequisites

- Node.js 18+
- A Supabase project with the schema below
- An OpenAI API key

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local   # fill in values below
npm run dev                         # runs on localhost:3001 (or 3000)
```

### Environment variables (`frontend/.env.local`)

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
```

The app degrades gracefully — if Supabase is not configured it falls back to `DUMMY_INSTRUMENTS`.

## Supabase schema

| Table | Purpose |
| --- | --- |
| `instruments` | Instrument catalogue (slug, name, manufacturer, category, image_path) |
| `document_chunks` | Chunked manual text with pgvector embeddings |
| `chat_sessions` | Per-user per-instrument sessions |
| `chat_messages` | Message history with `highlighted_controls` array |

RPC function `match_chunks(query_embedding, match_instrument_id, match_count)` runs cosine similarity search via pgvector.

## Adding an instrument

1. Add a row to `instruments` in Supabase with a unique `slug`
2. Place the instrument image at `frontend/public/instruments/{slug}/main.png`
3. Upload the PDF manual and run the ingest route: `POST /api/admin/ingest`
4. Add FAQs and suggested prompts to `frontend/lib/instrument-content.ts`
5. Add control hotspot coordinates to `frontend/lib/hotspots.ts`
