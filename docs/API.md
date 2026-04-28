# Elucia API Reference

---

## Frontend API routes (Next.js)

These are internal routes called by the frontend client. They are not public.

### `POST /api/chat`

Streaming chat endpoint. Embeds the user's question, retrieves Pinecone chunks, and streams a `gpt-4o-mini` response grounded in the manual.

**Request**

```json
{
  "messages": [
    { "role": "user", "content": "How do I set the filter cutoff?" }
  ],
  "instrumentId": "uuid",
  "sessionId": "uuid"   // optional — enables chat history saving
}
```

**Validation** — Zod schema: `messages` max 50, content max 2000 chars, `instrumentId` must be a UUID.

**Rate limiting** — 20 requests per 24 hours per authenticated user or IP address (in-memory; resets on cold start).

**Response** — Vercel AI SDK data stream (`text/event-stream`). Consumed by `useChat` on the client.

**Errors**

| Status | Reason |
|---|---|
| 400 | Invalid request body |
| 404 | Instrument not found |
| 429 | Rate limit exceeded (`Retry-After: 86400`) |
| 500 | Internal error |

---

### `POST /api/chat/highlights`

Extracts physical control names from an assistant message for hotspot highlighting on the instrument image.

**Request**

```json
{ "text": "Turn the Filter Cutoff knob clockwise to open the filter..." }
```

**Response**

```json
{ "controls": ["Filter Cutoff", "Resonance"] }
```

These control names are matched against the instrument's `hotspots.json` via fuzzy matching in `lib/hotspots.ts`.

---

## Backend API (Django REST Framework)

Base URL: `http://localhost:8000/api/` (local) / `https://<railway-url>/api/` (production)

### Auth

| Method | Path | Body | Auth |
|---|---|---|---|
| `POST` | `/api/auth/register/` | `{ username, email, password, password_confirm }` | None |
| `POST` | `/api/auth/login/` | `{ username, password }` | None |
| `POST` | `/api/auth/logout/` | — | Session |
| `GET` | `/api/users/me/` | — | Session |

### Instruments / Manuals

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/manuals/` | Supports `?category=synth\|drum_machine\|sampler\|groovebox`, `?manufacturer=Moog`, `?search=grandmother` |
| `GET` | `/api/manuals/:id/` | Single instrument detail |

### Conversations & chat

| Method | Path | Notes |
|---|---|---|
| `GET` | `/api/conversations/` | List current user's conversations |
| `POST` | `/api/conversations/` | `{ "manual": <id>, "title": "..." }` |
| `GET` | `/api/conversations/:id/` | Detail with messages |
| `DELETE` | `/api/conversations/:id/` | Soft delete |
| `POST` | `/api/conversations/:id/messages/` | Send message → triggers RAG pipeline → returns AI response |

**Send message request:**
```json
{ "content": "How do I save a preset?" }
```

**Send message response:**
```json
{
  "user_message": { "id": 1, "role": "user", "content": "...", "created_at": "2026-04-27T..." },
  "ai_message":   { "id": 2, "role": "assistant", "content": "...", "created_at": "2026-04-27T..." }
}
```

---

## Data models

### Supabase tables (used by frontend)

**instruments**
```
id            uuid PK
slug          text UNIQUE
name          text
manufacturer  text
category      text  -- synth | drum_machine | sampler | groovebox | other
description   text
image_path    text
is_published  boolean
created_at    timestamptz
```

**chat_sessions**
```
id            uuid PK
user_id       uuid FK → auth.users
instrument_id uuid FK → instruments
created_at    timestamptz
```

**chat_messages**
```
id            uuid PK
session_id    uuid FK → chat_sessions
role          text  -- user | assistant
content       text
sources       jsonb -- [{ section_title, page_start, similarity }]
created_at    timestamptz
```

### Pinecone vectors

Each vector has dimension 1536 (`text-embedding-3-small`).

Namespace: `manual-<instrument_id>`

Metadata:
```json
{
  "instrument_id": "uuid",
  "section_title": "Oscillator Section",
  "page_start": 12,
  "chunk_index": 3
}
```
