import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Subscriber {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  package_id?: string;
  package_name?: string;
  speed?: string;
  status: 'Active' | 'Grace' | 'Suspended' | 'Inactive';
  outstanding_amount: number;
  last_payment_date?: string;
  router_ip?: string;
  pppoe_username?: string;
  mac_address?: string;
  join_date: string;
}

interface UseSubscribersReturn {
  subscribers: Subscriber[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useSubscribers = (): UseSubscribersReturn => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchSubscribers = async () => {
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

      // Fetch subscribers for the tenant
      const { data, error: subscriberError } = await supabase
        .from('subscribers')
        .select(`
          id,
          name,
          phone,
          email,
          address,
          package_id,
          status,
          outstanding_amount,
          last_payment_date,
          router_ip,
          pppoe_username,
          mac_address,
          join_date,
          packages:package_id (
            name,
            speed
          )
        `)
        .eq('tenant_id', tenantMembers.tenant_id)
        .order('name', { ascending: true });

      if (subscriberError) throw subscriberError;

      // Transform data
      const transformedSubscribers = data?.map(sub => ({
        id: sub.id,
        name: sub.name,
        phone: sub.phone,
        email: sub.email,
        address: sub.address,
        package_id: sub.package_id,
        package_name: Array.isArray(sub.packages) ? sub.packages[0]?.name : sub.packages?.name,
        speed: Array.isArray(sub.packages) ? sub.packages[0]?.speed : sub.packages?.speed,
        status: sub.status as 'Active' | 'Grace' | 'Suspended' | 'Inactive',
        outstanding_amount: Number(sub.outstanding_amount),
        last_payment_date: sub.last_payment_date,
        router_ip: sub.router_ip,
        pppoe_username: sub.pppoe_username,
        mac_address: sub.mac_address,
        join_date: sub.join_date,
      })) || [];

      setSubscribers(transformedSubscribers);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscribers'));
      console.error('Error fetching subscribers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [user]);

  return { subscribers, loading, error, refetch: fetchSubscribers };
};
