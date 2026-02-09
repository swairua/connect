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
