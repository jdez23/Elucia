'use client'

import { motion } from 'framer-motion'
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
        className="max-w-[85%] rounded-2xl px-4 py-3 font-mono leading-relaxed"
        style={{
          fontSize: '12px',
          ...(isUser
            ? {
                background: 'var(--bio-teal)',
                color: 'var(--cream)',
                borderBottomRightRadius: '4px',
              }
            : {
                background: 'var(--cream-dark)',
                color: 'var(--ink-soft)',
                border: '1px solid rgba(26,23,20,0.08)',
                borderBottomLeftRadius: '4px',
              }),
        }}
      >
        {message.content.split('\n').map((line, i, arr) => (
          <span key={i}>
            {line}
            {i < arr.length - 1 && <br />}
          </span>
        ))}

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
