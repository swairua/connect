-- Create tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Technical', 'Billing', 'Sales', 'Support')),
  status TEXT NOT NULL DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed')),
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, ticket_number)
);

-- Create activity logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES public.subscribers(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notification templates table
CREATE TABLE public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SMS', 'Email')),
  category TEXT NOT NULL CHECK (category IN ('Onboarding', 'Billing', 'Account', 'Service', 'Support')),
  subject TEXT,
  content TEXT NOT NULL,
  variables TEXT[] DEFAULT '{}',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service plans table (for service plan configurations)
CREATE TABLE public.service_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bandwidth_profile TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('Weekly', 'Monthly', 'Quarterly')),
  grace_period INTEGER DEFAULT 7,
  auto_suspend BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_tickets_tenant_id ON public.tickets(tenant_id);
CREATE INDEX idx_tickets_subscriber_id ON public.tickets(subscriber_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_activity_logs_tenant_id ON public.activity_logs(tenant_id);
CREATE INDEX idx_activity_logs_subscriber_id ON public.activity_logs(subscriber_id);
CREATE INDEX idx_notification_templates_tenant_id ON public.notification_templates(tenant_id);
CREATE INDEX idx_service_plans_tenant_id ON public.service_plans(tenant_id);

-- Enable RLS
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tickets
CREATE POLICY "Tenant members can view tickets"
ON public.tickets
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage tickets"
ON public.tickets
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- RLS Policies for activity logs
CREATE POLICY "Tenant members can view activity logs"
ON public.activity_logs
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can create activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- RLS Policies for notification templates
CREATE POLICY "Tenant members can view templates"
ON public.notification_templates
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage templates"
ON public.notification_templates
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- RLS Policies for service plans
CREATE POLICY "Tenant members can view service plans"
ON public.service_plans
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage service plans"
ON public.service_plans
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notification_templates_updated_at
BEFORE UPDATE ON public.notification_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_plans_updated_at
BEFORE UPDATE ON public.service_plans
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
