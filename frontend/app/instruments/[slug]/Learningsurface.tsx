'use client'

import { useState, useEffect } from 'react'
import { InstrumentVisual } from '@/components/InstrumentVisual'
import { ChatPanel } from '@/components/ChatPanel'
import type { Instrument } from '@/types/database'
import type { Hotspot } from '@/lib/hotspots'
import { INSTRUMENT_CONTENT } from '@/lib/instrument-content'
import Link from 'next/link'

interface Props {
  instrument: Instrument
  initialPrompt?: string
}

export function Learningsurface({ instrument, initialPrompt }: Props) {
  const [activeControlIds, setActiveControlIds] = useState<string[]>([])
  const [hotspots, setHotspots] = useState<Hotspot[]>([])

  useEffect(() => {
    fetch(`/instruments/${instrument.slug}/hotspots.json`)
      .then((r) => r.json())
      .then((data) => setHotspots(data.controls ?? []))
      .catch(() => setHotspots([]))
  }, [instrument.slug])

  const content = INSTRUMENT_CONTENT[instrument.slug] ?? null

  return (
    <div className="page min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>

      {/* Thin header */}
      <header
        className="flex items-center gap-4 py-4 shrink-0"
        style={{
          borderBottom: '1px solid rgba(26,23,20,0.08)',
          background: 'rgba(245,240,232,0.85)',
          backdropFilter: 'blur(12px)',
          paddingLeft: '30px',
          paddingRight: '30px',
        }}
      >
        <Link
          href={`/instruments/${instrument.slug}`}
          className="font-mono uppercase transition-colors duration-200"
          style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--ink-ghost)' }}
        >
          ← {instrument.name}
        </Link>
        <div style={{ width: '1px', height: '12px', background: 'rgba(26,23,20,0.15)' }} />
        <div>
          <p
            className="font-mono uppercase"
            style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--ink-ghost)' }}
          >
            {instrument.manufacturer}
          </p>
          <h1
            className="font-display italic leading-tight"
            style={{ fontSize: '20px', color: 'var(--ink)' }}
          >
            {instrument.name}
          </h1>
        </div>
      </header>

      {/* Two-panel layout */}
      <div className="flex flex-col sm:flex-row flex-1 min-h-0">

        {/* Left: instrument visual */}
        <div
          className="sm:w-1/2 flex flex-col justify-center sm:overflow-y-auto"
          style={{ padding: '30px', borderRight: '1px solid rgba(26,23,20,0.06)' }}
        >
          <InstrumentVisual
            slug={instrument.slug}
            instrumentName={`${instrument.manufacturer} ${instrument.name}`}
            activeControlIds={activeControlIds}
          />
          {instrument.description && (
            <p
              className="mt-5 font-mono leading-relaxed max-w-xl"
              style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}
            >
              {instrument.description}
            </p>
          )}
        </div>

        {/* Right: chat */}
        <div className="sm:w-1/2 flex flex-col min-h-0 sm:h-[calc(100vh-65px)]">
          <ChatPanel
            instrumentId={instrument.id}
            instrumentName={`${instrument.manufacturer} ${instrument.name}`}
            hotspots={hotspots}
            onHighlightsChange={setActiveControlIds}
            suggestedPrompts={content?.suggestedPrompts}
            initialPrompt={initialPrompt}
          />
        </div>

      </div>
    </div>
  )
}
