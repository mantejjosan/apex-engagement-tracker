import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    // Get session from cookie
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('apex_session')

    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const session = JSON.parse(sessionCookie.value)
    const studentId = session.studentId

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Fetch participation with event details
    const { data: participations, error } = await supabase
      .from('participation')
      .select(`
        id,
        timestamp,
        event_id,
        events (
          id,
          name,
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

    // Format the response
    const formattedData = participations.map(p => ({
      id: p.id,
      eventName: p.events?.name || 'Unknown Event',
      eventDescription: p.events?.description,
      timestamp: p.timestamp
    }))

    return NextResponse.json({
      success: true,
      participations: formattedData,
      student: {
        name: session.name,
        school: session.school
      }
    })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}