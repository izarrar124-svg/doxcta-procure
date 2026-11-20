export function StatusPill({ status }: { status: string }) {
  const key = status.toLowerCase().replace(/\s+/g, '_')
  return <span className={`status-pill status-${key}`}>{status}</span>
}
