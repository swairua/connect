import { SuperAdminLayout } from "@/components/layout/SuperAdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Clock, Info } from "lucide-react";

// MVP placeholder - audit logs will be implemented with proper backend tracking
const mockAuditLogs = [
  {
    id: "1",
    timestamp: new Date().toISOString(),
    action: "Platform Initialized",
    details: "Multi-tenant ISP billing platform ready for tenants",
    level: "info",
  },
];

const AuditLogsPage = () => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SuperAdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-600 mt-1">
            Monitor platform activity and events
          </p>
        </div>

        {/* Info Banner */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <p className="font-medium text-blue-900">MVP Feature</p>
                <p className="text-sm text-blue-700">
                  Full audit logging with detailed tracking of user actions, tenant
                  operations, and system events will be implemented in a future update.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 rounded-lg bg-slate-50"
                >
                  <div className="rounded-full bg-blue-100 p-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-slate-900">{log.action}</p>
                      <Badge variant="outline" className="text-xs">
                        {log.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{log.details}</p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SuperAdminLayout>
  );
};

export default AuditLogsPage;
