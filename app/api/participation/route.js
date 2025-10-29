import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase/client'

export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('apex_session')

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const session = JSON.parse(sessionCookie.value)
    const studentId = session.studentId

    const { data: participations, error } = await supabase
      .from('participation') // ✅ correct table name
      .select(`
        id,
        timestamp,
        event_id,
        events (
          id,
          event_name,
          description
        )
      `)
      .eq('student_id', studentId)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Participation fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch participation history' },
        { status: 500 }
      )
    }

    const formattedData = participations.map(p => ({
      id: p.id,
      eventName: p.events?.event_name || 'Unknown Event',
      eventDescription: p.events?.description,
      timestamp: p.timestamp
    }))

    return NextResponse.json({
      success: true,
      participations: formattedData,
      student: {
        id: studentId,
        name: session.name,
        school: session.school
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
