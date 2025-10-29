import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { supabase } from '@/lib/supabase/client'

export async function POST(request) {
  try {
    const { clubId } = await request.json()

    console.log('Club login attempt for ID:', clubId)

    // Validate input
    if (!clubId || clubId.length !== 4) {
      return NextResponse.json(
        { error: 'Invalid club ID format. Must be 4 characters.' },
        { status: 400 }
      )
    }

    // Fetch all clubs (fine for small dataset)
    const { data: clubs, error } = await supabase
      .from('clubs')
      .select('id, club_name')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Find club whose UUID starts with the entered ID
    const club = clubs?.find(c => 
      c.id.toLowerCase().startsWith(clubId.toLowerCase())
    )

    if (!club) {
      console.log('Club not found for ID:', clubId)
      return NextResponse.json(
        { error: 'Club ID not found' },
        { status: 404 }
      )
    }

    console.log('Club found:', club.club_name)

    // Create session cookie for club
    const cookieStore = await cookies()
    const sessionData = {
      clubId: club.id,
      name: club.club_name,
      loginTime: new Date().toISOString(),
      isClub: true
    }

    cookieStore.set('apex_club_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8 // 8 hours in seconds
    })

    console.log('Club session created successfully')

    return NextResponse.json({
      success: true,
      club: { name: club.club_name,
        id: club.id
       }
    })

  } catch (error) {
    console.error('Club login error:', error)
    return NextResponse.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    )
  }
}

// Add GET handler to check if club is logged in
export async function GET() {
  try {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('apex_club_session')
    
    if (!sessionCookie) {
      return NextResponse.json(
        { error: 'Not logged in' },
        { status: 401 }
      )
    }
    
    const sessionData = JSON.parse(sessionCookie.value)
    
    // Optional: Verify session is still valid (not expired)
    // For now, we'll just check if the session exists
    
    return NextResponse.json({
      success: true,
      club: { name: sessionData.name, id: sessionData.clubId }
    })
  } catch (error) {
    console.error('Error checking club login status:', error)
    return NextResponse.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    )
  }
}