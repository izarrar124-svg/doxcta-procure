'use client'

import { useState, useTransition } from 'react'
import { askAssistantAction } from '@/server/ai/assistant'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const SUGGESTIONS = [
  'How much did we spend this month?',
  'Which department spent the most?',
  'Show all unpaid invoices.',
  'What are our top five vendors?',
  'Which expenses exceeded departmental budgets?',
]

export function AssistantChat() {
  const [query, setQuery] = useState('')
  const [answer, setAnswer] = useState<string | null>(null)
  const [sources, setSources] = useState<string[]>([])
  const [pending, startTransition] = useTransition()

  function ask(q: string) {
    setQuery(q)
    startTransition(async () => {
      const res = await askAssistantAction(q)
      setAnswer(res.answer)
      setSources(res.sources)
    })
  }

  return (
    <div className="panel">
      <div className="panel-body" style={{ display: 'grid', gap: 14 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUGGESTIONS.map((s) => (
            <button key={s} type="button" className="dx-btn dx-btn-ghost dx-btn-sm" onClick={() => ask(s)}>
              {s}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            if (query.trim()) ask(query.trim())
          }}
          style={{ display: 'flex', gap: 8 }}
        >
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask about spending, vendors, invoices, budgets…"
          />
          <Button type="submit" disabled={pending || !query.trim()}>
            {pending ? 'Thinking…' : 'Ask'}
          </Button>
        </form>
        {answer ? (
          <div>
            <strong>Answer</strong>
            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{answer}</pre>
            {sources.length ? (
              <p className="muted">Source records: {sources.slice(0, 8).join(', ')}</p>
            ) : null}
          </div>
        ) : (
          <p className="muted">Answers use verified organization-scoped calculations, never invented figures.</p>
        )}
      </div>
    </div>
  )
}
