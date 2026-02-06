import { useState } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Package,
  Clock,
  BarChart3,
  Loader2,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";
import { useInvoices } from "@/hooks/useInvoices";
import { useSubscribers } from "@/hooks/useSubscribers";

const COLORS = ["hsl(187, 72%, 43%)", "hsl(142, 76%, 36%)", "hsl(38, 92%, 50%)", "hsl(0, 84%, 60%)"];

const ReportsPage = () => {
  const [dateRange, setDateRange] = useState("last6months");
  const { toast } = useToast();

  // Fetch data from database
  const { invoices, loading: invoicesLoading } = useInvoices();
  const { subscribers, loading: subscribersLoading } = useSubscribers();

  // Generate mock revenue data (TODO: Calculate from actual invoice data)
  const revenueData = useMemo(() => [
    { month: "Jul", revenue: 850000, expected: 900000, subscribers: 180 },
    { month: "Aug", revenue: 920000, expected: 950000, subscribers: 195 },
    { month: "Sep", revenue: 980000, expected: 1000000, subscribers: 210 },
    { month: "Oct", revenue: 1050000, expected: 1050000, subscribers: 228 },
    { month: "Nov", revenue: 1120000, expected: 1100000, subscribers: 245 },
    { month: "Dec", revenue: 1180000, expected: 1200000, subscribers: 258 },
  ], []);

  // Generate report data from invoices (TODO: Calculate from actual invoice data)
  const reportsData = useMemo(() => ({
    revenueReport: [
      { month: "Jul 2024", collected: 850000, expected: 900000, variance: -50000 },
      { month: "Aug 2024", collected: 920000, expected: 950000, variance: -30000 },
      { month: "Sep 2024", collected: 980000, expected: 1000000, variance: -20000 },
      { month: "Oct 2024", collected: 1050000, expected: 1050000, variance: 0 },
      { month: "Nov 2024", collected: 1120000, expected: 1100000, variance: 20000 },
      { month: "Dec 2024", collected: 1180000, expected: 1200000, variance: -20000 },
    ],
    ageingReport: [
      { range: "0-30 days", count: 15, amount: 87500 },
      { range: "31-60 days", count: 18, amount: 112500 },
      { range: "61-90 days", count: 8, amount: 55000 },
      { range: "90+ days", count: 4, amount: 32500 },
    ],
    churnReport: [
      { month: "Jul 2024", churned: 5, newSignups: 15, netGrowth: 10 },
      { month: "Aug 2024", churned: 3, newSignups: 18, netGrowth: 15 },
      { month: "Sep 2024", churned: 4, newSignups: 19, netGrowth: 15 },
      { month: "Oct 2024", churned: 2, newSignups: 20, netGrowth: 18 },
      { month: "Nov 2024", churned: 3, newSignups: 20, netGrowth: 17 },
      { month: "Dec 2024", churned: 2, newSignups: 15, netGrowth: 13 },
    ],
    packagePerformance: [
      { package: "Basic 20Mbps", subscribers: 85, revenue: 212500, churn: 3 },
      { package: "Premium 50Mbps", subscribers: 120, revenue: 600000, churn: 5 },
      { package: "Business 100Mbps", subscribers: 38, revenue: 570000, churn: 1 },
      { package: "Enterprise 200Mbps", subscribers: 15, revenue: 375000, churn: 0 },
    ],
  }), []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleExport = (format: string, reportName: string) => {
    toast({
      title: "Export Started",
      description: `Exporting ${reportName} as ${format.toUpperCase()}...`,
    });
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: `${reportName} has been downloaded.`,
      });
    }, 1500);
  };

  const totalCollected = reportsData.revenueReport.reduce((a, b) => a + b.collected, 0);
  const totalExpected = reportsData.revenueReport.reduce((a, b) => a + b.expected, 0);
  const totalOutstanding = reportsData.ageingReport.reduce((a, b) => a + b.amount, 0);
  const collectionRate = ((totalCollected / totalExpected) * 100).toFixed(1);

  return (
    <SidebarLayout>
      <PageHeader
        title="Reports"
        description="Generate and export detailed business reports and analytics."
      />

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Collected</p>
                <p className="text-2xl font-bold">{formatCurrency(totalCollected)}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Expected Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExpected)}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <TrendingUp className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collection Rate</p>
                <p className="text-2xl font-bold">{collectionRate}%</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <BarChart3 className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding</p>
                <p className="text-2xl font-bold text-destructive">{formatCurrency(totalOutstanding)}</p>
              </div>
              <div className="rounded-lg bg-destructive/10 p-3">
                <Clock className="h-5 w-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Date Range Filter */}
      <Card className="border-border shadow-card mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last3months">Last 3 Months</SelectItem>
                  <SelectItem value="last6months">Last 6 Months</SelectItem>
                  <SelectItem value="lastyear">Last Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => handleExport("pdf", "Full Report")}>
                <FileText className="h-4 w-4" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => handleExport("csv", "Full Report")}>
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Tabs */}
      <Tabs defaultValue="revenue" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="ageing">Ageing</TabsTrigger>
          <TabsTrigger value="churn">Churn</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
        </TabsList>

        {/* Revenue Report */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Revenue vs Expected</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExport("csv", "Revenue Report")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportsData.revenueReport}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                      <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis
                        fontSize={12}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          backgroundColor: "hsl(0, 0%, 100%)",
                          border: "1px solid hsl(214, 32%, 91%)",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Bar dataKey="collected" name="Collected" fill="hsl(187, 72%, 43%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="expected" name="Expected" fill="hsl(214, 32%, 91%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Month</TableHead>
                      <TableHead className="font-semibold text-right">Collected</TableHead>
                      <TableHead className="font-semibold text-right">Expected</TableHead>
                      <TableHead className="font-semibold text-right">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportsData.revenueReport.map((row) => (
                      <TableRow key={row.month} className="hover:bg-muted/50">
                        <TableCell className="font-medium">{row.month}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.collected)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(row.expected)}</TableCell>
                        <TableCell className="text-right">
                          <span className={row.variance >= 0 ? "text-success" : "text-destructive"}>
                            {row.variance >= 0 ? "+" : ""}{formatCurrency(row.variance)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Collections Report */}
        <TabsContent value="collections" className="space-y-6">
          <Card className="border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Collection Trend</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport("csv", "Collections Report")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={reportsData.revenueReport}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(214, 32%, 91%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="collected"
                      name="Collected"
                      stroke="hsl(187, 72%, 43%)"
                      strokeWidth={2}
                      dot={{ fill: "hsl(187, 72%, 43%)" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="expected"
                      name="Expected"
                      stroke="hsl(215, 16%, 47%)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: "hsl(215, 16%, 47%)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ageing Report */}
        <TabsContent value="ageing" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-border shadow-card">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Ageing Summary</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleExport("csv", "Ageing Report")}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={reportsData.ageingReport}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="amount"
                        nameKey="range"
                        label={({ range, percent }) => `${range}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {reportsData.ageingReport.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg">Ageing Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-semibold">Age Range</TableHead>
                      <TableHead className="font-semibold text-center">Invoices</TableHead>
                      <TableHead className="font-semibold text-right">Amount</TableHead>
                      <TableHead className="font-semibold text-right">% of Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportsData.ageingReport.map((row, index) => (
                      <TableRow key={row.range} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: COLORS[index] }}
                            />
                            <span className="font-medium">{row.range}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{row.count}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(row.amount)}</TableCell>
                        <TableCell className="text-right">
                          {((row.amount / totalOutstanding) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="bg-muted/30 font-semibold hover:bg-muted/50">
                      <TableCell>Total</TableCell>
                      <TableCell className="text-center">
                        {reportsData.ageingReport.reduce((a, b) => a + b.count, 0)}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(totalOutstanding)}</TableCell>
                      <TableCell className="text-right">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Churn Report */}
        <TabsContent value="churn" className="space-y-6">
          <Card className="border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Customer Churn vs New Signups</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport("csv", "Churn Report")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportsData.churnReport}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(0, 0%, 100%)",
                        border: "1px solid hsl(214, 32%, 91%)",
                        borderRadius: "8px",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="newSignups" name="New Signups" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="churned" name="Churned" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Monthly Churn Details</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Month</TableHead>
                    <TableHead className="font-semibold text-center">New Signups</TableHead>
                    <TableHead className="font-semibold text-center">Churned</TableHead>
                    <TableHead className="font-semibold text-center">Net Growth</TableHead>
                    <TableHead className="font-semibold text-right">Churn Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsData.churnReport.map((row) => (
                    <TableRow key={row.month} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{row.month}</TableCell>
                      <TableCell className="text-center text-success font-medium">+{row.newSignups}</TableCell>
                      <TableCell className="text-center text-destructive font-medium">-{row.churned}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={row.netGrowth >= 0 ? "success" : "destructive"}>
                          {row.netGrowth >= 0 ? "+" : ""}{row.netGrowth}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {((row.churned / (row.netGrowth + row.churned)) * 100).toFixed(1)}%
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Package Performance */}
        <TabsContent value="packages" className="space-y-6">
          <Card className="border-border shadow-card">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Package Performance</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleExport("csv", "Package Report")}
              >
                <Download className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Package</TableHead>
                    <TableHead className="font-semibold text-center">Subscribers</TableHead>
                    <TableHead className="font-semibold text-right">Monthly Revenue</TableHead>
                    <TableHead className="font-semibold text-center">Churn</TableHead>
                    <TableHead className="font-semibold text-right">Revenue Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reportsData.packagePerformance.map((pkg) => {
                    const totalPackageRevenue = reportsData.packagePerformance.reduce((a, b) => a + b.revenue, 0);
                    return (
                      <TableRow key={pkg.package} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-accent" />
                            <span className="font-medium">{pkg.package}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{pkg.subscribers}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(pkg.revenue)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={pkg.churn === 0 ? "success" : "secondary"}>
                            {pkg.churn}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {((pkg.revenue / totalPackageRevenue) * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg">Revenue by Package</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportsData.packagePerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                    <XAxis
                      type="number"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <YAxis type="category" dataKey="package" fontSize={12} tickLine={false} axisLine={false} width={120} />
                    <Tooltip formatter={(value: number) => formatCurrency(value)} />
                    <Bar dataKey="revenue" fill="hsl(187, 72%, 43%)" radius={[0, 4, 4, 0]} />
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

export default ReportsPage;
