import { NextRequest } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// Protected admin route — triggers manual re-ingestion status check
// Actual ingestion runs via scripts/ingest.py (Python), not here.
// This endpoint is used to verify ingestion status and trigger re-index if needed.
export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-admin-secret')

  if (!secret || secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { instrumentSlug } = await req.json()
    const supabase = createAdminClient()

    const { data: instrument, error } = await supabase
      .from('instruments')
      .select('id, name, slug')
      .eq('slug', instrumentSlug)
      .single()

    if (error || !instrument) {
      return Response.json({ error: 'Instrument not found' }, { status: 404 })
    }

    const instrumentId = (instrument as { id: string; name: string; slug: string }).id
    const instrumentName = (instrument as { id: string; name: string; slug: string }).name

    const { count } = await supabase
      .from('document_chunks')
      .select('*', { count: 'exact', head: true })
      .eq('instrument_id', instrumentId)

    return Response.json({
      instrument: instrumentName,
      chunks_ingested: count ?? 0,
      status: (count ?? 0) > 0 ? 'ready' : 'not_ingested',
      message: (count ?? 0) > 0
        ? `${count} chunks indexed. Run scripts/ingest.py to re-ingest.`
        : 'No chunks found. Run: cd scripts && source venv/bin/activate && python ingest.py --slug ' + instrumentSlug,
    })
  } catch (err) {
    console.error('[/api/admin/ingest]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
