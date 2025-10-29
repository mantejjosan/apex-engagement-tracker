import { NextResponse } from 'next/server'

export function proxy(request) {
  const session = request.cookies.get('apex_session')
  const clubSession = request.cookies.get('apex_club_session')
  const { pathname, searchParams } = request.nextUrl

  // Protect home page and scan page for regular users
  if (pathname === '/' || pathname.startsWith('/scan')) {
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      
      // For scan pages, preserve the event ID in redirect
      if (pathname.startsWith('/scan')) {
        loginUrl.searchParams.set('redirect', pathname + '?' + searchParams.toString())
      } else {
        loginUrl.searchParams.set('redirect', '/')
      }
      
      return NextResponse.redirect(loginUrl)
    }
  }

  // Protect club dashboard for club users
  if (pathname.startsWith('/clubdashboard')) {
    if (!clubSession) {
      const loginUrl = new URL('/club-login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  // If logged in as regular user and trying to access login page, redirect to home
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // If logged in as club and trying to access club login page, redirect to club dashboard
  if (pathname === '/club-login' && clubSession) {
    return NextResponse.redirect(new URL('/clubdashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/scan/:path*', '/login', '/club-login', '/clubdashboard/:path*']
}