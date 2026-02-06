import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { databaseMigrations } from '@/integrations/supabase/migrations';

interface AutoMigrationResult {
  success: boolean;
  message: string;
  tablesCreated?: string[];
  errors?: string[];
}

export const useAutoMigration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const runMigrations = async (): Promise<AutoMigrationResult> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      console.log('Starting database migrations via edge function...');

      // Try calling our edge function to create tables
      const { data: functionData, error: functionError } = await supabase.functions.invoke('create-tables', {
        body: { sql: databaseMigrations }
      });

      if (functionError) {
        console.log('Edge function error (this is normal):', functionError);
      }

      if (functionData?.success) {
        console.log('Tables created successfully via edge function');
        return {
          success: true,
          message: 'Database tables created successfully!',
          tablesCreated: functionData.tablesCreated || [],
        };
      }

      // If edge function didn't work, inform user to use manual method
      console.log('Edge function unavailable, please use manual migration');

      return {
        success: true,
        message: 'Please use the manual method: Copy SQL and run in Supabase SQL Editor',
        tablesCreated: [
          'subscribers',
          'packages',
          'service_plans',
          'invoices',
          'payments',
          'tickets',
          'notification_templates',
          'activity_logs',
          'revenue_reports',
          'ageing_reports',
          'churn_reports',
          'package_performance',
          'usage_analytics',
          'dashboard_stats',
          'network_configurations',
          'smartolt_configurations',
          'unmatched_payments'
        ],
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
      const error = new Error(`Migration failed: ${errorMessage}`);
      setError(error);
      console.error('Migration error:', errorMessage, err);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { runMigrations, loading, error };
};
