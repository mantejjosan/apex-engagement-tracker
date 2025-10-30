'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Trophy, Users, TrendingUp, Award, Medal } from 'lucide-react'
import Image from 'next/image'

export default function ToggleLeaderboard() {
  const [mode, setMode] = useState('students') // 'students' or 'clubs'
  const [clubFilter, setClubFilter] = useState('participations') // 'participations' or 'points'
  const [studentLeaderboard, setStudentLeaderboard] = useState([])
  const [clubLeaderboard, setClubLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboards()
  }, [])

  const fetchLeaderboards = async () => {
    setLoading(true)
    await Promise.all([fetchStudentLeaderboard(), fetchClubLeaderboard()])
    setLoading(false)
  }

  const fetchStudentLeaderboard = async () => {
    try {
      const { data, error } = await supabase
        .from('students')
        .select('id, name, school, points, type')
        .order('points', { ascending: false })
        .limit(50)

      if (error) throw error
      setStudentLeaderboard(data || [])
    } catch (error) {
      console.error('Error fetching student leaderboard:', error)
    }
  }

  const fetchClubLeaderboard = async () => {
    try {
      const { data: clubs } = await supabase.from('clubs').select('id, club_name')
      const { data: events } = await supabase.from('events').select('id, club_id')
      const { data: participations } = await supabase.from('participation').select('event_id, win')

      if (!clubs || !events || !participations) return

      const eventToClub = {}
      events.forEach(e => (eventToClub[e.id] = e.club_id))

      const clubStats = {}
      participations.forEach(p => {
        const clubId = eventToClub[p.event_id]
        if (!clubId) return

        if (!clubStats[clubId]) {
          clubStats[clubId] = { participations: 0, points: 0 }
        }

        clubStats[clubId].participations++

        if (p.win === true) clubStats[clubId].points += 20
        else if (p.win === false) clubStats[clubId].points += 10
        else clubStats[clubId].points += 10
      })

      const leaderboard = clubs.map(club => ({
        id: club.id,
        name: club.club_name,
        participations: clubStats[club.id]?.participations || 0,
        points: clubStats[club.id]?.points || 0
      }))

      setClubLeaderboard(leaderboard)
    } catch (error) {
      console.error('Error fetching club leaderboard:', error)
    }
  }

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="text-amber-500" size={20} />
    if (rank === 2) return <Medal className="text-gray-400" size={20} />
    if (rank === 3) return <Award className="text-amber-700" size={20} />
    return <span className="text-gray-500 font-semibold">{rank}</span>
  }

  const sortedClubs = [...clubLeaderboard].sort((a, b) =>
    clubFilter === 'participations'
      ? b.participations - a.participations
      : b.points - a.points
  )

  if (loading) {
    return (
      <div className="bg-card rounded-xl shadow-lg border-2 border-primary p-8 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
        <p className="text-gray-500">Loading leaderboard...</p>
      </div>
    )
  }

  return (
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg border-2 border-amber-200 overflow-hidden w-full max-w-[374px] mx-auto">

      {/* Header */}
      <div className="bg-primary p-4">
        <h2 className="text-2xl font-bold text-white text-center flex items-center justify-center gap-2">
          <TrendingUp size={28} />
          Leaderboard
        </h2>
      </div>

      {/* Toggle Switch */}
      <div className="bg-white p-4 border-b-2 border-amber-200">
        <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setMode('students')}
            className={`
              flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all
              ${mode === 'students'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:text-primary'
              }
            `}
          >
            <Users className="inline mr-1" size={16} />
            Students
          </button>
          <button
            onClick={() => setMode('clubs')}
            className={`
              flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all
              ${mode === 'clubs'
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:text-primary'
              }
            `}
          >
            <Trophy className="inline mr-1" size={16} />
            Clubs
          </button>
        </div>
      </div>

      {/* Club Filter */}
      {mode === 'clubs' && (
        <div className="bg-amber-50 p-3 border-b border-amber-200">
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => setClubFilter('participations')}
              className={`
                flex-1 py-1.5 px-3 rounded font-medium transition-all
                ${clubFilter === 'participations'
                  ? 'bg-amber-500 text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-amber-100'
                }
              `}
            >
              By Participations
            </button>
            <button
              onClick={() => setClubFilter('points')}
              className={`
                flex-1 py-1.5 px-3 rounded font-medium transition-all
                ${clubFilter === 'points'
                  ? 'bg-amber-500 text-white shadow'
                  : 'bg-white text-gray-600 hover:bg-amber-100'
                }
              `}
            >
              By Points Given
            </button>
          </div>
        </div>
      )}

      {/* Leaderboard Content */}
      <div className="bg-white p-4 max-h-[600px] overflow-y-auto w-full">
        {mode === 'students' ? (
          /* Student Leaderboard */
          <div className="space-y-2">
            {studentLeaderboard.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Users size={48} className="mx-auto mb-2 opacity-50" />
                <p>No students yet</p>
              </div>
            ) : (
              studentLeaderboard.map((student, index) => (
                <div
                  key={student.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-lg border-2 transition-all
                    ${index < 3
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-md'
                      : 'bg-gray-50 border-gray-200 hover:border-amber-200'
                    }
                    max-w-full overflow-hidden
                  `}
                >
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    {getRankIcon(index + 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {student.name}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{student.school || 'N/A'}</span>
                      <span>•</span>
                      <span>{student.type === 'school' ? '🏫 School' : '🎓 College'}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-amber-600">
                      {student.points}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Club Leaderboard */
          <div className="space-y-2">
            {sortedClubs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Trophy size={48} className="mx-auto mb-2 opacity-50" />
                <p>No clubs yet</p>
              </div>
            ) : (
              sortedClubs.map((club, index) => (
                <div
                  key={club.id}
                  className={`
                    flex flex-col sm:flex-row sm:items-center gap-3 p-3 rounded-lg border-2 transition-all
                    ${index < 3
                      ? 'bg-gradient-to-r from-amber-50 to-orange-50 border-amber-300 shadow-md'
                      : 'bg-gray-50 border-gray-200 hover:border-amber-200'
                    }
                    max-w-full overflow-hidden
                  `}
                >
                  {/* Rank + Image Row */}
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 flex items-center justify-center">
                      {getRankIcon(index + 1)}
                    </div>
                    <div className="flex-shrink-0 w-10 h-10">
                      <Image
                        src={`/club_images/${club.id}.jpg`}
                        alt={club.name}
                        width={40}
                        height={40}
                        className="rounded-full border-2 border-amber-300 object-cover w-full h-full"
                        unoptimized
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0 truncate">
                      <p className="font-semibold text-gray-800 truncate">
                        {club.name}
                      </p>
                      <div className="text-xs text-gray-500 truncate">
                        {club.participations} participations • {club.points} points
                      </div>
                    </div>
                  </div>

                  {/* Stat */}
                  <div className="flex-shrink-0 text-right">
                    <div className="text-2xl font-bold text-amber-600">
                      {clubFilter === 'participations'
                        ? club.participations
                        : club.points}
                    </div>
                    <div className="text-xs text-gray-500">
                      {clubFilter === 'participations' ? 'entries' : 'points'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="bg-gray-50 p-3 border-t border-gray-200">
        <button
          onClick={fetchLeaderboards}
          className="w-full py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors"
        >
          🔄 Refresh Leaderboard
        </button>
      </div>
    </div>
  )
}
