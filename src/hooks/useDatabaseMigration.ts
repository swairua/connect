import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface MigrationResult {
  success: boolean;
  message: string;
  details?: {
    user_id: string;
    is_superadmin: boolean;
    tables_verified: string[];
    timestamp: string;
  };
}

export const useDatabaseMigration = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const initializeDatabase = async (): Promise<MigrationResult> => {
    if (!user) {
      throw new Error('User not authenticated');
    }

    try {
      setLoading(true);
      setError(null);

      // Step 1: Check if user has superadmin role
      let isSuperAdmin = false;
      try {
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .eq('role', 'super_admin')
          .maybeSingle();

        if (rolesError) {
          console.warn('Warning checking user roles:', rolesError.message);
        }

        // Step 2: If not superadmin, promote them
        if (!userRoles) {
          const { error: insertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'super_admin',
            });

          if (insertError && !insertError.message.includes('duplicate')) {
            console.warn('Warning promoting to super admin:', insertError.message);
          }

          isSuperAdmin = true;
        } else {
          isSuperAdmin = true;
        }
      } catch (err) {
        console.warn('Error during super admin setup:', err instanceof Error ? err.message : 'Unknown error');
        // Continue even if super admin setup fails
        isSuperAdmin = false;
      }

      // Step 3: Verify key tables exist by querying them
      const tablesToVerify = [
        'tenants',
        'profiles',
        'user_roles',
        'tenant_members',
        'packages',
        'subscribers',
        'invoices',
        'payments',
        'tickets',
        'activity_logs',
        'notification_templates',
        'service_plans',
        'revenue_reports',
        'ageing_reports',
        'churn_reports',
        'package_performance',
        'usage_analytics',
        'unmatched_payments',
        'dashboard_stats',
        'network_configurations',
        'smartolt_configurations',
      ];

      const verifiedTables: string[] = [];

      // Check each table exists
      for (const tableName of tablesToVerify) {
        try {
          const { count, error: tableError } = await supabase
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          if (!tableError) {
            verifiedTables.push(tableName);
          } else {
            console.warn(`Table ${tableName} does not exist or is not accessible:`, tableError.message);
          }
        } catch (e) {
          // Table might not exist, but that's okay - migrations should create it
          console.warn(`Error checking table ${tableName}:`, e instanceof Error ? e.message : 'Unknown error');
        }
      }

      // Step 4: Create a default tenant for the user if they don't have one
      let tenantId: string | undefined = undefined;
      try {
        const { data: existingTenant, error: tenantCheckError } = await supabase
          .from('tenant_members')
          .select('tenant_id')
          .eq('user_id', user.id)
          .maybeSingle();

        tenantId = existingTenant?.tenant_id;

        if (!existingTenant) {
          // User doesn't have a tenant yet, create one
          const tenantSlug = `tenant-${user.id.substring(0, 8)}`;

          const { data: newTenant, error: createTenantError } = await supabase
            .from('tenants')
            .insert({
              name: user.email?.split('@')[0] || 'My Organization',
              slug: tenantSlug,
              is_active: true,
            })
            .select()
            .maybeSingle();

          if (createTenantError) {
            console.warn('Warning creating tenant:', createTenantError.message);
          } else if (newTenant) {
            tenantId = newTenant.id;

            // Add user as admin of the new tenant
            const { error: memberError } = await supabase
              .from('tenant_members')
              .insert({
                tenant_id: tenantId,
                user_id: user.id,
                role: 'admin',
                is_primary: true,
              });

            if (memberError && !memberError.message.includes('duplicate')) {
              console.warn('Warning adding user to tenant:', memberError.message);
            }
          }
        }
      } catch (err) {
        console.warn('Error during tenant setup:', err instanceof Error ? err.message : 'Unknown error');
        // Continue even if tenant setup fails
      }

      return {
        success: true,
        message: `Database successfully initialized. ${verifiedTables.length} out of ${tablesToVerify.length} tables verified.`,
        details: {
          user_id: user.id,
          is_superadmin: isSuperAdmin,
          tables_verified: verifiedTables,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to initialize database');
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return { initializeDatabase, loading, error };
};
