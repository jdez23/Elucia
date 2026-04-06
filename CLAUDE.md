# CLAUDE.md — Elucia project context

## What this is

Elucia is an AI-powered instrument tutor. Users select a hardware synthesizer or drum machine and ask natural language questions. The system retrieves relevant excerpts from the official PDF manual (RAG via pgvector), answers the question, and returns a list of control IDs that the frontend highlights on an instrument image in real time.

## Architecture at a glance

```text
Home (page.tsx)
  └── InstrumentCarousel     → select instrument
  └── HomeQuickChat          → fires question, redirects to /instruments/[slug]/chat?q=...

/instruments/[slug]/         → instrument detail page (InstrumentHub)
/instruments/[slug]/chat     → full chat (ChatPanel + InstrumentVisual)

API routes (all in frontend/app/api/):
  POST /api/chat             → embed query → match_chunks RPC → GPT-4o → stream
  POST /api/chat/highlights  → extract control IDs from AI reply
  POST /api/admin/ingest     → chunk PDF → embed → upsert to document_chunks
```

## Tech stack

- **Next.js 14** App Router, server components where possible
- **TypeScript** — strict throughout
- **Tailwind CSS** — utility classes preferred; avoid arbitrary inline styles unless
  values must be dynamic or come from CSS variables
- **Framer Motion** — page/section entry animations and carousel spring physics
- **Supabase** — Postgres + pgvector, Auth, SSR helpers (`@supabase/ssr`)
- **OpenAI SDK** — `text-embedding-3-small` for embeddings, `gpt-4o` for chat
- **Vercel AI SDK** (`ai` package) — streaming responses in the chat route

## Design system

### Colors (CSS variables in `globals.css`)

| Variable | Value | Use |
| --- | --- | --- |
| `--cream` | `#f5f0e8` | page background |
| `--cream-dark` | `#ebe4d8` | surface / arrow buttons |
| `--cream-deep` | `#ddd5c5` | deeper surface |
| `--ink` | `#1a1714` | primary text |
| `--ink-soft` | `#3d3830` | secondary text |
| `--ink-ghost` | `#8a8279` | muted text |
| `--ink-whisper` | `#b5ada3` | placeholder / decorative |
| `--bio-teal` | `#00c896` | accent / glow effects |

Instrument cards use **pure white** (`#ffffff`) background with `#f5f2ec` for the image well.

### Fonts

- `font-display` → Instrument Serif (italic, used for headings and instrument names)
- `font-mono` → DM Mono (used for labels, badges, UI chrome — everything else)

### Spacing conventions

- Page container: `max-w-2xl mx-auto px-4 sm:px-6`
- Section gaps: `space-y-8 sm:space-y-12 lg:space-y-14`
- No hardcoded pixel padding in inline styles — use Tailwind classes

### Carousel

Constants live at the top of `InstrumentCarousel.tsx`:

```ts
CARD_WIDTH   = '60%'    // % of stage width
SIDE_SCALE   = 0.72     // scale of non-active cards
SIDE_OPACITY = 0.40
X_OFFSET     = 65       // % of card width per position step
```

The hidden sizer div has **two children** (image aspect + 88px info strip) so the
stage height matches a full card and nothing clips on mobile.

Image containers use `absolute inset-[10px]` to pad the `fill` Image away from card
edges — Next.js `fill` ignores CSS `padding`, so a wrapper div is required.

## Key files

| File | What it does |
| --- | --- |
| `frontend/app/page.tsx` | Home page — server component, fetches instruments |
| `frontend/app/globals.css` | Design tokens, blob animations, `.carousel-card-image` responsive aspect ratio |
| `frontend/components/InstrumentCarousel.tsx` | 3-card spring carousel |
| `frontend/components/HomeQuickChat.tsx` | Instrument selector + textarea → redirects to chat |
| `frontend/lib/ai/rag.ts` | `embedQuery`, `retrieveChunks`, `assembleContext`, `buildSystemPrompt` |
| `frontend/lib/instrument-content.ts` | Per-instrument FAQs and suggested prompts |
| `frontend/lib/hotspots.ts` | Control ID → `{x, y}` pixel coordinates for highlight overlay |
| `frontend/lib/dummy-data.ts` | Fallback `DUMMY_INSTRUMENTS` array (Supabase optional) |

## Instrument images

Place at `frontend/public/instruments/{slug}/main.png`.

Images render with `object-contain` inside a `4/3` aspect ratio container on sm+ screens
and `3/4` portrait on mobile (CSS class `.carousel-card-image` in `globals.css`).

## Adding a new instrument checklist

1. Supabase: insert row into `instruments` with a unique `slug`
2. Image: `frontend/public/instruments/{slug}/main.png`
3. Ingest: `POST /api/admin/ingest` with the PDF
4. Content: add entry to `INSTRUMENT_CONTENT` in `lib/instrument-content.ts`
5. Hotspots: add control coordinates to `lib/hotspots.ts`
6. Dummy data (optional): add entry to `lib/dummy-data.ts` for local dev without Supabase

## Coding conventions

- Prefer editing existing components over creating new ones
- Don't add error handling for scenarios that can't happen
- Don't abstract things used in only one place
- Responsive values always via Tailwind breakpoint classes, not JS `window.innerWidth`
- CSS variables for brand colors; Tailwind utilities for layout/spacing
- Server components by default; add `'use client'` only when state or browser APIs are needed
