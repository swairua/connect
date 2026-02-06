-- Create network_configurations table for storing router settings per tenant
CREATE TABLE public.network_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  router_type TEXT NOT NULL DEFAULT 'none' CHECK (router_type IN ('mikrotik-api', 'mikrotik-radius', 'none')),
  connection_mode TEXT NOT NULL DEFAULT 'none' CHECK (connection_mode IN ('hotspot', 'pppoe', 'ip-queue', 'none')),
  router_host TEXT,
  api_port INTEGER DEFAULT 8728 CHECK (api_port >= 1 AND api_port <= 65535),
  username TEXT,
  password TEXT,
  is_connected BOOLEAN DEFAULT false,
  api_version TEXT,
  active_sessions INTEGER DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Enable RLS
ALTER TABLE public.network_configurations ENABLE ROW LEVEL SECURITY;

-- Tenant members can view their tenant's configuration
CREATE POLICY "Tenant members can view network config"
ON public.network_configurations
FOR SELECT
USING (is_tenant_member(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- Tenant admins can insert configuration
CREATE POLICY "Tenant admins can insert network config"
ON public.network_configurations
FOR INSERT
WITH CHECK (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- Tenant admins can update configuration
CREATE POLICY "Tenant admins can update network config"
ON public.network_configurations
FOR UPDATE
USING (is_tenant_admin(auth.uid(), tenant_id) OR is_super_admin(auth.uid()));

-- Add updated_at trigger
CREATE TRIGGER update_network_configurations_updated_at
BEFORE UPDATE ON public.network_configurations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();