import { Badge } from "@/components/ui/badge";
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
import { StatusBadge } from "@/components/common/StatusBadge";
import {
  Wifi,
  User,
  CreditCard,
  MessageSquare,
  Receipt,
  Phone,
  Download,
  ArrowUpRight,
} from "lucide-react";
import { usageData } from "@/data/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CustomerPortalPage = () => {
  const customer = {
    name: "John Kamau",
    id: "SUB001",
    status: "Active" as const,
    package: "Premium 50Mbps",
    speed: "50 Mbps",
    nextBilling: "2024-12-15",
    balance: 0,
  };

  const invoices = [
    { id: "INV-2024-006", amount: 5000, dueDate: "2024-12-15", status: "Pending" as const },
    { id: "INV-2024-005", amount: 5000, dueDate: "2024-11-15", status: "Paid" as const },
    { id: "INV-2024-004", amount: 5000, dueDate: "2024-10-15", status: "Paid" as const },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Wifi className="h-6 w-6 text-accent-foreground" />
              </div>
              <span className="text-xl font-bold">NetFlow ISP</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm opacity-90">Customer Portal</span>
              <Button variant="secondary" size="sm">
                <User className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Hello, {customer.name}! 👋
          </h1>
          <p className="text-muted-foreground">
            Manage your internet subscription and view your usage
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Account Status</p>
                  <div className="mt-1">
                    <StatusBadge status={customer.status} />
                  </div>
                </div>
                <div className="rounded-lg bg-success/10 p-3">
                  <Wifi className="h-5 w-5 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Package</p>
                  <p className="text-lg font-semibold mt-1">{customer.package}</p>
                </div>
                <div className="rounded-lg bg-accent/10 p-3">
                  <ArrowUpRight className="h-5 w-5 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Speed</p>
                  <p className="text-lg font-semibold mt-1">{customer.speed}</p>
                </div>
                <div className="rounded-lg bg-info/10 p-3">
                  <Download className="h-5 w-5 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Next Billing</p>
                  <p className="text-lg font-semibold mt-1">{customer.nextBilling}</p>
                </div>
                <div className="rounded-lg bg-warning/10 p-3">
                  <Receipt className="h-5 w-5 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Bills & Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bills */}
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-accent" />
                  My Bills
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.id}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell className="text-muted-foreground">{invoice.dueDate}</TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.status === "Pending" && (
                            <Button variant="accent" size="sm">
                              Pay Now
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Usage Graph */}
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">My Usage This Week</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={usageData}>
                      <defs>
                        <linearGradient id="colorDownload" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(187, 72%, 43%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(187, 72%, 43%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                      <XAxis
                        dataKey="day"
                        stroke="hsl(215, 16%, 47%)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(215, 16%, 47%)"
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value} GB`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(214, 32%, 91%)",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [`${value} GB`, "Data Used"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="download"
                        stroke="hsl(187, 72%, 43%)"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorDownload)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Payment & Support */}
          <div className="space-y-6">
            {/* Make Payment */}
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-accent" />
                  Make Payment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Phone Number (M-Pesa)</Label>
                  <Input placeholder="+254 7XX XXX XXX" defaultValue="+254 712 345 678" />
                </div>
                <div className="space-y-2">
                  <Label>Amount (KES)</Label>
                  <Input placeholder="Enter amount" defaultValue="5000" />
                </div>
                <Button variant="accent" className="w-full">
                  <Phone className="h-4 w-4" />
                  Pay via M-Pesa
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  You will receive an STK push on your phone to complete the payment
                </p>
              </CardContent>
            </Card>

            {/* Support */}
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-accent" />
                  Need Help?
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Having issues with your connection? Our support team is here to help!
                </p>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4" />
                  Open Support Ticket
                </Button>
                <div className="pt-4 border-t border-border">
                  <p className="text-sm font-medium mb-2">Contact Us</p>
                  <p className="text-sm text-muted-foreground">📞 +254 700 123 456</p>
                  <p className="text-sm text-muted-foreground">✉️ support@netflowisp.com</p>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-border shadow-card bg-accent/5">
              <CardContent className="pt-6">
                <p className="text-sm font-medium mb-3">Quick Links</p>
                <div className="space-y-2">
                  <Button variant="ghost" className="w-full justify-start text-sm h-9">
                    📋 View All Invoices
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm h-9">
                    🔄 Change Package
                  </Button>
                  <Button variant="ghost" className="w-full justify-start text-sm h-9">
                    👤 Update Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 NetFlow ISP Solutions. All rights reserved.</p>
          <p className="mt-1">Fast, Reliable Internet for Everyone</p>
        </div>
      </footer>
    </div>
  );
};

export default CustomerPortalPage;
