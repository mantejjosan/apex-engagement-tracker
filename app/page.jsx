'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ParticipationHistory from '@/components/participationhistory'
import Logo from '@/components/logo'

export default function HomePage() {
  const [student, setStudent] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchStudentInfo()
  }, [])

  const fetchStudentInfo = async () => {
    try {
      const res = await fetch('/api/participation')
      const data = await res.json()

      if (res.ok) {
        setStudent(data.student)
      }
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
      router.refresh()
    } catch (err) {
      console.error('Logout error:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="shrink-0">
                <Logo size="sm" />

              </div>
              <div>
                <h1 className="text-xl font-bold">Apex 2025</h1>
                {student && (
                  <p className="text-sm text-gray-600">special invitation to {student.school}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm text-gray-600 hover:text-gray-900 px-3 py-1 rounded-lg hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 w-[95vw]">
        {student && (
          <div className="rounded-xl p-6 mb-6 text-black bg-card w-1/2 shadow-accent-foreground ">
            <h3 className="text-muted-foreground">Welcome</h3>
            <h2 className="text-2xl font-bold mb-1">{student.name}!</h2>
            <p className="text-muted-foreground">{student.school}</p>
          </div>
        )}

        {/* Participation History */}
        <div className="noisy-texture rounded-xl p-6">
          <ParticipationHistory />
        </div>

        {/* Quick Actions */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/scan')}
            className="inline-flex items-center space-x-2 bg-primary text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Scan QR Code</span>
          </button>
          <p className="text-sm text-gray-500 mt-3">
            Scan event QR codes to track your participation
          </p>
        </div>
      </div>
    </div>
  )
}