import Link from 'next/link'

export default function VerifyEmailPage() {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Verify email</h1>
        <p className="subtitle">
          Check your inbox for a verification link. In development without Resend, verification may be
          optional depending on server configuration.
        </p>
        <Link href="/login">Continue to sign in</Link>
      </div>
    </div>
  )
}
