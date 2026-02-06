import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDatabaseMigration } from '@/hooks/useDatabaseMigration';
import { useToast } from '@/hooks/use-toast';
import { Database, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface DatabaseMigrationButtonProps {
  onSuccess?: () => void;
}

export const DatabaseMigrationButton = ({ onSuccess }: DatabaseMigrationButtonProps) => {
  const [migrationDone, setMigrationDone] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [migrationDetails, setMigrationDetails] = useState<any>(null);
  const { initializeDatabase, loading } = useDatabaseMigration();
  const { toast } = useToast();

  const handleMigrate = async () => {
    try {
      setLastError(null);
      const result = await initializeDatabase();

      if (result.details) {
        const tableCount = result.details.tables_verified.length;
        const totalTables = 20; // Total number of tables we're checking for
        const roleText = result.details.is_superadmin ? 'Super Admin' : 'Admin';

        setMigrationDetails(result.details);

        // Show success toast with detailed information
        toast({
          title: 'Database Initialization Complete',
          description: `${tableCount}/${totalTables} tables verified. You are set as ${roleText}.`,
        });

        // Log detailed information to console for debugging
        console.log('Migration successful:', result);
        console.log('Tables verified:', result.details.tables_verified);

        setMigrationDone(true);

        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize database';
      setLastError(errorMessage);

      // Provide more helpful error messages
      let helpfulDescription = errorMessage;
      if (errorMessage.includes('violates') || errorMessage.includes('constraint')) {
        helpfulDescription = 'Database constraint error. Check browser console for details. You may need to manually run Supabase migrations.';
      } else if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        helpfulDescription = 'Permission denied. Ensure you have the correct database access permissions.';
      } else if (errorMessage.includes('not authenticated')) {
        helpfulDescription = 'Please log in first before initializing the database.';
      } else if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
        helpfulDescription = 'Some tables do not exist yet. Run this again, or manually run Supabase migrations from the Supabase dashboard.';
      }

      toast({
        title: 'Database Initialization Error',
        description: helpfulDescription,
        variant: 'destructive',
      });

      // Log detailed error to console
      console.error('Migration failed:', error);
    }
  };

  if (migrationDone) {
    const tableCount = migrationDetails?.tables_verified?.length || 0;
    const isSuperAdmin = migrationDetails?.is_superadmin || false;

    return (
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            Database Ready
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Your database has been successfully initialized.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>{tableCount} out of 20 tables verified and accessible</li>
              <li>Your account has been set as {isSuperAdmin ? 'Super Admin' : 'Admin'}</li>
              <li>Ready to add subscribers, invoices, and other data</li>
              {tableCount < 20 && (
                <li className="text-yellow-700 dark:text-yellow-500">
                  {20 - tableCount} tables not yet verified - migrations may still be pending
                </li>
              )}
            </ul>
          </div>

          {migrationDetails?.tables_verified && migrationDetails.tables_verified.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-3 border border-success/20">
              <p className="text-xs font-medium text-muted-foreground mb-2">Verified Tables:</p>
              <div className="flex flex-wrap gap-2">
                {migrationDetails.tables_verified.map((table: string) => (
                  <Badge key={table} variant="outline" className="text-xs">
                    {table}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={() => {
              setMigrationDone(false);
              setMigrationDetails(null);
              setLastError(null);
            }}
            className="w-full"
          >
            Run Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border shadow-card bg-gradient-to-br from-accent/5 to-accent/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Database className="h-5 w-5 text-accent" />
          Database Initialization
        </CardTitle>
        <CardDescription>
          Create all required database tables and configure your account as Super Admin
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 space-y-3 border border-border/50">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Creates all tables</p>
              <p className="text-xs text-muted-foreground">Subscribers, invoices, payments, tickets, and more</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Sets up your account</p>
              <p className="text-xs text-muted-foreground">Promotes you to Super Admin with full access</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Preserves your user</p>
              <p className="text-xs text-muted-foreground">Your authentication and profile are maintained</p>
            </div>
          </div>
        </div>

        <div className="bg-info/10 border border-info/20 rounded-lg p-3 flex gap-3">
          <AlertCircle className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            Safe to run multiple times - will not recreate existing tables
          </div>
        </div>

        <Button
          variant="accent"
          onClick={handleMigrate}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Initializing Database...
            </>
          ) : (
            <>
              <Database className="h-4 w-4" />
              Initialize Database
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
