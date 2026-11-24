import { exportExpensesCsvAction } from '@/server/expenses/actions'

export async function GET() {
  try {
    const csv = await exportExpensesCsvAction()
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="expenses.csv"',
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'EXPORT_FAILED'
    return Response.json({ error: message }, { status: 400 })
  }
}
