'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/Button'

const PRESETS = [
  { id: 'week', label: 'This week' },
  { id: 'month', label: 'This month' },
  { id: 'quarter', label: 'This quarter' },
  { id: 'year', label: 'This year' },
] as const

export function OverviewFilters({
  range,
  from,
  to,
  q,
  panelFilter,
  onPanelFilterChange,
}: {
  range: string
  from?: string
  to?: string
  q?: string
  panelFilter: string
  onPanelFilterChange: (value: string) => void
}) {
  const router = useRouter()
  const [fromVal, setFromVal] = useState(from || '')
  const [toVal, setToVal] = useState(to || '')
  const [searchVal, setSearchVal] = useState(q || '')

  function applyDates(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (fromVal) params.set('from', fromVal)
    if (toVal) params.set('to', toVal)
    if (searchVal.trim()) params.set('q', searchVal.trim())
    const qs = params.toString()
    router.push(qs ? `/dashboard?${qs}` : '/dashboard')
  }

  function applySearch(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (fromVal && toVal) {
      params.set('from', fromVal)
      params.set('to', toVal)
    } else if (range) {
      params.set('range', range)
    }
    if (searchVal.trim()) params.set('q', searchVal.trim())
    const qs = params.toString()
    router.push(qs ? `/dashboard?${qs}` : '/dashboard')
  }

  const usingCustomDates = Boolean(from || to)

  return (
    <div className="overview-filters">
      <div className="overview-filters-row">
        <div className="overview-filters-presets">
          {PRESETS.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard?range=${p.id}${searchVal.trim() ? `&q=${encodeURIComponent(searchVal.trim())}` : ''}`}
              className={`dx-btn dx-btn-ghost dx-btn-sm${!usingCustomDates && range === p.id ? ' is-active' : ''}`}
            >
              {p.label}
            </Link>
          ))}
        </div>
      </div>

      <form className="overview-filters-row" onSubmit={applyDates}>
        <div className="overview-filter-field">
          <label htmlFor="ov-from">From</label>
          <input
            id="ov-from"
            type="date"
            value={fromVal}
            onChange={(e) => setFromVal(e.target.value)}
          />
        </div>
        <div className="overview-filter-field">
          <label htmlFor="ov-to">To</label>
          <input id="ov-to" type="date" value={toVal} onChange={(e) => setToVal(e.target.value)} />
        </div>
        <Button type="submit" size="sm" variant="secondary">
          Apply dates
        </Button>
      </form>

      <div className="overview-filters-row">
        <form className="overview-filters-row overview-filter-grow" onSubmit={applySearch}>
          <div className="overview-filter-field overview-filter-grow">
            <label htmlFor="ov-q">Workspace search</label>
            <input
              id="ov-q"
              type="search"
              placeholder="Search expenses, invoices, vendors, approvals…"
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm">
            Search
          </Button>
        </form>
        <div className="overview-filter-field overview-filter-grow">
          <label htmlFor="ov-panel">Filter panels</label>
          <input
            id="ov-panel"
            type="search"
            placeholder="Filter chart labels and notifications…"
            value={panelFilter}
            onChange={(e) => onPanelFilterChange(e.target.value)}
          />
        </div>
      </div>
    </div>
  )
}
