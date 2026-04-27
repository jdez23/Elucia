'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Instrument } from '@/types/database'

const CATEGORY_LABELS: Record<string, string> = {
  synth: 'Synthesizer',
  drum_machine: 'Drum Machine',
  sampler: 'Sampler',
  groovebox: 'Groovebox',
  other: 'Instrument',
}

const ARROW_WIDTH = 44   // px reserved for each arrow column
const CARD_WIDTH   = '70%'
const SIDE_SCALE   = 0.72
const SIDE_OPACITY = 0.40
const X_OFFSET     = 60  // % of card width per position step

interface Props {
  instruments: Instrument[]
}

export function InstrumentCarousel({ instruments }: Props) {
  const [active, setActive] = useState(0)
  const count = instruments.length

  function prev() { setActive((i) => (i - 1 + count) % count) }
  function next() { setActive((i) => (i + 1) % count) }

  function getPos(i: number): number {
    let diff = i - active
    if (diff > count / 2) diff -= count
    if (diff < -count / 2) diff += count
    return diff
  }

  return (
    <motion.div
      className="relative w-full select-none"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      {/* Row: [arrow] [stage] [arrow] */}
      <div className="flex items-stretch w-full">

        {/* Left arrow */}
        <div
          className="shrink-0 flex items-center justify-center"
          style={{ width: `${ARROW_WIDTH}px` }}
        >
          <button
            onClick={prev}
            aria-label="Previous instrument"
            className="flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              width: '32px', height: '32px',
              background: '#ffffff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              border: '1px solid rgba(26,23,20,0.12)',
              cursor: 'pointer',
              color: 'var(--ink-ghost)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'rgba(26,23,20,0.35)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-ghost)'; e.currentTarget.style.borderColor = 'rgba(26,23,20,0.12)' }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Stage — overflow-hidden clips peeking side cards at the arrow boundary */}
        <div className="flex-1 relative overflow-hidden">

          {/*
            Hidden sizer: two children mirror the real card structure —
            image area (aspect ratio) + info strip (fixed height) — so the
            stage height always fits a full card and nothing clips on mobile.
          */}
          <div aria-hidden style={{ width: CARD_WIDTH, visibility: 'hidden', pointerEvents: 'none' }}>
            <div className="carousel-card-image w-full" />
            <div style={{ height: '88px' }} />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            {instruments.map((instrument, i) => {
              const pos = getPos(i)
              const isCenter = pos === 0
              const isVisible = Math.abs(pos) <= 1

              if (!isVisible) return null

              return (
                <motion.div
                  key={instrument.id}
                  animate={{
                    x: `${pos * X_OFFSET}%`,
                    scale: isCenter ? 1 : SIDE_SCALE,
                    opacity: isCenter ? 1 : SIDE_OPACITY,
                    zIndex: isCenter ? 10 : 4,
                  }}
                  transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                  className="absolute flex justify-center"
                  style={{ width: CARD_WIDTH }}
                  onClick={() => !isCenter && setActive(i)}
                >
                  <Link
                    href={isCenter ? `/instruments/${instrument.slug}` : '#'}
                    onClick={(e) => { if (!isCenter) e.preventDefault() }}
                    className="block w-full overflow-hidden rounded-2xl"
                    style={{
                      background: '#ffffff',
                      boxShadow: isCenter
                        ? '0 4px 24px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
                        : '0 1px 4px rgba(0,0,0,0.04)',
                      cursor: 'pointer',
                      transition: 'box-shadow 0.3s',
                    }}
                  >
                    {/* Image area — inset wrapper keeps Next/Image inside rounded corners */}
                    <div
                      className="carousel-card-image relative w-full"
                      style={{ background: '#f5f2ec' }}
                    >
                      {instrument.image_path ? (
                        /* absolute inset-[10px] pads the image away from card edges */
                        <div className="absolute inset-[10px]">
                          <Image
                            src={instrument.image_path}
                            alt={`${instrument.manufacturer} ${instrument.name}`}
                            fill
                            className="object-contain"
                            sizes="(max-width: 640px) 55vw, 360px"
                          />
                        </div>
                      ) : (
                        <div
                          className="absolute inset-0 flex items-center justify-center font-mono uppercase tracking-widest"
                          style={{ fontSize: '10px', color: 'var(--ink-whisper)' }}
                        >
                          {instrument.manufacturer}
                        </div>
                      )}
                    </div>

                    {/* Info strip */}
                    <div className="px-4 py-3">
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p
                          className="font-mono uppercase"
                          style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--ink-ghost)' }}
                        >
                          {instrument.manufacturer}
                        </p>
                        <span
                          className="font-mono uppercase rounded-full shrink-0"
                          style={{
                            fontSize: '9px',
                            letterSpacing: '1.5px',
                            color: 'var(--ink-ghost)',
                            border: '1px solid rgba(26,23,20,0.12)',
                            padding: '2px 8px',
                          }}
                        >
                          {CATEGORY_LABELS[instrument.category] ?? instrument.category}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <h2
                          className="font-display italic leading-tight min-w-0 truncate"
                          style={{ fontSize: '22px', color: 'var(--ink)' }}
                        >
                          {instrument.name}
                        </h2>
                      </div>

                      <AnimatePresence mode="wait">
                        {isCenter && (
                          <motion.p
                            key={instrument.id}
                            initial={{ opacity: 0, y: 3 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="mt-2 font-mono uppercase"
                            style={{ fontSize: '11px', letterSpacing: '2px', color: 'var(--ink)' }}
                          >
                            Explore →
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Right arrow */}
        <div
          className="shrink-0 flex items-center justify-center"
          style={{ width: `${ARROW_WIDTH}px` }}
        >
          <button
            onClick={next}
            aria-label="Next instrument"
            className="flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              width: '32px', height: '32px',
              background: '#ffffff',
              boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
              border: '1px solid rgba(26,23,20,0.12)',
              cursor: 'pointer',
              color: 'var(--ink-ghost)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'rgba(26,23,20,0.35)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ink-ghost)'; e.currentTarget.style.borderColor = 'rgba(26,23,20,0.12)' }}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

      </div>

      {/* Dots — inset to align with the stage, not the full row width */}
      <div
        className="flex justify-center gap-2 mt-3"
        style={{ paddingLeft: `${ARROW_WIDTH}px`, paddingRight: `${ARROW_WIDTH}px` }}
      >
        {instruments.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to instrument ${i + 1}`}
            style={{
              width: i === active ? '20px' : '6px',
              height: '6px',
              borderRadius: '3px',
              background: i === active ? 'var(--bio-teal)' : 'var(--ink-whisper)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              padding: 0,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
