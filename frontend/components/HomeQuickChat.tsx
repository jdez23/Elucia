'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Send } from 'lucide-react'
import { INSTRUMENT_CONTENT } from '@/lib/instrument-content'
import type { Instrument } from '@/types/database'

interface Props {
  instruments: Instrument[]
}

export function HomeQuickChat({ instruments }: Props) {
  const router = useRouter()
  const [selectedSlug, setSelectedSlug] = useState(instruments[0]?.slug ?? '')
  const [input, setInput] = useState('')

  function submit(prompt: string, slug?: string) {
    const target = slug ?? selectedSlug
    if (!target || !prompt.trim()) return
    router.push(`/instruments/${target}/chat?q=${encodeURIComponent(prompt.trim())}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit(input)
    }
  }

  const chips = instruments.flatMap((inst) => {
    const content = INSTRUMENT_CONTENT[inst.slug]
    if (!content) return []
    return content.suggestedPrompts.slice(0, 3).map((sp) => ({
      label: sp.label,
      prompt: sp.prompt,
      slug: inst.slug,
      instrumentName: inst.name,
    }))
  })

  return (
    <div className="w-full space-y-4">

      {/* Suggestion chips — single scrollable row */}
      <div
        className="flex gap-2 overflow-x-auto pb-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {chips.map((chip) => (
          <button
            key={`${chip.slug}-${chip.label}`}
            onClick={() => submit(chip.prompt, chip.slug)}
            className="font-mono rounded-full transition-all duration-200 flex items-center gap-1.5 shrink-0"
            style={{
              fontSize: '12px',
              letterSpacing: '0.5px',
              padding: '6px 14px',
              background: 'var(--cream-dark)',
              border: '1px solid rgba(26,23,20,0.12)',
              color: 'var(--ink-soft)',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--ink)'
              e.currentTarget.style.color = 'var(--ink)'
              e.currentTarget.style.background = 'var(--cream-deep)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(26,23,20,0.12)'
              e.currentTarget.style.color = 'var(--ink-soft)'
              e.currentTarget.style.background = 'var(--cream-dark)'
            }}
          >
            <span
              className="font-mono uppercase"
              style={{ fontSize: '10px', letterSpacing: '1.5px', color: 'var(--ink-whisper)' }}
            >
              {chip.instrumentName} ·
            </span>
            {chip.label}
          </button>
        ))}
      </div>

      {/* Chat box */}
      <div
        className="w-full rounded-2xl overflow-hidden"
        style={{
          background: '#ffffff',
          boxShadow: '0 2px 16px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04)',
        }}
      >
        {/* Instrument selector */}
        {instruments.length > 1 && (
          <div
            className="flex flex-wrap gap-1.5 px-4 pt-3 pb-2"
            style={{ borderBottom: '1px solid rgba(0,0,0,0.06)' }}
          >
            <span
              className="font-mono uppercase self-center mr-1"
              style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--ink-whisper)' }}
            >
              Ask about
            </span>
            {instruments.map((inst) => {
              const isActive = selectedSlug === inst.slug
              return (
                <button
                  key={inst.slug}
                  onClick={() => setSelectedSlug(inst.slug)}
                  className="font-mono uppercase rounded-full transition-all duration-150"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '1.5px',
                    padding: '4px 12px',
                    background: isActive ? 'var(--ink)' : 'transparent',
                    color: isActive ? 'var(--cream)' : 'var(--ink-ghost)',
                    border: isActive ? '1px solid var(--ink)' : '1px solid rgba(26,23,20,0.15)',
                    cursor: 'pointer',
                  }}
                >
                  {inst.name}
                </button>
              )
            })}
          </div>
        )}

        {/* Input row */}
        <div className="flex items-end gap-3 p-4">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              selectedSlug
                ? `Ask anything about the ${instruments.find((i) => i.slug === selectedSlug)?.name ?? 'instrument'}…`
                : 'Select an instrument above…'
            }
            rows={3}
            className="flex-1 resize-none font-mono rounded-xl px-4 py-3 outline-none transition-all duration-200 leading-relaxed"
            style={{
              fontSize: '14px',
              color: 'var(--ink)',
              background: 'var(--cream-dark)',
              border: '1px solid rgba(0,0,0,0.07)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0ea5e9'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.12)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(0,0,0,0.07)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          {/* Glowy organic send button */}
          <button
            onClick={() => submit(input)}
            disabled={!input.trim() || !selectedSlug}
            className="shrink-0 flex items-center justify-center transition-all duration-300 disabled:opacity-30"
            style={{
              width: '52px',
              height: '52px',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '62% 38% 46% 54% / 60% 44% 56% 40%',
              boxShadow: '0 0 18px rgba(14,165,233,0.55), 0 0 36px rgba(99,102,241,0.3)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 28px rgba(14,165,233,0.75), 0 0 56px rgba(99,102,241,0.45)'
              e.currentTarget.style.transform = 'scale(1.06)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 18px rgba(14,165,233,0.55), 0 0 36px rgba(99,102,241,0.3)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <p
          className="px-4 pb-3 font-mono uppercase text-center"
          style={{ fontSize: '10px', letterSpacing: '2px', color: 'var(--ink-whisper)' }}
        >
          opens the chat · grounded in the official manual
        </p>
      </div>
    </div>
  )
}
