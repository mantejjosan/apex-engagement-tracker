import { NextResponse } from 'next/server'

export function proxy(request) {
  const session = request.cookies.get('apex_session')
  const { pathname, searchParams } = request.nextUrl

  // Protect home page and scan page
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

  // If logged in and trying to access login page, redirect to home
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/scan/:path*', '/login']
}