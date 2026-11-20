import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/lib/auth'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { RequestsPage } from '@/pages/RequestsPage'
import { RequestDetailPage } from '@/pages/RequestDetailPage'
import { ApprovalsPage } from '@/pages/ApprovalsPage'
import { ProcurementPage } from '@/pages/ProcurementPage'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { ReportsPage } from '@/pages/ReportsPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import {
  CategoriesPage,
  DepartmentsPage,
  RolesPage,
  SettingsPage,
  UsersPage,
  VendorsPage,
  WorkflowsPage,
} from '@/pages/AdminPages'
import type { ReactNode } from 'react'

function Protected({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <Protected>
              <AppShell />
            </Protected>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="requests/:number" element={<RequestDetailPage />} />
          <Route path="approvals" element={<ApprovalsPage />} />
          <Route path="procurement" element={<ProcurementPage />} />
          <Route path="procurement/expenses" element={<ExpensesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="admin/users" element={<UsersPage />} />
          <Route path="admin/departments" element={<DepartmentsPage />} />
          <Route path="admin/roles" element={<RolesPage />} />
          <Route path="admin/categories" element={<CategoriesPage />} />
          <Route path="admin/vendors" element={<VendorsPage />} />
          <Route path="admin/workflows" element={<WorkflowsPage />} />
          <Route path="admin/settings" element={<SettingsPage />} />
          {/* Live app redirects bare admin/expense paths to dashboard; keep soft redirects */}
          <Route path="expenses" element={<Navigate to="/procurement/expenses" replace />} />
          <Route path="users" element={<Navigate to="/admin/users" replace />} />
          <Route path="departments" element={<Navigate to="/admin/departments" replace />} />
          <Route path="roles" element={<Navigate to="/admin/roles" replace />} />
          <Route path="categories" element={<Navigate to="/admin/categories" replace />} />
          <Route path="vendors" element={<Navigate to="/admin/vendors" replace />} />
          <Route path="workflows" element={<Navigate to="/admin/workflows" replace />} />
          <Route path="settings" element={<Navigate to="/admin/settings" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
