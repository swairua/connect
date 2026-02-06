import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface InitResponse {
  success: boolean;
  message: string;
  deletedRecords?: {
    invoices: number;
    payments: number;
    subscribers: number;
    packages: number;
    tickets: number;
    activity_logs: number;
  };
}

export const useDatabaseInit = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const deleteAllTestData = async (): Promise<InitResponse> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

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
      if (!tenantMembers) throw new Error('No tenant found');

      const tenantId = tenantMembers.tenant_id;
      const deletedRecords = {
        invoices: 0,
        payments: 0,
        subscribers: 0,
        packages: 0,
        tickets: 0,
        activity_logs: 0,
      };

      // Delete in order of dependencies (reverse order of foreign keys)

      // 1. Delete invoices (depends on subscribers)
      const { count: invoiceCount } = await supabase
        .from('invoices')
        .delete()
        .eq('tenant_id', tenantId);
      if (invoiceCount !== null) deletedRecords.invoices = invoiceCount;

      // 2. Delete payments
      const { count: paymentCount } = await supabase
        .from('payments')
        .delete()
        .eq('tenant_id', tenantId);
      if (paymentCount !== null) deletedRecords.payments = paymentCount;

      // 3. Delete tickets (depends on subscribers)
      const { count: ticketCount } = await supabase
        .from('tickets')
        .delete()
        .eq('tenant_id', tenantId);
      if (ticketCount !== null) deletedRecords.tickets = ticketCount;

      // 4. Delete activity logs
      const { count: activityCount } = await supabase
        .from('activity_logs')
        .delete()
        .eq('tenant_id', tenantId);
      if (activityCount !== null) deletedRecords.activity_logs = activityCount;

      // 5. Delete subscribers (depends on packages)
      const { count: subscriberCount } = await supabase
        .from('subscribers')
        .delete()
        .eq('tenant_id', tenantId);
      if (subscriberCount !== null) deletedRecords.subscribers = subscriberCount;

      // 6. Delete packages
      const { count: packageCount } = await supabase
        .from('packages')
        .delete()
        .eq('tenant_id', tenantId);
      if (packageCount !== null) deletedRecords.packages = packageCount;

      return {
        success: true,
        message: 'All test data has been deleted successfully',
        deletedRecords,
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to delete test data');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { deleteAllTestData, loading, error };
};
