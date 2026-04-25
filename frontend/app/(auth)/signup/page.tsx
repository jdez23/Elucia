'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/` },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      setDone(true)
    }
  }

  if (done) {
    return (
      <main className="page min-h-screen flex items-center justify-center" style={{ paddingLeft: '30px', paddingRight: '30px' }}>
        <div className="text-center max-w-sm space-y-4">
          <p
            className="font-display italic leading-none"
            style={{ fontSize: '42px', color: 'var(--bio-teal)' }}
          >
            check your email
          </p>
          <p
            className="font-mono leading-relaxed"
            style={{ fontSize: '11px', color: 'var(--ink-ghost)', letterSpacing: '0.3px' }}
          >
            We sent a confirmation link to{' '}
            <span style={{ color: 'var(--ink)' }}>{email}</span>.{' '}
            Click it to activate your account.
          </p>
          <Link
            href="/login"
            className="inline-block font-mono uppercase mt-4"
            style={{ fontSize: '10px', letterSpacing: '3px', color: 'var(--bio-teal)' }}
          >
            ← back to sign in
          </Link>
        </div>
      </main>
    )
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
            create account
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
            placeholder="password (min 8 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
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
            {loading ? 'creating account…' : 'create account'}
          </button>
        </form>

        <p
          className="text-center font-mono mt-8"
          style={{ fontSize: '11px', color: 'var(--ink-ghost)', letterSpacing: '0.5px' }}
        >
          already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--bio-teal)' }}>
            sign in
          </Link>
        </p>

      </div>
    </main>
  )
}
