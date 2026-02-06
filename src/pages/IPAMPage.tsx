import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Network,
  Plus,
  Edit,
  Trash2,
  Search,
  Server,
  Globe,
  Layers,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

// Mock IP Pools
const mockIPPools = [
  { id: 1, name: "Residential Pool", network: "10.0.0.0/16", gateway: "10.0.0.1", total: 65534, used: 12450, reserved: 100, status: "Active" },
  { id: 2, name: "Business Pool", network: "172.16.0.0/20", gateway: "172.16.0.1", total: 4094, used: 856, reserved: 50, status: "Active" },
  { id: 3, name: "Management VLAN", network: "192.168.1.0/24", gateway: "192.168.1.1", total: 254, used: 45, reserved: 10, status: "Active" },
  { id: 4, name: "Legacy Pool", network: "10.100.0.0/22", gateway: "10.100.0.1", total: 1022, used: 0, reserved: 0, status: "Inactive" },
];

// Mock DHCP Ranges
const mockDHCPRanges = [
  { id: 1, pool: "Residential Pool", start: "10.0.1.1", end: "10.0.255.254", leaseTime: "24h", used: 8542, available: 56990 },
  { id: 2, pool: "Business Pool", start: "172.16.1.1", end: "172.16.15.254", leaseTime: "12h", used: 756, available: 3088 },
  { id: 3, pool: "Management VLAN", start: "192.168.1.100", end: "192.168.1.200", leaseTime: "8h", used: 35, available: 66 },
];

// Mock IP Allocations
const mockAllocations = [
  { ip: "10.0.1.45", mac: "AA:BB:CC:DD:EE:01", hostname: "john-kamau-ont", customer: "John Kamau", type: "DHCP", leaseExpires: "2024-01-16 14:32", status: "Active" },
  { ip: "10.0.1.78", mac: "AA:BB:CC:DD:EE:02", hostname: "jane-wanjiku-ont", customer: "Jane Wanjiku", type: "DHCP", leaseExpires: "2024-01-16 12:15", status: "Active" },
  { ip: "172.16.1.10", mac: "AA:BB:CC:DD:EE:03", hostname: "acme-corp-router", customer: "ACME Corporation", type: "Static", leaseExpires: "-", status: "Active" },
  { ip: "10.0.2.156", mac: "AA:BB:CC:DD:EE:04", hostname: "peter-ochieng-ont", customer: "Peter Ochieng", type: "DHCP", leaseExpires: "2024-01-15 08:45", status: "Expired" },
  { ip: "192.168.1.150", mac: "AA:BB:CC:DD:EE:05", hostname: "office-printer", customer: "Internal", type: "Reserved", leaseExpires: "-", status: "Active" },
  { ip: "10.0.3.22", mac: "AA:BB:CC:DD:EE:06", hostname: "mary-akinyi-ont", customer: "Mary Akinyi", type: "DHCP", leaseExpires: "2024-01-16 18:00", status: "Active" },
];

const IPAMPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  const getUtilization = (used: number, total: number) => {
    return Math.round((used / total) * 100);
  };

  const getUtilizationColor = (percent: number) => {
    if (percent < 50) return "bg-success";
    if (percent < 80) return "bg-warning";
    return "bg-destructive";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />Active</Badge>;
      case "Inactive":
        return <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" />Inactive</Badge>;
      case "Expired":
        return <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" />Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "DHCP":
        return <Badge variant="outline" className="text-accent border-accent">DHCP</Badge>;
      case "Static":
        return <Badge variant="default">Static</Badge>;
      case "Reserved":
        return <Badge variant="secondary">Reserved</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const totalIPs = mockIPPools.reduce((acc, pool) => acc + pool.total, 0);
  const usedIPs = mockIPPools.reduce((acc, pool) => acc + pool.used, 0);
  const reservedIPs = mockIPPools.reduce((acc, pool) => acc + pool.reserved, 0);

  return (
    <SidebarLayout>
      <PageHeader
        title="IP Address Management"
        description="Configure IP pools, DHCP ranges, and track address allocations."
      />

      <div className="space-y-6">
        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-accent/10">
                  <Globe className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total IPs</p>
                  <p className="text-2xl font-bold">{totalIPs.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-success/10">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Allocated</p>
                  <p className="text-2xl font-bold">{usedIPs.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-warning/10">
                  <Layers className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reserved</p>
                  <p className="text-2xl font-bold">{reservedIPs.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-muted">
                  <Network className="h-6 w-6 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-bold">{(totalIPs - usedIPs - reservedIPs).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* IP Pools */}
        <Card className="border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5 text-accent" />
                IP Pools
              </CardTitle>
              <CardDescription>
                Manage your IP address pools and subnets
              </CardDescription>
            </div>
            <Button variant="accent" size="sm">
              <Plus className="h-4 w-4" />
              Add Pool
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pool Name</TableHead>
                  <TableHead>Network/CIDR</TableHead>
                  <TableHead>Gateway</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Used / Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockIPPools.map((pool) => {
                  const utilization = getUtilization(pool.used, pool.total);
                  return (
                    <TableRow key={pool.id}>
                      <TableCell className="font-medium">{pool.name}</TableCell>
                      <TableCell className="font-mono text-sm">{pool.network}</TableCell>
                      <TableCell className="font-mono text-sm">{pool.gateway}</TableCell>
                      <TableCell className="min-w-[150px]">
                        <div className="space-y-1">
                          <Progress value={utilization} className={`h-2 ${getUtilizationColor(utilization)}`} />
                          <span className="text-xs text-muted-foreground">{utilization}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{pool.used.toLocaleString()}</span>
                        <span className="text-muted-foreground"> / {pool.total.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(pool.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* DHCP Ranges */}
        <Card className="border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <RefreshCw className="h-5 w-5 text-accent" />
                DHCP Ranges
              </CardTitle>
              <CardDescription>
                Configure dynamic IP address assignment ranges
              </CardDescription>
            </div>
            <Button variant="accent" size="sm">
              <Plus className="h-4 w-4" />
              Add Range
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pool</TableHead>
                  <TableHead>Start IP</TableHead>
                  <TableHead>End IP</TableHead>
                  <TableHead>Lease Time</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Available</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockDHCPRanges.map((range) => (
                  <TableRow key={range.id}>
                    <TableCell className="font-medium">{range.pool}</TableCell>
                    <TableCell className="font-mono text-sm">{range.start}</TableCell>
                    <TableCell className="font-mono text-sm">{range.end}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{range.leaseTime}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{range.used.toLocaleString()}</TableCell>
                    <TableCell className="text-success">{range.available.toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Address Allocations */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="h-5 w-5 text-accent" />
                  Address Allocations
                </CardTitle>
                <CardDescription>
                  Track all IP address assignments and leases
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search IP or customer..."
                    className="pl-9 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="dhcp">DHCP</SelectItem>
                    <SelectItem value="static">Static</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>MAC Address</TableHead>
                  <TableHead>Hostname</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Lease Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAllocations.map((alloc, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm font-medium">{alloc.ip}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{alloc.mac}</TableCell>
                    <TableCell className="text-sm">{alloc.hostname}</TableCell>
                    <TableCell className="font-medium">{alloc.customer}</TableCell>
                    <TableCell>{getTypeBadge(alloc.type)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{alloc.leaseExpires}</TableCell>
                    <TableCell>{getStatusBadge(alloc.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default IPAMPage;
