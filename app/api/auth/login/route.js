import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function POST(request) {
  try {
    const { studentId } = await request.json()

    console.log('Login attempt for ID:', studentId)

    // Validate input
    if (!studentId || studentId.length !== 8) {
      return NextResponse.json(
        { error: 'Invalid student ID format' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )

    // Fetch all students (fine for small dataset)
    // Can't use ilike on UUID columns directly
    const { data: students, error } = await supabase
      .from('students')
      .select('id, name, school')

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    // Find student whose UUID starts with the entered ID
    const student = students?.find(s => 
      s.id.toLowerCase().startsWith(studentId.toLowerCase())
    )

    if (!student) {
      console.log('Student not found for ID:', studentId)
      return NextResponse.json(
        { error: 'Student ID not found' },
        { status: 404 }
      )
    }

    console.log('Student found:', student.name)

    // Create session cookie
    const cookieStore = await cookies()
    const sessionData = {
      studentId: student.id,
      name: student.name,
      school: student.school,
      loginTime: new Date().toISOString()
    }

    cookieStore.set('apex_session', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8 // 8 hours in seconds
    })

    console.log('Session created successfully')

    return NextResponse.json({
      success: true,
      student: { name: student.name, school: student.school }
    })

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Server error: ' + error.message },
      { status: 500 }
    )
  }
}

// Add GET handler for testing
export async function GET() {
  return NextResponse.json({
    message: 'Login endpoint is working. Use POST to login.',
    status: 'active'
  })
}