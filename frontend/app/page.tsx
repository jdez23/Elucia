import { createClient } from '@/lib/supabase/server'
import type { Instrument } from '@/types/database'
import { DUMMY_INSTRUMENTS } from '@/lib/dummy-data'
import { HomeQuickChat } from '@/components/HomeQuickChat'
import { InstrumentCarousel } from '@/components/InstrumentCarousel'
import { HomeContent, HomeSection } from '@/components/HomeContent'

const VALUE_PROPS = [
  { label: 'Official manuals' },
  { label: 'Controls highlighted live' },
  { label: 'Ask anything' },
]

export default async function HomePage() {
  let instruments: Instrument[] = DUMMY_INSTRUMENTS

  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('instruments')
      .select('*')
      .eq('is_published', true)
      .order('manufacturer')
    if (data && data.length > 0) {
      const dbSlugs = new Set(data.map((i) => i.slug))
      const dummyOnly = DUMMY_INSTRUMENTS.filter((i) => !dbSlugs.has(i.slug))
      instruments = [...dummyOnly, ...data]
    }
  } catch {
    // Supabase not configured — use dummy data
  }

  return (
    <main className="page flex-1 flex flex-col justify-center">
      <div className="w-full py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <HomeContent>

            {/* Header */}
            <HomeSection>
              <header className="text-center">
                <h1
                  className="font-display italic leading-none tracking-[-2px]"
                  style={{ fontSize: 'clamp(56px, 10vw, 96px)', color: 'var(--ink)' }}
                >
                  Elucia
                </h1>
                <p
                  className="font-mono uppercase mt-4"
                  style={{ fontSize: '11px', letterSpacing: '4px', color: 'var(--ink-ghost)' }}
                >
                  the instrument, illuminated
                </p>

                {/* Value bullets */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 mt-7 flex-wrap">
                  {VALUE_PROPS.map((v, i) => (
                    <div key={v.label} className="flex items-center gap-2">
                      {i > 0 && (
                        <span style={{ color: 'var(--ink-whisper)', fontSize: '10px' }}>·</span>
                      )}
                      <div className="flex items-center gap-1.5">
                        <span
                          className="h-1.5 w-1.5 rounded-full shrink-0"
                          style={{ background: 'var(--ink-soft)' }}
                        />
                        <span
                          className="font-mono uppercase"
                          style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--ink-ghost)' }}
                        >
                          {v.label}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </header>
            </HomeSection>

            {/* Instrument carousel */}
            <HomeSection>
              <InstrumentCarousel instruments={instruments} />
            </HomeSection>

            {/* Quick chat */}
            <HomeSection>
              <HomeQuickChat instruments={instruments} />
            </HomeSection>

          </HomeContent>
        </div>
      </div>
    </main>
  )
}
