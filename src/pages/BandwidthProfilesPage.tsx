import { useState } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Gauge,
  Plus,
  Edit,
  Trash2,
  Zap,
  ArrowUp,
  ArrowDown,
  Package,
  Users,
  Activity,
} from "lucide-react";

const mockProfiles = [
  {
    id: "BP001",
    name: "Basic 10Mbps",
    downloadSpeed: 10,
    uploadSpeed: 5,
    burstDownload: 15,
    burstUpload: 8,
    burstThreshold: 80,
    burstTime: 30,
    priority: "Normal",
    assignedPackages: ["Home Basic"],
    subscribers: 245,
    status: "Active",
  },
  {
    id: "BP002",
    name: "Standard 25Mbps",
    downloadSpeed: 25,
    uploadSpeed: 10,
    burstDownload: 35,
    burstUpload: 15,
    burstThreshold: 75,
    burstTime: 45,
    priority: "Normal",
    assignedPackages: ["Home Standard", "Business Lite"],
    subscribers: 512,
    status: "Active",
  },
  {
    id: "BP003",
    name: "Premium 50Mbps",
    downloadSpeed: 50,
    uploadSpeed: 25,
    burstDownload: 75,
    burstUpload: 40,
    burstThreshold: 70,
    burstTime: 60,
    priority: "High",
    assignedPackages: ["Home Premium"],
    subscribers: 328,
    status: "Active",
  },
  {
    id: "BP004",
    name: "Business 100Mbps",
    downloadSpeed: 100,
    uploadSpeed: 50,
    burstDownload: 150,
    burstUpload: 75,
    burstThreshold: 65,
    burstTime: 90,
    priority: "High",
    assignedPackages: ["Business Pro", "Enterprise Basic"],
    subscribers: 89,
    status: "Active",
  },
  {
    id: "BP005",
    name: "Enterprise 200Mbps",
    downloadSpeed: 200,
    uploadSpeed: 100,
    burstDownload: 250,
    burstUpload: 125,
    burstThreshold: 60,
    burstTime: 120,
    priority: "Critical",
    assignedPackages: ["Enterprise Plus"],
    subscribers: 24,
    status: "Active",
  },
  {
    id: "BP006",
    name: "Suspended Profile",
    downloadSpeed: 0.5,
    uploadSpeed: 0.25,
    burstDownload: 0,
    burstUpload: 0,
    burstThreshold: 0,
    burstTime: 0,
    priority: "Low",
    assignedPackages: [],
    subscribers: 67,
    status: "System",
  },
];

const mockPackages = [
  { id: "PKG001", name: "Home Basic", price: 29.99 },
  { id: "PKG002", name: "Home Standard", price: 49.99 },
  { id: "PKG003", name: "Home Premium", price: 79.99 },
  { id: "PKG004", name: "Business Lite", price: 99.99 },
  { id: "PKG005", name: "Business Pro", price: 149.99 },
  { id: "PKG006", name: "Enterprise Basic", price: 249.99 },
  { id: "PKG007", name: "Enterprise Plus", price: 399.99 },
];

