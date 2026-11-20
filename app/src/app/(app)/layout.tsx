import { redirect } from 'next/navigation'
import { AppShell } from '@/components/layout/AppShell'
import { getActiveCompanyId, getSession } from '@/server/authz'

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session?.user) redirect('/login')

  const activeCompanyId =
    (session.session as { activeCompanyId?: string | null }).activeCompanyId ||
    (await getActiveCompanyId(session.user.id))

  return (
    <AppShell
      userId={session.user.id}
      userName={session.user.name}
      activeCompanyId={activeCompanyId}
      isSuperAdmin={Boolean((session.user as { isSuperAdmin?: boolean }).isSuperAdmin)}
    >
      {children}
    </AppShell>
  )
}
