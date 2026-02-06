import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { databaseMigrations } from '@/integrations/supabase/migrations';

interface ForceMigrationResult {
  success: boolean;
  message: string;
  tablesCreated: string[];
}

export const useForceDatabaseMigration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const forceCreateTables = async (): Promise<ForceMigrationResult> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      // Generate DROP TABLE statements in reverse order of dependencies
      const dropStatements = `
-- Drop all tables (in reverse order of dependencies)
DROP TABLE IF EXISTS public.unmatched_payments CASCADE;
DROP TABLE IF EXISTS public.smartolt_configurations CASCADE;
DROP TABLE IF EXISTS public.network_configurations CASCADE;
DROP TABLE IF EXISTS public.dashboard_stats CASCADE;
DROP TABLE IF EXISTS public.usage_analytics CASCADE;
DROP TABLE IF EXISTS public.package_performance CASCADE;
DROP TABLE IF EXISTS public.churn_reports CASCADE;
DROP TABLE IF EXISTS public.ageing_reports CASCADE;
DROP TABLE IF EXISTS public.revenue_reports CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.notification_templates CASCADE;
DROP TABLE IF EXISTS public.tickets CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.packages CASCADE;
DROP TABLE IF EXISTS public.service_plans CASCADE;
DROP TABLE IF EXISTS public.subscribers CASCADE;
`;

      // Combine drop statements with create statements
      const fullSql = dropStatements + '\n\n' + databaseMigrations;

      // Call the edge function to execute SQL
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-tables`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${(await import('@/integrations/supabase/client').then(m => m.supabase.auth.getSession())).data.session?.access_token || ''}`,
          },
          body: JSON.stringify({ sql: fullSql }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to force create tables');
      }

      return {
        success: true,
        message: 'All tables have been forcefully recreated',
        tablesCreated: result.tablesCreated || [],
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to force create tables');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { forceCreateTables, loading, error };
};
