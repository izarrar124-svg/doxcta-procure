import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  const isApp =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/requests') ||
    pathname.startsWith('/approvals') ||
    pathname.startsWith('/procurement') ||
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/reports') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/onboarding')
  const isSuper = pathname.startsWith('/super-admin')

  if ((isApp || isSuper) && !sessionCookie) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/requests/:path*',
    '/approvals/:path*',
    '/procurement/:path*',
    '/analytics/:path*',
    '/reports/:path*',
    '/notifications/:path*',
    '/onboarding/:path*',
    '/super-admin/:path*',
  ],
}
