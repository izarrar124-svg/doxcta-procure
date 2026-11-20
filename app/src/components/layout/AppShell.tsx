import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import { useAuth } from '@/lib/auth'
import { initials } from '@/lib/format'
import { SpendChat } from '@/components/layout/SpendChat'
import { Button } from '@/components/ui/Button'

const spendNav = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/requests', label: 'Requests' },
  { to: '/approvals', label: 'Approvals' },
  { to: '/procurement', label: 'Procurement' },
  { to: '/procurement/expenses', label: 'Expenses' },
  { to: '/analytics', label: 'Analytics' },
  { to: '/reports', label: 'Reports' },
  { to: '/notifications', label: 'Notifications' },
]

const adminNav = [
  { to: '/admin/users', label: 'Users' },
  { to: '/admin/departments', label: 'Departments' },
  { to: '/admin/roles', label: 'Roles' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/vendors', label: 'Vendors' },
  { to: '/admin/workflows', label: 'Workflows' },
  { to: '/admin/settings', label: 'Settings' },
]

export function AppShell() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const title = useMemo(() => {
    const all = [...spendNav, ...adminNav].sort((a, b) => b.to.length - a.to.length)
    return all.find((item) => location.pathname.startsWith(item.to))?.label ?? 'Procure'
  }, [location.pathname])

  return (
    <div className="app-shell">
      <aside className={`app-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <NavLink to="/dashboard" className="app-sidebar-brand" onClick={() => setSidebarOpen(false)}>
          <img src="/brand/doxcta-mark-dark.png" alt="Doxcta" />
          <div className="app-sidebar-brand-text">
            <strong>Doxcta Procure</strong>
            <span>Spend management</span>
          </div>
        </NavLink>

        <div className="app-nav-section">Spend management</div>
        {spendNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/procurement'}
            className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}

        <div className="app-nav-section">Administration</div>
        {adminNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setSidebarOpen(false)}
          >
            {item.label}
          </NavLink>
        ))}
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <Button
            className="mobile-toggle"
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle navigation"
          >
            Menu
          </Button>
          <div className="app-topbar-title">{title}</div>
          <button className="app-search" type="button" onClick={() => navigate('/requests')}>
            Search requests, vendors…
            <kbd>⌘K</kbd>
          </button>
          <div className="avatar" title={user?.email}>
            {initials(user?.name ?? 'UA')}
          </div>
          <Button
            variant="secondary"
            size="sm"
            type="button"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            Sign out
          </Button>
        </header>

        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <SpendChat />
    </div>
  )
}
