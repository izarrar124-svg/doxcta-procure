import Link from 'next/link'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { MarketingShell } from '@/components/marketing/MarketingShell'
import { ProductFrame } from '@/components/marketing/ProductFrame'
import { PricingGrid } from '@/components/marketing/PricingGrid'

export const metadata: Metadata = {
  title: 'Doxcta AI: Expenses and invoices for growing teams',
  description:
    'Stop retyping invoices. Record expenses, run approvals, and see what the company actually spent.',
}

export default function HomePage() {
  return (
    <MarketingShell>
      <section className="mkt-hero">
        <div className="mkt-container mkt-hero-grid">
          <div>
            <div className="mkt-eyebrow">Doxcta AI</div>
            <h1>
              stop retyping <span className="accent">every invoice.</span>
            </h1>
            <p className="mkt-hero-lead">
              Upload the PDF. Check the fields. Send it for approval. See what each department spent
              this month, without another spreadsheet.
            </p>
            <div className="mkt-cta-row">
              <Link href="/register">
                <Button type="button" size="lg">
                  Try it for 14 days
                </Button>
              </Link>
              <Link href="/login">
                <Button type="button" variant="secondary" size="lg">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
          <ProductFrame variant="overview" caption="workspace / overview" />
        </div>
      </section>

      <section className="mkt-section" id="problem">
        <div className="mkt-container">
          <div className="mkt-eyebrow">Sound familiar</div>
          <h2>invoices in email. expenses in chat. nobody has the full picture.</h2>
          <p className="mkt-section-lead">
            Most small finance teams are not missing “insights.” They’re missing a place where the
            documents, the approvals, and the balances actually live together.
          </p>
          <div className="mkt-problem-grid">
            <article className="mkt-problem-item">
              <div className="num">01</div>
              <h3>someone is still keying totals</h3>
              <p>
                Vendor sends a PDF. You open it, type the amount into a sheet, hope the tax line is
                right, hope nobody already logged it last week.
              </p>
            </article>
            <article className="mkt-problem-item">
              <div className="num">02</div>
              <h3>spend is scattered</h3>
              <p>
                Receipts in WhatsApp. Card statements in email. Department heads each keep their own
                version of “what we spent.”
              </p>
            </article>
            <article className="mkt-problem-item">
              <div className="num">03</div>
              <h3>approvals drag</h3>
              <p>
                A request sits until someone notices. By then the invoice is overdue, or the budget
                was already blown.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mkt-section" id="product">
        <div className="mkt-container">
          <div className="mkt-eyebrow">What you get</div>
          <h2>the boring parts of finance ops, done properly.</h2>
          <p className="mkt-section-lead">
            Doxcta is for recording expenses, reading invoices, approving them, and tracking what is
            still unpaid. AI helps with the typing. It does not invent your numbers.
          </p>

          <div className="mkt-split" style={{ marginBottom: '3.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>upload the invoice. we fill the form.</h2>
              <p className="mkt-section-lead">
                PDF, JPG, or PNG. You get vendor, invoice number, dates, tax, total, and line items
                to check. Low-confidence fields stay flagged. Nothing is marked paid just because the
                document said so.
              </p>
            </div>
            <ProductFrame variant="invoice-review" caption="workspace / invoice review" />
          </div>

          <div className="mkt-split reverse" style={{ marginBottom: '3.5rem' }}>
            <ProductFrame variant="expenses" caption="workspace / approvals" />
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>approvals that match how you already work.</h2>
              <p className="mkt-section-lead">
                Department head first. Finance next. CEO when the amount warrants it. Approve,
                reject, or send it back with a note, and keep the trail.
              </p>
            </div>
          </div>

          <div className="mkt-split">
            <div>
              <h2 style={{ fontSize: '1.8rem' }}>know what you still owe.</h2>
              <p className="mkt-section-lead">
                Log a payment when money goes out. Partial payments are fine. The outstanding
                balance is calculated for you, not typed into a second sheet.
              </p>
            </div>
            <ProductFrame variant="payments" caption="workspace / payments" />
          </div>
        </div>
      </section>

      <section className="mkt-section" id="how">
        <div className="mkt-container">
          <div className="mkt-eyebrow">Workflow</div>
          <h2>four steps. same every time.</h2>
          <p className="mkt-section-lead">
            No magic. Just a path from a file on disk to a record your team can trust.
          </p>
          <div className="mkt-steps">
            <div className="mkt-step">
              <div className="num">01</div>
              <h3>upload</h3>
              <p>Drop the invoice file. We keep the original.</p>
            </div>
            <div className="mkt-step">
              <div className="num">02</div>
              <h3>extract</h3>
              <p>We pull the fields and check the math where we can.</p>
            </div>
            <div className="mkt-step">
              <div className="num">03</div>
              <h3>review</h3>
              <p>You confirm next to the document. Fix anything wrong.</p>
            </div>
            <div className="mkt-step">
              <div className="num">04</div>
              <h3>act</h3>
              <p>Approve it. Record payment. Report on it later.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section" id="workspace">
        <div className="mkt-container">
          <div className="mkt-eyebrow">Inside the product</div>
          <h2>what shows up in the sidebar.</h2>
          <p className="mkt-section-lead">
            Same labels after you sign in. People only see the parts their role allows.
          </p>
          <div className="mkt-modules">
            {[
              'Overview',
              'Expenses',
              'Invoices',
              'Vendors',
              'Approvals',
              'Payments',
              'Budgets',
              'Reports',
              'AI Assistant',
              'Settings',
            ].map((m) => (
              <span key={m} className="mkt-module">
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section" id="roles">
        <div className="mkt-container">
          <div className="mkt-eyebrow">Who uses it</div>
          <h2>built for the people who actually touch the money.</h2>
          <p className="mkt-section-lead">
            Invite by email. Assign a role. No shared “finance@” password floating around.
          </p>
          <div className="mkt-role-grid">
            <article className="mkt-card">
              <h3>Employees</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
                Submit an expense. Attach a receipt. See where it sits in approval, not the whole
                company ledger.
              </p>
            </article>
            <article className="mkt-card">
              <h3>Finance</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
                Check invoice extractions, keep vendors tidy, log payments, pull department and aging
                reports.
              </p>
            </article>
            <article className="mkt-card">
              <h3>Admins</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
                Set departments, approval rules, currency (USD, GBP, or AED), and who can see bank
                details.
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="mkt-section" id="pricing">
        <div className="mkt-container">
          <div className="mkt-eyebrow">Pricing</div>
          <h2>priced for small teams, not enterprise theater.</h2>
          <p className="mkt-section-lead">
            USD monthly. 14-day trial. If you need more seats or volume later, move up a plan.
          </p>
          <PricingGrid />
          <p style={{ marginTop: '1.25rem' }}>
            <Link href="/pricing" style={{ color: 'var(--accent)' }}>
              Full plan comparison →
            </Link>
          </p>
        </div>
      </section>

      <section className="mkt-section" id="trust">
        <div className="mkt-container">
          <div className="mkt-eyebrow">Trust</div>
          <h2>we won’t claim certifications we don’t have.</h2>
          <div className="mkt-trust-grid">
            <ul className="mkt-trust-list">
              <li>Your company’s data stays in your workspace. Other customers cannot see it.</li>
              <li>Permissions decide who views expenses, invoices, payments, and bank fields.</li>
              <li>Creates, approvals, and payment changes are written to an audit log.</li>
              <li>
                Ask the assistant “how much did we spend this month?” Answers come from your
                records, not made-up totals.
              </li>
            </ul>
            <div className="mkt-card">
              <h3>This site is public. Your books are not.</h3>
              <p style={{ color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                The marketing pages only explain the product. Once you sign in, that’s a separate
                workspace. We don’t put invoice totals on the homepage for a reason.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-final">
        <div className="mkt-container">
          <h2>less typing. clearer spend.</h2>
          <p className="mkt-section-lead">
            If your week still includes copying invoice PDFs into a sheet, start a trial and see if
            this fits how your team works.
          </p>
          <div className="mkt-cta-row">
            <Link href="/register">
              <Button type="button" size="lg">
                Start 14-day trial
              </Button>
            </Link>
            <Link href="/pricing">
              <Button type="button" variant="secondary" size="lg">
                See pricing
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  )
}
