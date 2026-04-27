import type { Metadata } from 'next'
import { Instrument_Serif, DM_Mono, Inter } from 'next/font/google'
import './globals.css'
import { Footer } from '@/components/Footer'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: '400',
  style: ['normal', 'italic'],
  variable: '--font-display',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400'],
  style: ['normal', 'italic'],
  variable: '--font-mono',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Elucia — the instrument, illuminated',
  description: 'Ask any question about your synth or drum machine. Get answers grounded in the official manual — with the relevant controls highlighted right on the instrument.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmMono.variable} ${inter.variable}`}>
      <body>
        <div className="grain" aria-hidden="true" />
        {children}
        <Footer />
      </body>
    </html>
  )
}
