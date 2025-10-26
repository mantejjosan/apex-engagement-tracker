'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ParticipationHistory from '@/components/participationhistory'
import Logo from '@/components/logo'
import Navbar from '@/components/navbar'
import { QrCode } from 'lucide-react'


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




  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col">
        <Logo size='md' animated />
        <div className="text-muted-foreground">Just a min!</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <Navbar school={student.school} />

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 w-[95vw]">
        {student && (
          <div className="rounded-xl p-6 mb-6 text-black bg-card w-1/2 shadow-accent-foreground ">
            <h3 className="text-muted-foreground">Welcome</h3>
            <h2 className="text-2xl font-bold mb-1">{student.name}!</h2>
            <p className="text-muted-foreground">{student.school}</p>
          </div>
        )}


        {/* Quick Actions */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/scan')}
            className="inline-flex items-center space-x-2 bg-secondary text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg hover:shadow-xl active:bg-accent transform hover:scale-105 transition-all"
          >
            <QrCode />
            <span>Scan QR Code</span>
          </button>
          <p className="text-sm text-gray-500 mt-1 mb-3 text-muted-foreground/50">
            Scan event QR codes to participate
          </p>
        </div>

        {/* Participation History */}
        <div className="noisy-texture rounded-xl p-6">
          <ParticipationHistory />
        </div>

      </div>
    </div>
  )
}