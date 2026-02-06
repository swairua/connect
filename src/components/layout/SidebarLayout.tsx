import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Receipt,
  CreditCard,
  Network,
  Ticket,
  Settings,
  Globe,
  Wifi,
  ChevronLeft,
  ChevronRight,
  Package,
  MessageSquare,
  BarChart3,
  Link as LinkIcon,
  ShieldCheck,
  Shield,
  LogOut,
  User,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Subscribers", path: "/subscribers", icon: Users },
  { label: "Service Plans", path: "/service-plans", icon: Package },
  { label: "Billing", path: "/billing", icon: Receipt },
  { label: "Payments", path: "/payments", icon: CreditCard },
  { label: "Reconciliation", path: "/reconciliation", icon: LinkIcon },
  { label: "Reports", path: "/reports", icon: BarChart3 },
  { label: "Notifications", path: "/notifications", icon: MessageSquare },
  { label: "Network Integration", path: "/network", icon: Network },
  { label: "SmartOLT", path: "/network/smartolt", icon: Wifi },
  { label: "RADIUS Server", path: "/network/radius", icon: Network },
  { label: "IPAM", path: "/network/ipam", icon: Globe },
  { label: "Bandwidth Profiles", path: "/network/bandwidth", icon: Wifi },
  { label: "Tickets", path: "/tickets", icon: Ticket },
  { label: "Settings", path: "/settings", icon: Settings },
];

// Tenant admin items - visible to admin/manager roles within the tenant
const tenantAdminItems = [
  { label: "Team & Roles", path: "/admin", icon: ShieldCheck },
];

interface SidebarLayoutProps {
  children: React.ReactNode;
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, roles, isSuperAdmin, currentTenant, tenants, setCurrentTenant, signOut, hasTenantRole } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "super_admin":
        return "destructive";
      case "admin":
        return "default";
      case "manager":
        return "secondary";
      default:
        return "outline";
    }
  };

  // Determine which items to show based on roles
  const canManageTeam = isSuperAdmin || hasTenantRole('admin') || hasTenantRole('manager');
  
  const allNavItems = [
    ...navItems,
    { label: "Customer Portal", path: "/portal", icon: Globe },
    ...(canManageTeam ? tenantAdminItems : []),
    ...(isSuperAdmin ? [{ label: "Platform Admin", path: "/super-admin", icon: Shield }] : []),
  ];

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out gradient-primary",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border">
            {!collapsed && (
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
                  <Wifi className="h-5 w-5 text-accent-foreground" />
                </div>
                <span className="text-lg font-semibold text-sidebar-foreground">NetFlow ISP</span>
              </div>
            )}
            {collapsed && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent mx-auto">
                <Wifi className="h-5 w-5 text-accent-foreground" />
              </div>
            )}
          </div>

          {/* Tenant Selector (if multiple tenants) */}
          {!collapsed && tenants.length > 1 && (
            <div className="px-3 py-2 border-b border-sidebar-border">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent">
                    <Building2 className="h-4 w-4" />
                    <span className="truncate">{currentTenant?.name || "Select Tenant"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  <DropdownMenuLabel>Switch Organization</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {tenants.map((tenant) => (
                    <DropdownMenuItem
                      key={tenant.id}
                      onClick={() => setCurrentTenant(tenant)}
                      className={cn(currentTenant?.id === tenant.id && "bg-accent")}
                    >
                      {tenant.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {allNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-muted hover:bg-sidebar-accent hover:text-sidebar-foreground"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive && "text-sidebar-primary")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-sidebar-border p-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex flex-col items-start text-left overflow-hidden">
                      <span className="text-sm font-medium truncate w-full">
                        {profile?.full_name || profile?.email}
                      </span>
                      <span className="text-xs text-sidebar-muted truncate w-full">
                        {roles[0]?.replace("_", " ") || "User"}
                      </span>
                    </div>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{profile?.email}</p>
                    <div className="flex gap-1 mt-1">
                      {roles.map((role) => (
                        <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                          {role.replace("_", " ")}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <User className="mr-2 h-4 w-4" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Collapse Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className="w-full justify-center text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent mt-2"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronLeft className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          "flex-1 transition-all duration-300 ease-in-out",
          collapsed ? "ml-16" : "ml-64"
        )}
      >
        <div className="min-h-screen p-6">{children}</div>
      </main>
    </div>
  );
}
