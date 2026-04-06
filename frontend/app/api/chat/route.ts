import { createAnthropic } from '@ai-sdk/anthropic'
import { streamText } from 'ai'
import { z } from 'zod'
import { embedQuery, retrieveChunks, assembleContext, buildSystemPrompt } from '@/lib/ai/rag'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DUMMY_INSTRUMENTS } from '@/lib/dummy-data'

export const maxDuration = 30

const anthropic = createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const RequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string().max(2000),
    })
  ).min(1).max(50),
  instrumentId: z.string().uuid(),
  sessionId: z.string().uuid().optional(),
})

// Simple in-memory rate limiter (resets on cold start; use Upstash Redis for production)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 24 * 60 * 60 * 1000 // 24 hours

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(userId)

  if (!record || now > record.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return true
  }

  if (record.count >= RATE_LIMIT) return false
  record.count++
  return true
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { messages, instrumentId, sessionId } = parsed.data

    // Identify user (or fall back to IP for anonymous)
    let user = null
    try {
      const supabase = await createClient()
      const { data } = await supabase.auth.getUser()
      user = data.user
    } catch {
      // Supabase not configured — proceed as anonymous
    }
    const rateLimitKey = user?.id ?? req.headers.get('x-forwarded-for') ?? 'anonymous'

    if (!checkRateLimit(rateLimitKey)) {
      return Response.json(
        { error: 'Rate limit exceeded. Try again tomorrow.' },
        { status: 429, headers: { 'Retry-After': '86400' } }
      )
    }

    // Resolve instrument metadata — try Supabase first, then dummy data
    let instrument: { id: string; name: string; manufacturer: string } | null = null

    try {
      const adminClient = createAdminClient()
      const { data, error } = await adminClient
        .from('instruments')
        .select('id, name, manufacturer')
        .eq('id', instrumentId)
        .single()
      if (!error && data) instrument = data as { id: string; name: string; manufacturer: string }
    } catch {
      // Supabase not configured — fall through
    }

    if (!instrument) {
      const dummy = DUMMY_INSTRUMENTS.find((i) => i.id === instrumentId)
      if (dummy) {
        instrument = { id: dummy.id, name: dummy.name, manufacturer: dummy.manufacturer }
      }
    }

    if (!instrument) {
      return Response.json({ error: 'Instrument not found' }, { status: 404 })
    }

    // RAG: try to embed + retrieve; fall back to empty context gracefully
    const lastUserMessage = messages.filter((m) => m.role === 'user').at(-1)!.content
    let context = ''
    let chunks: Awaited<ReturnType<typeof retrieveChunks>> = []

    try {
      const embedding = await embedQuery(lastUserMessage)
      chunks = await retrieveChunks(embedding, instrumentId, 5)
      context = assembleContext(chunks)
    } catch {
      // RAG unavailable — continue with no manual context
    }

    const systemPrompt = buildSystemPrompt(instrument.name, instrument.manufacturer, context)

    // Persist user message if session provided
    if (sessionId && user) {
      try {
        const adminClient = createAdminClient()
        await adminClient.from('chat_messages').insert({
          session_id: sessionId,
          role: 'user',
          content: lastUserMessage,
        })
      } catch {
        // Non-critical
      }
    }

    // Stream response
    const result = streamText({
      model: anthropic('claude-sonnet-4-6'),
      system: systemPrompt,
      messages,
      maxTokens: 1024,
      onFinish: async ({ text }) => {
        if (sessionId && user) {
          try {
            const adminClient = createAdminClient()
            await adminClient.from('chat_messages').insert({
              session_id: sessionId,
              role: 'assistant',
              content: text,
              sources: chunks.map((c) => ({
                section_title: c.section_title,
                page_start: c.page_start,
                similarity: Math.round(c.similarity * 100) / 100,
              })),
            })
          } catch {
            // Non-critical
          }
        }
      },
    })

    return result.toDataStreamResponse()
  } catch (err) {
    console.error('[/api/chat]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
