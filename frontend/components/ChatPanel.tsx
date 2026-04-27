'use client'

import { useEffect, useRef, useState } from 'react'
import { useChat } from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send } from 'lucide-react'
import { matchControls } from '@/lib/hotspots'
import type { Hotspot } from '@/lib/hotspots'
import type { SuggestedPrompt } from '@/lib/instrument-content'
import { MessageBubble } from './MessageBubble'

interface Props {
  instrumentId: string
  instrumentName: string
  hotspots: Hotspot[]
  onHighlightsChange: (controlIds: string[]) => void
  sessionId?: string
  suggestedPrompts?: SuggestedPrompt[]
  initialPrompt?: string
}

export function ChatPanel({
  instrumentId,
  instrumentName,
  hotspots,
  onHighlightsChange,
  sessionId,
  suggestedPrompts,
  initialPrompt,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [isExtracting, setIsExtracting] = useState(false)
  const hasAutoSubmitted = useRef(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error, append } = useChat({
    api: '/api/chat',
    body: { instrumentId, sessionId },
    onFinish: async (message) => {
      if (hotspots.length === 0) return
      setIsExtracting(true)
      try {
        const res = await fetch('/api/chat/highlights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message.content }),
        })
        const { controls } = await res.json()
        const matched = matchControls(controls, hotspots)
        onHighlightsChange(matched)
      } catch {
        // Non-critical
      } finally {
        setIsExtracting(false)
      }
    },
    onError: () => {
      onHighlightsChange([])
    },
  })

  // Auto-submit initialPrompt once on mount
  useEffect(() => {
    if (initialPrompt && !hasAutoSubmitted.current && messages.length === 0) {
      hasAutoSubmitted.current = true
      append({ role: 'user', content: initialPrompt })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleInputChangeWithClear = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    handleInputChange(e)
    if (e.target.value.length === 1) onHighlightsChange([])
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!isLoading && input.trim()) {
        handleSubmit(e as unknown as React.FormEvent)
      }
    }
  }

  const handleSuggestionClick = (prompt: string) => {
    onHighlightsChange([])
    append({ role: 'user', content: prompt })
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--cream)' }}>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto py-5 space-y-4 min-h-0"
        style={{ paddingLeft: '30px', paddingRight: '30px' }}
      >
        {messages.length === 0 && (
          <EmptyState
            instrumentName={instrumentName}
            suggestedPrompts={suggestedPrompts}
            onSuggestionClick={handleSuggestionClick}
          />
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <MessageBubble
              key={m.id}
              message={m}
              isStreaming={isLoading && m.role === 'assistant' && m === messages.at(-1)}
            />
          ))}

          {isLoading && messages.at(-1)?.role === 'user' && (
            <motion.div
              key="typing"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
              className="flex justify-start"
            >
              <div
                className="rounded-2xl px-4 py-3 flex gap-1.5 items-center"
                style={{
                  background: 'var(--cream-dark)',
                  border: '1px solid rgba(26,23,20,0.08)',
                  borderBottomLeftRadius: '4px',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="block w-1.5 h-1.5 rounded-full animate-bounce"
                    style={{
                      background: 'var(--ink-whisper)',
                      animationDelay: `${i * 0.15}s`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <p
            className="font-mono text-center"
            style={{ fontSize: '11px', color: '#b91c1c' }}
          >
            Something went wrong. Please try again.
          </p>
        )}
      </div>

      {/* Input */}
      <div
        className="shrink-0 py-4"
        style={{ borderTop: '1px solid rgba(26,23,20,0.08)', paddingLeft: '30px', paddingRight: '30px' }}
      >
        <form onSubmit={handleSubmit} className="flex gap-2 items-end">
          <textarea
            value={input}
            onChange={handleInputChangeWithClear}
            onKeyDown={handleKeyDown}
            placeholder={`Ask anything about the ${instrumentName}…`}
            rows={2}
            disabled={isLoading}
            className="flex-1 resize-none rounded-lg px-4 py-3 outline-none transition-all duration-200 leading-relaxed"
            style={{
              fontSize: '14px',
              color: 'var(--ink)',
              background: 'var(--cream-dark)',
              border: '1px solid rgba(26,23,20,0.1)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = '#0ea5e9'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(14,165,233,0.15)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(26,23,20,0.1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="shrink-0 h-[60px] w-[52px] rounded-lg flex items-center justify-center transition-all duration-200 disabled:opacity-30"
            style={{
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              color: '#ffffff',
              boxShadow: '0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(99,102,241,0.18)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 22px rgba(14,165,233,0.55), 0 0 44px rgba(99,102,241,0.28)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 0 14px rgba(14,165,233,0.35), 0 0 28px rgba(99,102,241,0.18)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            {isLoading || isExtracting ? (
              <span
                className="h-4 w-4 rounded-full border-2 border-t-transparent animate-spin"
                style={{ borderColor: 'rgba(245,240,232,0.4)', borderTopColor: 'var(--cream)' }}
              />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </form>
        <p
          className="mt-2 font-mono uppercase text-center"
          style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--ink-whisper)' }}
        >
          grounded in the official manual · enter to send
        </p>
      </div>
    </div>
  )
}

function EmptyState({
  instrumentName,
  suggestedPrompts,
  onSuggestionClick,
}: {
  instrumentName: string
  suggestedPrompts?: SuggestedPrompt[]
  onSuggestionClick: (prompt: string) => void
}) {
  const prompts = suggestedPrompts ?? [
    { label: 'Get started', prompt: 'How do I get started?' },
    { label: 'Filter', prompt: 'What does the filter do?' },
    { label: 'Save preset', prompt: 'How do I save a preset?' },
    { label: 'Signal flow', prompt: 'Walk me through the signal flow.' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="text-center space-y-6 py-10"
    >
      <div>
        <p className="font-display italic" style={{ fontSize: '22px', color: 'var(--ink)' }}>
          Ask me anything
        </p>
        <p
          className="mt-2 leading-relaxed"
          style={{ fontSize: '13px', color: 'var(--ink-ghost)', letterSpacing: '0.2px' }}
        >
          about the {instrumentName}
          <br />
          I&apos;ll highlight the relevant controls
        </p>
      </div>
      <div className="flex flex-col gap-2 max-w-[280px] mx-auto">
        {prompts.map((s) => (
          <button
            key={s.label}
            onClick={() => onSuggestionClick(s.prompt)}
            className="text-left rounded-lg px-3 py-2.5 transition-all duration-200"
            style={{
              fontSize: '13px',
              color: 'var(--ink-soft)',
              background: 'var(--cream-dark)',
              border: '1px solid rgba(26,23,20,0.08)',
              borderLeft: '2px solid transparent',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderLeftColor = 'var(--bio-teal)'
              e.currentTarget.style.background = 'var(--cream-deep)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderLeftColor = 'transparent'
              e.currentTarget.style.background = 'var(--cream-dark)'
            }}
          >
            <span
              className="font-mono uppercase block mb-0.5"
              style={{ fontSize: '9px', letterSpacing: '2px', color: 'var(--bio-teal)' }}
            >
              {s.label}
            </span>
            {s.prompt}
          </button>
        ))}
      </div>
    </motion.div>
  )
}
