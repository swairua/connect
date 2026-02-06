-- Create smartolt_configurations table
CREATE TABLE public.smartolt_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  api_url text,
  api_key text,
  olt_device_id text,
  default_service_profile text,
  default_speed_profile text,
  auto_provision_enabled boolean NOT NULL DEFAULT false,
  ont_password_pattern text,
  default_vlan text,
  billing_suspension_enabled boolean NOT NULL DEFAULT false,
  suspend_method text DEFAULT 'disable_port',
  reactivate_method text DEFAULT 'enable_port',
  is_connected boolean DEFAULT false,
  last_sync_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.smartolt_configurations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Tenant members can view smartolt config"
ON public.smartolt_configurations
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can insert smartolt config"
ON public.smartolt_configurations
FOR INSERT
WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

CREATE POLICY "Tenant admins can update smartolt config"
ON public.smartolt_configurations
FOR UPDATE
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- Trigger for updated_at
CREATE TRIGGER update_smartolt_configurations_updated_at
BEFORE UPDATE ON public.smartolt_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();