import OpenAI from 'openai'
import { createAdminClient } from '@/lib/supabase/admin'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SupabaseAdmin = ReturnType<typeof createAdminClient>

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export interface RetrievedChunk {
  id: string
  content: string
  section_title: string | null
  page_start: number | null
  similarity: number
}

export async function embedQuery(query: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: query,
  })
  return response.data[0].embedding
}

export async function retrieveChunks(
  embedding: number[],
  instrumentId: string,
  topK = 5
): Promise<RetrievedChunk[]> {
  const supabase: SupabaseAdmin = createAdminClient()

  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: embedding,
    match_instrument_id: instrumentId,
    match_count: topK,
  })

  if (error) throw new Error(`RAG retrieval failed: ${error.message}`)
  return (data ?? []) as RetrievedChunk[]
}

export function assembleContext(chunks: RetrievedChunk[]): string {
  return chunks
    .map((c) => {
      const ref = c.page_start ? `[p.${c.page_start}]` : ''
      const heading = c.section_title ? `**${c.section_title}** ` : ''
      return `${heading}${ref}\n${c.content}`
    })
    .join('\n\n---\n\n')
}

export function buildSystemPrompt(
  instrumentName: string,
  manufacturer: string,
  context: string
): string {
  return `You are Elucia, an expert music educator specializing in the ${manufacturer} ${instrumentName}.

Your job is to help musicians learn this instrument clearly and practically, grounded in the official manual.

IMPORTANT RULES:
- Base your answers on the manual excerpts provided. If the answer is not there, say so honestly.
- When referring to a physical control (knob, button, pad, switch, menu item), use its EXACT name as labeled on the instrument. This is critical for visual highlighting.
- Describe WHERE controls are physically located on the instrument (e.g., "in the upper-left section", "on the right panel").
- Be practical: suggest what the user should listen for or watch on screen.
- Use numbered steps for procedures.
- Keep responses focused and concise — this is an interactive learning tool, not a reference manual.
- Use musical analogies to explain technical concepts before going into technical detail.

MANUAL EXCERPTS:
${context}
`
}
