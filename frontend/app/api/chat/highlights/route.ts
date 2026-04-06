import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const RequestSchema = z.object({
  text: z.string().max(4000),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json({ controls: [] }, { status: 400 })
    }

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 256,
      system: `Extract the names of physical instrument controls (knobs, buttons, pads, faders, switches, menu items) mentioned in the text.
Return ONLY a JSON object in this exact format: {"controls": ["Control Name 1", "Control Name 2"]}
If no controls are mentioned, return: {"controls": []}
Do not include any other text.`,
      messages: [{ role: 'user', content: parsed.data.text }],
    })

    const responseText = message.content[0].type === 'text' ? message.content[0].text : '{}'

    try {
      const parsed = JSON.parse(responseText)
      const controls = Array.isArray(parsed.controls) ? parsed.controls : []
      return Response.json({ controls })
    } catch {
      return Response.json({ controls: [] })
    }
  } catch (err) {
    console.error('[/api/chat/highlights]', err)
    return Response.json({ controls: [] })
  }
}
