-- Create packages table for service plans
CREATE TABLE public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  speed TEXT NOT NULL,
  description TEXT,
  bandwidth_limit INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscribers table
CREATE TABLE public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT,
  package_id UUID REFERENCES public.packages(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Grace', 'Suspended', 'Inactive')),
  outstanding_amount DECIMAL(10, 2) DEFAULT 0,
  last_payment_date TIMESTAMP WITH TIME ZONE,
  router_ip TEXT,
  pppoe_username TEXT,
  mac_address TEXT,
  join_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, pppoe_username)
);

-- Create invoices table
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES public.subscribers(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Overdue')),
  created_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  paid_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id, invoice_number)
);

-- Create payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  subscriber_id UUID REFERENCES public.subscribers(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Success', 'Failed', 'Pending')),
  payment_method TEXT DEFAULT 'M-Pesa',
  transaction_id TEXT,
  reconciled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_packages_tenant_id ON public.packages(tenant_id);
CREATE INDEX idx_subscribers_tenant_id ON public.subscribers(tenant_id);
CREATE INDEX idx_subscribers_status ON public.subscribers(status);
CREATE INDEX idx_invoices_tenant_id ON public.invoices(tenant_id);
CREATE INDEX idx_invoices_subscriber_id ON public.invoices(subscriber_id);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_payments_tenant_id ON public.payments(tenant_id);
CREATE INDEX idx_payments_subscriber_id ON public.payments(subscriber_id);
CREATE INDEX idx_payments_status ON public.payments(status);

-- Enable RLS
ALTER TABLE public.packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for packages
CREATE POLICY "Tenant members can view packages"
ON public.packages
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage packages"
ON public.packages
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- RLS Policies for subscribers
CREATE POLICY "Tenant members can view subscribers"
ON public.subscribers
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage subscribers"
ON public.subscribers
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- RLS Policies for invoices
CREATE POLICY "Tenant members can view invoices"
ON public.invoices
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage invoices"
ON public.invoices
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- RLS Policies for payments
CREATE POLICY "Tenant members can view payments"
ON public.payments
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can manage payments"
ON public.payments
FOR ALL
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- Create triggers for updated_at
CREATE TRIGGER update_packages_updated_at
BEFORE UPDATE ON public.packages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscribers_updated_at
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
BEFORE UPDATE ON public.invoices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
BEFORE UPDATE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
