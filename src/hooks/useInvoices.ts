import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Invoice {
  id: string;
  subscriber_id: string;
  invoice_number: string;
  amount: number;
  due_date: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  created_date: string;
  paid_date?: string;
  subscriber?: {
    name: string;
    email: string;
  };
}

interface UseInvoicesReturn {
  invoices: Invoice[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  stats: {
    totalInvoices: number;
    paid: number;
    pending: number;
    overdue: number;
    totalAmount: number;
    paidAmount: number;
  };
}

export const useInvoices = (): UseInvoicesReturn => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchInvoices = async () => {
    if (!user) {
      console.log('useInvoices: No user logged in yet');
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
        setInvoices([]);
        return;
      }

      // Fetch invoices for the tenant
      const { data, error: invoiceError } = await supabase
        .from('invoices')
        .select(`
          id,
          subscriber_id,
          invoice_number,
          amount,
          due_date,
          status,
          created_date,
          paid_date,
          subscribers:subscriber_id (
            name,
            email
          )
        `)
        .eq('tenant_id', tenantMembers.tenant_id)
        .order('created_date', { ascending: false });

      if (invoiceError) {
        console.error('Invoices fetch error:', invoiceError.message || invoiceError);
        throw invoiceError;
      }

      // Transform data
      const transformedInvoices = data?.map(inv => ({
        id: inv.id,
        subscriber_id: inv.subscriber_id,
        invoice_number: inv.invoice_number,
        amount: Number(inv.amount),
        due_date: inv.due_date,
        status: inv.status as 'Paid' | 'Pending' | 'Overdue',
        created_date: inv.created_date,
        paid_date: inv.paid_date,
        subscriber: Array.isArray(inv.subscribers) ? inv.subscribers[0] : inv.subscribers,
      })) || [];

      setInvoices(transformedInvoices);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      const error = new Error(`Failed to fetch invoices: ${errorMessage}`);
      setError(error);
      console.error('Error fetching invoices:', errorMessage, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  // Calculate stats
  const stats = {
    totalInvoices: invoices.length,
    paid: invoices.filter(i => i.status === 'Paid').length,
    pending: invoices.filter(i => i.status === 'Pending').length,
    overdue: invoices.filter(i => i.status === 'Overdue').length,
    totalAmount: invoices.reduce((acc, inv) => acc + inv.amount, 0),
    paidAmount: invoices.filter(i => i.status === 'Paid').reduce((acc, inv) => acc + inv.amount, 0),
  };

  return { invoices, loading, error, refetch: fetchInvoices, stats };
};
