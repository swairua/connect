import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { StatCard } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  UserCheck,
  UserX,
  Receipt,
  DollarSign,
  Plus,
  FileText,
  MessageSquare,
  Ban,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  Ticket,
  CheckCircle,
  Timer,
  ChevronDown,
} from "lucide-react";
import { dashboardStats, revenueData, servicePlans, ticketStats } from "@/data/mockData";
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
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { DatabaseInitButton } from "@/components/dashboard/DatabaseInitButton";
import { DatabaseMigrationButton } from "@/components/dashboard/DatabaseMigrationButton";
import { useState } from "react";

const Index = () => {
  const navigate = useNavigate();
  const [showAdminSection, setShowAdminSection] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const dailyPerformance = ((dashboardStats.dailyRevenue / dashboardStats.expectedDailyRevenue) * 100).toFixed(1);
  const monthlyPerformance = ((dashboardStats.mrr / dashboardStats.expectedMrr) * 100).toFixed(1);

  return (
    <SidebarLayout>
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your ISP business."
      />

      {/* Revenue Analytics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Daily Revenue</p>
              <div className="rounded-lg bg-accent/10 p-2">
                <TrendingUp className="h-4 w-4 text-accent" />
              </div>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(dashboardStats.dailyRevenue)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Expected: {formatCurrency(dashboardStats.expectedDailyRevenue)}
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Performance</span>
                <span className={Number(dailyPerformance) >= 100 ? "text-success" : "text-warning"}>
                  {dailyPerformance}%
                </span>
              </div>
              <Progress value={Number(dailyPerformance)} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <div className="rounded-lg bg-success/10 p-2">
                <DollarSign className="h-4 w-4 text-success" />
              </div>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(dashboardStats.mrr)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Expected: {formatCurrency(dashboardStats.expectedMrr)}
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Target Achievement</span>
                <span className={Number(monthlyPerformance) >= 100 ? "text-success" : "text-warning"}>
                  {monthlyPerformance}%
                </span>
              </div>
              <Progress value={Number(monthlyPerformance)} className="h-1.5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card hover:shadow-card-hover transition-shadow cursor-pointer" onClick={() => navigate("/billing")}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Accounts Due</p>
              <div className="rounded-lg bg-warning/10 p-2">
                <AlertCircle className="h-4 w-4 text-warning" />
              </div>
            </div>
            <p className="text-2xl font-bold text-warning">{dashboardStats.accountsDue}</p>
            <p className="text-xs text-muted-foreground mt-1">Customers with pending payments</p>
            <p className="text-xs text-accent mt-2 font-medium">Click to view list →</p>
          </CardContent>
        </Card>

        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">Unpaid Amount</p>
              <div className="rounded-lg bg-destructive/10 p-2">
                <Receipt className="h-4 w-4 text-destructive" />
              </div>
            </div>
            <p className="text-2xl font-bold text-destructive">{formatCurrency(dashboardStats.unpaidAmount)}</p>
            <p className="text-xs text-muted-foreground mt-1">{dashboardStats.unpaidInvoices} unpaid invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Subscribers"
          value={dashboardStats.totalSubscribers}
          subtitle={`${dashboardStats.newSignups} new this month`}
          icon={Users}
          variant="accent"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Active Subscribers"
          value={dashboardStats.activeSubscribers}
          subtitle={`${((dashboardStats.activeSubscribers / dashboardStats.totalSubscribers) * 100).toFixed(0)}% of total`}
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="Grace Period"
          value={dashboardStats.graceSubscribers}
          subtitle="Awaiting payment"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Suspended"
          value={dashboardStats.suspendedSubscribers}
          subtitle={`${dashboardStats.expiredSubscribers} expired`}
          icon={UserX}
          variant="destructive"
        />
      </div>

      {/* Quick Actions */}
      <Card className="mb-8 border-border shadow-card">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="accent" onClick={() => navigate("/subscribers")}>
              <Plus className="h-4 w-4" />
              Add Subscriber
            </Button>
            <Button variant="outline" onClick={() => navigate("/billing")}>
              <FileText className="h-4 w-4" />
              Create Invoice
            </Button>
            <Button variant="outline" onClick={() => navigate("/notifications")}>
              <MessageSquare className="h-4 w-4" />
              Send SMS Broadcast
            </Button>
            <Button variant="outline" onClick={() => navigate("/reports")}>
              <TrendingUp className="h-4 w-4" />
              View Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Packages Overview Table */}
      <Card className="mb-8 border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Packages Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Package Name</TableHead>
                <TableHead className="font-semibold text-center">Total Users</TableHead>
                <TableHead className="font-semibold text-center">Active</TableHead>
                <TableHead className="font-semibold text-center">Expired</TableHead>
                <TableHead className="font-semibold text-center">Suspended</TableHead>
                <TableHead className="font-semibold text-right">Monthly Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {servicePlans.map((plan) => (
                <TableRow key={plan.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell className="text-center">{plan.totalUsers}</TableCell>
                  <TableCell className="text-center text-success font-medium">{plan.activeUsers}</TableCell>
                  <TableCell className="text-center text-warning font-medium">{plan.expiredUsers}</TableCell>
                  <TableCell className="text-center text-destructive font-medium">{plan.suspendedUsers}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(plan.activeUsers * plan.price)}</TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-muted/30 font-semibold hover:bg-muted/50">
                <TableCell>Total</TableCell>
                <TableCell className="text-center">{servicePlans.reduce((a, b) => a + b.totalUsers, 0)}</TableCell>
                <TableCell className="text-center text-success">{servicePlans.reduce((a, b) => a + b.activeUsers, 0)}</TableCell>
                <TableCell className="text-center text-warning">{servicePlans.reduce((a, b) => a + b.expiredUsers, 0)}</TableCell>
                <TableCell className="text-center text-destructive">{servicePlans.reduce((a, b) => a + b.suspendedUsers, 0)}</TableCell>
                <TableCell className="text-right">{formatCurrency(servicePlans.reduce((a, b) => a + (b.activeUsers * b.price), 0))}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Ticketing Snapshot & Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3 mb-8">
        {/* Ticketing Snapshot */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Ticket className="h-5 w-5 text-accent" />
              Ticketing Snapshot
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-warning/10 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-warning">{ticketStats.open}</p>
                <p className="text-xs text-muted-foreground">Open Tickets</p>
              </div>
              <div className="bg-success/10 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-success">{ticketStats.resolvedToday}</p>
                <p className="text-xs text-muted-foreground">Resolved Today</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2 border-t border-border">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Avg SLA Time</span>
              </div>
              <span className="text-sm font-medium">{ticketStats.avgSlaTime}</span>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase">By Category</p>
              {Object.entries(ticketStats.categories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-sm">{category}</span>
                  <span className="text-sm font-medium bg-secondary px-2 py-0.5 rounded">{count}</span>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full" onClick={() => navigate("/tickets")}>
              View All Tickets
            </Button>
          </CardContent>
        </Card>

        {/* Revenue Trend */}
        <Card className="border-border shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Revenue vs Expected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(187, 72%, 43%)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(187, 72%, 43%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(215, 16%, 47%)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="hsl(215, 16%, 47%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                  <XAxis
                    dataKey="month"
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
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(0, 0%, 100%)",
                      border: "1px solid hsl(214, 32%, 91%)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px hsl(222, 47%, 11%, 0.1)",
                    }}
                    formatter={(value: number, name: string) => [formatCurrency(value), name === "revenue" ? "Collected" : "Expected"]}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="expected"
                    name="Expected"
                    stroke="hsl(215, 16%, 47%)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    fillOpacity={1}
                    fill="url(#colorExpected)"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Collected"
                    stroke="hsl(187, 72%, 43%)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Subscriber Growth */}
      <Card className="border-border shadow-card mb-8">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Subscriber Growth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis
                  dataKey="month"
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
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(0, 0%, 100%)",
                    border: "1px solid hsl(214, 32%, 91%)",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px hsl(222, 47%, 11%, 0.1)",
                  }}
                  formatter={(value: number) => [value, "Subscribers"]}
                />
                <Bar
                  dataKey="subscribers"
                  fill="hsl(187, 72%, 43%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-success/10 p-3">
                <UserCheck className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.activeSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-warning/10 p-3">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Grace Period</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.graceSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-orange-500/10 p-3">
                <AlertCircle className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expired</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.expiredSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <UserX className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                <p className="text-2xl font-bold text-foreground">{dashboardStats.suspendedSubscribers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Section */}
      <div className="space-y-4">
        <button
          onClick={() => setShowAdminSection(!showAdminSection)}
          className="w-full flex items-center justify-between p-4 border border-dashed border-muted-foreground/30 rounded-lg hover:bg-muted/30 transition-colors"
        >
          <span className="text-sm font-medium text-muted-foreground">Admin Tools</span>
          <ChevronDown
            className={`h-4 w-4 text-muted-foreground transition-transform ${
              showAdminSection ? 'rotate-180' : ''
            }`}
          />
        </button>

        {showAdminSection && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200 space-y-4">
            <DatabaseMigrationButton onSuccess={() => {}} />
            <DatabaseInitButton onDataDeleted={() => setShowAdminSection(false)} />
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Index;
