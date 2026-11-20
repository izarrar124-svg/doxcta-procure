import { eq } from 'drizzle-orm'
import { getSession } from '@/server/authz'
import { getDb } from '@/server/db'
import { notifications } from '@/server/db/schema'
import { redirect } from 'next/navigation'

export default async function NotificationsPage() {
  const session = await getSession()
  if (!session?.user) redirect('/login')
  const db = getDb()
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))

  return (
    <div>
      <div className="app-page-header">
        <div>
          <h1>Notifications</h1>
          <p>Workspace events for your account.</p>
        </div>
      </div>
      <div className="panel">
        <div className="panel-body">
          {rows.length === 0 ? (
            <p className="muted">No notifications.</p>
          ) : (
            rows.map((n) => (
              <div className="activity-item" key={n.id}>
                <div className="activity-dot" style={{ opacity: n.read ? 0.35 : 1 }} />
                <div>
                  <strong>{n.title}</strong>
                  <div className="muted">{n.body}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
