'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AppNavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname()
  const active =
    href === '/dashboard'
      ? pathname === '/dashboard'
      : pathname === href || pathname.startsWith(`${href}/`)

  return (
    <Link href={href} className={`app-nav-link${active ? ' active' : ''}`}>
      {label}
    </Link>
  )
}
