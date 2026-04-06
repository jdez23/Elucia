'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { Hotspot, HotspotMap } from '@/lib/hotspots'

interface Props {
  slug: string
  instrumentName: string
  activeControlIds: string[]
}

export function InstrumentVisual({ slug, instrumentName, activeControlIds }: Props) {
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    fetch(`/instruments/${slug}/hotspots.json`)
      .then((r) => r.json())
      .then((data: HotspotMap) => setHotspots(data.controls))
      .catch(() => setHotspots([]))
  }, [slug])

  return (
    <div className="relative w-full select-none">
      <div className="relative w-full">
        <Image
          src={`/instruments/${slug}/main.png`}
          alt={instrumentName}
          width={1200}
          height={600}
          className={`w-full h-auto rounded-xl object-contain transition-opacity duration-700 ${
            imgLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            boxShadow: '0 8px 40px rgba(26,23,20,0.12), 0 2px 8px rgba(26,23,20,0.06)',
          }}
          onLoad={() => setImgLoaded(true)}
          priority
        />

        {/* Skeleton */}
        {!imgLoaded && (
          <div
            className="absolute inset-0 rounded-xl animate-pulse"
            style={{ background: 'var(--cream-deep)' }}
          />
        )}

        {/* SVG overlay */}
        {imgLoaded && hotspots.length > 0 && (
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <AnimatePresence>
              {hotspots
                .filter((h) => activeControlIds.includes(h.id))
                .map((hotspot) => (
                  <ControlOverlay key={hotspot.id} hotspot={hotspot} />
                ))}
            </AnimatePresence>
          </svg>
        )}
      </div>

      {/* Active control labels */}
      <AnimatePresence>
        {activeControlIds.length > 0 && hotspots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex flex-wrap gap-2"
          >
            {hotspots
              .filter((h) => activeControlIds.includes(h.id))
              .map((h) => (
                <span
                  key={h.id}
                  className="inline-flex items-center gap-1.5 rounded-full font-mono uppercase"
                  style={{
                    fontSize: '10px',
                    letterSpacing: '1px',
                    padding: '3px 10px',
                    background: 'rgba(10,122,110,0.08)',
                    border: '1px solid rgba(10,122,110,0.25)',
                    color: 'var(--bio-teal)',
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: 'var(--bio-teal)' }}
                  />
                  {h.label}
                </span>
              ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ControlOverlay({ hotspot }: { hotspot: Hotspot }) {
  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Pulsing outer ring */}
      <motion.rect
        x={hotspot.x - hotspot.w * 0.2}
        y={hotspot.y - hotspot.h * 0.2}
        width={hotspot.w * 1.4}
        height={hotspot.h * 1.4}
        rx="1.2"
        fill="none"
        stroke="#0a7a6e"
        strokeWidth="0.35"
        animate={{ opacity: [0.2, 0.8, 0.2] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Solid highlight */}
      <rect
        x={hotspot.x}
        y={hotspot.y}
        width={hotspot.w}
        height={hotspot.h}
        rx="0.6"
        fill="rgba(10,122,110,0.15)"
        stroke="#0a7a6e"
        strokeWidth="0.4"
      />
    </motion.g>
  )
}
