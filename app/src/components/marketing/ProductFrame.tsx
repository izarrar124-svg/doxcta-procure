type Variant = 'overview' | 'invoice-review' | 'expenses' | 'payments'

const SIDE = [
  'Overview',
  'Expenses',
  'Invoices',
  'Vendors',
  'Approvals',
  'Payments',
  'Budgets',
  'Reports',
  'AI Assistant',
]

export function ProductFrame({
  variant = 'overview',
  caption = 'app / overview',
}: {
  variant?: Variant
  caption?: string
}) {
  return (
    <div className="mkt-frame mkt-hero-mock">
      <div className="mkt-frame-top">
        <span className="mkt-frame-dot" />
        <span className="mkt-frame-dot" />
        <span className="mkt-frame-dot" />
        <span style={{ marginLeft: 8 }}>{caption}</span>
      </div>
      <div className="mkt-frame-body">
        <aside className="mkt-frame-side">
          <strong>Doxcta AI</strong>
          <ul>
            {SIDE.map((item) => (
              <li
                key={item}
                className={
                  (variant === 'overview' && item === 'Overview') ||
                  (variant === 'invoice-review' && item === 'Invoices') ||
                  (variant === 'expenses' && item === 'Approvals') ||
                  (variant === 'payments' && item === 'Payments')
                    ? 'active'
                    : undefined
                }
              >
                {item}
              </li>
            ))}
          </ul>
        </aside>
        <div className="mkt-frame-main">{renderMain(variant)}</div>
      </div>
    </div>
  )
}

function renderMain(variant: Variant) {
  if (variant === 'invoice-review') {
    return (
      <>
        <h4>AI Review Center</h4>
        <p className="hint">Side-by-side document and extracted fields · confidence shown</p>
        <div className="mkt-review">
          <div className="mkt-review-pane">
            <div className="doc" />
            <div>invoice-acme-nov.pdf</div>
            <div style={{ marginTop: 6 }}>
              <span className="mkt-pill warn">1 arithmetic warning</span>
            </div>
          </div>
          <div className="mkt-review-pane">
            <div className="mkt-field">
              <span>Vendor</span>
              <strong>Acme Cloud</strong>
            </div>
            <div className="mkt-field">
              <span>Invoice #</span>
              <strong>INV-10428</strong>
            </div>
            <div className="mkt-field">
              <span>Total</span>
              <strong>USD 1,240.00</strong>
            </div>
            <div className="mkt-field">
              <span>Category</span>
              <strong>Software</strong>
            </div>
            <div style={{ marginTop: 8 }}>
              <span className="mkt-pill">Ready to approve</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (variant === 'expenses') {
    return (
      <>
        <h4>Approval Center</h4>
        <p className="hint">Pending requests · department · amount · stage</p>
        <table className="mkt-table">
          <thead>
            <tr>
              <th>Request</th>
              <th>Dept</th>
              <th>Amount</th>
              <th>Stage</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>AWS November</td>
              <td>Engineering</td>
              <td>USD 2,480</td>
              <td>
                <span className="mkt-pill">Finance</span>
              </td>
            </tr>
            <tr>
              <td>Team offsite</td>
              <td>Ops</td>
              <td>USD 860</td>
              <td>
                <span className="mkt-pill warn">Dept head</span>
              </td>
            </tr>
            <tr>
              <td>Legal retainer</td>
              <td>Finance</td>
              <td>USD 3,200</td>
              <td>
                <span className="mkt-pill">CEO</span>
              </td>
            </tr>
          </tbody>
        </table>
      </>
    )
  }

  if (variant === 'payments') {
    return (
      <>
        <h4>Payments</h4>
        <p className="hint">Outstanding balances calculated by the backend</p>
        <div className="mkt-kpi-grid" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
          <div className="mkt-kpi">
            <div className="label">Outstanding</div>
            <div className="value">$48.2k</div>
          </div>
          <div className="mkt-kpi">
            <div className="label">Overdue</div>
            <div className="value">6</div>
          </div>
          <div className="mkt-kpi">
            <div className="label">Paid MTD</div>
            <div className="value">$112k</div>
          </div>
        </div>
        <div className="mkt-bars">
          <Bar label="Current" pct={42} value="$20k" />
          <Bar label="1–30" pct={28} value="$13k" />
          <Bar label="31–60" pct={18} value="$9k" />
          <Bar label="90+" pct={12} value="$6k" />
        </div>
      </>
    )
  }

  return (
    <>
      <h4>Overview</h4>
      <p className="hint">Summary cards use the selected period · trends & attention</p>
      <div className="mkt-kpi-grid">
        <div className="mkt-kpi">
          <div className="label">Expenses</div>
          <div className="value">$84.1k</div>
        </div>
        <div className="mkt-kpi">
          <div className="label">Outstanding</div>
          <div className="value">$48.2k</div>
        </div>
        <div className="mkt-kpi">
          <div className="label">Approvals</div>
          <div className="value">12</div>
        </div>
        <div className="mkt-kpi">
          <div className="label">Budget</div>
          <div className="value">72%</div>
        </div>
      </div>
      <div className="mkt-bars">
        <Bar label="Eng" pct={88} value="$31k" />
        <Bar label="Ops" pct={64} value="$22k" />
        <Bar label="Finance" pct={41} value="$14k" />
        <Bar label="Mkt" pct={35} value="$12k" />
      </div>
    </>
  )
}

function Bar({ label, pct, value }: { label: string; pct: number; value: string }) {
  return (
    <div className="mkt-bar-row">
      <span>{label}</span>
      <div className="mkt-bar-track">
        <div className="mkt-bar-fill" style={{ width: `${pct}%` }} />
      </div>
      <span>{value}</span>
    </div>
  )
}
