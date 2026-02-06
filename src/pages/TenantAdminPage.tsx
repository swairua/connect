import { useState } from "react";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Users,
  Activity,
  Key,
  UserCog,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Lock,
  Unlock,
  Building2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

// Mock data for system users
const systemUsers = [
  {
    id: "USR001",
    name: "Admin User",
    email: "admin@netflowisp.com",
    role: "Super Admin",
    status: "Active",
    lastLogin: "2024-12-05 08:30:00",
    createdAt: "2023-01-15",
    twoFactorEnabled: true,
  },
  {
    id: "USR002",
    name: "John Manager",
    email: "john.manager@netflowisp.com",
    role: "Manager",
    status: "Active",
    lastLogin: "2024-12-04 14:22:00",
    createdAt: "2023-06-20",
    twoFactorEnabled: true,
  },
  {
    id: "USR003",
    name: "Sarah Support",
    email: "sarah.support@netflowisp.com",
    role: "Support Agent",
    status: "Active",
    lastLogin: "2024-12-05 09:15:00",
    createdAt: "2024-02-10",
    twoFactorEnabled: false,
  },
  {
    id: "USR004",
    name: "Mike Billing",
    email: "mike.billing@netflowisp.com",
    role: "Billing Admin",
    status: "Inactive",
    lastLogin: "2024-11-20 16:45:00",
    createdAt: "2023-09-05",
    twoFactorEnabled: false,
  },
  {
    id: "USR005",
    name: "Tech Network",
    email: "tech.network@netflowisp.com",
    role: "Network Admin",
    status: "Active",
    lastLogin: "2024-12-05 07:00:00",
    createdAt: "2023-04-12",
    twoFactorEnabled: true,
  },
];

const roles = [
  {
    id: "ROLE001",
    name: "Super Admin",
    description: "Full system access with all permissions",
    users: 1,
    permissions: ["all"],
  },
  {
    id: "ROLE002",
    name: "Manager",
    description: "Access to reports, subscribers, and billing management",
    users: 1,
    permissions: ["subscribers.view", "subscribers.edit", "billing.view", "billing.edit", "reports.view"],
  },
  {
    id: "ROLE003",
    name: "Support Agent",
    description: "Handle tickets and view subscriber information",
    users: 1,
    permissions: ["subscribers.view", "tickets.view", "tickets.edit", "tickets.create"],
  },
  {
    id: "ROLE004",
    name: "Billing Admin",
    description: "Manage invoices, payments, and billing settings",
    users: 1,
    permissions: ["billing.view", "billing.edit", "payments.view", "payments.edit", "invoices.create"],
  },
  {
    id: "ROLE005",
    name: "Network Admin",
    description: "Network infrastructure and device management",
    users: 1,
    permissions: ["network.view", "network.edit", "devices.view", "devices.edit"],
  },
];

const auditLogs = [
  {
    id: "LOG001",
    timestamp: "2024-12-05 09:30:15",
    user: "Admin User",
    action: "User Created",
    details: "Created new user: Sarah Support (sarah.support@netflowisp.com)",
    ipAddress: "192.168.1.100",
    status: "Success",
  },
  {
    id: "LOG002",
    timestamp: "2024-12-05 09:15:42",
    user: "John Manager",
    action: "Subscriber Updated",
    details: "Updated package for subscriber SUB003 from Basic to Premium",
    ipAddress: "192.168.1.105",
    status: "Success",
  },
  {
    id: "LOG003",
    timestamp: "2024-12-05 08:45:33",
    user: "Admin User",
    action: "Role Modified",
    details: "Added 'reports.export' permission to Manager role",
    ipAddress: "192.168.1.100",
    status: "Success",
  },
  {
    id: "LOG004",
    timestamp: "2024-12-05 08:30:00",
    user: "Admin User",
    action: "Login",
    details: "Successful login from Nairobi, Kenya",
    ipAddress: "192.168.1.100",
    status: "Success",
  },
  {
    id: "LOG005",
    timestamp: "2024-12-04 22:15:00",
    user: "Unknown",
    action: "Login Attempt",
    details: "Failed login attempt for admin@netflowisp.com",
    ipAddress: "203.45.67.89",
    status: "Failed",
  },
  {
    id: "LOG006",
    timestamp: "2024-12-04 18:30:22",
    user: "Mike Billing",
    action: "Invoice Created",
    details: "Generated 45 invoices for December billing cycle",
    ipAddress: "192.168.1.110",
    status: "Success",
  },
  {
    id: "LOG007",
    timestamp: "2024-12-04 16:45:00",
    user: "Sarah Support",
    action: "Ticket Resolved",
    details: "Resolved ticket TKT-003: Billing inquiry",
    ipAddress: "192.168.1.108",
    status: "Success",
  },
  {
    id: "LOG008",
    timestamp: "2024-12-04 14:22:00",
    user: "John Manager",
    action: "Login",
    details: "Successful login from Nairobi, Kenya",
    ipAddress: "192.168.1.105",
    status: "Success",
  },
  {
    id: "LOG009",
    timestamp: "2024-12-04 11:00:15",
    user: "Tech Network",
    action: "Device Added",
    details: "Added new OLT device: OLT-WEST-002",
    ipAddress: "192.168.1.115",
    status: "Success",
  },
  {
    id: "LOG010",
    timestamp: "2024-12-04 09:30:00",
    user: "Admin User",
    action: "Settings Updated",
    details: "Updated SMS gateway configuration",
    ipAddress: "192.168.1.100",
    status: "Success",
  },
];

