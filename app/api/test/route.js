import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    // Check if env variables exist
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        hasUrl: !!supabaseUrl,
        hasKey: !!supabaseKey,
        urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING'
      })
    }

    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Try to fetch students count
    const { data, error, count } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Supabase query failed',
        details: error.message,
        hint: error.hint,
        code: error.code
      })
    }

    // Success!
    return NextResponse.json({
      success: true,
      message: '✅ Supabase connection working!',
      studentCount: count,
      supabaseUrl: supabaseUrl.substring(0, 30) + '...',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error.message
    })
  }
}