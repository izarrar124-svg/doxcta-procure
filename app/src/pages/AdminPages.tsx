import {
  categories,
  departments,
  roles,
  users,
  vendors,
  workflows,
} from '@/data/mock'
import { formatPkr } from '@/lib/format'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusPill } from '@/components/ui/StatusPill'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { useState } from 'react'

export function UsersPage() {
  return (
    <div>
      <PageHeader
        title="Users"
        description="People who can raise and approve spend."
        actions={
          <Button type="button" size="sm">
            + Add user
          </Button>
        }
      />
      <div className="filters-row">
        <Input placeholder="Search users…" />
      </div>
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Roles</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.department}</td>
                <td>{u.role}</td>
                <td>
                  <StatusPill status={u.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function DepartmentsPage() {
  return (
    <div>
      <PageHeader
        title="Departments"
        description="Org units used for request routing and reports."
        actions={
          <Button type="button" size="sm">
            + Add department
          </Button>
        }
      />
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Head</th>
              <th>Members</th>
            </tr>
          </thead>
          <tbody>
            {departments.map((d) => (
              <tr key={d.id}>
                <td>{d.name}</td>
                <td className="mono">{d.code}</td>
                <td>{d.head}</td>
                <td>{d.members}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function RolesPage() {
  return (
    <div>
      <PageHeader
        title="Roles"
        description="Permission bundles for requesters, managers, and finance."
        actions={
          <Button type="button" size="sm">
            + Add role
          </Button>
        }
      />
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Description</th>
              <th>Permissions</th>
              <th>Users</th>
              <th>System</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.name}</td>
                <td className="mono">{role.code}</td>
                <td>{role.description}</td>
                <td>{role.permissions.length}</td>
                <td>{role.users}</td>
                <td>{role.system ? 'Yes' : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function CategoriesPage() {
  return (
    <div>
      <PageHeader
        title="Categories"
        description="Spend taxonomy for requests and reports."
        actions={
          <Button type="button" size="sm">
            + Add category
          </Button>
        }
      />
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Code</th>
              <th>Description</th>
              <th>Status</th>
              <th>YTD spend</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td className="mono">{c.code}</td>
                <td>{c.description}</td>
                <td>
                  <StatusPill status={c.status} />
                </td>
                <td className="mono">{formatPkr(c.spendYtd)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function VendorsPage() {
  return (
    <div>
      <PageHeader
        title="Vendors"
        description="Preferred and approved suppliers."
        actions={
          <Button type="button" size="sm">
            + Add vendor
          </Button>
        }
      />
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {vendors.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.email}</td>
                <td>{v.phone}</td>
                <td>
                  <StatusPill status={v.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function WorkflowsPage() {
  return (
    <div>
      <PageHeader
        title="Workflows"
        description="Sequential approval chains by department and spend threshold."
        actions={
          <Button type="button" size="sm">
            New workflow
          </Button>
        }
      />
      <div className="panel">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Steps</th>
              <th>Default</th>
              <th>Active</th>
            </tr>
          </thead>
          <tbody>
            {workflows.map((w) => (
              <tr key={w.id}>
                <td>{w.name}</td>
                <td>{w.description}</td>
                <td>{w.steps.join(' → ')}</td>
                <td>{w.isDefault ? 'Yes' : '—'}</td>
                <td>{w.active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export function SettingsPage() {
  const [org, setOrg] = useState('Doxcta')
  const [currency, setCurrency] = useState('PKR')
  const [fiscalStart, setFiscalStart] = useState('July')
  const [reminderDays, setReminderDays] = useState('3')
  const [fx, setFx] = useState('278')
  const [saved, setSaved] = useState(false)

  return (
    <div>
      <PageHeader title="Settings" description="Organization defaults for the Procure workspace." />
      <div className="panel" style={{ maxWidth: 560 }}>
        <div className="panel-body">
          <div className="auth-field">
            <Label htmlFor="org">Organization name</Label>
            <Input id="org" value={org} onChange={(e) => setOrg(e.target.value)} />
          </div>
          <div className="auth-field">
            <Label htmlFor="currency">Default currency</Label>
            <select
              id="currency"
              className="dx-input"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="PKR">PKR</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <div className="auth-field">
            <Label htmlFor="fx">FX rate (PKR per USD)</Label>
            <Input id="fx" value={fx} onChange={(e) => setFx(e.target.value)} />
          </div>
          <div className="auth-field">
            <Label htmlFor="fiscal">Fiscal year start</Label>
            <Input id="fiscal" value={fiscalStart} onChange={(e) => setFiscalStart(e.target.value)} />
          </div>
          <div className="auth-field">
            <Label htmlFor="remind">Approval reminder days</Label>
            <Input
              id="remind"
              value={reminderDays}
              onChange={(e) => setReminderDays(e.target.value)}
            />
          </div>
          <Button
            type="button"
            onClick={() => {
              setSaved(true)
              window.setTimeout(() => setSaved(false), 2000)
            }}
          >
            Save settings
          </Button>
          {saved ? <p className="muted">Saved locally (mock).</p> : null}
        </div>
      </div>
    </div>
  )
}
