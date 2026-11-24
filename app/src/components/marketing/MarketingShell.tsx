'use client'

import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { SiteFooter } from '@/components/marketing/SiteFooter'
import { DoxctaLogo } from '@/components/brand/DoxctaLogo'

export function MarketingShell({
  children,
  minimal = false,
}: {
  children: ReactNode
  minimal?: boolean
}) {
  const [open, setOpen] = useState(false)

  if (minimal) {
    return <div className="mkt mkt-auth">{children}</div>
  }

  return (
    <div className="mkt">
      <header className="mkt-nav" aria-label="Site header">
        <nav className="mkt-nav-pill" aria-label="Primary">
          <DoxctaLogo size="sm" />
          <div className="mkt-nav-links">
            <a href="/#product">Product</a>
            <a href="/#how">How it works</a>
            <Link href="/pricing">Pricing</Link>
            <a href="/#trust">Trust</a>
          </div>
          <div className="mkt-nav-actions">
            <Link href="/login" className="mkt-nav-signin hide-sm">
              Sign in
            </Link>
            <Link href="/register" className="hide-sm">
              <Button type="button" size="sm" className="mkt-nav-cta">
                Try for 14 days
              </Button>
            </Link>
            <button
              type="button"
              className="mkt-nav-toggle"
              aria-expanded={open}
              aria-controls="mkt-mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((v) => !v)}
            >
              <span className="mkt-nav-toggle-bars" aria-hidden="true" />
            </button>
          </div>
        </nav>
        <div
          id="mkt-mobile-menu"
          className={`mkt-nav-mobile${open ? ' open' : ''}`}
          hidden={!open}
        >
          <a href="/#product" onClick={() => setOpen(false)}>
            Product
          </a>
          <a href="/#how" onClick={() => setOpen(false)}>
            How it works
          </a>
          <Link href="/pricing" onClick={() => setOpen(false)}>
            Pricing
          </Link>
          <a href="/#trust" onClick={() => setOpen(false)}>
            Trust
          </a>
          <Link href="/login" onClick={() => setOpen(false)}>
            Sign in
          </Link>
          <Link href="/register" className="mkt-nav-mobile-cta" onClick={() => setOpen(false)}>
            Try for 14 days
          </Link>
        </div>
      </header>
      {children}
      <SiteFooter />
    </div>
  )
}
