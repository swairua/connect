import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useDatabaseInit } from '@/hooks/useDatabaseInit';
import { useToast } from '@/hooks/use-toast';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';

interface DatabaseInitButtonProps {
  onDataDeleted?: () => void;
}

export const DatabaseInitButton = ({ onDataDeleted }: DatabaseInitButtonProps) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const { deleteAllTestData, loading } = useDatabaseInit();
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const result = await deleteAllTestData();

      toast({
        title: 'Database Cleared',
        description: `Successfully deleted ${Object.values(result.deletedRecords || {}).reduce((a, b) => a + b, 0)} records from your database.`,
      });

      setShowConfirm(false);
      setConfirmText('');

      // Reload the page to reflect changes
      if (onDataDeleted) {
        onDataDeleted();
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete database records',
        variant: 'destructive',
      });
    }
  };

  if (!showConfirm) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Database Management
          </CardTitle>
          <CardDescription>Delete all test data from your database</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            This action will permanently delete all subscribers, invoices, payments, tickets, and related records from your database. This cannot be undone.
          </p>
          <Button
            variant="destructive"
            onClick={() => setShowConfirm(true)}
            disabled={loading}
          >
            <Trash2 className="h-4 w-4" />
            Delete All Test Data
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
          Confirm Database Deletion
        </CardTitle>
        <CardDescription>This action is permanent and cannot be undone</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <p className="text-sm font-medium text-destructive mb-2">Warning</p>
          <p className="text-sm text-muted-foreground">
            You are about to permanently delete ALL data including:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-1 ml-4">
            <li>All subscribers and their profiles</li>
            <li>All invoices and payment records</li>
            <li>All support tickets</li>
            <li>All service packages</li>
            <li>All activity logs</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">
            Type <span className="font-mono font-bold text-destructive">DELETE ALL</span> to confirm:
          </p>
          <input
            type="text"
            placeholder="Type DELETE ALL to confirm"
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
            onClick={handleDelete}
            disabled={confirmText !== 'DELETE ALL' || loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete All Data
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
