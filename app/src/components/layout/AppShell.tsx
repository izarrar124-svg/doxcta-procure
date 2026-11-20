import Link from 'next/link'
import { ReactNode } from 'react'
import { listMembershipsForUser } from '@/server/authz'
import { CompanySwitcher } from '@/components/layout/CompanySwitcher'
import { SignOutButton } from '@/components/layout/SignOutButton'

const spendNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/requests', label: 'Requests', soon: true },
  { to: '/approvals', label: 'Approvals', soon: true },
  { to: '/procurement', label: 'Procurement', soon: true },
  { to: '/procurement/expenses', label: 'Expenses', soon: true },
  { to: '/analytics', label: 'Analytics', soon: true },
  { to: '/reports', label: 'Reports', soon: true },
  { to: '/notifications', label: 'Notifications' },
]

const adminNav = [
  { to: '/admin/users', label: 'Employees' },
  { to: '/admin/departments', label: 'Departments' },
  { to: '/admin/roles', label: 'Roles' },
  { to: '/admin/settings', label: 'Settings' },
]

export async function AppShell({
  children,
  userId,
  userName,
  activeCompanyId,
  isSuperAdmin,
}: {
  children: ReactNode
  userId: string
  userName: string
  activeCompanyId: string | null
  isSuperAdmin?: boolean
}) {
  const memberships = await listMembershipsForUser(userId)

  return (
    <div className="app-shell">
      <aside className="app-sidebar open">
        <Link href="/dashboard" className="app-sidebar-brand">
          <img src="/brand/doxcta-mark-dark.png" alt="Doxcta" />
          <div className="app-sidebar-brand-text">
            <strong>Doxcta Procure</strong>
            <span>Spend management</span>
          </div>
        </Link>

        <div className="app-nav-section">Spend management</div>
        {spendNav.map((item) => (
          <Link key={item.to} href={item.to} className="app-nav-link">
            {item.label}
            {item.soon ? <span className="muted" style={{ marginLeft: 6, fontSize: 11 }}>soon</span> : null}
          </Link>
        ))}

        <div className="app-nav-section">Administration</div>
        {adminNav.map((item) => (
          <Link key={item.to} href={item.to} className="app-nav-link">
            {item.label}
          </Link>
        ))}

        {isSuperAdmin ? (
          <>
            <div className="app-nav-section">Platform</div>
            <Link href="/super-admin" className="app-nav-link">
              Super Admin
            </Link>
          </>
        ) : null}
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="app-topbar-title">Workspace</div>
          <CompanySwitcher memberships={memberships} activeCompanyId={activeCompanyId} />
          <div className="avatar">{userName.slice(0, 2).toUpperCase()}</div>
          <SignOutButton />
        </header>
        <main className="app-content">{children}</main>
      </div>
    </div>
  )
}
