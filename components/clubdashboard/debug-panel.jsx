'use client'
import { useEffect, useState } from 'react'

export default function DebugPanel({ queue, studentData, fetchStudentData }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
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
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Test Query
            </button>
          </div>
        </div>
      </div>
    </details>
  )
}

/*
USAGE:
import DebugPanel from '@/components/clubdashboard/debug-panel'

<DebugPanel 
  queue={queue}
  studentData={studentData}
  fetchStudentData={fetchStudentData}
/>
*/