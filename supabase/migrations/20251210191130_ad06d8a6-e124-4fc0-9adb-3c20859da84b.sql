-- Create SECURITY DEFINER helper function to check tenant membership
CREATE OR REPLACE FUNCTION public.is_tenant_member(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = _user_id AND tenant_id = _tenant_id
  )
$$;

-- Create SECURITY DEFINER helper function to check if user is tenant admin
CREATE OR REPLACE FUNCTION public.is_tenant_admin(_user_id uuid, _tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = _user_id 
    AND tenant_id = _tenant_id
    AND role IN ('admin', 'super_admin')
  )
$$;

-- Drop ALL existing policies on tenant_members to start fresh
DROP POLICY IF EXISTS "Users can view members of their tenants" ON public.tenant_members;
DROP POLICY IF EXISTS "Admins can manage members of their tenants" ON public.tenant_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.tenant_members;
DROP POLICY IF EXISTS "Users can view co-members" ON public.tenant_members;
DROP POLICY IF EXISTS "Admins can manage tenant members" ON public.tenant_members;

-- Drop ALL existing policies on tenants
DROP POLICY IF EXISTS "Users can view tenants they belong to" ON public.tenants;
DROP POLICY IF EXISTS "Users can view their tenants" ON public.tenants;
DROP POLICY IF EXISTS "Super admins can manage all tenants" ON public.tenants;

-- NEW POLICIES FOR tenant_members using SECURITY DEFINER functions
-- Policy 1: Users can view their own membership row (simple direct check)
CREATE POLICY "Users can view own membership"
ON public.tenant_members
FOR SELECT
USING (user_id = auth.uid() OR is_super_admin(auth.uid()));

-- Policy 2: Admins can manage tenant members (uses SECURITY DEFINER function)
CREATE POLICY "Admins can manage tenant members"
ON public.tenant_members
FOR ALL
USING (
  is_tenant_admin(auth.uid(), tenant_id)
  OR is_super_admin(auth.uid())
);

-- NEW POLICIES FOR tenants using SECURITY DEFINER functions
-- Policy 1: Users can view tenants they are members of
CREATE POLICY "Users can view their tenants"
ON public.tenants
FOR SELECT
USING (
  is_tenant_member(auth.uid(), id)
  OR is_super_admin(auth.uid())
);

-- Policy 2: Super admins can manage all tenants
CREATE POLICY "Super admins can manage all tenants"
ON public.tenants
FOR ALL
USING (is_super_admin(auth.uid()));