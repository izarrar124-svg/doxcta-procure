export type RequestStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Returned'
  | 'Rejected'
  | 'Approved'
  | 'In Procurement'
  | 'Completed'

export type Priority = 'Low' | 'Medium' | 'High'

export type ApprovalDecision = 'Pending' | 'Approved' | 'Rejected'

export interface User {
  id: string
  name: string
  email: string
  role: string
  department: string
  status: 'Active' | 'Invited' | 'Disabled'
}

export interface Department {
  id: string
  name: string
  code: string
  head: string
  members: number
}

export interface Role {
  id: string
  name: string
  code: string
  description: string
  permissions: string[]
  users: number
  system?: boolean
}

export interface Category {
  id: string
  name: string
  code: string
  description: string
  status: 'Active' | 'Inactive'
  spendYtd: number
}

export interface Vendor {
  id: string
  name: string
  category: string
  email: string
  phone: string
  status: 'Active' | 'Inactive'
}

export interface ApprovalStep {
  id: string
  order: number
  approver: string
  role: string
  decision: ApprovalDecision
  decidedAt?: string
  note?: string
}

export interface PurchaseRequest {
  id: string
  number: string
  title: string
  category: string
  department: string
  vendor: string
  status: RequestStatus
  priority: Priority
  amount: number
  currency: 'PKR'
  requiredBy: string
  requester: string
  createdAt: string
  description: string
  approvals: ApprovalStep[]
  comments: { id: string; author: string; body: string; at: string }[]
}

export interface Expense {
  id: string
  number: string
  date: string
  description: string
  department: string
  category: string
  vendor: string
  amount: number
  source: 'Manual' | 'Google Sheet'
}

export interface NotificationItem {
  id: string
  title: string
  body: string
  createdAt: string
  read: boolean
}

export interface Workflow {
  id: string
  name: string
  description: string
  department: string
  steps: string[]
  active: boolean
  isDefault?: boolean
}

export interface DashboardStats {
  pendingApprovals: number
  myRequests: number
  approved: number
  rejected: number
  spending: number
  largestPurchase: number
  avgApprovalHours: number
  topPurchaseNumber: string
  monthlyTrend: { month: string; amount: number }[]
  departmentSpend: { name: string; amount: number }[]
  categorySpend: { name: string; amount: number }[]
  pipeline: { status: string; count: number }[]
  recentActivity: { actor: string; action: string; number: string; detail: string; at: string }[]
}
