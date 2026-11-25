import { ReactNode } from 'react'
import { getMembershipPermissions, listMembershipsForUser } from '@/server/authz'
import { AppNavLink } from '@/components/layout/AppNavLink'
import { CompanySwitcher } from '@/components/layout/CompanySwitcher'
import { SignOutButton } from '@/components/layout/SignOutButton'
import { DoxctaLogo } from '@/components/brand/DoxctaLogo'
import type { PermissionKey } from '@/server/permissions'

type NavItem = {
  to: string
  label: string
  anyOf?: PermissionKey[]
}

const primaryNav: NavItem[] = [
  { to: '/dashboard', label: 'Overview' },
  {
    to: '/expenses',
    label: 'Expenses',
    anyOf: ['expenses.view_own', 'expenses.view_department', 'expenses.view_all', 'expenses.create'],
  },
  { to: '/invoices', label: 'Invoices', anyOf: ['invoices.view', 'invoices.create'] },
  { to: '/vendors', label: 'Vendors', anyOf: ['vendors.view', 'vendors.manage'] },
  { to: '/approvals', label: 'Approvals', anyOf: ['expenses.approve', 'invoices.approve'] },
  { to: '/payments', label: 'Payments', anyOf: ['payments.view', 'payments.record'] },
  { to: '/admin/departments', label: 'Departments', anyOf: ['departments.manage'] },
  { to: '/budgets', label: 'Budgets', anyOf: ['budgets.view', 'budgets.manage'] },
  { to: '/reports', label: 'Reports & Analytics', anyOf: ['reports.view'] },
  { to: '/assistant', label: 'AI Assistant', anyOf: ['ai.assistant'] },
  { to: '/notifications', label: 'Notifications' },
]

const adminNav: NavItem[] = [
  { to: '/admin/users', label: 'Users', anyOf: ['employees.manage'] },
  { to: '/admin/roles', label: 'Permissions', anyOf: ['roles.manage'] },
  { to: '/admin/settings', label: 'Settings', anyOf: ['settings.manage'] },
  { to: '/admin/billing', label: 'Subscription', anyOf: ['settings.manage'] },
]

function canSee(perms: string[], item: NavItem) {
  if (!item.anyOf || item.anyOf.length === 0) return true
  return item.anyOf.some((p) => perms.includes(p))
}

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
  let perms: string[] = []
  if (activeCompanyId) {
    try {
      const ctx = await getMembershipPermissions(activeCompanyId)
      perms = ctx.permissions
    } catch {
      perms = []
    }
  }

  return (
    <div className="app-shell">
      <aside className="app-sidebar open">
        <div className="app-sidebar-brand">
          <DoxctaLogo href="/dashboard" size="md" tagline="Expenses & invoices" />
        </div>

        <div className="app-nav-section">Workspace</div>
        {primaryNav.filter((item) => canSee(perms, item)).map((item) => (
          <AppNavLink key={item.to} href={item.to} label={item.label} />
        ))}

        <div className="app-nav-section">Administration</div>
        {adminNav.filter((item) => canSee(perms, item)).map((item) => (
          <AppNavLink key={item.to} href={item.to} label={item.label} />
        ))}

        {isSuperAdmin ? (
          <>
            <div className="app-nav-section">Platform</div>
            <AppNavLink href="/super-admin" label="Super Admin" />
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
