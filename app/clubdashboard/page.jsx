'use client'

import Navbar from "@/components/navbar"
import Camera from "@/components/camera"
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import StudentAvatar from "@/components/clubdashboard/avatar"
import Image from "next/image"

export default function ClubDashboard() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const studentIdFromUrl = searchParams.get('student_id')

  const [queue, setQueue] = useState([])
  const [clubName, setClubName] = useState('')
    const [clubId, setClubId] = useState('')
  // ✅ Check if user is logged in as club & get club name
  useEffect(() => {
    const checkClubLogin = async () => {
      try {
        const res = await fetch('/api/auth/club-login', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })

        if (!res.ok) {
          // Redirect if not logged in
          router.push('/club-login?redirect=/clubdashboard')
          return
        }

        const data = await res.json()
        if (data.success && data.club) {
          setClubName(data.club.name)
          setClubId(data.club.id)
        }
      } catch (error) {
        console.error('Error checking club login status:', error)
        router.push('/club-login?redirect=/clubdashboard')
      } finally {
      }
    }

    checkClubLogin()
  }, [router])

  // Handle student_id from query parameter
  useEffect(() => {
    if (studentIdFromUrl) {
      const storedQueue = JSON.parse(localStorage.getItem('student_queue') || '[]')
      const newQueue = [...storedQueue, studentIdFromUrl]
      localStorage.setItem('student_queue', JSON.stringify(newQueue))
      setQueue(newQueue)
    }
  }, [studentIdFromUrl])

  // Load queue from localStorage on component mount
  useEffect(() => {
    const storedQueue = JSON.parse(localStorage.getItem('student_queue') || '[]')
    setQueue(storedQueue)
  }, [])

  const sendToDatabase = () => {
    console.log('Sending queue to database:', queue)
  }

  console.log("Clubid: ==============", clubId)

    return (
        <div className="min-h-screen max-w-screen gap-5">
            <Navbar club={clubName} />
            <div id="body" className="p-4">
            <div className="flex flex-col items-center rounded-lg  ">
                <div className="flex flex-col items-center justify-center">
                    <Image src={`/club_images/${clubId}/jpg`}
                    alt={`${clubName} logo`}
                    width={50}
                    height={50}
                    />
                <p className="text-sm italic">Club ID: {clubId?.slice(0,4)}</p>
                </div>
                <Camera />
            </div>
            <div className="flex flex-col mt-5">
                <div className="text-sm font-extrabold ">Select events</div>
                <div className="flex justify-between items-center my-2 ">
                    <div className="flex flex-wrap">
                        <StudentAvatar />
                        <StudentAvatar />
                    </div>
                    <div id="applu-to-all" className="flex">
                        
                    </div>
                </div>
                event selection component goes here
            </div>
            <div className="flex mt-5">
                win grant section goes here
            </div>
            <div className="flex mt-5">
                <button onClick={sendToDatabase}>DONE!</button>
            </div>
            </div>
        </div>
    )
}