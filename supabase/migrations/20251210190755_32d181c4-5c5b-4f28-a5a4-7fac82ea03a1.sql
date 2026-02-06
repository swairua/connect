-- Drop existing problematic policies on tenant_members
DROP POLICY IF EXISTS "Users can view members of their tenants" ON public.tenant_members;
DROP POLICY IF EXISTS "Admins can manage members of their tenants" ON public.tenant_members;

-- Drop existing problematic policy on tenants
DROP POLICY IF EXISTS "Users can view tenants they belong to" ON public.tenants;

-- Create new non-recursive policy for tenant_members (SELECT)
-- Uses direct user_id check instead of get_user_tenant_ids() to avoid recursion
CREATE POLICY "Users can view members of their tenants"
ON public.tenant_members
FOR SELECT
USING (
  tenant_id IN (
    SELECT tm.tenant_id 
    FROM public.tenant_members tm 
    WHERE tm.user_id = auth.uid()
  )
  OR is_super_admin(auth.uid())
);

-- Create new non-recursive policy for tenant_members (ALL for admins)
CREATE POLICY "Admins can manage members of their tenants"
ON public.tenant_members
FOR ALL
USING (
  (
    EXISTS (
      SELECT 1 FROM public.tenant_members tm
      WHERE tm.tenant_id = tenant_members.tenant_id
      AND tm.user_id = auth.uid()
      AND tm.role IN ('admin', 'super_admin')
    )
  )
  OR is_super_admin(auth.uid())
);

-- Create new non-recursive policy for tenants (SELECT)
CREATE POLICY "Users can view tenants they belong to"
ON public.tenants
FOR SELECT
USING (
  id IN (
    SELECT tm.tenant_id 
    FROM public.tenant_members tm 
    WHERE tm.user_id = auth.uid()
  )
  OR is_super_admin(auth.uid())
);