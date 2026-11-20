export const PERMISSIONS = [
  { key: 'employees.manage', description: 'Invite and manage employees' },
  { key: 'departments.manage', description: 'Manage departments' },
  { key: 'roles.manage', description: 'Manage roles and permissions' },
  { key: 'settings.manage', description: 'Manage company settings' },
  { key: 'reports.view', description: 'View company reports' },
  { key: 'expenses.create', description: 'Submit expenses' },
  { key: 'expenses.view_own', description: 'View own expenses' },
  { key: 'expenses.view_department', description: 'View department expenses' },
  { key: 'expenses.view_all', description: 'View all company expenses' },
  { key: 'expenses.approve', description: 'Approve expenses' },
  { key: 'purchases.create', description: 'Create purchase requests' },
  { key: 'purchases.approve', description: 'Approve purchase requests' },
  { key: 'vendors.manage', description: 'Manage vendors' },
  { key: 'budgets.manage', description: 'Manage budgets' },
] as const

export type PermissionKey = (typeof PERMISSIONS)[number]['key']

export const ROLE_TEMPLATES: Array<{
  key: string
  name: string
  description: string
  permissions: PermissionKey[]
}> = [
  {
    key: 'company_admin',
    name: 'Company Admin',
    description: 'Manage company settings, employees, and configuration.',
    permissions: [
      'employees.manage',
      'departments.manage',
      'roles.manage',
      'settings.manage',
      'reports.view',
      'expenses.view_all',
      'purchases.approve',
      'vendors.manage',
      'budgets.manage',
    ],
  },
  {
    key: 'ceo',
    name: 'CEO / Director',
    description: 'Company-wide financial visibility and executive approvals.',
    permissions: [
      'reports.view',
      'expenses.view_all',
      'expenses.approve',
      'purchases.approve',
      'budgets.manage',
    ],
  },
  {
    key: 'finance_manager',
    name: 'Finance Manager',
    description: 'Financial records, budgets, and payments.',
    permissions: [
      'reports.view',
      'expenses.view_all',
      'expenses.approve',
      'budgets.manage',
      'purchases.approve',
    ],
  },
  {
    key: 'department_manager',
    name: 'Department Manager',
    description: 'Department approvals and team spend.',
    permissions: [
      'expenses.view_department',
      'expenses.approve',
      'purchases.approve',
      'reports.view',
    ],
  },
  {
    key: 'procurement_officer',
    name: 'Procurement Officer',
    description: 'Vendors, POs, and purchasing.',
    permissions: ['vendors.manage', 'purchases.create', 'purchases.approve', 'reports.view'],
  },
  {
    key: 'employee',
    name: 'Employee',
    description: 'Submit and track personal requests.',
    permissions: [
      'expenses.create',
      'expenses.view_own',
      'purchases.create',
    ],
  },
]