const permissionGroups = [
  {
    name: "Subscribers",
    permissions: [
      { key: "subscribers.view", label: "View Subscribers" },
      { key: "subscribers.create", label: "Create Subscribers" },
      { key: "subscribers.edit", label: "Edit Subscribers" },
      { key: "subscribers.delete", label: "Delete Subscribers" },
    ],
  },
  {
    name: "Billing",
    permissions: [
      { key: "billing.view", label: "View Billing" },
      { key: "billing.edit", label: "Edit Billing" },
      { key: "invoices.create", label: "Create Invoices" },
      { key: "invoices.void", label: "Void Invoices" },
    ],
  },
  {
    name: "Payments",
    permissions: [
      { key: "payments.view", label: "View Payments" },
      { key: "payments.edit", label: "Edit Payments" },
      { key: "payments.reconcile", label: "Reconcile Payments" },
    ],
  },
  {
    name: "Tickets",
    permissions: [
      { key: "tickets.view", label: "View Tickets" },
      { key: "tickets.create", label: "Create Tickets" },
      { key: "tickets.edit", label: "Edit Tickets" },
      { key: "tickets.delete", label: "Delete Tickets" },
    ],
  },
  {
    name: "Network",
    permissions: [
      { key: "network.view", label: "View Network" },
      { key: "network.edit", label: "Edit Network" },
      { key: "devices.view", label: "View Devices" },
      { key: "devices.edit", label: "Edit Devices" },
    ],
  },
  {
    name: "Reports",
    permissions: [
      { key: "reports.view", label: "View Reports" },
      { key: "reports.export", label: "Export Reports" },
    ],
  },
  {
    name: "Settings",
    permissions: [
      { key: "settings.view", label: "View Settings" },
      { key: "settings.edit", label: "Edit Settings" },
    ],
  },
];

