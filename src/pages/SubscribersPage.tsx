import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Plus, Search, Eye, Ban, RefreshCw, Loader2 } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSubscribers } from "@/hooks/useSubscribers";
import { usePackages } from "@/hooks/usePackages";

const SubscribersPage = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [packageFilter, setPackageFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { subscribers, loading } = useSubscribers();
  const { packages } = usePackages();

  const filteredSubscribers = subscribers.filter((sub) => {
    const matchesStatus = statusFilter === "all" || sub.status === statusFilter;
    const matchesPackage = packageFilter === "all" || sub.package_name === packageFilter;
    const matchesSearch =
      sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.phone.includes(searchTerm) ||
      (sub.pppoe_username || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesPackage && matchesSearch;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (loading) {
    return (
      <SidebarLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading subscribers...</p>
          </div>
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <PageHeader
        title="Subscribers"
        description="Manage your customer base and their connections."
      >
        <Button variant="accent">
          <Plus className="h-4 w-4" />
          Add Subscriber
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="mb-6 border-border shadow-card">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Grace">Grace</SelectItem>
                <SelectItem value="Suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Select value={packageFilter} onValueChange={setPackageFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Package" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Packages</SelectItem>
                {packages.map((pkg) => (
                  <SelectItem key={pkg.id} value={pkg.name}>
                    {pkg.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subscribers Table */}
      <Card className="border-border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Package</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Outstanding</TableHead>
                <TableHead className="font-semibold">Last Payment</TableHead>
                <TableHead className="font-semibold">Router IP</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSubscribers.length > 0 ? (
                filteredSubscribers.map((subscriber) => (
                  <TableRow
                    key={subscriber.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => navigate(`/subscribers/${subscriber.id}`)}
                  >
                    <TableCell className="font-medium">{subscriber.name}</TableCell>
                    <TableCell className="text-muted-foreground">{subscriber.phone}</TableCell>
                    <TableCell>{subscriber.package_name || "N/A"}</TableCell>
                    <TableCell>
                      <StatusBadge status={subscriber.status} />
                    </TableCell>
                    <TableCell className={subscriber.outstanding_amount > 0 ? "text-destructive font-medium" : "text-muted-foreground"}>
                      {formatCurrency(subscriber.outstanding_amount)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {subscriber.last_payment_date ? new Date(subscriber.last_payment_date).toLocaleDateString('en-KE') : "Never"}
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {subscriber.router_ip || "N/A"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/subscribers/${subscriber.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {subscriber.status === "Active" ? (
                          <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                            <Ban className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button variant="ghost" size="icon" className="text-success hover:text-success">
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No subscribers found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="mt-4 text-sm text-muted-foreground">
        Showing {filteredSubscribers.length} of {subscribers.length} subscribers
      </div>
    </SidebarLayout>
  );
};

export default SubscribersPage;
