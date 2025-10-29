'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import ParticipationHistory from '@/components/participationhistory'
import Logo from '@/components/logo'
import Navbar from '@/components/navbar'
import { QrCode } from 'lucide-react'
import LeaderBoard from '@/components/leaderboard'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'


export default function HomePage() {
  const [student, setStudent] = useState('')
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
        console.log("READ THIS: ", data.student)
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
        <div className="flex gap-2 max-w-[95vw]">

          {student && (
            <div className="flex flex-col justify-between rounded-xl p-6 mb-6 border-4 text-black bg-card w-1/2 shadow-accent-foreground ">
              <div>

              <h3 className="text-muted-foreground">Welcome</h3>
              <h2 className="text-2xl font-bold mb-1">{student.name}!</h2>
              <p className="text-muted-foreground">{student.school}</p>
              </div>
              <p className="text-sm">ID: {student.id?.slice(0, 8)}</p>
            </div>
          )}

          {/*leaderboard*/}
          <div className="flex flex-col gap-3 items-center justify-center rounded-xl ">
            <div className="relative">
              <div className="absolute right-1 -top-2 rounded-full w-4 h-4 bg-gray-100 border-2 border-amber-500 flex items-center justify-center"><ArrowUpRight size={20} /></div>
              <Link
                href={`leaderboard`}
                className='py-1 px-3 rounded-3xl bg-secondary text-white'
              >Leaderboard
              </Link>
            </div>
            
            <LeaderBoard />
          </div>
        </div>

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