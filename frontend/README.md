# Elucia Frontend

Next.js 14 frontend for Elucia — instrument learning via RAG-grounded chat with live control highlighting.

Deployed at **[elucia.xyz](https://elucia.xyz)** on Vercel.

---

## Stack

| | |
|---|---|
| Framework | Next.js 14, App Router, TypeScript |
| Styling | Tailwind CSS, CSS custom properties |
| Fonts | Inter (body), Instrument Serif (display), DM Mono (labels) — all via `next/font/google` |
| Animation | Framer Motion |
| Chat | Vercel AI SDK (`ai` + `@ai-sdk/openai`) — streaming via `useChat` |
| Markdown | `react-markdown` (assistant responses) |
| Auth | `@supabase/ssr` — server + client helpers |
| Validation | Zod (API route request schemas) |
| Icons | Lucide React |

---

## Local dev

```bash
npm install
cp .env.local.example .env.local   # add keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required env vars

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=             # server-only — used by /api/chat and /api/chat/highlights
PINECONE_API_KEY=
PINECONE_INDEX=
SUPABASE_SERVICE_ROLE_KEY=  # server-only — admin Supabase client
```

---

## Key pages

| Route | Component | Description |
|---|---|---|
| `/` | `app/page.tsx` | Home — instrument carousel + quick chat widget |
| `/instruments/[slug]` | `InstrumentHub` | Instrument detail, FAQs, suggested prompts |
| `/instruments/[slug]/chat` | `Learningsurface` | Two-panel: instrument visual + chat |
| `/login`, `/signup` | Auth pages | Supabase Auth forms |

---

## Key components

| Component | Purpose |
|---|---|
| `InstrumentCarousel` | Animated 3-card carousel with peek effect |
| `InstrumentVisual` | Instrument image with SVG hotspot overlay — highlights controls mentioned in chat |
| `ChatPanel` | `useChat` hook wiring, streaming, suggested prompts, typing indicator |
| `MessageBubble` | Renders assistant messages via `react-markdown` (bold, lists, code) |
| `HomeQuickChat` | Home page chat box with instrument selector + suggestion chips |
| `InstrumentHub` | Instrument detail layout with FAQ accordion and suggested prompts |
| `FAQAccordion` | Animated expandable FAQ list |

---

## API routes

| Route | Purpose |
|---|---|
| `POST /api/chat` | Streaming chat — embeds query, retrieves Pinecone chunks, streams gpt-4o-mini |
| `POST /api/chat/highlights` | Extracts control names from assistant response for hotspot highlighting |

Both routes validate requests with Zod. `/api/chat` includes in-memory rate limiting (20 requests / 24h per user or IP).

---

## Design system

CSS custom properties are defined in `app/globals.css`:

```
--cream / --cream-dark / --cream-deep   Background palette (cool neutral white)
--ink / --ink-soft / --ink-ghost        Text palette
--bio-teal (#0ea5e9)                    Primary accent (sky blue)
--bio-gradient                          Blue/indigo gradient (send buttons, user bubbles)
--font-sans / --font-display / --font-mono  Font variables (Inter / Instrument Serif / DM Mono)
```

`font-mono` (DM Mono) is used only on uppercase micro-labels. All body and interactive text uses Inter via `--font-sans`.

---

## Adding a new instrument

1. Add entry to `lib/dummy-data.ts` (dev) or Supabase `instruments` table (prod)
2. Add image at `public/instruments/<slug>/image.{jpg,png,webp}`
3. Add `public/instruments/<slug>/hotspots.json`:
   ```json
   { "controls": [{ "id": "filter-cutoff", "label": "Filter Cutoff", "x": 42, "y": 31, "r": 4 }] }
   ```
4. Add `INSTRUMENT_CONTENT['<slug>']` in `lib/instrument-content.ts` — tagline, FAQs, suggestedPrompts
