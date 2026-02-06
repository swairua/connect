import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface DashboardStats {
  total_subscribers: number;
  active_subscribers: number;
  suspended_subscribers: number;
  grace_subscribers: number;
  expired_subscribers: number;
  unpaid_invoices: number;
  unpaid_amount: number;
  mrr: number;
  expected_mrr: number;
  daily_revenue: number;
  expected_daily_revenue: number;
  new_signups: number;
  accounts_due: number;
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

const defaultStats: DashboardStats = {
  total_subscribers: 0,
  active_subscribers: 0,
  suspended_subscribers: 0,
  grace_subscribers: 0,
  expired_subscribers: 0,
  unpaid_invoices: 0,
  unpaid_amount: 0,
  mrr: 0,
  expected_mrr: 0,
  daily_revenue: 0,
  expected_daily_revenue: 0,
  new_signups: 0,
  accounts_due: 0,
};

export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchStats = async () => {
    if (!user) {
      console.log('useDashboardStats: No user logged in yet');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Get user's tenant
      const { data: tenantMembers, error: tenantError } = await supabase
        .from('tenant_members')
        .select('tenant_id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (tenantError) {
        console.error('Tenant lookup error:', tenantError.message || tenantError);
        throw tenantError;
      }

      if (!tenantMembers) {
        console.warn('No tenant found for user:', user.id);
        setStats(defaultStats);
        return;
      }

      // Try to fetch from dashboard_stats table
      const { data: statsData, error: statsError } = await supabase
        .from('dashboard_stats')
        .select('*')
        .eq('tenant_id', tenantMembers.tenant_id)
        .single();

      if (statsData) {
        setStats({
          total_subscribers: statsData.total_subscribers,
          active_subscribers: statsData.active_subscribers,
          suspended_subscribers: statsData.suspended_subscribers,
          grace_subscribers: statsData.grace_subscribers,
          expired_subscribers: statsData.expired_subscribers,
          unpaid_invoices: statsData.unpaid_invoices,
          unpaid_amount: Number(statsData.unpaid_amount),
          mrr: Number(statsData.mrr),
          expected_mrr: Number(statsData.expected_mrr),
          daily_revenue: Number(statsData.daily_revenue),
          expected_daily_revenue: Number(statsData.expected_daily_revenue),
          new_signups: statsData.new_signups,
          accounts_due: statsData.accounts_due,
        });
      } else {
        // Calculate stats from raw data if not found in dashboard_stats
        const { data: subscribers } = await supabase
          .from('subscribers')
          .select('status')
          .eq('tenant_id', tenantMembers.tenant_id);

        const { data: invoices } = await supabase
          .from('invoices')
          .select('amount, status')
          .eq('tenant_id', tenantMembers.tenant_id)
          .eq('status', 'Overdue');

        const calculatedStats: DashboardStats = {
          ...defaultStats,
          total_subscribers: subscribers?.length || 0,
          active_subscribers: subscribers?.filter(s => s.status === 'Active').length || 0,
          suspended_subscribers: subscribers?.filter(s => s.status === 'Suspended').length || 0,
          grace_subscribers: subscribers?.filter(s => s.status === 'Grace').length || 0,
          expired_subscribers: subscribers?.filter(s => s.status === 'Inactive').length || 0,
          unpaid_invoices: invoices?.length || 0,
          unpaid_amount: invoices?.reduce((acc, inv) => acc + Number(inv.amount), 0) || 0,
        };

        setStats(calculatedStats);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      const error = new Error(`Failed to fetch dashboard stats: ${errorMessage}`);
      setError(error);
      console.error('Error fetching dashboard stats:', errorMessage, err);
      setStats(defaultStats);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [user]);

  return { stats: stats || defaultStats, loading, error, refetch: fetchStats };
};
