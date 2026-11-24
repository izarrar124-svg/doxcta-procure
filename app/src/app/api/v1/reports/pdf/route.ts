import { getActiveCompanyId, requirePermission, requireUser } from '@/server/authz'
import { getOverviewMetrics, agingReport } from '@/server/reports/overview'

export async function GET() {
  try {
    const session = await requireUser()
    const companyId =
      (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
      (await getActiveCompanyId(session.user.id))
    if (!companyId) return Response.json({ error: 'NO_COMPANY' }, { status: 400 })
    await requirePermission(companyId, 'reports.view')

    const metrics = await getOverviewMetrics(companyId)
    const aging = await agingReport(companyId)
    const text = [
      'Doxcta AI: Financial Summary',
      `Generated: ${new Date().toISOString()}`,
      '',
      `Total Expenses: ${metrics.totalExpenses.toFixed(2)}`,
      `Total Invoiced: ${metrics.totalInvoiced.toFixed(2)}`,
      `Total Paid: ${metrics.totalPaid.toFixed(2)}`,
      `Outstanding: ${metrics.outstanding.toFixed(2)}`,
      `Pending Approvals: ${metrics.pendingApprovals}`,
      `Overdue Invoices: ${metrics.overdueInvoices}`,
      `Budget Utilization: ${metrics.budgetUtilization.toFixed(0)}%`,
      '',
      'Invoice Aging',
      `Current: ${aging.current.toFixed(2)}`,
      `1-30: ${aging.d1_30.toFixed(2)}`,
      `31-60: ${aging.d31_60.toFixed(2)}`,
      `61-90: ${aging.d61_90.toFixed(2)}`,
      `90+: ${aging.d90p.toFixed(2)}`,
    ].join('\n')

    // Lightweight text/pdf-compatible download for MVP (true PDF libraries deferred)
    return new Response(text, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="doxcta-summary.pdf"',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'FAILED'
    return Response.json({ error: message }, { status: 400 })
  }
}
