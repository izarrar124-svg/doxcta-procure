import Link from 'next/link'
import { DoxctaLogo } from '@/components/brand/DoxctaLogo'

export function SiteFooter() {
  return (
    <footer className="mkt-footer">
      <div className="mkt-container mkt-footer-grid">
        <div>
          <div style={{ marginBottom: 12 }}>
            <DoxctaLogo size="sm" />
          </div>
          <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: 280 }}>
            Expenses, invoices, approvals, and payments — in one workspace for your team.
          </p>
        </div>
        <div>
          <h4>Product</h4>
          <ul>
            <li>
              <a href="/#product">Overview</a>
            </li>
            <li>
              <a href="/#how">How it works</a>
            </li>
            <li>
              <Link href="/pricing">Pricing</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4>Workspace</h4>
          <ul>
            <li>
              <Link href="/register">Start trial</Link>
            </li>
            <li>
              <Link href="/login">Sign in</Link>
            </li>
            <li>
              <a href="/#roles">Roles</a>
            </li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul>
            <li>
              <span>Privacy policy</span>
            </li>
            <li>
              <span>Terms of use</span>
            </li>
            <li>
              <a href="/#trust">Security</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mkt-container mkt-footer-bottom">
        <span>© {new Date().getFullYear()} Doxcta</span>
        <span>Expenses · invoices · approvals</span>
      </div>
    </footer>
  )
}
