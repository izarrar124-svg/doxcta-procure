import { Resend } from 'resend'

export async function sendEmail(opts: {
  to: string
  subject: string
  html: string
}) {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM ?? 'Doxcta Procure <onboarding@resend.dev>'

  if (!apiKey) {
    console.info('[email:dev]', opts.to, opts.subject, opts.html.slice(0, 200))
    return { id: 'dev-log' }
  }

  const resend = new Resend(apiKey)
  const result = await resend.emails.send({
    from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  })
  return result
}
