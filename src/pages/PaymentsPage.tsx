import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
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
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, Smartphone, RefreshCw, Link, Code, Zap } from "lucide-react";
import { payments } from "@/data/mockData";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const PaymentsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [connectionTested, setConnectionTested] = useState(false);
  const { toast } = useToast();

  const filteredPayments = payments.filter((payment) => {
    return (
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.phone.includes(searchTerm) ||
      payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleTestConnection = () => {
    setConnectionTested(true);
    toast({
      title: "Connection Successful",
      description: "M-Pesa API connection verified successfully.",
    });
  };

  const stats = {
    totalTransactions: payments.length,
    successful: payments.filter((p) => p.status === "Success").length,
    failed: payments.filter((p) => p.status === "Failed").length,
    totalAmount: payments
      .filter((p) => p.status === "Success")
      .reduce((acc, p) => acc + p.amount, 0),
    reconciled: payments.filter((p) => p.reconciled).length,
  };

  return (
    <SidebarLayout>
      <PageHeader
        title="Payments"
        description="Track M-Pesa transactions and reconcile payments."
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-2xl font-bold">{stats.totalTransactions}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <Smartphone className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Successful</p>
                <p className="text-2xl font-bold text-success">{stats.successful}</p>
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
                <p className="text-sm text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <XCircle className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-2xl font-bold">{formatCurrency(stats.totalAmount)}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <Zap className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transactions Table */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search */}
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by transaction ID, phone, or invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Transactions Table */}
          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Transaction ID</TableHead>
                    <TableHead className="font-semibold">Phone</TableHead>
                    <TableHead className="font-semibold">Amount</TableHead>
                    <TableHead className="font-semibold">Invoice</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Reconciled</TableHead>
                    <TableHead className="font-semibold">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm">{payment.id}</TableCell>
                      <TableCell className="text-muted-foreground">{payment.phone}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                      <TableCell className="font-mono text-sm">{payment.invoiceId}</TableCell>
                      <TableCell>
                        <StatusBadge status={payment.status} />
                      </TableCell>
                      <TableCell>
                        {payment.reconciled ? (
                          <Badge variant="success">Yes</Badge>
                        ) : (
                          <Badge variant="secondary">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{payment.timestamp}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* M-Pesa Configuration */}
        <div className="space-y-6">
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-accent" />
                M-Pesa Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Paybill Number</Label>
                <Input value="123456" readOnly className="font-mono bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Till Number</Label>
                <Input value="7654321" readOnly className="font-mono bg-muted" />
              </div>
              <div className="space-y-2">
                <Label>Business Short Code</Label>
                <Input value="174379" readOnly className="font-mono bg-muted" />
              </div>
              <div className="flex items-center gap-2 pt-2">
                <div
                  className={`w-3 h-3 rounded-full ${
                    connectionTested ? "bg-success animate-pulse-subtle" : "bg-muted-foreground"
                  }`}
                />
                <span className="text-sm text-muted-foreground">
                  {connectionTested ? "Connected" : "Not tested"}
                </span>
              </div>
              <Button variant="accent" className="w-full" onClick={handleTestConnection}>
                <RefreshCw className="h-4 w-4" />
                Test M-Pesa Connection
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Link className="h-5 w-5 text-accent" />
                Callback URLs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">C2B Callback URL</Label>
                <code className="block text-xs bg-muted p-3 rounded-lg break-all font-mono">
                  https://api.yourisp.com/mpesa/c2b/callback
                </code>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">B2C Result URL</Label>
                <code className="block text-xs bg-muted p-3 rounded-lg break-all font-mono">
                  https://api.yourisp.com/mpesa/b2c/result
                </code>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Code className="h-5 w-5 text-accent" />
                STK Push Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg">
                <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
{`{
  "BusinessShortCode": "174379",
  "Password": "MTc0Mzc5YmZ...",
  "Timestamp": "20241204143000",
  "TransactionType": "CustomerPayBillOnline",
  "Amount": "2500",
  "PartyA": "254712345678",
  "PartyB": "174379",
  "PhoneNumber": "254712345678",
  "CallBackURL": "https://...",
  "AccountReference": "INV-2024-001",
  "TransactionDesc": "Invoice Payment"
}`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  );
};

export default PaymentsPage;
