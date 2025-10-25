import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request) {
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

    const { eventId } = await request.json()

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // 1. Check if event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, name, description')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      console.error('Event not found:', eventError)
      return NextResponse.json(
        { error: 'Invalid event. Please scan a valid QR code.' },
        { status: 404 }
      )
    }

    // 2. Check for recent participation (5-minute cooldown)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    
    const { data: recentParticipation, error: cooldownError } = await supabase
      .from('participation')
      .select('timestamp')
      .eq('student_id', studentId)
      .eq('event_id', eventId)
      .gte('timestamp', fiveMinutesAgo)
      .order('timestamp', { ascending: false })
      .limit(1)
      .single()

    if (recentParticipation && !cooldownError) {
      const lastTimestamp = new Date(recentParticipation.timestamp)
      const nextAllowedTime = new Date(lastTimestamp.getTime() + 5 * 60 * 1000)
      const remainingSeconds = Math.ceil((nextAllowedTime - Date.now()) / 1000)
      const remainingMinutes = Math.ceil(remainingSeconds / 60)

      return NextResponse.json(
        {
          error: 'cooldown',
          message: `You participated in this event recently. Please wait ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}.`,
          cooldownUntil: nextAllowedTime.toISOString(),
          remainingSeconds
        },
        { status: 429 }
      )
    }

    // 3. Record participation
    const { data: participation, error: insertError } = await supabase
      .from('participation')
      .insert([
        {
          student_id: studentId,
          event_id: eventId
        }
      ])
      .select()
      .single()

    if (insertError) {
      console.error('Insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to record participation. Please try again.' },
        { status: 500 }
      )
    }

    console.log('Participation recorded:', participation.id)

    return NextResponse.json({
      success: true,
      message: 'Participation recorded successfully!',
      event: {
        name: event.name,
        description: event.description
      },
      participation: {
        id: participation.id,
        timestamp: participation.timestamp
      }
    })

  } catch (error) {
    console.error('Record participation error:', error)
    return NextResponse.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    )
  }
}