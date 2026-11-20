import { useMemo, useState } from 'react'
import { assistantAnswers } from '@/data/mock'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type Msg = { role: 'bot' | 'user'; text: string }

function answerFor(prompt: string): string {
  const q = prompt.toLowerCase()
  if (q.includes('pending') || q.includes('approval')) return assistantAnswers.pending
  if (q.includes('vendor') || q.includes('top')) return assistantAnswers.vendor
  if (q.includes('spend') || q.includes('pkr') || q.includes('month')) return assistantAnswers.spend
  return assistantAnswers.default
}

export function SpendChat() {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: 'bot',
      text: 'Ask me about this month’s spend, pending approvals, or top vendors. Answers are grounded in mock ledger fixtures.',
    },
  ])

  const canSend = useMemo(() => input.trim().length > 0, [input])

  function send() {
    if (!canSend) return
    const text = input.trim()
    setInput('')
    setMessages((prev) => [
      ...prev,
      { role: 'user', text },
      { role: 'bot', text: answerFor(text) },
    ])
  }

  return (
    <>
      {open ? (
        <div className="chat-panel" role="dialog" aria-label="Spend assistant">
          <header>
            <strong>Spend assistant</strong>
            <Button variant="ghost" size="sm" type="button" onClick={() => setOpen(false)}>
              Close
            </Button>
          </header>
          <div className="chat-messages">
            {messages.map((msg, idx) => (
              <div key={`${msg.role}-${idx}`} className={`chat-bubble ${msg.role}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chat-input-row">
            <Input
              value={input}
              placeholder="Ask about spend…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') send()
              }}
            />
            <Button type="button" size="sm" onClick={send} disabled={!canSend}>
              Send
            </Button>
          </div>
        </div>
      ) : null}

      <button
        className="chat-fab"
        type="button"
        aria-label="Open spend chat"
        onClick={() => setOpen((v) => !v)}
      >
        AI
      </button>
    </>
  )
}
