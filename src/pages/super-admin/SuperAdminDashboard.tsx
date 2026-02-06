import { useEffect, useState } from "react";
import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Activity,
  TrendingUp,
  Plus,
  ArrowRight,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PlatformStats {
  totalTenants: number;
  activeTenants: number;
  totalUsers: number;
  recentSignups: number;
}

interface RecentTenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  member_count: number;
}

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStats>({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    recentSignups: 0,
  });
  const [recentTenants, setRecentTenants] = useState<RecentTenant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlatformData();
  }, []);

  const fetchPlatformData = async () => {
    try {
      // Fetch tenants
      const { data: tenants, error: tenantsError } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });

      if (tenantsError) throw tenantsError;

      // Fetch all users count
      const { count: usersCount, error: usersError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      if (usersError) throw usersError;

      // Fetch recent signups (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { count: recentCount, error: recentError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .gte("created_at", sevenDaysAgo.toISOString());

      if (recentError) throw recentError;

      // Fetch tenant member counts
      const tenantsWithCounts = await Promise.all(
        (tenants || []).slice(0, 5).map(async (tenant) => {
          const { count } = await supabase
            .from("tenant_members")
            .select("*", { count: "exact", head: true })
            .eq("tenant_id", tenant.id);
          return { ...tenant, member_count: count || 0 };
        })
      );

      setStats({
        totalTenants: tenants?.length || 0,
        activeTenants: tenants?.filter((t) => t.is_active).length || 0,
        totalUsers: usersCount || 0,
        recentSignups: recentCount || 0,
      });

      setRecentTenants(tenantsWithCounts);
    } catch (error) {
      console.error("Error fetching platform data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Platform Admin Context Banner */}
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-500/20 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-amber-500/20">
              <Shield className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-amber-700">Platform Administration</span>
                <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/30 hover:bg-amber-500/30">
                  Super Admin
                </Badge>
              </div>
              <p className="text-xs text-amber-600/80">
                You have full access to manage all tenants, users, and platform settings
              </p>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-slate-900">Platform Overview</h1>
            </div>
            <p className="text-slate-600">
              Monitor and manage the multi-tenant ISP billing platform across all organizations
            </p>
          </div>
          <Button onClick={() => navigate("/super-admin/tenants")} className="gap-2 bg-amber-600 hover:bg-amber-700">
            <Plus className="h-4 w-4" />
            Create Tenant
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Tenants</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalTenants}</p>
                </div>
                <div className="rounded-xl bg-blue-100 p-3">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Active Tenants</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.activeTenants}</p>
                </div>
                <div className="rounded-xl bg-emerald-100 p-3">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                </div>
                <div className="rounded-xl bg-purple-100 p-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Recent Signups</p>
                  <p className="text-3xl font-bold text-amber-600">{stats.recentSignups}</p>
                  <p className="text-xs text-slate-500">Last 7 days</p>
                </div>
                <div className="rounded-xl bg-amber-100 p-3">
                  <TrendingUp className="h-6 w-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tenants */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-slate-900">Recent Tenants</CardTitle>
              <CardDescription>Latest organizations on the platform</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/super-admin/tenants")}>
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-slate-500">Loading...</div>
            ) : recentTenants.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <p className="text-slate-600 font-medium">No tenants yet</p>
                <p className="text-sm text-slate-500 mb-4">
                  Create your first tenant to get started
                </p>
                <Button onClick={() => navigate("/super-admin/tenants")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Tenant
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                    onClick={() => navigate(`/super-admin/tenants`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-slate-200 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{tenant.name}</p>
                        <p className="text-sm text-slate-500">{tenant.slug}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-slate-600">
                          {tenant.member_count} {tenant.member_count === 1 ? "member" : "members"}
                        </p>
                      </div>
                      <Badge variant={tenant.is_active ? "default" : "secondary"}>
                        {tenant.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card
            className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/super-admin/tenants")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-blue-100 p-3">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Manage Tenants</p>
                  <p className="text-sm text-slate-500">Create and configure ISP organizations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/super-admin/users")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-purple-100 p-3">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">User Management</p>
                  <p className="text-sm text-slate-500">View and manage platform users</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate("/super-admin/audit")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-amber-100 p-3">
                  <Activity className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Audit Logs</p>
                  <p className="text-sm text-slate-500">Monitor platform activity</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
