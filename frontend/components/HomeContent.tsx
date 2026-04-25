'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
}

export function HomeContent({ children }: { children: ReactNode }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8 sm:space-y-12 lg:space-y-14"
    >
      {children}
    </motion.div>
  )
}

export function HomeSection({ children }: { children: ReactNode }) {
  return (
    <motion.div variants={item} transition={{ duration: 0.5 }}>
      {children}
    </motion.div>
  )
}
