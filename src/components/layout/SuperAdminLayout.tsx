import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Building2,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  Shield,
  LogOut,
  User,
  Activity,
  ArrowLeftRight,
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

const superAdminNavItems = [
  { label: "Platform Overview", path: "/super-admin", icon: LayoutDashboard },
  { label: "Tenants", path: "/super-admin/tenants", icon: Building2 },
  { label: "All Users", path: "/super-admin/users", icon: Users },
  { label: "Audit Logs", path: "/super-admin/audit", icon: Activity },
  { label: "Platform Settings", path: "/super-admin/settings", icon: Settings },
];

interface SuperAdminLayoutProps {
  children: React.ReactNode;
}

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { profile, roles, signOut } = useAuth();

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

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar - Dark with amber/orange accent */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 h-screen transition-all duration-300 ease-in-out bg-gradient-to-b from-slate-950 via-slate-900 to-amber-950/30 border-r border-amber-500/10",
          collapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo with amber accent */}
          <div className="flex h-16 items-center justify-between px-4 border-b border-amber-500/20 bg-amber-500/5">
            {!collapsed && (
              <div className="flex items-center gap-2 animate-fade-in">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-semibold text-white">NetFlow</span>
                  <span className="text-xs font-medium text-amber-400">Platform Admin</span>
                </div>
              </div>
            )}
            {collapsed && (
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 mx-auto">
                <Shield className="h-5 w-5 text-white" />
              </div>
            )}
          </div>

          {/* Switch to Tenant View */}
          {!collapsed && (
            <div className="px-3 py-3 border-b border-amber-500/10">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/")}
                className="w-full justify-start gap-2 border-amber-500/20 bg-amber-500/5 text-amber-100 hover:bg-amber-500/10 hover:text-white hover:border-amber-500/30"
              >
                <ArrowLeftRight className="h-4 w-4 text-amber-400" />
                Switch to Tenant View
              </Button>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
            {superAdminNavItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400 border-l-2 border-amber-500"
                      : "text-slate-400 hover:bg-amber-500/10 hover:text-amber-200"
                  )}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive ? "text-amber-400" : "text-slate-500")} />
                  {!collapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-amber-500/20 p-2 bg-amber-500/5">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-slate-300 hover:bg-amber-500/10 hover:text-white",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <Avatar className="h-8 w-8 ring-2 ring-amber-500/30">
                    <AvatarImage src={profile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-semibold">
                      {getInitials(profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  {!collapsed && (
                    <div className="flex flex-col items-start text-left overflow-hidden">
                      <span className="text-sm font-medium truncate w-full text-white">
                        {profile?.full_name || profile?.email}
                      </span>
                      <span className="text-xs text-amber-400 font-medium truncate w-full">
                        Platform Admin
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
                    <Badge className="text-xs w-fit mt-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0">
                      Super Admin
                    </Badge>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/super-admin/settings")}>
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
              className="w-full justify-center text-amber-200/70 hover:text-amber-100 hover:bg-amber-500/10 mt-2"
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
        <div className="min-h-screen p-6 bg-slate-50">{children}</div>
      </main>
    </div>
  );
}
