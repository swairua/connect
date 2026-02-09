/**
 * Database Migrations for ISP Billing System
 * Includes complete schema with authentication and multi-tenant support
 */

export const databaseMigrations = `
-- ============================================
-- Complete PostgreSQL Schema Migration
-- For ISP Management System
-- Date: 2026-02-07
-- ============================================

-- ============================================
-- Authentication & Multi-Tenant Tables (REQUIRED FIRST)
-- ============================================

-- Tenants table
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  logo_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- User Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- User Roles table (global roles)
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin', 'manager', 'operator', 'viewer')),
  created_at TIMESTAMP DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Tenant Members table (user access to tenants)
CREATE TABLE IF NOT EXISTS public.tenant_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'manager', 'operator', 'viewer')),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now(),
  UNIQUE(tenant_id, user_id)
);

-- ============================================
-- Core Tables
-- ============================================

-- Subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  address TEXT,
  package_id UUID REFERENCES packages(id),
  status TEXT DEFAULT 'Active' CHECK (status IN ('Active', 'Grace', 'Suspended', 'Inactive')),
  outstanding_amount NUMERIC DEFAULT 0,
  last_payment_date DATE,
  router_ip TEXT,
  pppoe_username TEXT,
  mac_address TEXT,
  join_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Service Plans table
CREATE TABLE IF NOT EXISTS public.service_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bandwidth_profile TEXT NOT NULL,
  price NUMERIC NOT NULL,
  billing_cycle TEXT DEFAULT 'Monthly' CHECK (billing_cycle IN ('Weekly', 'Monthly', 'Quarterly', 'Yearly')),
  grace_period INTEGER DEFAULT 3,
  auto_suspend BOOLEAN DEFAULT true,
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Packages table
CREATE TABLE IF NOT EXISTS public.packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  speed TEXT NOT NULL,
  description TEXT,
  bandwidth_limit NUMERIC,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- Billing Tables
-- ============================================

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Paid', 'Pending', 'Overdue')),
  created_date TIMESTAMP DEFAULT now(),
  paid_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES invoices(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Success', 'Failed', 'Pending')),
  payment_method TEXT,
  transaction_id TEXT,
  reconciled BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- Support & Communication Tables
-- ============================================

-- Tickets table
CREATE TABLE IF NOT EXISTS public.tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscriber_id UUID NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
  ticket_number TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Technical', 'Billing', 'Sales', 'Support')),
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'In Progress', 'Closed')),
  priority TEXT DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High')),
  description TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Notification Templates table
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('SMS', 'Email')),
  category TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  enabled BOOLEAN DEFAULT true,
  variables TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  changes JSONB,
  timestamp TIMESTAMP DEFAULT now()
);

-- ============================================
-- Reports & Analytics Tables
-- ============================================

-- Revenue Reports table
CREATE TABLE IF NOT EXISTS public.revenue_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  collected NUMERIC DEFAULT 0,
  expected NUMERIC DEFAULT 0,
  variance NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Ageing Reports table
CREATE TABLE IF NOT EXISTS public.ageing_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  range_start INTEGER,
  range_end INTEGER,
  count INTEGER DEFAULT 0,
  amount NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Churn Reports table
CREATE TABLE IF NOT EXISTS public.churn_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  churned INTEGER DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  net_growth INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Package Performance table
CREATE TABLE IF NOT EXISTS public.package_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  package_id UUID REFERENCES packages(id) ON DELETE CASCADE,
  subscribers INTEGER DEFAULT 0,
  revenue NUMERIC DEFAULT 0,
  churn INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Usage Analytics table
CREATE TABLE IF NOT EXISTS public.usage_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  subscriber_id UUID REFERENCES subscribers(id) ON DELETE CASCADE,
  day DATE NOT NULL,
  upload NUMERIC DEFAULT 0,
  download NUMERIC DEFAULT 0,
  created_at TIMESTAMP DEFAULT now()
);

-- Dashboard Stats table
CREATE TABLE IF NOT EXISTS public.dashboard_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  total_subscribers INTEGER DEFAULT 0,
  active_subscribers INTEGER DEFAULT 0,
  suspended_subscribers INTEGER DEFAULT 0,
  grace_subscribers INTEGER DEFAULT 0,
  expired_subscribers INTEGER DEFAULT 0,
  unpaid_invoices INTEGER DEFAULT 0,
  unpaid_amount NUMERIC DEFAULT 0,
  mrr NUMERIC DEFAULT 0,
  expected_mrr NUMERIC DEFAULT 0,
  daily_revenue NUMERIC DEFAULT 0,
  expected_daily_revenue NUMERIC DEFAULT 0,
  new_signups INTEGER DEFAULT 0,
  accounts_due INTEGER DEFAULT 0,
  updated_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- Network Integration Tables
-- ============================================

-- Network Configurations table
CREATE TABLE IF NOT EXISTS public.network_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  config_name TEXT NOT NULL,
  config_type TEXT NOT NULL,
  settings JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- SmartOLT Configurations table
CREATE TABLE IF NOT EXISTS public.smartolt_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  device_name TEXT NOT NULL,
  ip_address INET NOT NULL,
  port INTEGER DEFAULT 8080,
  username TEXT,
  password TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Unmatched Payments table
CREATE TABLE IF NOT EXISTS public.unmatched_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  suggested_matches JSONB DEFAULT '[]',
  matched_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);

-- ============================================
-- Create Indexes for Performance
-- ============================================

-- Core authentication table indexes
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant ON tenant_members(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user ON tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_user ON tenant_members(tenant_id, user_id);

-- Core table indexes
CREATE INDEX IF NOT EXISTS idx_subscribers_tenant ON subscribers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscribers_status ON subscribers(status);
CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(email);

CREATE INDEX IF NOT EXISTS idx_packages_tenant ON packages(tenant_id);
CREATE INDEX IF NOT EXISTS idx_service_plans_tenant ON service_plans(tenant_id);

-- Billing table indexes
CREATE INDEX IF NOT EXISTS idx_invoices_tenant ON invoices(tenant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscriber ON invoices(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_subscriber ON payments(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);

-- Support table indexes
CREATE INDEX IF NOT EXISTS idx_tickets_tenant ON tickets(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tickets_subscriber ON tickets(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

CREATE INDEX IF NOT EXISTS idx_notification_templates_tenant ON notification_templates(tenant_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_tenant ON activity_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);

-- Analytics table indexes
CREATE INDEX IF NOT EXISTS idx_usage_analytics_subscriber ON usage_analytics(subscriber_id);

-- Network table indexes
CREATE INDEX IF NOT EXISTS idx_network_config_tenant ON network_configurations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_smartolt_config_tenant ON smartolt_configurations(tenant_id);

-- ============================================
-- Auto-Profile Creation Trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    true
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- Row Level Security Policies
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- User Roles policies
DROP POLICY IF EXISTS "Users can read own roles" ON public.user_roles;
CREATE POLICY "Users can read own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Tenant Members policies
DROP POLICY IF EXISTS "Users can read own memberships" ON public.tenant_members;
CREATE POLICY "Users can read own memberships"
  ON public.tenant_members
  FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- Super Admin Bootstrap Function
-- ============================================

CREATE OR REPLACE FUNCTION public.bootstrap_super_admin(
  admin_email TEXT,
  admin_full_name TEXT
)
RETURNS TABLE(success BOOLEAN, message TEXT, user_id UUID) AS $$
DECLARE
  v_user_id UUID;
  v_count INT;
BEGIN
  -- Check if any super admin already exists
  SELECT COUNT(*) INTO v_count FROM public.user_roles WHERE role = 'super_admin';

  IF v_count > 0 THEN
    RETURN QUERY SELECT false, 'Super admin already exists in system'::TEXT, NULL::UUID;
    RETURN;
  END IF;

  -- Check if user profile exists
  SELECT id INTO v_user_id FROM public.profiles WHERE email = admin_email;

  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT false, 'User profile not found for email: ' || admin_email, NULL::UUID;
    RETURN;
  END IF;

  -- Create or update user_roles entry
  INSERT INTO public.user_roles (user_id, role)
  VALUES (v_user_id, 'super_admin')
  ON CONFLICT (user_id, role) DO NOTHING;

  RETURN QUERY SELECT true, 'Super admin created successfully'::TEXT, v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Check Super Admin Existence Function
-- ============================================

CREATE OR REPLACE FUNCTION public.has_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM public.user_roles WHERE role = 'super_admin' LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- Check Profile Exists Function
-- ============================================

CREATE OR REPLACE FUNCTION public.profile_exists(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS(SELECT 1 FROM public.profiles WHERE id = user_id LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
`;
