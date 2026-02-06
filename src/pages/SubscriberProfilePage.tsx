import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Wifi,
  Router,
  CreditCard,
  FileText,
  RefreshCw,
  Ban,
  Plus,
  Download,
} from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { subscribers, invoices, tickets, activityLog, usageData } from "@/data/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

const SubscriberProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const subscriber = subscribers.find((s) => s.id === id);
  const subscriberInvoices = invoices.filter((inv) => inv.customerId === id);
  const subscriberTickets = tickets.filter((t) => t.customerId === id);

  if (!subscriber) {
    return (
      <SidebarLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold text-foreground">Subscriber not found</h2>
          <Button variant="outline" className="mt-4" onClick={() => navigate("/subscribers")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subscribers
          </Button>
        </div>
      </SidebarLayout>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <SidebarLayout>
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/subscribers")} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Subscribers
        </Button>
      </div>

      {/* Profile Header */}
      <Card className="mb-6 border-border shadow-card overflow-hidden">
        <div className="h-24 gradient-primary" />
        <CardContent className="relative pt-0">
          <div className="flex flex-col md:flex-row md:items-end gap-6 -mt-12">
            <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
              <AvatarFallback className="text-2xl font-bold bg-accent text-accent-foreground">
                {getInitials(subscriber.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 pb-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">{subscriber.name}</h1>
                  <p className="text-muted-foreground">{subscriber.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={subscriber.status} />
                  {subscriber.status === "Active" ? (
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Ban className="h-4 w-4 mr-1" />
                      Suspend
                    </Button>
                  ) : (
                    <Button variant="accent" size="sm">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reactivate
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="text-sm font-medium">{subscriber.phone}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium">{subscriber.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <Wifi className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Package</p>
                <p className="text-sm font-medium">{subscriber.package}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-secondary p-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Address</p>
                <p className="text-sm font-medium truncate">{subscriber.address}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="billing" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="billing">Billing & Payments</TabsTrigger>
          <TabsTrigger value="network">Network</TabsTrigger>
          <TabsTrigger value="tickets">Support Tickets</TabsTrigger>
          <TabsTrigger value="usage">Usage Graph</TabsTrigger>
        </TabsList>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Invoices</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              <Button variant="accent" size="sm">
                <FileText className="h-4 w-4 mr-1" />
                Generate Invoice
              </Button>
            </div>
          </div>

          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriberInvoices.length > 0 ? (
                    subscriberInvoices.map((invoice) => (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-mono">{invoice.id}</TableCell>
                        <TableCell>{invoice.createdDate}</TableCell>
                        <TableCell className="font-medium">{formatCurrency(invoice.amount)}</TableCell>
                        <TableCell>
                          <StatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          {invoice.status !== "Paid" && (
                            <Button variant="accent" size="sm">
                              <CreditCard className="h-4 w-4 mr-1" />
                              Pay Now
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No invoices found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Network Tab */}
        <TabsContent value="network" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Router className="h-5 w-5 text-accent" />
                  Connection Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={subscriber.status === "Active" ? "success" : "destructive"}>
                    {subscriber.status === "Active" ? "Connected" : "Disconnected"}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Current Speed</span>
                  <span className="font-medium">{subscriber.speed}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Router IP</span>
                  <span className="font-mono text-sm">{subscriber.routerIp}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">MAC Address</span>
                  <span className="font-mono text-sm">{subscriber.macAddress}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">PPPoE Username</span>
                  <span className="font-mono text-sm">{subscriber.pppoeUsername}</span>
                </div>
                <div className="flex gap-2 pt-4 border-t border-border">
                  {subscriber.status === "Active" ? (
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive flex-1">
                      <Ban className="h-4 w-4 mr-1" />
                      Suspend Connection
                    </Button>
                  ) : (
                    <Button variant="accent" size="sm" className="flex-1">
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reactivate Connection
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityLog.map((log, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          log.type === "success"
                            ? "bg-success"
                            : log.type === "warning"
                            ? "bg-warning"
                            : "bg-info"
                        }`}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{log.event}</p>
                        <p className="text-xs text-muted-foreground">{log.timestamp}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tickets Tab */}
        <TabsContent value="tickets" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Support Tickets</h3>
            <Button variant="accent" size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Open New Ticket
            </Button>
          </div>

          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ticket #</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Update</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriberTickets.length > 0 ? (
                    subscriberTickets.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-mono">{ticket.id}</TableCell>
                        <TableCell>{ticket.subject}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              ticket.priority === "High"
                                ? "destructive"
                                : ticket.priority === "Medium"
                                ? "warning"
                                : "secondary"
                            }
                          >
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={ticket.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">{ticket.lastUpdate}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No tickets found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Weekly Data Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={usageData}>
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
                        boxShadow: "0 4px 6px -1px hsl(222, 47%, 11%, 0.1)",
                      }}
                      formatter={(value: number, name: string) => [`${value} GB`, name === "download" ? "Download" : "Upload"]}
                    />
                    <Legend />
                    <Bar dataKey="download" fill="hsl(187, 72%, 43%)" radius={[4, 4, 0, 0]} name="Download" />
                    <Bar dataKey="upload" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Upload" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
};

export default SubscriberProfilePage;
