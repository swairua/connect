-- Create a function that allows authenticated users to create their own tenant
-- This uses SECURITY DEFINER to bypass RLS and handle the full flow atomically
CREATE OR REPLACE FUNCTION public.create_tenant_for_user(
  _tenant_name TEXT,
  _tenant_slug TEXT
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
  _tenant_id uuid;
BEGIN
  -- Get the current user ID
  _user_id := auth.uid();
  
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Check if user already has a tenant
  IF EXISTS (SELECT 1 FROM public.tenant_members WHERE user_id = _user_id) THEN
    RAISE EXCEPTION 'User already belongs to a tenant';
  END IF;
  
  -- Check if slug is already taken
  IF EXISTS (SELECT 1 FROM public.tenants WHERE slug = _tenant_slug) THEN
    RAISE EXCEPTION 'Organization slug is already taken';
  END IF;
  
  -- Create the tenant
  INSERT INTO public.tenants (name, slug, is_active)
  VALUES (_tenant_name, _tenant_slug, true)
  RETURNING id INTO _tenant_id;
  
  -- Add the user as admin of the new tenant
  INSERT INTO public.tenant_members (tenant_id, user_id, role, is_primary)
  VALUES (_tenant_id, _user_id, 'admin', true);
  
  -- Also give them the admin role in user_roles table
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin')
  ON CONFLICT DO NOTHING;
  
  RETURN _tenant_id;
END;
$$;