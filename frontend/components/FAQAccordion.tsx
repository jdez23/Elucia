'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { FAQ, FAQCategory } from '@/lib/instrument-content'
import { CATEGORY_LABELS } from '@/lib/instrument-content'

interface Props {
  faqs: FAQ[]
}

const CATEGORIES: FAQCategory[] = [
  'getting-started',
  'controls',
  'sound-design',
  'workflow',
  'troubleshooting',
]

export function FAQAccordion({ faqs }: Props) {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>('getting-started')
  const [openId, setOpenId] = useState<string | null>(null)

  const visible = faqs.filter((f) => f.category === activeCategory)

  return (
    <div>
      {/* Category tabs */}
      <div className="flex flex-wrap gap-2 mb-5">
        {CATEGORIES.map((cat) => {
          const hasItems = faqs.some((f) => f.category === cat)
          if (!hasItems) return null
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat)
                setOpenId(null)
              }}
              className="font-mono uppercase rounded-full transition-all duration-200"
              style={{
                fontSize: '9px',
                letterSpacing: '2px',
                padding: '4px 12px',
                background: isActive ? 'var(--ink)' : 'transparent',
                color: isActive ? 'var(--cream)' : 'var(--ink-ghost)',
                border: `1px solid ${isActive ? 'var(--ink)' : 'rgba(26,23,20,0.15)'}`,
                cursor: 'pointer',
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          )
        })}
      </div>

      {/* FAQ items */}
      <div className="space-y-0">
        {visible.map((faq, i) => {
          const isOpen = openId === faq.id
          return (
            <div
              key={faq.id}
              style={{
                borderTop: i === 0 ? '1px solid rgba(26,23,20,0.08)' : 'none',
                borderBottom: '1px solid rgba(26,23,20,0.08)',
              }}
            >
              <button
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="w-full flex items-start justify-between gap-4 py-4 text-left transition-colors duration-200"
                style={{ cursor: 'pointer', background: 'transparent', border: 'none' }}
              >
                <span
                  className="font-mono leading-relaxed"
                  style={{ fontSize: '12px', color: 'var(--ink-soft)' }}
                >
                  {faq.question}
                </span>
                <span
                  className="shrink-0 font-mono transition-colors duration-200"
                  style={{
                    fontSize: '18px',
                    lineHeight: 1,
                    color: isOpen ? 'var(--ink)' : 'var(--ink-ghost)',
                    marginTop: '1px',
                  }}
                >
                  {isOpen ? '−' : '+'}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeInOut' }}
                    style={{ overflow: 'hidden' }}
                  >
                    <p
                      className="font-mono leading-relaxed pb-4"
                      style={{ fontSize: '11px', color: 'var(--ink-ghost)' }}
                    >
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </div>
  )
}
