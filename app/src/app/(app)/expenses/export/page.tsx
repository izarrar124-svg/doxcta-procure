import { redirect } from 'next/navigation'

export default function ExportExpensesRedirect() {
  redirect('/api/v1/expenses/export')
}
