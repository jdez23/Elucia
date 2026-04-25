'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/')
      router.refresh()
    }
  }

  return (
    <main className="page min-h-screen flex items-center justify-center" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
      <div className="w-full max-w-sm">

        <div className="text-center mb-12">
          <Link href="/">
            <h1
              className="font-display italic leading-none tracking-[-1px]"
              style={{ fontSize: '52px', color: 'var(--ink)' }}
            >
              Elucia
            </h1>
          </Link>
          <p
            className="font-mono uppercase mt-3"
            style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--ink-ghost)' }}
          >
            sign in
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full font-mono rounded-lg px-4 py-3 outline-none transition-all duration-200"
            style={{
              fontSize: '13px',
              color: 'var(--ink)',
              background: 'var(--cream-dark)',
              border: '1px solid rgba(26,23,20,0.12)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--bio-teal)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10,122,110,0.08)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(26,23,20,0.12)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full font-mono rounded-lg px-4 py-3 outline-none transition-all duration-200"
            style={{
              fontSize: '13px',
              color: 'var(--ink)',
              background: 'var(--cream-dark)',
              border: '1px solid rgba(26,23,20,0.12)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--bio-teal)'
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(10,122,110,0.08)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(26,23,20,0.12)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />

          {error && (
            <p className="font-mono" style={{ fontSize: '11px', color: '#b91c1c' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full font-mono uppercase rounded-lg px-4 transition-all duration-200 disabled:opacity-40"
            style={{
              fontSize: '11px',
              letterSpacing: '3px',
              color: 'var(--cream)',
              background: 'var(--bio-teal)',
              border: '1px solid var(--bio-teal)',
              paddingTop: '14px',
              paddingBottom: '14px',
            }}
          >
            {loading ? 'signing in…' : 'sign in'}
          </button>
        </form>

        <p
          className="text-center font-mono mt-8"
          style={{ fontSize: '11px', color: 'var(--ink-ghost)', letterSpacing: '0.5px' }}
        >
          no account?{' '}
          <Link href="/signup" style={{ color: 'var(--bio-teal)' }}>
            sign up
          </Link>
        </p>

      </div>
    </main>
  )
}