export default function BandwidthProfilesPage() {
  const [burstEnabled, setBurstEnabled] = useState(true);
  const [fairUsageEnabled, setFairUsageEnabled] = useState(true);

  const totalSubscribers = mockProfiles.reduce((sum, p) => sum + p.subscribers, 0);
  const activeProfiles = mockProfiles.filter((p) => p.status === "Active").length;

  return (
    <SidebarLayout>
      <div className="space-y-6">
        <PageHeader
          title="Bandwidth Profiles"
          description="Manage speed tiers, burst settings, and package assignments"
        />

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Gauge className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Profiles</p>
                  <p className="text-2xl font-bold">{mockProfiles.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                  <Activity className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Profiles</p>
                  <p className="text-2xl font-bold">{activeProfiles}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                  <Users className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Subscribers</p>
                  <p className="text-2xl font-bold">{totalSubscribers.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                  <Package className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Linked Packages</p>
                  <p className="text-2xl font-bold">{mockPackages.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Global Burst Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Global Burst Settings
              </CardTitle>
              <CardDescription>
                Configure burst behavior across all profiles
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Burst Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow temporary speed boosts
                  </p>
                </div>
                <Switch checked={burstEnabled} onCheckedChange={setBurstEnabled} />
              </div>

              <div className="space-y-2">
                <Label>Default Burst Multiplier</Label>
                <Select defaultValue="1.5">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1.25">1.25x Base Speed</SelectItem>
                    <SelectItem value="1.5">1.5x Base Speed</SelectItem>
                    <SelectItem value="2.0">2.0x Base Speed</SelectItem>
                    <SelectItem value="custom">Custom per Profile</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Max Burst Duration (seconds)</Label>
                <Input type="number" defaultValue="60" />
              </div>

              <div className="space-y-2">
                <Label>Burst Cooldown Period (minutes)</Label>
                <Input type="number" defaultValue="5" />
              </div>
            </CardContent>
          </Card>

          {/* Fair Usage Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Fair Usage Policy
              </CardTitle>
              <CardDescription>
                Manage bandwidth caps and throttling rules
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable FUP</Label>
                  <p className="text-sm text-muted-foreground">
                    Apply fair usage limits
                  </p>
                </div>
                <Switch checked={fairUsageEnabled} onCheckedChange={setFairUsageEnabled} />
              </div>

              <div className="space-y-2">
                <Label>Monthly Data Cap (GB)</Label>
                <Input type="number" defaultValue="500" />
              </div>

              <div className="space-y-2">
                <Label>Post-FUP Speed Reduction</Label>
                <Select defaultValue="50">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="25">25% of Base Speed</SelectItem>
                    <SelectItem value="50">50% of Base Speed</SelectItem>
                    <SelectItem value="75">75% of Base Speed</SelectItem>
                    <SelectItem value="unlimited">No Reduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>FUP Reset Day</Label>
                <Select defaultValue="1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1st of Month</SelectItem>
                    <SelectItem value="15">15th of Month</SelectItem>
                    <SelectItem value="billing">Billing Cycle</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* QoS Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                QoS Configuration
              </CardTitle>
              <CardDescription>
                Quality of Service and traffic prioritization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Traffic Shaping Method</Label>
                <Select defaultValue="htb">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="htb">HTB (Hierarchical Token Bucket)</SelectItem>
                    <SelectItem value="hfsc">HFSC (Hierarchical Fair Service)</SelectItem>
                    <SelectItem value="simple">Simple Queue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Priority Queues</Label>
                <Select defaultValue="8">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4">4 Queues</SelectItem>
                    <SelectItem value="8">8 Queues</SelectItem>
                    <SelectItem value="16">16 Queues</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Contention Ratio</Label>
                <Select defaultValue="20:1">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10:1">10:1 (Premium)</SelectItem>
                    <SelectItem value="20:1">20:1 (Standard)</SelectItem>
                    <SelectItem value="50:1">50:1 (Economy)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full mt-2" variant="outline">
                Advanced QoS Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Bandwidth Profiles Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Bandwidth Profiles</CardTitle>
              <CardDescription>
                Speed tiers and their configurations
              </CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Bandwidth Profile</DialogTitle>
                  <DialogDescription>
                    Define a new speed tier with upload/download limits and burst settings
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Profile Name</Label>
                      <Input placeholder="e.g., Premium 100Mbps" />
                    </div>
                    <div className="space-y-2">
                      <Label>Priority Level</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ArrowDown className="h-4 w-4 text-green-500" />
                        Download Speed (Mbps)
                      </Label>
                      <Input type="number" placeholder="100" />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ArrowUp className="h-4 w-4 text-blue-500" />
                        Upload Speed (Mbps)
                      </Label>
                      <Input type="number" placeholder="50" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Burst Download (Mbps)</Label>
                      <Input type="number" placeholder="150" />
                    </div>
                    <div className="space-y-2">
                      <Label>Burst Upload (Mbps)</Label>
                      <Input type="number" placeholder="75" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Burst Threshold (%)</Label>
                      <Input type="number" placeholder="70" />
                    </div>
                    <div className="space-y-2">
                      <Label>Burst Time (seconds)</Label>
                      <Input type="number" placeholder="60" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Assign to Packages</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select packages" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPackages.map((pkg) => (
                          <SelectItem key={pkg.id} value={pkg.id}>
                            {pkg.name} - ${pkg.price}/mo
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Profile</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Profile Name</TableHead>
                  <TableHead>Download / Upload</TableHead>
                  <TableHead>Burst (Down / Up)</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Assigned Packages</TableHead>
                  <TableHead>Subscribers</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="font-medium">{profile.name}</div>
                      <div className="text-xs text-muted-foreground">{profile.id}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ArrowDown className="h-3 w-3 text-green-500" />
                        <span>{profile.downloadSpeed} Mbps</span>
                        <span className="text-muted-foreground">/</span>
                        <ArrowUp className="h-3 w-3 text-blue-500" />
                        <span>{profile.uploadSpeed} Mbps</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {profile.burstDownload > 0 ? (
                        <div className="text-sm">
                          {profile.burstDownload} / {profile.burstUpload} Mbps
                          <div className="text-xs text-muted-foreground">
                            {profile.burstTime}s @ {profile.burstThreshold}%
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">No burst</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          profile.priority === "Critical"
                            ? "destructive"
                            : profile.priority === "High"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {profile.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {profile.assignedPackages.length > 0 ? (
                          profile.assignedPackages.map((pkg) => (
                            <Badge key={pkg} variant="outline" className="text-xs">
                              {pkg}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        {profile.subscribers}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={profile.status === "Active" ? "default" : "secondary"}
                        className={
                          profile.status === "Active"
                            ? "bg-green-500/10 text-green-600 hover:bg-green-500/20"
                            : ""
                        }
                      >
                        {profile.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Package Assignment Matrix */}
        <Card>
          <CardHeader>
            <CardTitle>Package-Profile Assignment</CardTitle>
            <CardDescription>
              View and manage which bandwidth profiles are assigned to each package
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {mockPackages.map((pkg) => {
                const assignedProfile = mockProfiles.find((p) =>
                  p.assignedPackages.includes(pkg.name)
                );
                return (
                  <div
                    key={pkg.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <div className="font-medium">{pkg.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ${pkg.price}/month
                      </div>
                    </div>
                    <div className="text-right">
                      {assignedProfile ? (
                        <>
                          <Badge variant="outline">{assignedProfile.name}</Badge>
                          <div className="text-xs text-muted-foreground mt-1">
                            {assignedProfile.downloadSpeed}/{assignedProfile.uploadSpeed} Mbps
                          </div>
                        </>
                      ) : (
                        <Badge variant="secondary">Unassigned</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
}
