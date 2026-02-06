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
  Loader2,
} from "lucide-react";
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
import { AutoMigrationButton } from "@/components/dashboard/AutoMigrationButton";
import { ForceDatabaseMigrationButton } from "@/components/dashboard/ForceDatabaseMigrationButton";
import { useState, useMemo } from "react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { usePackages } from "@/hooks/usePackages";
import { useTickets } from "@/hooks/useTickets";

const Index = () => {
  const navigate = useNavigate();
  const [showAdminSection, setShowAdminSection] = useState(false);

  // Fetch data from database
  const { stats: dashboardStats, loading: statsLoading } = useDashboardStats();
  const { servicePlans, loading: plansLoading } = usePackages();
  const { stats: ticketStats, loading: ticketsLoading } = useTickets();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Calculate performance metrics safely
  const dailyPerformance = dashboardStats && dashboardStats.expected_daily_revenue > 0
    ? ((dashboardStats.daily_revenue / dashboardStats.expected_daily_revenue) * 100).toFixed(1)
    : "0";

  const monthlyPerformance = dashboardStats && dashboardStats.expected_mrr > 0
    ? ((dashboardStats.mrr / dashboardStats.expected_mrr) * 100).toFixed(1)
    : "0";

  // Generate mock revenue data for charts (TODO: fetch from actual revenue history)
  const revenueData = useMemo(() => [
    { month: "Jul", revenue: 850000, expected: 900000, subscribers: 180 },
    { month: "Aug", revenue: 920000, expected: 950000, subscribers: 195 },
    { month: "Sep", revenue: 980000, expected: 1000000, subscribers: 210 },
    { month: "Oct", revenue: 1050000, expected: 1050000, subscribers: 228 },
    { month: "Nov", revenue: 1120000, expected: 1100000, subscribers: 245 },
    { month: "Dec", revenue: 1180000, expected: 1200000, subscribers: 258 },
  ], []);

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
                {statsLoading ? (
                  <Loader2 className="h-4 w-4 text-accent animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-accent" />
                )}
              </div>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(dashboardStats?.daily_revenue || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Expected: {formatCurrency(dashboardStats?.expected_daily_revenue || 0)}
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Performance</span>
                <span className={Number(dailyPerformance) >= 100 ? "text-success" : "text-warning"}>
                  {dailyPerformance}%
                </span>
              </div>
              <Progress value={Math.min(Number(dailyPerformance), 100)} className="h-1.5" />
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
            <p className="text-2xl font-bold">{formatCurrency(dashboardStats?.mrr || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">
              Expected: {formatCurrency(dashboardStats?.expected_mrr || 0)}
            </p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">Target Achievement</span>
                <span className={Number(monthlyPerformance) >= 100 ? "text-success" : "text-warning"}>
                  {monthlyPerformance}%
                </span>
              </div>
              <Progress value={Math.min(Number(monthlyPerformance), 100)} className="h-1.5" />
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
            <p className="text-2xl font-bold text-warning">{dashboardStats?.accounts_due || 0}</p>
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
            <p className="text-2xl font-bold text-destructive">{formatCurrency(dashboardStats?.unpaid_amount || 0)}</p>
            <p className="text-xs text-muted-foreground mt-1">{dashboardStats?.unpaid_invoices || 0} unpaid invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard
          title="Total Subscribers"
          value={dashboardStats?.total_subscribers || 0}
          subtitle={`${dashboardStats?.new_signups || 0} new this month`}
          icon={Users}
          variant="accent"
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Active Subscribers"
          value={dashboardStats?.active_subscribers || 0}
          subtitle={`${dashboardStats?.total_subscribers && dashboardStats.total_subscribers > 0 ? ((dashboardStats.active_subscribers / dashboardStats.total_subscribers) * 100).toFixed(0) : 0}% of total`}
          icon={UserCheck}
          variant="success"
        />
        <StatCard
          title="Grace Period"
          value={dashboardStats?.grace_subscribers || 0}
          subtitle="Awaiting payment"
          icon={Clock}
          variant="warning"
        />
        <StatCard
          title="Suspended"
          value={dashboardStats?.suspended_subscribers || 0}
          subtitle={`${dashboardStats?.expired_subscribers || 0} expired`}
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
          <CardTitle className="text-lg font-semibold">Service Plans Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {plansLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : servicePlans.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-muted-foreground">No service plans found. Create one to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="font-semibold">Plan Name</TableHead>
                  <TableHead className="font-semibold">Bandwidth</TableHead>
                  <TableHead className="font-semibold text-right">Price (KES)</TableHead>
                  <TableHead className="font-semibold">Billing Cycle</TableHead>
                  <TableHead className="font-semibold text-center">Grace Period</TableHead>
                  <TableHead className="font-semibold text-center">Auto Suspend</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {servicePlans.map((plan) => (
                  <TableRow key={plan.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.bandwidth_profile}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(plan.price)}</TableCell>
                    <TableCell>{plan.billing_cycle}</TableCell>
                    <TableCell className="text-center">{plan.grace_period} days</TableCell>
                    <TableCell className="text-center">{plan.auto_suspend ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
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
            {ticketsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-warning/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-warning">{ticketStats?.open || 0}</p>
                    <p className="text-xs text-muted-foreground">Open Tickets</p>
                  </div>
                  <div className="bg-success/10 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-success">{ticketStats?.resolvedToday || 0}</p>
                    <p className="text-xs text-muted-foreground">Resolved Today</p>
                  </div>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">In Progress</span>
                  </div>
                  <span className="text-sm font-medium">{ticketStats?.inProgress || 0} tickets</span>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase">By Category</p>
                  {Object.entries(ticketStats?.categories || {}).length > 0 ? (
                    Object.entries(ticketStats?.categories || {}).map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <span className="text-sm">{category}</span>
                        <span className="text-sm font-medium bg-secondary px-2 py-0.5 rounded">{count}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No tickets yet</p>
                  )}
                </div>
              </>
            )}
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
                <p className="text-2xl font-bold text-foreground">{dashboardStats?.active_subscribers || 0}</p>
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
                <p className="text-2xl font-bold text-foreground">{dashboardStats?.grace_subscribers || 0}</p>
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
                <p className="text-2xl font-bold text-foreground">{dashboardStats?.expired_subscribers || 0}</p>
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
                <p className="text-2xl font-bold text-foreground">{dashboardStats?.suspended_subscribers || 0}</p>
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
            <AutoMigrationButton onSuccess={() => {}} />
            <DatabaseMigrationButton onSuccess={() => {}} />
            <DatabaseInitButton onDataDeleted={() => setShowAdminSection(false)} />
          </div>
        )}
      </div>
    </SidebarLayout>
  );
};

export default Index;
