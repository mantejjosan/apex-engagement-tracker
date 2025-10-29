'use client'
import DebugPanel from '@/components/clubdashboard/debug-panel'
import WinGrantSection from '@/components/clubdashboard/win-grant'
import Navbar from "@/components/navbar"
import Camera from "@/components/camera"
import { useSearchParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import StudentAvatar from "@/components/clubdashboard/avatar"
import EventSelectionSection from "@/components/clubdashboard/eventselection"
import Image from "next/image"
import { supabase } from "@/lib/supabase/client"
import { Users } from "lucide-react"

const MAX_QUEUE_SIZE = 15

export default function ClubDashboard() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const studentIdFromUrl = searchParams.get('student_id')

    // Club info
    const [clubName, setClubName] = useState('')
    const [clubId, setClubId] = useState('')

    // Student queue management
    const [queue, setQueue] = useState([])
    const [studentData, setStudentData] = useState({})
    const [loading, setLoading] = useState(false)
    const [isInitialized, setIsInitialized] = useState(false)
    const [isFetchingMissing, setIsFetchingMissing] = useState(false)

    // ✅ Check if user is logged in as club
    useEffect(() => {
        const checkClubLogin = async () => {
            try {
                const res = await fetch('/api/auth/club-login', {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                })
                if (!res.ok) {
                    router.push('/club-login?redirect=/clubdashboard')
                    return
                }
                const data = await res.json()
                if (data.success && data.club) {
                    setClubName(data.club.name)
                    setClubId(data.club.id)

                    // ✅ After club is loaded, refetch missing student data
                    refetchMissingStudentData()
                }
            } catch (error) {
                console.error('Error checking club login status:', error)
                router.push('/club-login?redirect=/clubdashboard')
            }
        }
        checkClubLogin()
    }, [router])

    // ✅ Refetch missing student data
    const refetchMissingStudentData = async () => {
        if (typeof window === 'undefined') return

        const storedQueue = JSON.parse(localStorage.getItem('student_queue') || '[]')
        const storedData = JSON.parse(localStorage.getItem('student_data') || '{}')

        const missingDataIds = storedQueue.filter(id => !storedData[id])

        if (missingDataIds.length === 0) return

        console.log('Refetching data for missing IDs:', missingDataIds)
        setIsFetchingMissing(true)

        const updatedStudentData = { ...storedData }

        for (const studentId of missingDataIds) {
            console.log('Fetching data for:', studentId)
            const student = await fetchStudentData(studentId)
            if (student) {
                updatedStudentData[student.id] = {
                    name: student.name,
                    school: student.school,
                    points: student.points || 0,
                    type: student.type
                }
                console.log('Fetched and added:', student)
            }
        }

        // Update state and localStorage
        setStudentData(updatedStudentData)
        localStorage.setItem('student_data', JSON.stringify(updatedStudentData))
        setIsFetchingMissing(false)
        console.log('All missing data refetched and saved')
    }

    // ✅ Load queue and student data from localStorage on mount (FIRST PRIORITY)
    useEffect(() => {
        if (typeof window === 'undefined') return

        console.log('Loading from localStorage...')
        const storedQueue = JSON.parse(localStorage.getItem('student_queue') || '[]')
        const storedData = JSON.parse(localStorage.getItem('student_data') || '{}')
        console.log('Loaded queue:', storedQueue)
        console.log('Loaded student data:', storedData)

        setQueue(storedQueue)
        setStudentData(storedData)
        setIsInitialized(true)

        // ✅ CRITICAL: If we have queue but missing student data, refetch it
        const missingDataIds = storedQueue.filter(id => !storedData[id])
        if (missingDataIds.length > 0) {
            console.log('Missing data for IDs:', missingDataIds)
            console.log('Will refetch after club login...')
        }
    }, [])

    // ✅ Reactively update queue + data when localStorage changes (even from QR scan)
    useEffect(() => {
        const handleStorageChange = () => {
            const updatedQueue = JSON.parse(localStorage.getItem('student_queue') || '[]')
            const updatedData = JSON.parse(localStorage.getItem('student_data') || '{}')
            setQueue(updatedQueue)
            setStudentData(updatedData)
        }

        window.addEventListener('storage', handleStorageChange)
        return () => window.removeEventListener('storage', handleStorageChange)
    }, [])

    // ✅ Fetch student data from database
    const fetchStudentData = async (studentId) => {
        try {
            setLoading(true)

            // Query students table - match first 4 characters of UUID
            const { data, error } = await supabase
                .from('students')
                .select('id, name, school, points')
                .ilike('id_text', `${studentId}%`)
                .limit(1)
                .single()

            if (error) {
                console.error('Error fetching student:', error)
                alert(`Student not found with ID: ${studentId}`)
                return null
            }

            return data
        } catch (error) {
            console.error('Error:', error)
            return null
        } finally {
            setLoading(false)
        }
    }

    // ✅ Handle new student_id from URL or Camera
    const addStudentToQueue = async (studentId) => {
        // Check if queue is full
        if (queue.length >= MAX_QUEUE_SIZE) {
            alert(`Queue is full! Maximum ${MAX_QUEUE_SIZE} students. Please press DONE to submit.`)
            return
        }

        // Check if already in queue
        if (queue.includes(studentId)) {
            alert('Student already in queue!')
            return
        }

        setLoading(true)
        try {
            // Fetch student data immediately
            const student = await fetchStudentData(studentId)
            if (!student) return

            // ⚡ Force ID consistency: store by short ID
            const shortId = studentId.length === 8 ? studentId : studentId.slice(0, 8)

            const newQueue = [...queue, shortId]
            const newStudentData = {
                ...studentData,
                [shortId]: {
                    name: student.name,
                    school: student.school,
                    points: student.points || 0,
                    type: studentId.length === 4 ? 'school' : 'college'
                }
            }

            // ✅ Update state (this will instantly re-render avatars)
            setQueue(newQueue)
            setStudentData(newStudentData)

            // ✅ Persist in localStorage for reload safety
            localStorage.setItem('student_queue', JSON.stringify(newQueue))
            localStorage.setItem('student_data', JSON.stringify(newStudentData))

            console.log(`✅ Added ${student.name} (${shortId}) to queue`)
        } catch (error) {
            console.error('Error adding student:', error)
        } finally {
            setLoading(false)
        }
    }


    // ✅ Handle student_id from query parameter (ONLY AFTER INITIALIZATION)
    useEffect(() => {
        if (!isInitialized || !clubId || !studentIdFromUrl) return

        console.log('Processing student_id from URL:', studentIdFromUrl)
        addStudentToQueue(studentIdFromUrl)

        // Clear the query param after processing (without scroll)
        window.history.replaceState({}, '', '/clubdashboard')
    }, [studentIdFromUrl, clubId, isInitialized])

    // ✅ Handle QR scan from camera
    const handleQRScan = (scannedData) => {
        // Extract student_id from scanned URL
        // Expected formats: 
        // https://apexgne.vercel.app/?student_id=136b (4 chars - school)
        // https://apexgne.vercel.app/?student_id=136b8ee3 (8 chars - college)
        try {
            const url = new URL(scannedData)
            const studentId = url.searchParams.get('student_id')
            if (studentId && (studentId.length === 4 || studentId.length === 8)) {
                console.log('Valid student_id scanned:', studentId)
                addStudentToQueue(studentId)
            } else {
                console.error('Invalid student_id length:', studentId)
                alert('Invalid QR code format')
            }
        } catch (error) {
            console.error('Invalid QR code URL:', error)
            alert('Invalid QR code')
        }
    }

    const clearQueue = () => {
        if (confirm('Clear all students from queue? This cannot be undone.')) {
            console.log('Clearing queue...')
            setQueue([])
            setStudentData({})
            localStorage.removeItem('student_queue')
            localStorage.removeItem('student_data')
            localStorage.removeItem('event_selections')
            localStorage.removeItem('win_status')
            console.log('Queue cleared')
        }
    }

    const handleSubmit = async () => {
        // Validate data
        const storedQueue = JSON.parse(localStorage.getItem('student_queue') || '[]')
        const storedEventSelections = JSON.parse(localStorage.getItem('event_selections') || '{}')
        const storedWinStatus = JSON.parse(localStorage.getItem('win_status') || '{}')

        if (storedQueue.length === 0) {
            alert('No students in queue!')
            return
        }

        // Check if all students have event selections
        const studentsWithoutEvents = storedQueue.filter(id => !storedEventSelections[id] || storedEventSelections[id].length === 0)

        if (studentsWithoutEvents.length > 0) {
            const proceed = confirm(
                `${studentsWithoutEvents.length} student(s) have no events selected.\n\nDo you want to continue anyway?`
            )
            if (!proceed) return
        }

        // Confirm submission
        const totalParticipations = storedQueue.reduce((sum, studentId) => {
            return sum + (storedEventSelections[studentId]?.length || 0)
        }, 0)

        const confirmSubmit = confirm(
            `Ready to submit?\n\n` +
            `Students: ${storedQueue.length}\n` +
            `Total Participations: ${totalParticipations}\n` +
            `Winners: ${Object.values(storedWinStatus).filter(s => s === true).length}\n` +
            `Participants: ${Object.values(storedWinStatus).filter(s => s === false).length}\n\n` +
            `This will record all data in the database.`
        )

        if (!confirmSubmit) return

        setLoading(true)

        try {
            // Prepare participation records
            const participationRecords = []

            for (const studentId of storedQueue) {
                const eventIds = storedEventSelections[studentId] || []
                const winStatus = storedWinStatus[studentId]

                // Get full student UUID
                const fullStudentId = Object.keys(studentData).find(key =>
                    key.startsWith(studentId) || studentId.startsWith(key)
                )

                if (!fullStudentId) {
                    console.error('Could not find full UUID for:', studentId)
                    continue
                }

                // Create a participation record for each event
                for (const eventId of eventIds) {
                    participationRecords.push({
                        student_id: fullStudentId,
                        event_id: eventId,
                        win: winStatus === null ? null : winStatus,
                        timestamp: new Date().toISOString()
                    })
                }
            }

            console.log('Submitting participations:', participationRecords)

            if (participationRecords.length === 0) {
                alert('No participation records to submit!')
                setLoading(false)
                return
            }

            // Insert into Supabase
            const { data, error } = await supabase
                .from('participation')
                .insert(participationRecords)

            if (error) {
                console.error('Supabase error:', error)
                alert(`Failed to submit data: ${error.message}`)
                return
            }

            console.log('Successfully inserted:', data)

            // Success! Clear everything
            alert(`✅ Success!\n\n${participationRecords.length} participation records submitted!`)

            // Clear localStorage
            localStorage.removeItem('student_queue')
            localStorage.removeItem('student_data')
            localStorage.removeItem('event_selections')
            localStorage.removeItem('win_status')

            // Clear state
            setQueue([])
            setStudentData({})

            // Reload page for fresh start
            window.location.reload()

        } catch (error) {
            console.error('Exception during submission:', error)
            alert(`Error: ${error.message}`)
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="min-h-screen ">
            <Navbar club={clubName} />

            <div className="max-w-2xl mx-auto p-4 space-y-6">

                {/* 1. Club Info + Scanner Section */}
                <div className="bg-card rounded-xl shadow-sm border p-4">
                    <div className="flex flex-col items-center">
                        {clubId && (
                            <div className="w-16 h-16 rounded-full overflow-hidden mb-2">

                            <Image
                                src={`/club_images/${clubId}.jpg`}
                                alt={`${clubName} logo`}
                                width={60}
                                height={60}
                                className="object-cover w-full h-full"
                                unoptimized
                                />
                                </div>
                        )}
                        <h2 className="font-bold text-lg">{clubName}</h2>
                        <p className="text-xs text-gray-500">Club ID: {clubId?.slice(0, 8)}</p>
                    </div>

                    {/* Camera Scanner */}
                    <div className="relative">
                        <Camera onScan={handleQRScan} />
                        {loading && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                                <div className="text-white">Loading student...</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. Student Queue Section (Avatar Bar) */}
                <div className="bg-accent text-white rounded-xl shadow-sm border p-4">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Users size={20} className="text-white" />
                            <h3 className="font-semibold">Student Queue</h3>
                            <span className="text-sm text-gray-100">
                                ({queue.length}/{MAX_QUEUE_SIZE})
                            </span>
                            {isFetchingMissing && (
                                <span className="text-xs text-amber-500 animate-pulse">
                                    Loading data...
                                </span>
                            )}
                        </div>
                        {queue.length > 0 && (
                            <button
                                onClick={clearQueue}
                                className="text-xs font-extrabold text-amber-900 hover:text-red-700"
                            >
                                Clear All
                            </button>
                        )}
                    </div>

                    {queue.length === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                            <Users size={48} className="text-white mx-auto mb-2 opacity-50" />
                            <p className="text-sm text-white">No students scanned yet</p>
                            <p className="text-xs text-white">Scan a QR code to add students</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-3">
                            {queue.map((studentId) => {
                                // Try to find student data by full ID or partial match
                                let student = studentData[studentId]

                                // If not found by exact match, try to find by partial ID
                                if (!student) {
                                    const matchingKey = Object.keys(studentData).find(key =>
                                        key.startsWith(studentId) || studentId.startsWith(key)
                                    )
                                    if (matchingKey) {
                                        student = studentData[matchingKey]
                                    }
                                }

                                console.log('Rendering avatar for:', studentId, student)

                                return (
                                    <div key={studentId} className="flex flex-col items-center gap-1">
                                        <StudentAvatar
                                            size="md"
                                            name={student?.name || 'Loading...'}
                                            institute={student?.school || 'Loading...'}
                                            points={student?.points || 0}
                                            checkMark={false}
                                        />
                                        {student?.type && (
                                            <span className="text-xs text-gray-500">
                                                {student.type === 'school' ? '🏫' : '🎓'}
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {queue.length >= MAX_QUEUE_SIZE && (
                        <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-700">
                            ⚠️ Queue is full. Please submit data before scanning more students.
                        </div>
                    )}
                </div>

                {/* 3. Event Selection Section */}
                {queue.length > 0 && (
                    <EventSelectionSection
                        clubId={clubId}
                        queue={queue}
                        studentData={studentData}
                    />
                )}

                {/* 4. Win/Participate Grant Section */}
                {queue.length > 0 && (
                    <WinGrantSection
                        queue={queue}
                        studentData={studentData}
                    />
                )}

                {/* 5. Submit Button */}
                {queue.length > 0 && (
                    <div className="space-y-3">
                        {/* Pre-submit Summary */}
                        <div className="bg-gradient-to-r from-secondary to-primary rounded-xl p-4 border border-blue-200">
                            <h4 className="font-semibold text-sm mb-2 text-amber-900">Ready to Submit?</h4>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-600">Students:</span>
                                    <span className="font-bold ml-1">{queue.length}</span>
                                </div>
                                <div>
                                    <span className="text-gray-600">Total Records:</span>
                                    <span className="font-bold ml-1">
                                        {queue.reduce((sum, id) => {
                                            const selections = JSON.parse(localStorage.getItem('event_selections') || '{}')
                                            return sum + (selections[id]?.length || 0)
                                        }, 0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            className="w-full bg-accent-foreground text-white py-4 rounded-xl font-bold text-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                            onClick={handleSubmit}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </span>
                            ) : (
                                `DONE! Submit ${queue.length} Student(s)`
                            )}
                        </button>
                    </div>
                )}

                {/* Debug Panel - Remove this in production */}
                {process.env.NODE_ENV === 'development' && typeof window !== 'undefined' && (
                    <details className="bg-gray-100 rounded-lg p-4 text-xs">
                        <summary className="cursor-pointer font-semibold mb-2">🐛 Debug Info</summary>
                        <div className="space-y-2">
                            <div>
                                <strong>Queue ({queue.length}):</strong>
                                <pre className="bg-white p-2 rounded mt-1 overflow-auto">
                                    {JSON.stringify(queue, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <strong>Student Data:</strong>
                                <pre className="bg-white p-2 rounded mt-1 overflow-auto max-h-40">
                                    {JSON.stringify(studentData, null, 2)}
                                </pre>
                            </div>
                            <div>
                                <strong>localStorage:</strong>
                                <pre className="bg-white p-2 rounded mt-1 overflow-auto">
                                    queue: {localStorage.getItem('student_queue')}{'\n'}
                                    data: {localStorage.getItem('student_data')?.slice(0, 100)}...
                                </pre>
                            </div>
                            <div className="mt-3 pt-3 border-t">
                                <strong>Test Database Query:</strong>
                                <div className="flex gap-2 mt-2">
                                    <input
                                        type="text"
                                        placeholder="Enter student ID (e.g., 7dc2)"
                                        className="flex-1 px-2 py-1 border rounded text-xs"
                                        id="test-student-id"
                                    />
                                    <button
                                        onClick={async () => {
                                            const testId = document.getElementById('test-student-id').value
                                            if (!testId) return
                                            console.log('Testing query for:', testId)
                                            const result = await fetchStudentData(testId)
                                            console.log('Test result:', result)
                                        }}
                                        className="px-3 py-1 bg-amber-500 text-white rounded hover:bg-amber-600"
                                    >
                                        Test Query
                                    </button>
                                </div>
                            </div>
                        </div>
                    </details>
                )}

            </div>
        </div>
    )
}