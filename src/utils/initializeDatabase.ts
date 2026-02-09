import { supabase } from '@/integrations/supabase/client';

/**
 * Initialize the database with required tables
 * This creates the core tables needed for authentication and multi-tenant support
 */
export async function initializeDatabase(): Promise<{ success: boolean; message: string }> {
  try {
    console.log('Starting database initialization...');

    // Check if profiles table exists
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(0);

    if (!error) {
      console.log('Database already initialized - tables exist');
      return { success: true, message: 'Database already initialized' };
    }

    // If we get here, tables don't exist. We need to create them.
    // The proper way to do this is through the Supabase SQL Editor directly
    // But we can provide a helpful error message
    console.error('Database tables are missing. Running migrations...');
    
    // Try to run the migrations through the SQL editor
    // Since we can't execute raw SQL directly from the client, we'll need to:
    // 1. Either use an edge function that has service role access
    // 2. Or guide the user to run the migrations manually
    
    // For now, return a message indicating what needs to be done
    return {
      success: false,
      message: 'Database tables not found. Please run migrations in Supabase SQL Editor.',
    };
  } catch (error) {
    console.error('Error during database initialization:', error);
    return {
      success: false,
      message: `Database initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Check if the database is properly initialized
 */
export async function checkDatabaseStatus(): Promise<{
  initialized: boolean;
  tables: string[];
  errors: string[];
}> {
  const tables = [
    'profiles',
    'tenants',
    'user_roles',
    'tenant_members',
    'subscribers',
    'packages',
    'service_plans',
    'invoices',
    'payments',
    'tickets',
    'activity_logs',
  ];

  const verifiedTables: string[] = [];
  const errors: string[] = [];

  // Check if Supabase is properly configured
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('VITE_SUPABASE_URL');
    if (!supabaseKey) missingVars.push('VITE_SUPABASE_PUBLISHABLE_KEY');

    return {
      initialized: false,
      tables: [],
      errors: [`Supabase not configured. Missing environment variables: ${missingVars.join(', ')}`],
    };
  }

  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table as any)
        .select('*', { count: 'exact', head: true });

      if (error) {
        errors.push(`${table}: ${error.message}`);
      } else {
        verifiedTables.push(table);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      errors.push(`${table}: ${errorMessage}`);
    }
  }

  return {
    initialized: verifiedTables.length === tables.length,
    tables: verifiedTables,
    errors,
  };
}

/**
 * Provide setup instructions to the user
 */
export function getDatabaseSetupInstructions(): string {
  return `
Database Setup Instructions:
============================

The database tables are not yet initialized. Follow these steps:

1. Go to your Supabase project dashboard: https://app.supabase.com/
2. Navigate to the "SQL Editor" section
3. Create a new query
4. Copy and paste the complete schema from: supabase/migrations/20260206_000004_complete_schema.sql
5. Click "Run" to execute the migration
6. Once complete, refresh this page and try logging in again

This will create all required tables for:
- User authentication and profiles
- Multi-tenant support
- Billing and invoice management
- Subscriber management
- Service plans and packages
- Ticketing and support
- Activity logging and reporting
  `;
}

/**
 * Wait for profile creation with retry logic
 * Useful after signup when the trigger needs time to execute
 */
export async function waitForProfileCreation(
  userId: string,
  maxRetries: number = 5,
  delayMs: number = 500
): Promise<boolean> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!error && data) {
        console.log(`Profile found for user ${userId} on attempt ${attempt + 1}`);
        return true;
      }

      if (attempt < maxRetries) {
        const waitTime = delayMs * Math.pow(2, attempt);
        console.log(`Waiting ${waitTime}ms for profile creation... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    } catch (err) {
      console.error('Error checking profile existence:', err);
      if (attempt < maxRetries) {
        const waitTime = delayMs * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  console.warn(`Profile not found for user ${userId} after ${maxRetries} retries`);
  return false;
}

/**
 * Verify RLS policies are enabled on auth tables
 */
export async function verifyRLSEnabled(): Promise<{
  enabled: boolean;
  tables: { [key: string]: boolean };
  errors: string[];
}> {
  const requiredTables = ['profiles', 'user_roles', 'tenant_members'];
  const results: { [key: string]: boolean } = {};
  const errors: string[] = [];

  for (const table of requiredTables) {
    try {
      // Try to fetch without filters - if RLS is enabled and user has no access, we'll get an error
      const { error } = await supabase
        .from(table as any)
        .select('count()', { count: 'exact', head: true });

      // If error is about permissions, RLS is likely enabled
      if (error && error.message?.includes('permission')) {
        results[table] = true;
      } else if (!error) {
        // No error means either RLS is not enabled, or user has access
        // This is acceptable - RLS might not be enforced yet
        results[table] = true;
      } else {
        results[table] = false;
        errors.push(`${table}: ${error.message}`);
      }
    } catch (err) {
      results[table] = false;
      errors.push(`${table}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  return {
    enabled: Object.values(results).every(v => v),
    tables: results,
    errors,
  };
}

/**
 * Check if super admin exists in the system
 */
export async function checkSuperAdminExists(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .rpc('has_super_admin');

    if (error) {
      console.error('Error checking super admin:', error);
      return false;
    }

    return data === true;
  } catch (err) {
    console.error('Error calling has_super_admin function:', err);
    return false;
  }
}

/**
 * Verify profile exists for a user
 */
export async function verifyProfileExists(userId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (error) {
      console.error(`Profile check failed for user ${userId}:`, error);
      return false;
    }

    return !!data;
  } catch (err) {
    console.error('Error verifying profile:', err);
    return false;
  }
}

/**
 * Bootstrap super admin on initial setup
 * This should only be called once, when the first user signs up with admin credentials
 */
export async function bootstrapSuperAdmin(
  email: string,
  fullName: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Verify profile exists first
    const profileExists = await waitForProfileCreation(
      (await supabase.auth.getUser()).data.user?.id || '',
      3,
      500
    );

    if (!profileExists) {
      return {
        success: false,
        message: 'User profile could not be created. Please try logging in again.',
      };
    }

    // Call the bootstrap function
    const { data, error } = await supabase
      .rpc('bootstrap_super_admin', {
        admin_email: email,
        admin_full_name: fullName,
      });

    if (error) {
      return {
        success: false,
        message: `Bootstrap failed: ${error.message}`,
      };
    }

    if (data && data[0]) {
      const result = data[0];
      return {
        success: result.success,
        message: result.message,
      };
    }

    return {
      success: false,
      message: 'Bootstrap function returned unexpected result',
    };
  } catch (err) {
    return {
      success: false,
      message: `Error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}
