'use client'

import { motion } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import type { Message } from 'ai'

interface Props {
  message: Message
  isStreaming?: boolean
}

export function MessageBubble({ message, isStreaming }: Props) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className="max-w-[88%] rounded-2xl px-5 py-4 leading-relaxed"
        style={{
          fontSize: '14px',
          ...(isUser
            ? {
                fontFamily: 'var(--font-mono)',
                background: 'var(--bio-teal)',
                color: 'var(--cream)',
                borderBottomRightRadius: '4px',
              }
            : {
                background: 'var(--cream-dark)',
                color: 'var(--ink)',
                border: '1px solid rgba(26,23,20,0.08)',
                borderBottomLeftRadius: '4px',
              }),
        }}
      >
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <ReactMarkdown
            components={{
              p: ({ children }) => (
                <p className="mb-3 last:mb-0 leading-relaxed">{children}</p>
              ),
              strong: ({ children }) => (
                <strong style={{ fontWeight: 700, color: 'var(--ink)' }}>{children}</strong>
              ),
              em: ({ children }) => <em className="italic">{children}</em>,
              ol: ({ children }) => (
                <ol className="list-decimal list-outside pl-5 mb-3 space-y-2">{children}</ol>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-outside pl-5 mb-3 space-y-1">{children}</ul>
              ),
              li: ({ children }) => (
                <li className="leading-relaxed">{children}</li>
              ),
              h1: ({ children }) => (
                <h1 className="font-display italic mb-2" style={{ fontSize: '18px', color: 'var(--ink)' }}>{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="font-display italic mb-2" style={{ fontSize: '16px', color: 'var(--ink)' }}>{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-mono uppercase mb-1" style={{ fontSize: '11px', letterSpacing: '1.5px', color: 'var(--bio-teal)' }}>{children}</h3>
              ),
              code: ({ children }) => (
                <code
                  className="rounded px-1.5 py-0.5 font-mono"
                  style={{ fontSize: '12px', background: 'rgba(26,23,20,0.07)', color: 'var(--ink)' }}
                >
                  {children}
                </code>
              ),
              hr: () => <hr style={{ border: 'none', borderTop: '1px solid rgba(26,23,20,0.1)', margin: '12px 0' }} />,
            }}
          >
            {message.content}
          </ReactMarkdown>
        )}

        {isStreaming && (
          <span
            className="inline-block w-1.5 h-3.5 ml-0.5 rounded-sm animate-pulse"
            style={{ background: 'var(--ink-ghost)' }}
          />
        )}
      </div>
    </motion.div>
  )
}
