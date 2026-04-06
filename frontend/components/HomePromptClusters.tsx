'use client'

import { motion } from 'framer-motion'

interface PromptGroup {
  category: string
  prompts: string[]
}

const GROUPS: PromptGroup[] = [
  {
    category: 'Getting Started',
    prompts: [
      'How do I make my first sound?',
      'Walk me through the signal flow.',
      'What should I learn first?',
    ],
  },
  {
    category: 'Sound Design',
    prompts: [
      'How do I get a classic bass patch?',
      'What does the filter cutoff do?',
      'How do I create a pad sound?',
    ],
  },
  {
    category: 'Workflow',
    prompts: [
      'How do I save my settings?',
      'How do I sync to my DAW?',
      'Walk me through recording a pattern.',
    ],
  },
  {
    category: 'Troubleshooting',
    prompts: [
      'Why am I getting no sound?',
      'My MIDI isn\'t working — what should I check?',
      'How do I reset to factory defaults?',
    ],
  },
]

export function HomePromptClusters() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.15 }}
    >
      <div className="section-header">
        <h2 className="section-title">What you can ask</h2>
        <div className="section-line" />
      </div>
      <p
        className="font-mono mb-6"
        style={{ fontSize: '11px', color: 'var(--ink-ghost)', letterSpacing: '0.3px' }}
      >
        Select any instrument and ask questions like these — the AI answers from the official manual.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GROUPS.map((group) => (
          <div
            key={group.category}
            className="rounded-xl p-4"
            style={{
              background: 'var(--cream-dark)',
              border: '1px solid rgba(26,23,20,0.07)',
            }}
          >
            <p
              className="font-mono uppercase mb-3"
              style={{ fontSize: '9px', letterSpacing: '3px', color: 'var(--bio-teal)' }}
            >
              {group.category}
            </p>
            <div className="space-y-2">
              {group.prompts.map((prompt) => (
                <div
                  key={prompt}
                  className="flex items-start gap-2"
                >
                  <span
                    className="shrink-0 mt-1 h-1 w-1 rounded-full"
                    style={{ background: 'var(--ink-whisper)' }}
                  />
                  <p
                    className="font-mono leading-relaxed"
                    style={{ fontSize: '11px', color: 'var(--ink-soft)' }}
                  >
                    {prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