const TenantAdminPage = () => {
  const [users, setUsers] = useState(systemUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [logFilter, setLogFilter] = useState("all");
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof systemUsers[0] | null>(null);
  const [editingRole, setEditingRole] = useState<typeof roles[0] | null>(null);
  const { toast } = useToast();
  const { currentTenant } = useAuth();

  const tenantName = currentTenant?.name || "Your Organization";

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = auditLogs.filter((log) => {
    if (logFilter === "all") return true;
    if (logFilter === "success") return log.status === "Success";
    if (logFilter === "failed") return log.status === "Failed";
    return true;
  });

  const handleSaveUser = () => {
    toast({
      title: editingUser ? "User Updated" : "User Created",
      description: editingUser
        ? "User account has been updated successfully."
        : "New user account has been created.",
    });
    setUserDialogOpen(false);
    setEditingUser(null);
  };

  const handleDeleteUser = (userId: string) => {
    setUsers(users.filter((u) => u.id !== userId));
    toast({
      title: "User Deleted",
      description: "User account has been removed.",
      variant: "destructive",
    });
  };

  const handleToggleUserStatus = (userId: string) => {
    setUsers(
      users.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "Active" ? "Inactive" : "Active" }
          : u
      )
    );
    toast({
      title: "Status Updated",
      description: "User status has been changed.",
    });
  };

  const handleSaveRole = () => {
    toast({
      title: editingRole ? "Role Updated" : "Role Created",
      description: "Role permissions have been saved.",
    });
    setRoleDialogOpen(false);
    setEditingRole(null);
  };

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.status === "Active").length,
    totalRoles: roles.length,
    recentLogins: auditLogs.filter((l) => l.action === "Login" && l.status === "Success").length,
  };

  return (
    <SidebarLayout>
      {/* Organization Admin Context Banner */}
      <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border border-primary/20 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/20">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-primary">{tenantName}</span>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
                Organization Admin
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Manage your team members, roles, and view activity within your organization
            </p>
          </div>
        </div>
      </div>

      <PageHeader
        title="Team & Roles"
        description={`Manage staff accounts and permissions for ${tenantName}`}
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <Users className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-success">{stats.activeUsers}</p>
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
                <p className="text-sm text-muted-foreground">Roles Defined</p>
                <p className="text-2xl font-bold">{stats.totalRoles}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <Shield className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border shadow-card">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recent Logins</p>
                <p className="text-2xl font-bold">{stats.recentLogins}</p>
              </div>
              <div className="rounded-lg bg-accent/10 p-3">
                <Activity className="h-5 w-5 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="space-y-6">
        <TabsList className="bg-muted p-1">
          <TabsTrigger value="users" className="gap-2">
            <UserCog className="h-4 w-4" />
            User Management
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="h-4 w-4" />
            Roles & Permissions
          </TabsTrigger>
          <TabsTrigger value="audit" className="gap-2">
            <Activity className="h-4 w-4" />
            Audit Logs
          </TabsTrigger>
        </TabsList>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="flex items-center justify-between gap-4">
            <Card className="flex-1 border-border shadow-card">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardContent>
            </Card>
            <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="accent" onClick={() => setEditingUser(null)}>
                  <Plus className="h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>{editingUser ? "Edit User" : "Create User"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name</Label>
                      <Input
                        placeholder="John"
                        defaultValue={editingUser?.name.split(" ")[0] || ""}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        placeholder="Doe"
                        defaultValue={editingUser?.name.split(" ")[1] || ""}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      placeholder="user@netflowisp.com"
                      defaultValue={editingUser?.email || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select defaultValue={editingUser?.role || ""}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.name}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {!editingUser && (
                    <div className="space-y-2">
                      <Label>Temporary Password</Label>
                      <Input type="password" placeholder="••••••••" />
                      <p className="text-xs text-muted-foreground">
                        User will be required to change password on first login
                      </p>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <div className="space-y-0.5">
                      <Label>Require 2FA</Label>
                      <p className="text-xs text-muted-foreground">
                        Enforce two-factor authentication
                      </p>
                    </div>
                    <Switch defaultChecked={editingUser?.twoFactorEnabled} />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setUserDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="accent" className="flex-1" onClick={handleSaveUser}>
                      {editingUser ? "Update User" : "Create User"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">2FA</TableHead>
                    <TableHead className="font-semibold">Last Login</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-accent/10 text-accent">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={user.role === "Super Admin" ? "default" : "secondary"}
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "success" : "secondary"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.twoFactorEnabled ? (
                          <div className="flex items-center gap-1 text-success">
                            <Lock className="h-4 w-4" />
                            <span className="text-sm">Enabled</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Unlock className="h-4 w-4" />
                            <span className="text-sm">Disabled</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {user.lastLogin}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingUser(user);
                              setUserDialogOpen(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleUserStatus(user.id)}
                          >
                            {user.status === "Active" ? (
                              <XCircle className="h-4 w-4 text-destructive" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-success" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.role === "Super Admin"}
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
        </TabsContent>

        {/* Roles & Permissions Tab */}
        <TabsContent value="roles" className="space-y-6">
          <div className="flex justify-end">
            <Dialog open={roleDialogOpen} onOpenChange={setRoleDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="accent" onClick={() => setEditingRole(null)}>
                  <Plus className="h-4 w-4" />
                  Create Role
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingRole ? "Edit Role" : "Create Role"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Role Name</Label>
                    <Input
                      placeholder="e.g., Sales Agent"
                      defaultValue={editingRole?.name || ""}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      placeholder="Brief description of this role"
                      defaultValue={editingRole?.description || ""}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label>Permissions</Label>
                    {permissionGroups.map((group) => (
                      <Card key={group.name} className="border-border">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm font-medium">{group.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="py-2">
                          <div className="grid grid-cols-2 gap-2">
                            {group.permissions.map((perm) => (
                              <div
                                key={perm.key}
                                className="flex items-center justify-between py-1"
                              >
                                <span className="text-sm">{perm.label}</span>
                                <Switch
                                  defaultChecked={editingRole?.permissions.includes(perm.key)}
                                />
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setRoleDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button variant="accent" className="flex-1" onClick={handleSaveRole}>
                      {editingRole ? "Update Role" : "Create Role"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {roles.map((role) => (
              <Card key={role.id} className="border-border shadow-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Shield className="h-4 w-4 text-accent" />
                        {role.name}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">{role.users} user{role.users !== 1 ? "s" : ""}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Permissions</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 4).map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                      {role.permissions.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 4} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingRole(role);
                        setRoleDialogOpen(true);
                      }}
                    >
                      <Edit2 className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-1" />
                      View Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Audit Logs Tab */}
        <TabsContent value="audit" className="space-y-6">
          <Card className="border-border shadow-card">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search audit logs..." className="pl-9" />
                </div>
                <Select value={logFilter} onValueChange={setLogFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Logs</SelectItem>
                    <SelectItem value="success">Success Only</SelectItem>
                    <SelectItem value="failed">Failed Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-card">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="font-semibold">Timestamp</TableHead>
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Action</TableHead>
                    <TableHead className="font-semibold">Details</TableHead>
                    <TableHead className="font-semibold">IP Address</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50">
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {log.timestamp}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            log.action.includes("Login")
                              ? "secondary"
                              : log.action.includes("Created")
                              ? "success"
                              : log.action.includes("Deleted")
                              ? "destructive"
                              : "outline"
                          }
                        >
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {log.details}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.ipAddress}</TableCell>
                      <TableCell>
                        {log.status === "Success" ? (
                          <div className="flex items-center gap-1 text-success">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm">Success</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-destructive">
                            <AlertTriangle className="h-4 w-4" />
                            <span className="text-sm">Failed</span>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </SidebarLayout>
  );
};

export default TenantAdminPage;
