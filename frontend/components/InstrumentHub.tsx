'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { InstrumentVisual } from '@/components/InstrumentVisual'
import { FAQAccordion } from '@/components/FAQAccordion'
import type { Instrument } from '@/types/database'
import type { InstrumentContent } from '@/lib/instrument-content'

interface Props {
  instrument: Instrument
  content: InstrumentContent | null
}

export function InstrumentHub({ instrument, content }: Props) {
  const router = useRouter()

  function openChat(prompt?: string) {
    const base = `/instruments/${instrument.slug}/chat`
    router.push(prompt ? `${base}?q=${encodeURIComponent(prompt)}` : base)
  }

  return (
    <div className="page min-h-screen flex flex-col" style={{ background: 'var(--cream)' }}>

      {/* Header */}
      <header
        className="flex items-center gap-4 py-4 shrink-0"
        style={{
          borderBottom: '1px solid rgba(26,23,20,0.08)',
          background: 'rgba(245,240,232,0.85)',
          backdropFilter: 'blur(12px)',
          position: 'sticky',
          top: 0,
          zIndex: 10,
          paddingLeft: '30px',
          paddingRight: '30px',
        }}
      >
        <Link
          href="/"
          className="font-mono uppercase transition-colors duration-200"
          style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--ink-ghost)' }}
        >
          ← All
        </Link>
        <div style={{ width: '1px', height: '12px', background: 'rgba(26,23,20,0.15)' }} />
        <div className="flex-1 min-w-0">
          <p
            className="font-mono uppercase"
            style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--ink-ghost)' }}
          >
            {instrument.manufacturer}
          </p>
          <h1
            className="font-display italic leading-tight truncate"
            style={{ fontSize: '20px', color: 'var(--ink)' }}
          >
            {instrument.name}
          </h1>
        </div>
        {/* Open Chat — desktop */}
        <button
          onClick={() => openChat()}
          className="hidden sm:flex items-center gap-2 font-mono uppercase rounded-lg px-4 py-2 transition-all duration-200 hover:opacity-90 shrink-0"
          style={{
            fontSize: '10px',
            letterSpacing: '2px',
            background: 'var(--ink)',
            color: 'var(--cream)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Open Chat →
        </button>
      </header>

      {/* Body */}
      <div className="flex flex-col sm:flex-row flex-1 min-h-0 pb-20 sm:pb-0">

        {/* Left: visual + tagline + FAQ */}
        <div
          className="sm:w-3/5 flex flex-col sm:overflow-y-auto"
          style={{ padding: '30px', borderRight: '1px solid rgba(26,23,20,0.06)' }}
        >
          <InstrumentVisual
            slug={instrument.slug}
            instrumentName={`${instrument.manufacturer} ${instrument.name}`}
            activeControlIds={[]}
          />

          {content?.tagline && (
            <p
              className="mt-5 font-display italic leading-relaxed"
              style={{ fontSize: '16px', color: 'var(--ink-soft)' }}
            >
              {content.tagline}
            </p>
          )}

          {content?.faqs && content.faqs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="mt-8"
            >
              <div className="section-header">
                <h2 className="section-title">Common questions</h2>
                <div className="section-line" />
              </div>
              <FAQAccordion faqs={content.faqs} />
            </motion.div>
          )}
        </div>

        {/* Right: suggested prompts + feature bullets */}
        <div className="sm:w-2/5 flex flex-col sm:overflow-y-auto" style={{ padding: '30px' }}>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
          >
            <div className="section-header">
              <h2 className="section-title">Where to start</h2>
              <div className="section-line" />
            </div>
            <p
              className="mb-5"
              style={{ fontSize: '13px', color: 'var(--ink-ghost)', letterSpacing: '0.2px' }}
            >
              Click a question to open the chat with an instant answer.
            </p>

            {content?.suggestedPrompts && content.suggestedPrompts.length > 0 ? (
              <div className="space-y-2">
                {content.suggestedPrompts.map((sp, i) => (
                  <motion.button
                    key={sp.label}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: 0.1 + i * 0.05 }}
                    onClick={() => openChat(sp.prompt)}
                    className="w-full text-left rounded-lg px-4 py-3 transition-all duration-200 group"
                    style={{
                      fontSize: '13px',
                      color: 'var(--ink-soft)',
                      background: '#ffffff',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                      cursor: 'pointer',
                      borderLeft: '2px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderLeftColor = 'var(--bio-teal)'
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(14,165,233,0.12)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderLeftColor = 'transparent'
                      e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.05)'
                    }}
                  >
                    <span
                      className="font-mono uppercase block mb-0.5"
                      style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--ink)' }}
                    >
                      {sp.label}
                    </span>
                    {sp.prompt}
                  </motion.button>
                ))}
              </div>
            ) : (
              <button
                onClick={() => openChat()}
                className="w-full rounded-lg px-4 py-3 transition-all duration-200"
                style={{
                  fontSize: '11px',
                  color: 'var(--cream)',
                  background: 'var(--ink)',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Start chatting →
              </button>
            )}
          </motion.div>

          {/* Feature bullets */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="mt-10"
          >
            <div
              className="rounded-xl p-5 space-y-3"
              style={{
                background: '#ffffff',
                boxShadow: '0 2px 12px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {[
                'Answers grounded in the official manual',
                'Physical controls highlighted on the image',
                'Ask follow-ups to go deeper',
              ].map((bullet) => (
                <div key={bullet} className="flex items-start gap-3">
                  <span
                    className="shrink-0 mt-1 h-1.5 w-1.5 rounded-full"
                    style={{ background: 'var(--ink)' }}
                  />
                  <p
                    className="font-mono leading-relaxed"
                    style={{ fontSize: '13px', color: 'var(--ink-ghost)' }}
                  >
                    {bullet}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Mobile sticky Open Chat bar */}
      <div
        className="sm:hidden fixed bottom-0 inset-x-0"
        style={{
          padding: '30px',
          background: 'rgba(245,240,232,0.95)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(26,23,20,0.08)',
          zIndex: 50,
        }}
      >
        <button
          onClick={() => openChat()}
          className="w-full rounded-lg py-3.5 transition-all duration-200 hover:opacity-90"
          style={{
            fontSize: '12px',
            letterSpacing: '3px',
            background: 'var(--ink)',
            color: 'var(--cream)',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Open Chat →
        </button>
      </div>

    </div>
  )
}
