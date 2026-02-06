import { useState } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Edit2, Trash2, Package, Users, DollarSign, Clock, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePackages } from "@/hooks/usePackages";

const bandwidthProfiles = [
  { id: "basic", name: "Basic 20Mbps", speed: "20/5 Mbps" },
  { id: "premium", name: "Premium 50Mbps", speed: "50/10 Mbps" },
  { id: "business", name: "Business 100Mbps", speed: "100/20 Mbps" },
  { id: "enterprise", name: "Enterprise 200Mbps", speed: "200/50 Mbps" },
];

const ServicePlansPage = () => {
  const [plans, setPlans] = useState(servicePlans);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<typeof servicePlans[0] | null>(null);
  const { toast } = useToast();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleSave = () => {
    toast({
      title: editingPlan ? "Plan Updated" : "Plan Created",
      description: editingPlan 
        ? "Service plan has been updated successfully."
        : "New service plan has been created.",
    });
    setDialogOpen(false);
    setEditingPlan(null);
  };

  const handleDelete = (planId: string) => {
    setPlans(plans.filter(p => p.id !== planId));
    toast({
      title: "Plan Deleted",
      description: "Service plan has been removed.",
      variant: "destructive",
    });
  };

  const totalStats = {
    totalPlans: plans.length,
    totalUsers: plans.reduce((a, b) => a + b.totalUsers, 0),
    activeUsers: plans.reduce((a, b) => a + b.activeUsers, 0),
    monthlyRevenue: plans.reduce((a, b) => a + (b.activeUsers * b.price), 0),
  };

  return (
    <SidebarLayout>
      <PageHeader
        title="Service Plans"
        description="Manage your internet service packages and pricing."
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Plans</p>
                <p className="text-2xl font-bold">{totalStats.totalPlans}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <Package className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
                <p className="text-2xl font-bold">{totalStats.totalUsers}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <Users className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Subscribers</p>
                <p className="text-2xl font-bold text-success">{totalStats.activeUsers}</p>
              </div>
              <div className="rounded-lg bg-success/10 p-3">
                <Users className="h-5 w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Monthly Revenue</p>
                <p className="text-2xl font-bold">{formatCurrency(totalStats.monthlyRevenue)}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="accent" onClick={() => setEditingPlan(null)}>
              <Plus className="h-4 w-4" />
              Create Plan
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingPlan ? "Edit Service Plan" : "Create Service Plan"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Plan Name</Label>
                <Input 
                  placeholder="e.g., Home Premium" 
                  defaultValue={editingPlan?.name || ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Bandwidth Profile</Label>
                <Select defaultValue={editingPlan?.bandwidthProfile || ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bandwidth profile" />
                  </SelectTrigger>
                  <SelectContent>
                    {bandwidthProfiles.map((profile) => (
                      <SelectItem key={profile.id} value={profile.name}>
                        {profile.name} ({profile.speed})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (KES)</Label>
                  <Input 
                    type="number" 
                    placeholder="5000" 
                    defaultValue={editingPlan?.price || ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Billing Cycle</Label>
                  <Select defaultValue={editingPlan?.billingCycle || "Monthly"}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Weekly">Weekly</SelectItem>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Grace Period (Days)</Label>
                <Input 
                  type="number" 
                  placeholder="5" 
                  defaultValue={editingPlan?.gracePeriod || ""}
                />
                <p className="text-xs text-muted-foreground">
                  Days allowed after expiry before suspension
                </p>
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="space-y-0.5">
                  <Label>Auto-Suspend</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically suspend after grace period
                  </p>
                </div>
                <Switch defaultChecked={editingPlan?.autoSuspend ?? true} />
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="accent" className="flex-1" onClick={handleSave}>
                  {editingPlan ? "Update Plan" : "Create Plan"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Plans Table */}
      <Card className="border-border shadow-card">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="font-semibold">Plan Name</TableHead>
                <TableHead className="font-semibold">Bandwidth Profile</TableHead>
                <TableHead className="font-semibold">Price</TableHead>
                <TableHead className="font-semibold">Billing Cycle</TableHead>
                <TableHead className="font-semibold text-center">Grace Period</TableHead>
                <TableHead className="font-semibold text-center">Auto-Suspend</TableHead>
                <TableHead className="font-semibold text-center">Subscribers</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{plan.bandwidthProfile}</Badge>
                  </TableCell>
                  <TableCell className="font-medium">{formatCurrency(plan.price)}</TableCell>
                  <TableCell>{plan.billingCycle}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {plan.gracePeriod} days
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {plan.autoSuspend ? (
                      <Badge variant="success">Enabled</Badge>
                    ) : (
                      <Badge variant="secondary">Disabled</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="text-success font-medium">{plan.activeUsers}</span>
                    <span className="text-muted-foreground"> / {plan.totalUsers}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingPlan(plan);
                          setDialogOpen(true);
                        }}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(plan.id)}
                      >
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
    </SidebarLayout>
  );
};

export default ServicePlansPage;
