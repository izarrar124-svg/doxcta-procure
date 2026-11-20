import { useState } from 'react'
import { notifications as seed } from '@/data/mock'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'

export function NotificationsPage() {
  const [items, setItems] = useState(seed)

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Approvals, submissions, and spend events."
        actions={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
          >
            Mark all read
          </Button>
        }
      />
      <div className="panel">
        <div className="panel-body">
          {items.map((item) => (
            <div className="activity-item" key={item.id}>
              <div
                className="activity-dot"
                style={{ opacity: item.read ? 0.35 : 1 }}
              />
              <div style={{ flex: 1 }}>
                <strong>{item.title}</strong>
                <div className="muted">{item.body}</div>
                <div className="muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
                  {formatDate(item.createdAt)}
                </div>
              </div>
              {!item.read ? (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    setItems((prev) =>
                      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
                    )
                  }
                >
                  Mark read
                </Button>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
