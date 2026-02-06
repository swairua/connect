-- Create revenue reports table
CREATE TABLE public.revenue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  collected_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  expected_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subscriber_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, month)
);

-- Create ageing reports table (invoice aging analysis)
CREATE TABLE public.ageing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  range_name TEXT NOT NULL,
  days_min INTEGER NOT NULL,
  days_max INTEGER,
  count INTEGER DEFAULT 0,
  amount DECIMAL(10, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create churn reports table
CREATE TABLE public.churn_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  churned_count INTEGER DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  net_growth INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, month)
);

-- Create package performance reports table
CREATE TABLE public.package_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  package_id UUID NOT NULL REFERENCES public.packages(id) ON DELETE CASCADE,
  subscriber_count INTEGER DEFAULT 0,
  revenue DECIMAL(10, 2) DEFAULT 0,
  churn_count INTEGER DEFAULT 0,
  month TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create usage analytics table
CREATE TABLE public.usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.subscribers(id) ON DELETE SET NULL,
  day_of_week TEXT,
  upload_mbps DECIMAL(10, 2),
  download_mbps DECIMAL(10, 2),
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unmatched payments table (for reconciliation)
CREATE TABLE public.unmatched_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  phone TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  transaction_id TEXT,
  status TEXT DEFAULT 'Unmatched' CHECK (status IN ('Unmatched', 'Matched', 'Reviewed')),
  suggested_matches JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dashboard stats table (denormalized for performance)
CREATE TABLE public.dashboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  total_subscribers INTEGER DEFAULT 0,
  active_subscribers INTEGER DEFAULT 0,
  suspended_subscribers INTEGER DEFAULT 0,
  grace_subscribers INTEGER DEFAULT 0,
  expired_subscribers INTEGER DEFAULT 0,
  unpaid_invoices INTEGER DEFAULT 0,
  unpaid_amount DECIMAL(10, 2) DEFAULT 0,
  mrr DECIMAL(10, 2) DEFAULT 0,
  expected_mrr DECIMAL(10, 2) DEFAULT 0,
  daily_revenue DECIMAL(10, 2) DEFAULT 0,
  expected_daily_revenue DECIMAL(10, 2) DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  accounts_due INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Create indexes for performance
CREATE INDEX idx_revenue_reports_tenant_id ON public.revenue_reports(tenant_id);
CREATE INDEX idx_ageing_reports_tenant_id ON public.ageing_reports(tenant_id);
CREATE INDEX idx_churn_reports_tenant_id ON public.churn_reports(tenant_id);
CREATE INDEX idx_package_performance_tenant_id ON public.package_performance(tenant_id);
CREATE INDEX idx_package_performance_package_id ON public.package_performance(package_id);
CREATE INDEX idx_usage_analytics_tenant_id ON public.usage_analytics(tenant_id);
CREATE INDEX idx_usage_analytics_subscriber_id ON public.usage_analytics(subscriber_id);
CREATE INDEX idx_unmatched_payments_tenant_id ON public.unmatched_payments(tenant_id);
CREATE INDEX idx_dashboard_stats_tenant_id ON public.dashboard_stats(tenant_id);

-- Enable RLS
ALTER TABLE public.revenue_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ageing_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churn_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.package_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.unmatched_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports tables
CREATE POLICY "Tenant members can view revenue reports"
ON public.revenue_reports
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage revenue reports"
ON public.revenue_reports
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant members can view ageing reports"
ON public.ageing_reports
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage ageing reports"
ON public.ageing_reports
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant members can view churn reports"
ON public.churn_reports
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage churn reports"
ON public.churn_reports
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant members can view package performance"
ON public.package_performance
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage package performance"
ON public.package_performance
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant members can view usage analytics"
ON public.usage_analytics
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage usage analytics"
ON public.usage_analytics
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant members can view unmatched payments"
ON public.unmatched_payments
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage unmatched payments"
ON public.unmatched_payments
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant members can view dashboard stats"
ON public.dashboard_stats
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage dashboard stats"
ON public.dashboard_stats
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_revenue_reports_updated_at
BEFORE UPDATE ON public.revenue_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ageing_reports_updated_at
BEFORE UPDATE ON public.ageing_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_churn_reports_updated_at
BEFORE UPDATE ON public.churn_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_package_performance_updated_at
BEFORE UPDATE ON public.package_performance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_unmatched_payments_updated_at
BEFORE UPDATE ON public.unmatched_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_stats_updated_at
BEFORE UPDATE ON public.dashboard_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
