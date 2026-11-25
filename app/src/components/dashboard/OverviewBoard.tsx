'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { OverviewFilters } from '@/components/dashboard/OverviewFilters'
import {
  AgingBarsChart,
  DeptSpendChart,
  MonthlyTrendChart,
  TopVendorsChart,
} from '@/components/dashboard/charts'
import type { WorkspaceSearchResults } from '@/server/reports/search'

type Note = { id: string; title: string; body: string | null }

export function OverviewBoard({
  range,
  from,
  to,
  q,
  monthly,
  deptSpend,
  topVendors,
  aging,
  notes,
  search,
}: {
  range: string
  from?: string
  to?: string
  q?: string
  monthly: { month: string; total: number }[]
  deptSpend: { name: string; total: number }[]
  topVendors: { name: string; total: number }[]
  aging: { label: string; total: number }[]
  notes: Note[]
  search: WorkspaceSearchResults | null
}) {
  const [panelFilter, setPanelFilter] = useState('')
  const needle = panelFilter.trim().toLowerCase()

  const filteredMonthly = useMemo(
    () => (needle ? monthly.filter((m) => m.month.toLowerCase().includes(needle)) : monthly),
    [monthly, needle],
  )
  const filteredDept = useMemo(
    () => (needle ? deptSpend.filter((d) => d.name.toLowerCase().includes(needle)) : deptSpend),
    [deptSpend, needle],
  )
  const filteredVendors = useMemo(
    () =>
      needle ? topVendors.filter((v) => v.name.toLowerCase().includes(needle)) : topVendors,
    [topVendors, needle],
  )
  const filteredAging = useMemo(
    () => (needle ? aging.filter((a) => a.label.toLowerCase().includes(needle)) : aging),
    [aging, needle],
  )
  const filteredNotes = useMemo(
    () =>
      needle
        ? notes.filter(
            (n) =>
              n.title.toLowerCase().includes(needle) ||
              (n.body || '').toLowerCase().includes(needle),
          )
        : notes,
    [notes, needle],
  )

  const searchEmpty =
    search &&
    !search.expenses.length &&
    !search.invoices.length &&
    !search.vendors.length &&
    !search.approvals.length

  return (
    <>
      <OverviewFilters
        range={range}
        from={from}
        to={to}
        q={q}
        panelFilter={panelFilter}
        onPanelFilterChange={setPanelFilter}
      />

      {q ? (
        <div className="panel" style={{ marginBottom: 18 }}>
          <div className="panel-header">
            <h3>Search results for “{q}”</h3>
          </div>
          <div className="panel-body">
            {searchEmpty ? (
              <p className="muted">No matching expenses, invoices, vendors, or approvals.</p>
            ) : (
              <div className="search-results-grid">
                <SearchGroup title="Expenses" hits={search?.expenses || []} />
                <SearchGroup title="Invoices" hits={search?.invoices || []} />
                <SearchGroup title="Vendors" hits={search?.vendors || []} />
                <SearchGroup title="Approvals" hits={search?.approvals || []} />
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="chart-grid">
        <div className="panel chart-panel">
          <div className="panel-header">
            <h3>Monthly spending trend</h3>
          </div>
          <div className="panel-body">
            <MonthlyTrendChart data={filteredMonthly} />
          </div>
        </div>
        <div className="panel chart-panel">
          <div className="panel-header">
            <h3>Departmental expenditure</h3>
          </div>
          <div className="panel-body">
            <DeptSpendChart data={filteredDept} />
          </div>
        </div>
        <div className="panel chart-panel">
          <div className="panel-header">
            <h3>Top vendors</h3>
          </div>
          <div className="panel-body">
            <TopVendorsChart data={filteredVendors} />
          </div>
        </div>
        <div className="panel chart-panel">
          <div className="panel-header">
            <h3>Payables aging</h3>
          </div>
          <div className="panel-body">
            <AgingBarsChart data={filteredAging} />
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h3>Recent notifications</h3>
        </div>
        <div className="panel-body">
          {filteredNotes.length === 0 ? (
            <p className="muted">{needle ? 'No notifications match this filter.' : 'No notifications yet.'}</p>
          ) : (
            filteredNotes.map((n) => (
              <div className="activity-item" key={n.id}>
                <div className="activity-dot" />
                <div>
                  <strong>{n.title}</strong>
                  <div className="muted">{n.body}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}

function SearchGroup({
  title,
  hits,
}: {
  title: string
  hits: { id: string; label: string; detail?: string; href: string }[]
}) {
  if (!hits.length) return null
  return (
    <div>
      <div className="label" style={{ marginBottom: 8 }}>
        {title}
      </div>
      <ul className="search-hit-list">
        {hits.map((h) => (
          <li key={h.id}>
            <Link href={h.href}>
              <strong>{h.label}</strong>
              {h.detail ? <div className="muted">{h.detail}</div> : null}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
