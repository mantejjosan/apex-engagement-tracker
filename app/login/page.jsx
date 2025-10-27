'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Logo from '@/components/logo'
import PoweredBy from '@/components/poweredby'
import Link from 'next/link'
import { register } from 'next/dist/next-devtools/userspace/pages/pages-dev-overlay-setup'


export default function LoginPage() {
  const [studentId, setStudentId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Validate format (8 characters)
    if (studentId.length !== 8) {
      setError('Student ID must be exactly 8 characters')
      setLoading(false)
      return
    }

    try {
      // Call API to validate and create session
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Invalid Student ID')
        setLoading(false)
        return
      }

      // Success! Redirect
      router.push(redirect)
      router.refresh()
    } catch (err) {
      setError('Connection error. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 ">
      <div className="relative flex flex-col items-center bg-card rounded-xl shadow-xl p-8 w-full max-w-md">
        <div className="absolute -top-20 rotate-6">
            <Logo size="lg" animated/>

        </div>
        <h1 className="text-3xl font-bold text-center  mt-4">Apex</h1>
        <p className="text-gray-500 text-center mb-6">Enter your Unique 8 digit ID</p>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value.toLowerCase())}
            placeholder="example: a3b4c5d6"
            maxLength={8}
            className="w-full px-4 py-3 border rounded-lg mb-4 text-center text-xl font-mono"
            disabled={loading}
          />

          {error && (
            <p className="text-red-500 text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-semibold hover:bg-sidebar-primary disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Continue'}
          </button>
        </form>

        <p className="text-gray-500 text-sm text-center mt-4">
          Check your email for your 8 digit ID
        </p>
          <p className="text-green-500 flex gap-2">
            <div className="text-muted-foreground">Haven't got one? </div>
            <Link href="/register">REGISTER NOW</Link>
          </p>
      </div>
      <aside className='fixed bottom-0 right-0 left-0'>
        <PoweredBy />

      </aside>
    </div>
  )
}