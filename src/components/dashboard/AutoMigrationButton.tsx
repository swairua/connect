import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutoMigration } from '@/hooks/useAutoMigration';
import { useToast } from '@/hooks/use-toast';
import { Database, CheckCircle, Loader2, AlertCircle, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AutoMigrationButtonProps {
  onSuccess?: () => void;
}

export const AutoMigrationButton = ({ onSuccess }: AutoMigrationButtonProps) => {
  const [migrationDone, setMigrationDone] = useState(false);
  const { runMigrations, loading } = useAutoMigration();
  const { toast } = useToast();

  const handleMigrate = async () => {
    try {
      const result = await runMigrations();

      if (result.success) {
        const tableCount = result.tablesCreated?.length || 0;

        toast({
          title: 'Database Tables Created',
          description: `Successfully created or verified ${tableCount} database tables.`,
        });

        // Log tables created
        console.log('Tables created/verified:', result.tablesCreated);

        setMigrationDone(true);

        if (onSuccess) {
          onSuccess();
        }
      } else {
        toast({
          title: 'Migration Partially Completed',
          description: result.message || 'Some tables may not have been created.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Migration Error',
        description: error instanceof Error ? error.message : 'Failed to create tables',
        variant: 'destructive',
      });
    }
  };

  if (migrationDone) {
    return (
      <Card className="border-success/20 bg-success/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            Tables Ready
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              All database tables have been created successfully.
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 ml-4 list-disc">
              <li>Subscribers & Service Plans</li>
              <li>Billing & Payments</li>
              <li>Tickets & Support</li>
              <li>Reports & Analytics</li>
              <li>Network Configuration</li>
              <li>All indexes and RLS policies enabled</li>
            </ul>
          </div>
          <Button
            variant="outline"
            onClick={() => setMigrationDone(false)}
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
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          Auto Create Database Tables
        </CardTitle>
        <CardDescription>
          Automatically create all missing tables based on your modules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 space-y-3 border border-border/50">
          <div className="space-y-2">
            <p className="text-sm font-medium">This will create tables for:</p>
            <div className="grid grid-cols-2 gap-2 ml-2">
              {[
                'Subscribers',
                'Packages & Plans',
                'Invoices & Payments',
                'Tickets & Support',
                'Reports & Analytics',
                'Network Config',
              ].map(item => (
                <div key={item} className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success" />
                  <span className="text-xs text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-info/10 border border-info/20 rounded-lg p-3 flex gap-3">
          <AlertCircle className="h-4 w-4 text-info flex-shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            This is a one-time setup. After running, all tables will be ready to use. Safe to run multiple times.
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
              Creating Tables...
            </>
          ) : (
            <>
              <Zap className="h-4 w-4" />
              Create All Tables Now
            </>
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          This will create ~17 tables with indexes and RLS policies
        </p>
      </CardContent>
    </Card>
  );
};
