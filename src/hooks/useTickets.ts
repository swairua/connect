import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Ticket {
  id: string;
  ticket_number: string;
  subscriber_id: string;
  subscriber_name?: string;
  subject: string;
  category: 'Technical' | 'Billing' | 'Sales' | 'Support';
  status: 'Open' | 'In Progress' | 'Closed';
  priority: 'Low' | 'Medium' | 'High';
  description?: string;
  created_at: string;
  updated_at: string;
}

interface UseTicketsReturn {
  tickets: Ticket[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  stats: {
    open: number;
    inProgress: number;
    resolvedToday: number;
    categories: Record<string, number>;
  };
}

export const useTickets = (): UseTicketsReturn => {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const fetchTickets = async () => {
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

      // Fetch tickets for the tenant
      const { data, error: ticketError } = await supabase
        .from('tickets')
        .select(`
          id,
          ticket_number,
          subscriber_id,
          subject,
          category,
          status,
          priority,
          description,
          created_at,
          updated_at,
          subscribers:subscriber_id (
            name
          )
        `)
        .eq('tenant_id', tenantMembers.tenant_id)
        .order('created_at', { ascending: false });

      if (ticketError) throw ticketError;

      // Transform data
      const transformedTickets = data?.map(ticket => ({
        id: ticket.id,
        ticket_number: ticket.ticket_number,
        subscriber_id: ticket.subscriber_id,
        subscriber_name: Array.isArray(ticket.subscribers) ? ticket.subscribers[0]?.name : ticket.subscribers?.name,
        subject: ticket.subject,
        category: ticket.category as 'Technical' | 'Billing' | 'Sales' | 'Support',
        status: ticket.status as 'Open' | 'In Progress' | 'Closed',
        priority: ticket.priority as 'Low' | 'Medium' | 'High',
        description: ticket.description,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
      })) || [];

      setTickets(transformedTickets);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tickets'));
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  // Calculate stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = {
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolvedToday: tickets.filter(t => {
      const updatedDate = new Date(t.updated_at);
      updatedDate.setHours(0, 0, 0, 0);
      return t.status === 'Closed' && updatedDate.getTime() === today.getTime();
    }).length,
    categories: tickets.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  };

  return { tickets, loading, error, refetch: fetchTickets, stats };
};
