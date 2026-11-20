# Xorora Procure — live capture report (2026-11-21)

Authenticated session at [https://procure.xorora.com](https://procure.xorora.com). Screenshots copied to [`screen-gallery/`](./screen-gallery/) (`01-dashboard.png` … `17-spend-chat.png`).

## Navigation IA

**Global chrome:** collapsible sidebar (hamburger), sticky top bar with **Search requests, vendors…** (⌘K), notifications bell, avatar menu (**ZA**), orange **Open spend chat** FAB on every page.

### Spend management

| Nav label | Canonical route | Notes |
|---|---|---|
| Dashboard | `/dashboard` | KPI + charts |
| Requests | `/requests` | List + **New request** |
| Approvals | `/approvals` | Approver inbox |
| Procurement | `/procurement` | Post-approval queue |
| Expenses | `/procurement/expenses` | Sidebar label “Expenses”; bare `/expenses` redirects to dashboard |
| Analytics | `/analytics` | Completed-spend analytics |
| Reports | `/reports` | Exports + rollups |
| Notifications | `/notifications` | In-app feed |

### Administration

| Nav label | Canonical route | Notes |
|---|---|---|
| Users | `/admin/users` | Bare `/users` redirects to dashboard |
| Departments | `/admin/departments` | |
| Roles | `/admin/roles` | |
| Categories | `/admin/categories` | |
| Vendors | `/admin/vendors` | |
| Workflows | `/admin/workflows` | |
| Settings | `/admin/settings` | Org defaults |

**Breadcrumbs:** Admin child routes show `Admin > {Section}`; expenses show `Procurement > Expenses`.

---

## Route inventory (per page)

### `/dashboard`

- **Purpose:** Month-scoped KPIs + spend visualizations + recent activity.
- **KPIs:** Pending Approvals, My Requests, Approved, Rejected, Spending (YYYY-MM), Largest purchase (YYYY-MM), Avg Approval Time, Top purchase #.
- **Sample values (Nov 2026):** 0 pending, 138 my/approved, PKR 211,814 spend, top PR-SHR-0028.
- **Charts:** Monthly Spending Trend, Department Spending, Procurement Status (open pipeline), Category Distribution, Recent Activity (`{user} · {ACTION} · {PR#}`).
- **Filters:** Year, Month, **All time**.
- **Actions:** Refresh, link to Reports.

### `/requests`

- **Purpose:** Purchase request directory.
- **Columns:** Number, Title, Status, Priority, Amount, Required (category shown as subtitle on title).
- **Filters:** Search title/number; status = All statuses \| DRAFT \| PENDING_APPROVAL \| RETURNED \| REJECTED \| APPROVED \| IN_PROCUREMENT \| COMPLETED.
- **Actions:** New request (link).

### `/requests/:uuid`

- **Example:** `PR-BD-0042` — “Claude pro 20$ for BD Team Humayun Khan”, status **Completed**.
- **Sections:** Details (estimated cost, required date, category, department, requester, priority), Comments (Add a comment… / Post comment), Approval timeline, History, Procurement (status + amount).
- **Detail metadata string:** payment card, renew date, sheet category, Google Sheet source row (expense sync).
- **Actions:** View procurement (when applicable).

### `/approvals`

- **Purpose:** Approver queue.
- **Empty state:** “Inbox clear” / “No requests need your approval right now.”
- **Subtitle:** “Items waiting for your decision.”

### `/procurement`

- **Purpose:** Buy approved requests.
- **Empty state:** “Queue empty” / “No approved requests awaiting purchase.”

### `/procurement/expenses`

- **Purpose:** Expense log (manual + Google Sheet import).
- **Copy:** Sync only adds new rows; delete removes from app not sheet.
- **Columns:** NUMBER, DATE, DESCRIPTION, DEPARTMENT, CATEGORY, VENDOR, AMOUNT, SOURCE (e.g. Google Sheet).
- **Pagination:** “Showing 100 of 138”.
- **Actions:** Sync from Google Sheet, per-row Delete.

### `/analytics`

- **Title:** Expense Analytics (completed procurement spend, PKR).
- **KPIs:** Total spend (PKR 1.9M), Departments with spend (6/8), Top department (Xorora Shared PKR 566K), Categories with spend (3 of 6).
- **Sections:** Monthly trend (6 months), Department spend ranked list, Category spend ranked list.

### `/reports`

- **Purpose:** Completed spend rollups PKR + USD (FX from org setting).
- **Report tabs:** Xorora Monthly Expense, Monthly Spending, Department Spending, Category Spending, Procurement Summary, Pending Requests, Approval Performance, Executive Report.
- **Xorora Monthly Expense KPIs:** Total PKR/USD, line items (138), FX rate (278 PKR/USD).
- **View modes:** By department, By month, By category, Line items.
- **Exports:** Refresh, CSV, Excel, PDF.

### `/notifications`

- **Actions:** Mark all read.
- **Event types observed:** Request approved; New comment on {PR#}.
- **Unread count shown:** 0 unread.

### `/admin/users`

- **Columns:** Name, Email, Department, Roles, Status.
- **Roles observed:** Super Admin, CEO, CFO, Administrator, Department Head, Procurement Officer, Employee.
- **Status:** ACTIVE.
- **Actions:** Add user, Search users…, Edit, Delete.

### `/admin/departments`

- **Columns:** Name, Code, Head, Members.
- **Departments:** Business Development (BD), Design (DES), Engineering (ENG), Human Resources (HR), Marketing (MKT, head Muhammad Bilal), Operations (OPS), Web (WEB), Xorora Shared (SHARED).

### `/admin/roles`

- **Columns:** Name, Code, Description, Permissions (count), Users (count), System badge.
- **Roles:** ADMINISTRATOR, CEO, CFO, DEPARTMENT_HEAD, EMPLOYEE, PROCUREMENT_OFFICER, SUPER_ADMIN (system roles: edit only, no delete).

### `/admin/categories`

- **Columns:** Name, Code, Description, Status.
- **Categories:** IT (IT Equipment), LEARN, OFFICE, OPS (Operations Spend), SW (Software), TRAVEL — all Active.

### `/admin/vendors`

- **Columns:** Name, Email, Phone, Status (Active).
- **Note:** Many vendor names mirror expense line descriptions from sheet import.

### `/admin/workflows`

- **Columns:** Name, Description, Steps, badges (Default, Active).
- **Workflows:** “Default Approval” — Dept Head → CEO → Procurement (3 steps, default); “2nd WorkFlow” — Director → Procurement Officer (2 steps).

### `/admin/settings`

- **Fields:** Organization name, Default currency, Fiscal year start month, Approval reminder (days), Internal notes.
- **Values observed:** Xorora, PKR, July, 3 (reminder days).

### Spend chat FAB (global)

- **Panel title:** Spend assistant — “Spend, dashboard & reports”.
- **Greeting:** Ask about org spend, dashboard KPIs, or reports; attach PDF/image.
- **Inputs:** Message (“Ask about spend or dashboard…”), Attach file, Send.

---

## API inventory

**Base:** `https://xorora-procure-api.vercel.app/api/v1`  
**Auth:** Bearer tokens (storage key names observed elsewhere: `xorora_access_token`, `xorora_refresh_token` — not captured).

| Method | Path (pattern) | When observed | Response shape (sanitized) |
|---|---|---|---|
| POST | `/auth/login` | Login | Session tokens + user object (not retained) |
| GET | `/analytics/dashboard?period=month&year={y}&month={m}` | Dashboard load/refresh | Object with KPI + chart series (dashboard module) |
| GET | `/requests` | Requests list | Likely `{ data: Request[] }` or array; list drives table columns above |
| GET | `/requests/{uuid}` | Request detail | Request + procurement block + comments/timeline |
| GET | *(inferred)* `/approvals` or inbox variant | Approvals page | Pending items for current user |
| GET | *(inferred)* `/procurement` or queue | Procurement page | Approved-not-purchased queue |
| GET | *(inferred)* `/procurement/expenses` | Expense log | Paginated expense rows (100/page) |
| POST | *(inferred)* `/procurement/expenses/sync` | Sync from Google Sheet | Import delta rows |
| DELETE | *(inferred)* `/procurement/expenses/{id}` or by PR number | Row delete buttons | Removal from app DB only |
| GET | *(inferred)* `/analytics/*` | Analytics page | Aggregated department/category spend |
| GET | *(inferred)* `/reports/{reportType}` | Reports tabs | Tabular rollups + export metadata |
| GET | *(inferred)* `/notifications` | Notifications | Notification list |
| GET/POST/PATCH/DELETE | `/admin/users`, `/admin/departments`, … | Admin CRUD | Standard entity arrays |

*Direct CDP `fetch` probing from the automation context failed (CORS / hook interaction); paths above combine **Performance API** observations during navigation and UI-driven inference.*

---

## Domain entities & enums

**PurchaseRequest**

- `number` (`PR-{DEPT}-{seq}` e.g. PR-BD-0042; also PR-2026-#### in notifications)
- `title`, `description`, `status`, `priority` (LOW \| MEDIUM \| HIGH)
- `estimatedCost` (PKR), `requiredDate`, `category`, `department`, `requester`
- `procurement`: { status: e.g. COMPLETED, amount PKR }

**RequestStatus (filter enum):** DRAFT, PENDING_APPROVAL, RETURNED, REJECTED, APPROVED, IN_PROCUREMENT, COMPLETED

**Department codes:** BD, DES, ENG, HR, MKT, OPS, WEB, SHARED

**Categories:** Software, Office Supplies, Learning & Development, IT Equipment, Operations Spend, Travel (+ codes in admin)

**Roles:** SUPER_ADMIN, ADMINISTRATOR, CEO, CFO, DEPARTMENT_HEAD, PROCUREMENT_OFFICER, EMPLOYEE

**Vendor:** name, email?, phone?, status Active

**Workflow:** name, description, stepCount, isDefault, active

**Expense row:** number, date, description, department, category, vendor, amount PKR, source (Google Sheet)

**Notification types:** approval completed, comment added

**Org settings:** name, currency (PKR), fiscal year start month, approval reminder days, FX rate used in reports (278 PKR/USD)

**Activity verbs (dashboard):** SUBMIT (and implied approval/procurement events)

---

## Workflow notes (request → approval → procurement → spend)

1. **Create / draft:** Employee opens **New request**; may stay DRAFT until submitted.
2. **Submit:** Moves to **PENDING_APPROVAL**; appears on approver **Approvals** inbox; notifications fire.
3. **Sequential approval:** Configured per **Workflow** (default: Dept Head → CEO → Procurement); CEO/CFO/Dept Head roles participate; comments on request detail.
4. **Approved:** Enters **Procurement** queue for purchasing; status **APPROVED** / **IN_PROCUREMENT**.
5. **Complete / expense:** Procurement completed (detail shows COMPLETED + amount); rows appear in **Expense log** (often via Google Sheet sync with rich metadata).
6. **Reporting:** Completed spend flows to **Dashboard**, **Analytics**, **Reports** (PKR + USD); spend assistant FAB answers questions over same ledger.

**Parallel path:** Sheet-imported expenses can show **Completed** on requests with approval timeline “Not submitted yet” — indicates sync bypass or legacy import for operational spend tracking.

---

## Screenshot index

| File | Page |
|---|---|
| `01-dashboard.png` | Dashboard |
| `02-requests-list.png` | Requests |
| `03-request-detail.png` | Request detail |
| `04-approvals.png` | Approvals |
| `05-procurement.png` | Procurement |
| `06-expenses.png` | Expense log |
| `07-analytics.png` | Analytics |
| `08-reports.png` | Reports |
| `09-notifications.png` | Notifications |
| `10-users.png` | Admin users |
| `11-departments.png` | Departments |
| `12-roles.png` | Roles |
| `13-categories.png` | Categories |
| `14-vendors.png` | Vendors |
| `15-workflows.png` | Workflows |
| `16-settings.png` | Settings |
| `17-spend-chat.png` | Spend assistant FAB |