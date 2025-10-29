'use client'
import { useEffect, useState } from 'react'
import StudentAvatar from './avatar'
import { Trophy, Users, X } from 'lucide-react'

export default function WinGrantSection({ queue, studentData }) {
  const [winStatus, setWinStatus] = useState({})

  // ✅ Load win status from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const stored = JSON.parse(localStorage.getItem('win_status') || '{}')
    
    // Initialize all students in queue with default "participate" (false) if not set
    const initialized = { ...stored }
    queue.forEach(studentId => {
      if (initialized[studentId] === undefined) {
        initialized[studentId] = false // Default to participate
      }
    })
    
    setWinStatus(initialized)
    localStorage.setItem('win_status', JSON.stringify(initialized))
  }, [queue])

  const setStatus = (studentId, status) => {
    const updated = {
      ...winStatus,
      [studentId]: status
    }
    setWinStatus(updated)
    localStorage.setItem('win_status', JSON.stringify(updated))
    console.log(`Set ${studentId} to:`, status)
  }

  // Find student with same matching logic
  const findStudent = (studentId) => {
    let student = studentData[studentId]
    if (!student) {
      const matchingKey = Object.keys(studentData).find(key => 
        key.startsWith(studentId) || studentId.startsWith(key)
      )
      if (matchingKey) {
        student = studentData[matchingKey]
      }
    }
    return student
  }

  const getStatusColor = (status) => {
    if (status === true) return 'bg-green-50 border-green-300'
    if (status === false) return 'bg-blue-50 border-blue-300'
    return 'bg-gray-50 border-gray-200'
  }

  const getStatusIcon = (status) => {
    if (status === true) return <Trophy className="text-green-600" size={16} />
    if (status === false) return <Users className="text-blue-600" size={16} />
    return <X className="text-gray-400" size={16} />
  }

  const getStatusText = (status) => {
    if (status === true) return 'Win (+20 pts)'
    if (status === false) return 'Participate (+10 pts)'
    return 'Skipped (0 pts)'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border p-4">
      <div className="mb-4">
        <h3 className="font-semibold mb-1">Win/Participate Grant</h3>
        <p className="text-xs text-gray-500">
          Mark students who won prizes or just participated
        </p>
      </div>

      <div className="space-y-3">
        {queue.map(studentId => {
          const student = findStudent(studentId)
          const status = winStatus[studentId]

          return (
            <div
              key={studentId}
              className={`
                border-2 rounded-lg p-3 transition-all
                ${getStatusColor(status)}
              `}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <StudentAvatar
                    size="sm"
                    name={student?.name || 'Loading...'}
                    institute={student?.school || 'N/A'}
                    points={student?.points || 0}
                    checkMark={status !== null && status !== undefined}
                  />
                </div>

                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">
                    {student?.name || 'Loading...'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {student?.school || 'N/A'}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="flex-shrink-0">
                  <div className="flex items-center gap-1 text-xs font-medium">
                    {getStatusIcon(status)}
                    <span className="hidden sm:inline">
                      {getStatusText(status)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setStatus(studentId, true)}
                  className={`
                    flex-1 py-2 rounded-lg font-medium text-sm transition-all
                    flex items-center justify-center gap-1
                    ${status === true
                      ? 'bg-green-500 text-white shadow-md'
                      : 'bg-white border-2 border-green-200 text-green-700 hover:bg-green-50'
                    }
                  `}
                >
                  <Trophy size={14} />
                  Win
                </button>

                <button
                  onClick={() => setStatus(studentId, false)}
                  className={`
                    flex-1 py-2 rounded-lg font-medium text-sm transition-all
                    flex items-center justify-center gap-1
                    ${status === false
                      ? 'bg-blue-500 text-white shadow-md'
                      : 'bg-white border-2 border-blue-200 text-blue-700 hover:bg-blue-50'
                    }
                  `}
                >
                  <Users size={14} />
                  Participate
                </button>

                <button
                  onClick={() => setStatus(studentId, null)}
                  className={`
                    flex-shrink-0 px-3 py-2 rounded-lg font-medium text-sm transition-all
                    flex items-center justify-center gap-1
                    ${status === null || status === undefined
                      ? 'bg-gray-500 text-white shadow-md'
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <X size={14} />
                  <span className="hidden sm:inline">Skip</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {queue.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="bg-green-50 rounded p-2">
              <div className="font-bold text-green-700">
                {Object.values(winStatus).filter(s => s === true).length}
              </div>
              <div className="text-gray-600">Winners</div>
            </div>
            <div className="bg-blue-50 rounded p-2">
              <div className="font-bold text-blue-700">
                {Object.values(winStatus).filter(s => s === false).length}
              </div>
              <div className="text-gray-600">Participants</div>
            </div>
            <div className="bg-gray-50 rounded p-2">
              <div className="font-bold text-gray-700">
                {queue.length - Object.keys(winStatus).filter(k => winStatus[k] !== null && winStatus[k] !== undefined).length}
              </div>
              <div className="text-gray-600">Skipped</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/*
USAGE in ClubDashboard:
<WinGrantSection 
  queue={queue}
  studentData={studentData}
/>
*/