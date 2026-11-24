import { redirect } from 'next/navigation'
import { AssistantChat } from '@/components/assistant/AssistantChat'
import { getActiveCompanyId, getSession, requirePermission } from '@/server/authz'

export default async function AssistantPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const companyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))
  if (!companyId) redirect('/dashboard')
  await requirePermission(companyId, 'ai.assistant')

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>AI Assistant</h1>
          <p>Ask questions about authorized financial records for your organization.</p>
        </div>
      </div>
      <AssistantChat />
    </div>
  )
}
