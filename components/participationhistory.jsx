'use client'

import { useEffect, useState } from 'react'

const EMPTY_MESSAGES = [
  "🎯 Go hunt 'em all!",
  "🎪 Your adventure awaits!",
  "✨ Go collect memories, not things!",
  "🎨 Time to paint your fest story!",
  "🚀 Launch into the fun!",
  "🎭 Every event is a new chapter!",
  "🌟 Make today legendary!",
  "🎵 Dance through the experiences!",
  "🎪 The fest is your playground!",
  "💫 Create moments worth remembering!"
]

export default function ParticipationHistory() {
  const [participations, setParticipations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [randomMessage] = useState(() => 
    EMPTY_MESSAGES[Math.floor(Math.random() * EMPTY_MESSAGES.length)]
  )

  useEffect(() => {
    fetchParticipations()
  }, [])

  const fetchParticipations = async () => {
    try {
      const res = await fetch('/api/participation')
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to load participation history')
        setLoading(false)
        return
      }

      setParticipations(data.participations || [])
      setLoading(false)
    } catch (err) {
      setError('Connection error')
      setLoading(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <button 
          onClick={fetchParticipations}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (participations.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-6xl mb-4">🎪</div>
        <h3 className="text-2xl font-bold mb-2">No Memories Yet!</h3>
        <p className="text-gray-600 text-lg mb-6">{randomMessage}</p>
        <div className="inline-block px-6 py-3 bg-primary text-white rounded-full font-semibold">
          Scan a QR to get started
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Your Journey</h2>
        <span className="text-sm text-gray-500">
          {participations.length} {participations.length === 1 ? 'event' : 'events'}
        </span>
      </div>

      <div className="space-y-3">
        {participations.map((participation, index) => (
          <div 
            key={participation.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            style={{
              animation: `slideIn 0.3s ease-out ${index * 0.05}s both`
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900">
                  {participation.eventName}
                </h3>
                {participation.eventDescription && (
                  <p className="text-sm text-gray-600 mt-1">
                    {participation.eventDescription}
                  </p>
                )}
              </div>
              <div className="ml-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                  ✓
                </div>
              </div>
            </div>
            <div className="flex items-center mt-3 text-xs text-gray-500">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(participation.timestamp)}
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}