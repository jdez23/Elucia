import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { InstrumentHub } from '@/components/InstrumentHub'
import { DUMMY_INSTRUMENTS } from '@/lib/dummy-data'
import { INSTRUMENT_CONTENT } from '@/lib/instrument-content'
import type { Instrument } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('instruments')
      .select('name, manufacturer')
      .eq('slug', slug)
      .single()
    if (data) return { title: `${data.manufacturer} ${data.name} — Elucia` }
  } catch {
    // fall through
  }

  const dummy = DUMMY_INSTRUMENTS.find((i) => i.slug === slug)
  if (dummy) return { title: `${dummy.manufacturer} ${dummy.name} — Elucia` }
  return { title: 'Instrument not found' }
}

export default async function InstrumentPage({ params }: Props) {
  const { slug } = await params

  let instrument: Instrument | null = null

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('instruments')
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()
    if (data) instrument = data as Instrument
  } catch {
    // fall through
  }

  if (!instrument) {
    const dummy = DUMMY_INSTRUMENTS.find((i) => i.slug === slug)
    if (!dummy) notFound()
    instrument = dummy
  }

  const content = INSTRUMENT_CONTENT[slug] ?? null

  return <InstrumentHub instrument={instrument} content={content} />
}
