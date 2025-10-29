import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = await cookies()

    // Check for club session first
    const clubSession = cookieStore.get('apex_club_session')
    if (clubSession) {
      const session = JSON.parse(clubSession.value)
      return NextResponse.json({
        type: 'club',
        id: session.clubId,
        name: session.name,
        loginTime: session.loginTime
      })
    }

    // Then check student session
    const studentSession = cookieStore.get('apex_session')
    if (studentSession) {
      const session = JSON.parse(studentSession.value)
      return NextResponse.json({
        type: 'student',
        id: session.studentId,
        name: session.name,
        school: session.school,
        loginTime: session.loginTime
      })
    }

    // If no session found
    return NextResponse.json(
      { error: 'No active session' },
      { status: 401 }
    )
  } catch (error) {
    console.error('Session check error:', error)
    return NextResponse.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    )
  }
}
