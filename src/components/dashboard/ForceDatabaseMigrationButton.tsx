import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useForceDatabaseMigration } from '@/hooks/useForceDatabaseMigration';
import { useToast } from '@/hooks/use-toast';
import { Database, AlertTriangle, Loader2, CheckCircle } from 'lucide-react';

interface ForceDatabaseMigrationButtonProps {
  onSuccess?: () => void;
}

export const ForceDatabaseMigrationButton = ({ onSuccess }: ForceDatabaseMigrationButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [migrationDone, setMigrationDone] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { forceCreateTables, loading } = useForceDatabaseMigration();
  const { toast } = useToast();

  const handleForceCreate = async () => {
    try {
      const result = await forceCreateTables();

      toast({
        title: 'Success',
        description: `All tables have been forcefully recreated. ${result.tablesCreated.length} tables created.`,
      });

      setShowConfirm(false);
      setConfirmText('');
      setMigrationDone(true);

      if (onSuccess) {
        onSuccess();
      }

      // Reset after 5 seconds
      setTimeout(() => {
        setMigrationDone(false);
      }, 5000);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to force create tables',
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
            Tables Recreated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            All database tables have been forcefully dropped and recreated. All data has been cleared.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!showConfirm) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <Database className="h-5 w-5" />
            Force Create Tables
          </CardTitle>
          <CardDescription>
            Drop and recreate all database tables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-destructive mb-1">Warning: This will delete all data</p>
                <p className="text-xs text-destructive/80">
                  This action will drop all existing tables and recreate them from scratch. All data will be permanently deleted and cannot be recovered.
                </p>
              </div>
            </div>
          </div>

          <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)}
            disabled={loading}
            className="w-full"
          >
            <Database className="h-4 w-4" />
            Force Create Tables
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive bg-destructive/10">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-destructive">
          <AlertTriangle className="h-5 w-5" />
          Confirm Force Create
        </CardTitle>
        <CardDescription>This action is permanent and will delete all data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
          <p className="text-sm font-medium text-destructive mb-2">What will happen:</p>
          <ul className="text-sm text-destructive/80 space-y-2 ml-4 list-disc">
            <li>All existing tables will be dropped</li>
            <li>All data in these tables will be permanently deleted</li>
            <li>All tables will be recreated with fresh schema</li>
            <li>Row Level Security policies will be reapplied</li>
            <li>Indexes will be recreated</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">
            Type <span className="font-mono font-bold text-destructive">FORCE CREATE</span> to confirm:
          </p>
          <input
            type="text"
            placeholder="Type FORCE CREATE to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
            className="w-full px-3 py-2 border border-destructive/20 rounded-lg bg-background text-sm font-mono"
            disabled={loading}
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowConfirm(false);
              setConfirmText('');
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleForceCreate}
            disabled={confirmText !== 'FORCE CREATE' || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating Tables...
              </>
            ) : (
              <>
                <Database className="h-4 w-4" />
                Force Create All Tables
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
