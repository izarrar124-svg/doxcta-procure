# Parity gaps — live vs Doxcta rebuild

Updated after [Capture procure page map](a7067f8f-1594-4593-9da3-5dda8898b136) report.

## Now aligned

- Canonical routes (`/procurement/expenses`, `/admin/*`)
- Request status set matching live enums (display labels)
- Expense columns + Google Sheet sync affordance
- Approvals / procurement empty states
- Request detail comments + procurement block
- Admin roles/categories columns closer to live
- Settings: FX, fiscal year start, reminder days
- Workflow names: Default Approval, 2nd WorkFlow

## Intentionally different

| Area | Live | Rebuild |
|---|---|---|
| Brand | Light + orange/indigo | Doxcta dark + lime |
| Auth / API | JWT + Vercel API | Mock session + fixtures |
| Assistant | RAG | Keyword fixtures |
| Charts / exports | Full charts, CSV/Excel/PDF | CSS bars; Export CSV button stub |
| CRUD | Full add/edit/delete | Mostly read + local approve/create/comment |

## Still thinner than live

- Full report tab suite (Monthly Expense, Executive, etc.)
- Real Google Sheet sync / row delete
- Role permission editor, workflow step builder UI
- Command palette beyond jumping to Requests
- UUID request IDs (rebuild keys by PR number)
