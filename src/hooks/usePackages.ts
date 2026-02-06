import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Package {
  id: string;
  name: string;
  price: number;
  speed: string;
  description?: string;
  bandwidth_limit?: number;
  is_active: boolean;
}

export interface ServicePlan {
  id: string;
  name: string;
  bandwidth_profile: string;
  price: number;
  billing_cycle: 'Weekly' | 'Monthly' | 'Quarterly';
  grace_period: number;
  auto_suspend: boolean;
  description?: string;
}

interface UsePackagesReturn {
  packages: Package[];
  servicePlans: ServicePlan[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const usePackages = (): UsePackagesReturn => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [servicePlans, setServicePlans] = useState<ServicePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchPackages = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get user's tenant
      const { data: tenantMembers, error: tenantError } = await supabase
        .from('tenant_members')
        .select('tenant_id')
        .eq('user_id', user.id)
        .single();

      if (tenantError) throw tenantError;

      // Fetch packages
      const { data: packagesData, error: packageError } = await supabase
        .from('packages')
        .select('*')
        .eq('tenant_id', tenantMembers.tenant_id)
        .order('price', { ascending: true });

      if (packageError) throw packageError;

      const transformedPackages = packagesData?.map(pkg => ({
        id: pkg.id,
        name: pkg.name,
        price: Number(pkg.price),
        speed: pkg.speed,
        description: pkg.description,
        bandwidth_limit: pkg.bandwidth_limit,
        is_active: pkg.is_active,
      })) || [];

      setPackages(transformedPackages);

      // Fetch service plans
      const { data: plansData, error: plansError } = await supabase
        .from('service_plans')
        .select('*')
        .eq('tenant_id', tenantMembers.tenant_id)
        .order('price', { ascending: true });

      if (plansError) throw plansError;

      const transformedPlans = plansData?.map(plan => ({
        id: plan.id,
        name: plan.name,
        bandwidth_profile: plan.bandwidth_profile,
        price: Number(plan.price),
        billing_cycle: plan.billing_cycle as 'Weekly' | 'Monthly' | 'Quarterly',
        grace_period: plan.grace_period,
        auto_suspend: plan.auto_suspend,
        description: plan.description,
      })) || [];

      setServicePlans(transformedPlans);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch packages'));
      console.error('Error fetching packages:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [user]);

  return { packages, servicePlans, loading, error, refetch: fetchPackages };
};
