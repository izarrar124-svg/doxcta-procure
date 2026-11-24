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
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/expenses') ||
    pathname.startsWith('/invoices') ||
    pathname.startsWith('/vendors') ||
    pathname.startsWith('/payments') ||
    pathname.startsWith('/budgets') ||
    pathname.startsWith('/assistant')
  const isSuper = pathname.startsWith('/super-admin')
  const isApiV1 = pathname.startsWith('/api/v1')

  if ((isApp || isSuper || isApiV1) && !sessionCookie) {
    if (isApiV1) {
      return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 })
    }
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
    '/expenses/:path*',
    '/invoices/:path*',
    '/vendors/:path*',
    '/payments/:path*',
    '/budgets/:path*',
    '/assistant/:path*',
    '/super-admin/:path*',
    '/api/v1/:path*',
  ],
}
