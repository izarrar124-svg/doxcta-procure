-- Optional PostgreSQL Row-Level Security for Doxcta AI tenant isolation.
-- Application authz remains the primary enforcement layer.
-- Apply after schema push when using a role that sets app.company_id.

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_processing_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_assistant_logs ENABLE ROW LEVEL SECURITY;

-- Example policy pattern (repeat per table): require session GUC app.company_id
DROP POLICY IF EXISTS vendors_tenant ON vendors;
CREATE POLICY vendors_tenant ON vendors
  USING (company_id::text = current_setting('app.company_id', true));

DROP POLICY IF EXISTS expenses_tenant ON expenses;
CREATE POLICY expenses_tenant ON expenses
  USING (company_id::text = current_setting('app.company_id', true));

DROP POLICY IF EXISTS invoices_tenant ON invoices;
CREATE POLICY invoices_tenant ON invoices
  USING (company_id::text = current_setting('app.company_id', true));

DROP POLICY IF EXISTS payments_tenant ON payments;
CREATE POLICY payments_tenant ON payments
  USING (company_id::text = current_setting('app.company_id', true));

DROP POLICY IF EXISTS budgets_tenant ON budgets;
CREATE POLICY budgets_tenant ON budgets
  USING (company_id::text = current_setting('app.company_id', true));
