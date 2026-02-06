import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Payment {
  id: string;
  phone: string;
  amount: number;
  invoice_id?: string;
  subscriber_id?: string;
  status: 'Success' | 'Failed' | 'Pending';
  payment_method: string;
  transaction_id?: string;
  reconciled: boolean;
  created_at: string;
  subscriber?: {
    name: string;
    email: string;
  };
  invoice?: {
    invoice_number: string;
  };
}

interface UsePaymentsReturn {
  payments: Payment[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  unmatched: Payment[];
}

export const usePayments = (): UsePaymentsReturn => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [unmatched, setUnmatched] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchPayments = async () => {
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

      // Fetch payments for the tenant
      const { data, error: paymentError } = await supabase
        .from('payments')
        .select(`
          id,
          phone,
          amount,
          invoice_id,
          subscriber_id,
          status,
          payment_method,
          transaction_id,
          reconciled,
          created_at,
          subscribers:subscriber_id (
            name,
            email
          ),
          invoices:invoice_id (
            invoice_number
          )
        `)
        .eq('tenant_id', tenantMembers.tenant_id)
        .order('created_at', { ascending: false });

      if (paymentError) throw paymentError;

      // Transform data
      const transformedPayments = data?.map(pay => ({
        id: pay.id,
        phone: pay.phone,
        amount: Number(pay.amount),
        invoice_id: pay.invoice_id,
        subscriber_id: pay.subscriber_id,
        status: pay.status as 'Success' | 'Failed' | 'Pending',
        payment_method: pay.payment_method,
        transaction_id: pay.transaction_id,
        reconciled: pay.reconciled,
        created_at: pay.created_at,
        subscriber: Array.isArray(pay.subscribers) ? pay.subscribers[0] : pay.subscribers,
        invoice: Array.isArray(pay.invoices) ? pay.invoices[0] : pay.invoices,
      })) || [];

      setPayments(transformedPayments);

      // Filter unmatched payments
      const unmatchedPayments = transformedPayments.filter(p => !p.invoice_id && p.status === 'Success');
      setUnmatched(unmatchedPayments);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch payments'));
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  return { payments, loading, error, refetch: fetchPayments, unmatched };
};
