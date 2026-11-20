import { useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categories, requests as seedRequests, vendors } from '@/data/mock'
import type { Priority, PurchaseRequest, RequestStatus } from '@/data/types'
import { formatDate, formatPkr } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusPill } from '@/components/ui/StatusPill'

const statuses: Array<'All statuses' | RequestStatus> = [
  'All statuses',
  'Draft',
  'Pending Approval',
  'Returned',
  'Rejected',
  'Approved',
  'In Procurement',
  'Completed',
]

export function RequestsPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<PurchaseRequest[]>(seedRequests)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<(typeof statuses)[number]>('All statuses')
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState({
    title: '',
    category: categories[0].name,
    vendor: vendors[0].name,
    amount: '',
    priority: 'Medium' as Priority,
    requiredBy: '',
    description: '',
  })

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query.toLowerCase()) ||
        item.number.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'All statuses' || item.status === status
      return matchesQuery && matchesStatus
    })
  }, [items, query, status])

  function onCreate(e: FormEvent) {
    e.preventDefault()
    const amount = Number(form.amount)
    if (!form.title || !amount) return
    const seq = String(items.length + 1).padStart(4, '0')
    const next: PurchaseRequest = {
      id: `local-${Date.now()}`,
      number: `PR-2026-${seq}`,
      title: form.title,
      category: form.category,
      department: 'Operations',
      vendor: form.vendor,
      status: 'Pending Approval',
      priority: form.priority,
      amount,
      currency: 'PKR',
      requiredBy: form.requiredBy || new Date().toISOString().slice(0, 10),
      requester: 'Zarrar Ahmed',
      createdAt: new Date().toISOString(),
      description: form.description || 'New purchase request',
      approvals: [
        {
          id: `na-${Date.now()}`,
          order: 1,
          approver: 'Department Head',
          role: 'Department Head',
          decision: 'Pending',
        },
        { id: `nb-${Date.now()}`, order: 2, approver: 'CEO', role: 'CEO', decision: 'Pending' },
        {
          id: `nc-${Date.now()}`,
          order: 3,
          approver: 'Procurement',
          role: 'Procurement Officer',
          decision: 'Pending',
        },
      ],
      comments: [],
    }
    setItems((prev) => [next, ...prev])
    setCreating(false)
    setForm({
      title: '',
      category: categories[0].name,
      vendor: vendors[0].name,
      amount: '',
      priority: 'Medium',
      requiredBy: '',
      description: '',
    })
    navigate(`/requests/${next.number}`)
  }

  return (
    <div>
      <PageHeader
        title="Purchase Requests"
        description="Create, track, and manage procurement requests."
        actions={
          <Button type="button" size="sm" onClick={() => setCreating((v) => !v)}>
            {creating ? 'Cancel' : '+ New request'}
          </Button>
        }
      />

      {creating ? (
        <form className="panel" style={{ marginBottom: 16 }} onSubmit={onCreate}>
          <div className="panel-header">
            <h3>New request</h3>
          </div>
          <div className="panel-body grid-2-equal">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount (PKR)</Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="dx-input"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="vendor">Vendor</Label>
              <select
                id="vendor"
                className="dx-input"
                value={form.vendor}
                onChange={(e) => setForm((f) => ({ ...f, vendor: e.target.value }))}
              >
                {vendors.map((v) => (
                  <option key={v.id} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                className="dx-input"
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div>
              <Label htmlFor="requiredBy">Required by</Label>
              <Input
                id="requiredBy"
                type="date"
                value={form.requiredBy}
                onChange={(e) => setForm((f) => ({ ...f, requiredBy: e.target.value }))}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Button type="submit">Submit request</Button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="filters-row">
        <Input
          placeholder="Search title or number..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Title</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Amount</th>
              <th>Required</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item) => (
              <tr key={item.id}>
                <td>
                  <Link to={`/requests/${item.number}`}>{item.number}</Link>
                </td>
                <td>
                  <div>{item.title}</div>
                  <div className="muted" style={{ fontSize: '0.85rem' }}>
                    {item.category}
                  </div>
                </td>
                <td>
                  <StatusPill status={item.status} />
                </td>
                <td>
                  <StatusPill status={item.priority} />
                </td>
                <td className="mono">{formatPkr(item.amount)}</td>
                <td>{formatDate(item.requiredBy)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
