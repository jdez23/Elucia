import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Learningsurface } from '../Learningsurface'
import { DUMMY_INSTRUMENTS } from '@/lib/dummy-data'
import type { Instrument } from '@/types/database'

interface Props {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ q?: string }>
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
    if (data) return { title: `Chat · ${data.manufacturer} ${data.name} — Elucia` }
  } catch {
    // fall through
  }

  const dummy = DUMMY_INSTRUMENTS.find((i) => i.slug === slug)
  if (dummy) return { title: `Chat · ${dummy.manufacturer} ${dummy.name} — Elucia` }
  return { title: 'Instrument not found' }
}

export default async function InstrumentChatPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { q } = await searchParams

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

  return <Learningsurface instrument={instrument} initialPrompt={q} />
}
