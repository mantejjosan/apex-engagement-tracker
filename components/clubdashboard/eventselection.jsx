'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import TapCard from './tapcard'
import StudentAvatar from './avatar'
import { Copy } from 'lucide-react'

export default function EventSelectionSection({ 
  clubId, 
  queue, 
  studentData 
}) {
  const [events, setEvents] = useState([])
  const [eventSelections, setEventSelections] = useState({})
  const [activeStudentId, setActiveStudentId] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ Fetch club events on mount
  useEffect(() => {
    if (!clubId) return
    fetchClubEvents()
  }, [clubId])

  // ✅ Load event selections from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = JSON.parse(localStorage.getItem('event_selections') || '{}')
    setEventSelections(stored)
  }, [])

  // ✅ Auto-select first student when queue changes
  useEffect(() => {
    if (queue.length > 0 && !activeStudentId) {
      setActiveStudentId(queue[0])
    }
  }, [queue])

  const fetchClubEvents = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('events')
        .select('id, event_name, description')
        .eq('club_id', clubId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching events:', error)
        return
      }

      console.log('Fetched club events:', data)
      setEvents(data || [])
    } catch (error) {
      console.error('Exception fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleEvent = (eventId) => {
    if (!activeStudentId) return

    const currentSelections = eventSelections[activeStudentId] || []
    const newSelections = currentSelections.includes(eventId)
      ? currentSelections.filter(id => id !== eventId)
      : [...currentSelections, eventId]

    const updated = {
      ...eventSelections,
      [activeStudentId]: newSelections
    }

    setEventSelections(updated)
    localStorage.setItem('event_selections', JSON.stringify(updated))
    console.log(`Updated selections for ${activeStudentId}:`, newSelections)
  }

  const applyToAll = () => {
    if (!activeStudentId || !eventSelections[activeStudentId]) {
      alert('Select some events first!')
      return
    }

    if (!confirm('Apply this student\'s event selections to all students in queue?')) {
      return
    }

    const templateSelections = eventSelections[activeStudentId]
    const updated = {}
    
    queue.forEach(studentId => {
      updated[studentId] = [...templateSelections]
    })

    setEventSelections(updated)
    localStorage.setItem('event_selections', JSON.stringify(updated))
    console.log('Applied to all students:', updated)
    alert('Event selections applied to all students!')
  }

  const activeStudent = studentData[activeStudentId]
  const activeSelections = eventSelections[activeStudentId] || []

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h3 className="font-semibold mb-3">Event Selection</h3>
        <div className="text-center py-8 text-gray-400">Loading events...</div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <h3 className="font-semibold mb-3">Event Selection</h3>
        <div className="text-center py-8 text-gray-400">
          <p>No events found for this club.</p>
          <p className="text-xs mt-1">Events need to be created first.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Event Selection</h3>
        <button
          onClick={applyToAll}
          className="flex items-center gap-1 text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600"
        >
          <Copy size={14} />
          Apply to All
        </button>
      </div>

      {/* Student Selector */}
      <div className="mb-4">
        <p className="text-xs text-gray-500 mb-2">Select events for:</p>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {queue.map(studentId => {
            // Match student data by partial ID (same logic as main queue)
            let student = studentData[studentId]
            
            if (!student) {
              const matchingKey = Object.keys(studentData).find(key => 
                key.startsWith(studentId) || studentId.startsWith(key)
              )
              if (matchingKey) {
                student = studentData[matchingKey]
              }
            }
            
            const selectionsCount = (eventSelections[studentId] || []).length
            
            return (
              <button
                key={studentId}
                onClick={() => setActiveStudentId(studentId)}
                className={`
                  flex-shrink-0 relative
                  ${activeStudentId === studentId ? 'ring-2 ring-blue-500 rounded-full' : ''}
                `}
              >
                <StudentAvatar
                  size="sm"
                  name={student?.name || 'Loading...'}
                  institute={student?.school || 'N/A'}
                  points={student?.points || 0}
                  checkMark={selectionsCount > 0}
                />
                {selectionsCount > 0 && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                    {selectionsCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Active Student Info */}
      {activeStudent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
          <p className="text-xs text-blue-700">
            <strong>{activeStudent.name}</strong> - {activeSelections.length} event(s) selected
          </p>
        </div>
      )}

      {/* Event Cards */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {events.map(event => (
          <TapCard
            key={event.id}
            eventName={event.event_name}
            description={event.description}
            selected={activeSelections.includes(event.id)}
            onClick={() => toggleEvent(event.id)}
          />
        ))}
      </div>
    </div>
  )
}

/*
USAGE in ClubDashboard:
<EventSelectionSection 
  clubId={clubId}
  queue={queue}
  studentData={studentData}
/>
*/