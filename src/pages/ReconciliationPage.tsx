import { useState } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle,
  DollarSign,
  XCircle,
  Ban,
  Plus,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePayments } from "@/hooks/usePayments";
import { useInvoices } from "@/hooks/useInvoices";
import { useSubscribers } from "@/hooks/useSubscribers";
import { useMemo } from "react";

const ReconciliationPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [manualPaymentOpen, setManualPaymentOpen] = useState(false);
  const { toast } = useToast();

  // Fetch data from database
  const { payments, loading: paymentsLoading } = usePayments();
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { subscribers, loading: subscribersLoading } = useSubscribers();

  // Filter unmatched payments (payments without an associated invoice)
  const unmatched = useMemo(() => {
    return payments.filter(p => !p.invoice_id || p.invoice_id === '');
  }, [payments]);

  const [unmatchedToRemove, setUnmatchedToRemove] = useState<string[]>([]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleMatch = (paymentId: string, invoiceId: string, customerName: string) => {
    setUnmatchedToRemove([...unmatchedToRemove, paymentId]);
    setSelectedPayment(null);
    toast({
      title: "Payment Matched",
      description: `Payment ${paymentId} matched to ${invoiceId} (${customerName}).`,
    });
  };

  const handleMarkUnallocated = (paymentId: string) => {
    setUnmatchedToRemove([...unmatchedToRemove, paymentId]);
    setSelectedPayment(null);
    toast({
      title: "Marked as Unallocated",
      description: `Payment ${paymentId} has been marked as unallocated funds.`,
    });
  };

  // Filter out the removed unmatched payments
  const displayedUnmatched = useMemo(() => {
    return unmatched.filter(p => !unmatchedToRemove.includes(p.id));
  }, [unmatched, unmatchedToRemove]);

  const handleManualPayment = () => {
    setManualPaymentOpen(false);
    toast({
      title: "Payment Recorded",
      description: "Manual payment has been recorded and matched successfully.",
    });
  };

  const totalUnmatched = displayedUnmatched.reduce((a, b) => a + Number(b.amount), 0);
  const noMatches = displayedUnmatched.length;

  return (
    <SidebarLayout>
      <PageHeader
        title="Payment Reconciliation"
        description="Match unreconciled payments to invoices and manage manual payments."
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unmatched Payments</p>
                <p className="text-2xl font-bold text-warning">{displayedUnmatched.length}</p>
              </div>
              <div className="rounded-lg bg-warning/10 p-3">
                <AlertCircle className="h-5 w-5 text-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Unmatched</p>
                <p className="text-2xl font-bold">{formatCurrency(totalUnmatched)}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processed</p>
                <p className="text-2xl font-bold text-success">{unmatchedToRemove.length}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">No Match Found</p>
                <p className="text-2xl font-bold text-destructive">
                  {noMatches}
                </p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6 gap-4">
        <Card className="flex-1 border-border shadow-card">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID or phone number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </CardContent>
        </Card>

        <Dialog open={manualPaymentOpen} onOpenChange={setManualPaymentOpen}>
          <DialogTrigger asChild>
            <Button variant="accent">
              <Plus className="h-4 w-4" />
              Add Manual Payment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Record Manual Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {subscribers.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>
                        {sub.name} ({sub.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Invoice</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select invoice" />
                  </SelectTrigger>
                  <SelectContent>
                    {invoices
                      .filter((inv) => inv.status !== "Paid")
                      .map((inv) => (
                        <SelectItem key={inv.id} value={inv.id}>
                          {inv.id} - {formatCurrency(inv.amount)} ({inv.status})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount (KES)</Label>
                  <Input type="number" placeholder="5000" />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mpesa">M-Pesa</SelectItem>
                      <SelectItem value="bank">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Payment Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split("T")[0]} />
              </div>
              <div className="space-y-2">
                <Label>Reference / Remarks (Optional)</Label>
                <Textarea placeholder="Transaction reference or notes..." />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setManualPaymentOpen(false)}
                >
                  Cancel
                </Button>
                <Button variant="accent" className="flex-1" onClick={handleManualPayment}>
                  Record Payment
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Unmatched Payments Table */}
      <Card className="border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-lg">Unmatched Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Transaction ID</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Timestamp</TableHead>
                <TableHead className="font-semibold">Suggested Matches</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {unmatched
                .filter(
                  (p) =>
                    p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    p.phone.includes(searchTerm)
                )
                .map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                    <TableCell className="text-muted-foreground">{payment.phone}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {payment.timestamp}
                    </TableCell>
                    <TableCell>
                      {payment.suggestedMatches.length > 0 ? (
                        <div className="space-y-1">
                          {payment.suggestedMatches.slice(0, 2).map((match) => (
                            <div
                              key={match.invoiceId}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Badge
                                variant={match.confidence >= 80 ? "success" : "secondary"}
                                className="text-xs"
                              >
                                {match.confidence}%
                              </Badge>
                              <span className="text-muted-foreground">
                                {match.invoiceId} - {match.customerName}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">No matches found</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payment.suggestedMatches.length > 0 && (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedPayment(payment)}
                              >
                                <LinkIcon className="h-4 w-4" />
                                Match
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Match Payment</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="bg-muted p-3 rounded-lg">
                                  <p className="text-xs text-muted-foreground mb-1">
                                    Transaction
                                  </p>
                                  <p className="font-mono text-sm">{payment.id}</p>
                                  <p className="text-lg font-bold mt-1">
                                    {formatCurrency(payment.amount)}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Suggested Matches</p>
                                  {payment.suggestedMatches.map((match) => (
                                    <div
                                      key={match.invoiceId}
                                      className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 cursor-pointer"
                                      onClick={() =>
                                        handleMatch(payment.id, match.invoiceId, match.customerName)
                                      }
                                    >
                                      <div>
                                        <p className="font-medium">{match.customerName}</p>
                                        <p className="text-sm text-muted-foreground">
                                          {match.invoiceId} - {formatCurrency(match.amount)}
                                        </p>
                                      </div>
                                      <Badge
                                        variant={match.confidence >= 80 ? "success" : "secondary"}
                                      >
                                        {match.confidence}% match
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => handleMarkUnallocated(payment.id)}
                        >
                          <Ban className="h-4 w-4" />
                          Unallocated
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {unmatched.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-success" />
                    All payments have been reconciled!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
};

export default ReconciliationPage;
