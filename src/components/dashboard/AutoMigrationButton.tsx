import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAutoMigration } from '@/hooks/useAutoMigration';
import { useToast } from '@/hooks/use-toast';
import { Database, CheckCircle, Loader2, AlertCircle, Zap, Copy, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { databaseMigrations } from '@/integrations/supabase/migrations';

interface AutoMigrationButtonProps {
  onSuccess?: () => void;
}

export const AutoMigrationButton = ({ onSuccess }: AutoMigrationButtonProps) => {
  const [migrationDone, setMigrationDone] = useState(false);
  const [showManualInstructions, setShowManualInstructions] = useState(false);
  const { runMigrations, loading } = useAutoMigration();
  const { toast } = useToast();

  const handleCopySQL = () => {
    navigator.clipboard.writeText(databaseMigrations);
    toast({
      title: 'SQL Copied',
      description: 'Migration SQL copied to clipboard. Paste it in Supabase SQL Editor.',
    });
  };

  const handleMigrate = async () => {
    try {
      const result = await runMigrations();

      // Show instructions to user
      setShowManualInstructions(true);

      const tableCount = result.tablesCreated?.length || 0;

      toast({
        title: 'Copy SQL and Run in Supabase',
        description: `Click "Copy SQL to Clipboard" and paste into Supabase SQL Editor to create ${tableCount} tables.`,
      });

      // Log tables to be created
      console.log('Tables to be created:', result.tablesCreated);

    } catch (error) {
      toast({
        title: 'Setup Required',
        description: 'Please use the manual method: Copy SQL and run in Supabase SQL Editor',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
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
          <Database className="h-5 w-5 text-accent" />
          Set Up Database Tables
        </CardTitle>
        <CardDescription>
          Create all tables required by your application modules
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Setup Instructions - Always Visible */}
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 space-y-3">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">Quick Setup (2 minutes)</p>
              <ol className="space-y-2 text-xs text-amber-800 dark:text-amber-300 list-decimal ml-5">
                <li>Click <strong>"Copy SQL to Clipboard"</strong></li>
                <li>Open <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:no-underline">Supabase Dashboard</a></li>
                <li>Go to <strong>SQL Editor</strong> → <strong>New Query</strong></li>
                <li>Paste the SQL and click <strong>Run</strong></li>
                <li>Refresh this page - you're done! ✨</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Tables to be created */}
        <div className="bg-white dark:bg-slate-900 rounded-lg p-4 space-y-3 border border-border/50">
          <p className="text-sm font-medium">This will create 17 tables for:</p>
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

        {/* Action Buttons */}
        <div className="space-y-2">
          <Button
            variant="accent"
            onClick={handleCopySQL}
            className="w-full text-base font-medium h-10"
          >
            <Copy className="h-4 w-4" />
            Copy SQL to Clipboard
          </Button>

          <Button
            variant="outline"
            onClick={handleMigrate}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <ExternalLink className="h-4 w-4" />
                Show Instructions Again
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center pt-2">
          Includes all indexes and Row Level Security policies
        </p>
      </CardContent>
    </Card>
  );
};
