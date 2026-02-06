import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Radio,
  Wifi,
  CheckCircle,
  XCircle,
  Settings,
  Zap,
  Shield,
  Eye,
  Clock,
  Activity,
  Info,
  RefreshCw,
  Save,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSmartOLTConfiguration } from "@/hooks/useSmartOLTConfiguration";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

// Mock event logs (will be replaced with real data in future)
const mockEventLogs = [
  { timestamp: "2024-01-15 14:32:18", event: "ONT Provisioned", details: "HWTC-A1B2C3D4 - John Kamau", type: "success" },
  { timestamp: "2024-01-15 14:28:45", event: "ONT Suspended", details: "ZTEG-Q7R8S9T0 - David Mwangi (Billing)", type: "warning" },
  { timestamp: "2024-01-15 14:15:22", event: "LOS Detected", details: "ZTEG-I9J0K1L2 - Peter Ochieng", type: "error" },
  { timestamp: "2024-01-15 13:55:10", event: "ONT Reactivated", details: "HWTC-M3N4O5P6 - Mary Akinyi", type: "success" },
  { timestamp: "2024-01-15 13:42:33", event: "Signal Warning", details: "ZTEG-Q7R8S9T0 - Low signal (-31.5 dBm)", type: "warning" },
  { timestamp: "2024-01-15 13:30:00", event: "Sync Completed", details: "45 ONTs synchronized", type: "info" },
];

const smartOLTConfigSchema = z.object({
  api_url: z.string().min(1, "API URL is required"),
  api_key: z.string().min(1, "API Key is required"),
  olt_device_id: z.string(),
  default_service_profile: z.string(),
  default_speed_profile: z.string(),
  auto_provision_enabled: z.boolean(),
  ont_password_pattern: z.string(),
  default_vlan: z.string(),
  billing_suspension_enabled: z.boolean(),
  suspend_method: z.string(),
  reactivate_method: z.string(),
});

type SmartOLTFormValues = z.infer<typeof smartOLTConfigSchema>;

const SmartOLTPage = () => {
  const { currentTenant } = useAuth();
  const tenantId = currentTenant?.id;
  const { 
    config, 
    isLoading, 
    isSaving, 
    isTestingConnection, 
    saveConfig, 
    testConnection,
    onts,
    totalONTs,
    isLoadingONTs,
    refreshONTs,
  } = useSmartOLTConfiguration(tenantId);

  const form = useForm<SmartOLTFormValues>({
    resolver: zodResolver(smartOLTConfigSchema),
    defaultValues: {
      api_url: "",
      api_key: "",
      olt_device_id: "",
      default_service_profile: "residential",
      default_speed_profile: "50mbps",
      auto_provision_enabled: false,
      ont_password_pattern: "ONT-{SERIAL}-ISP",
      default_vlan: "auto",
      billing_suspension_enabled: false,
      suspend_method: "disable_port",
      reactivate_method: "enable_port",
    },
  });

  // Update form when config loads
  React.useEffect(() => {
    if (config) {
      form.reset({
        api_url: config.api_url || "",
        api_key: config.api_key || "",
        olt_device_id: config.olt_device_id || "",
        default_service_profile: config.default_service_profile || "residential",
        default_speed_profile: config.default_speed_profile || "50mbps",
        auto_provision_enabled: config.auto_provision_enabled,
        ont_password_pattern: config.ont_password_pattern || "ONT-{SERIAL}-ISP",
        default_vlan: config.default_vlan || "auto",
        billing_suspension_enabled: config.billing_suspension_enabled,
        suspend_method: config.suspend_method || "disable_port",
        reactivate_method: config.reactivate_method || "enable_port",
      });
    }
  }, [config, form]);

  const onSubmit = (data: SmartOLTFormValues) => {
    saveConfig({
      api_url: data.api_url,
      api_key: data.api_key,
      olt_device_id: data.olt_device_id,
      default_service_profile: data.default_service_profile,
      default_speed_profile: data.default_speed_profile,
      auto_provision_enabled: data.auto_provision_enabled,
      ont_password_pattern: data.ont_password_pattern,
      default_vlan: data.default_vlan,
      billing_suspension_enabled: data.billing_suspension_enabled,
      suspend_method: data.suspend_method,
      reactivate_method: data.reactivate_method,
    });
  };

  const handleTestConnection = () => {
    const values = form.getValues();
    if (!values.api_url || !values.api_key) {
      form.setError("api_url", { message: "API URL is required for testing" });
      form.setError("api_key", { message: "API Key is required for testing" });
      return;
    }
    testConnection({
      api_url: values.api_url,
      api_key: values.api_key,
      olt_device_id: values.olt_device_id || undefined,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Online":
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />Online</Badge>;
      case "LOS":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />LOS</Badge>;
      case "Offline":
        return <Badge variant="secondary" className="gap-1"><XCircle className="h-3 w-3" />Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getEventBadge = (type: string) => {
    switch (type) {
      case "success":
        return <Badge variant="success">Provisioned</Badge>;
      case "warning":
        return <Badge variant="warning">Warning</Badge>;
      case "error":
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Info</Badge>;
    }
  };

  const getSignalColor = (signal: string) => {
    if (signal === "-") return "text-muted-foreground";
    const value = parseFloat(signal);
    if (value > -20) return "text-success";
    if (value > -25) return "text-warning";
    return "text-destructive";
  };

  const formatLastSync = () => {
    if (!config?.last_sync_at) return "Never";
    try {
      return formatDistanceToNow(new Date(config.last_sync_at), { addSuffix: true });
    } catch {
      return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <SidebarLayout>
        <PageHeader
          title="SmartOLT Integration"
          description="Configure GPON OLT integration for ONT provisioning and monitoring."
        />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </SidebarLayout>
    );
  }

  return (
    <SidebarLayout>
      <PageHeader
        title="SmartOLT Integration"
        description="Configure GPON OLT integration for ONT provisioning and monitoring."
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Integration Status Card */}
          <Card className="border-border shadow-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Radio className="h-5 w-5 text-accent" />
                Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full transition-colors ${
                        config?.is_connected ? "bg-success animate-pulse-subtle" : "bg-destructive"
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {config?.is_connected ? "Connected" : "Not Connected"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Last Sync: {formatLastSync()}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="accent"
                  onClick={handleTestConnection}
                  disabled={isTestingConnection}
                >
                  {isTestingConnection ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Testing...
                    </>
                  ) : (
                    <>
                      <Wifi className="h-4 w-4" />
                      Test SmartOLT Connection
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* API Configuration & Help */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-accent" />
                    SmartOLT API Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your SmartOLT platform connection settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="api_url"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SmartOLT API URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://api.smartolt.com/v1" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="api_key"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input type="password" placeholder="••••••••••••••••" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="olt_device_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OLT Device ID</FormLabel>
                          <FormControl>
                            <Input placeholder="OLT-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="default_service_profile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Default Service Profile</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="residential">Residential FTTH</SelectItem>
                              <SelectItem value="business">Business FTTH</SelectItem>
                              <SelectItem value="enterprise">Enterprise Premium</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="default_speed_profile"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Default Speed Profile</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="20mbps">20 Mbps (Basic)</SelectItem>
                              <SelectItem value="50mbps">50 Mbps (Standard)</SelectItem>
                              <SelectItem value="100mbps">100 Mbps (Premium)</SelectItem>
                              <SelectItem value="200mbps">200 Mbps (Ultra)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="flex justify-end pt-4 border-t border-border">
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Configuration
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Help Panel */}
            <Card className="border-border shadow-card h-fit">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Info className="h-5 w-5 text-accent" />
                  SmartOLT Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-muted-foreground">
                <div className="flex gap-3">
                  <Zap className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <p><strong className="text-foreground">ONT Provisioning:</strong> Automatically provision new ONTs with predefined templates and profiles.</p>
                </div>
                <div className="flex gap-3">
                  <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <p><strong className="text-foreground">Suspension Control:</strong> Suspend and reactivate ONTs based on billing status.</p>
                </div>
                <div className="flex gap-3">
                  <Activity className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <p><strong className="text-foreground">LOS Monitoring:</strong> Real-time Loss of Signal detection and alerts.</p>
                </div>
                <div className="flex gap-3">
                  <Eye className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <p><strong className="text-foreground">Signal Readings:</strong> Monitor optical power levels (dBm) for each ONT.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Auto-Provisioning & Suspension Rules */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* GPON Auto-Provisioning */}
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5 text-accent" />
                  Auto-Provisioning Settings
                </CardTitle>
                <CardDescription>
                  Configure automatic ONT provisioning rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="auto_provision_enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Enable Auto-Provisioning</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Automatically provision new ONTs when detected
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ont_password_pattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default ONT Password Pattern</FormLabel>
                      <FormControl>
                        <Input placeholder="ONT-{SERIAL}-ISP" {...field} />
                      </FormControl>
                      <p className="text-xs text-muted-foreground">
                        Use {'{SERIAL}'} as placeholder for ONT serial number
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="default_vlan"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Default VLAN / PON Port</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="auto">Auto-Assign</SelectItem>
                          <SelectItem value="vlan100">VLAN 100 (Residential)</SelectItem>
                          <SelectItem value="vlan200">VLAN 200 (Business)</SelectItem>
                          <SelectItem value="vlan300">VLAN 300 (VoIP)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <p>
                    When a new ONT is detected on the network, it will be automatically configured with the default service profile and speed settings above.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Suspension & Reactivation Rules */}
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  Suspension & Reactivation Rules
                </CardTitle>
                <CardDescription>
                  Configure billing-controlled suspension behavior
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="billing_suspension_enabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Billing-Controlled Suspension</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Auto-suspend when invoice is overdue
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="suspend_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Suspend Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="disable_port">Disable ONT</SelectItem>
                          <SelectItem value="block_profile">Block Profile</SelectItem>
                          <SelectItem value="zero_speed">Reduce to 0 Mbps</SelectItem>
                          <SelectItem value="isolation_vlan">Isolation VLAN</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reactivate_method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reactivate Method</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="enable_port">Enable ONT</SelectItem>
                          <SelectItem value="restore_profile">Restore Profile</SelectItem>
                          <SelectItem value="restore_speed">Restore Provisioned Speed</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="p-3 bg-muted/50 rounded-lg text-sm text-muted-foreground">
                  <p>
                    When a customer's payment is received, their ONT will be automatically reactivated using the selected method.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>

      {/* ONT Monitoring Table */}
      <Card className="border-border shadow-card mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                ONT Monitoring
                {totalONTs > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {totalONTs} devices
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Real-time status of connected ONT devices from SmartOLT
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshONTs}
              disabled={isLoadingONTs || !config?.is_connected}
            >
              {isLoadingONTs ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!config?.is_connected ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Wifi className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Not Connected</p>
              <p className="text-sm">Configure and test your SmartOLT connection to view ONT data.</p>
            </div>
          ) : isLoadingONTs && onts.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : onts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Radio className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No ONT Devices Found</p>
              <p className="text-sm">No ONT devices were returned from the SmartOLT API.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ONT Serial</TableHead>
                  <TableHead>Name / Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Signal Level</TableHead>
                  <TableHead>Uptime</TableHead>
                  <TableHead>PON Port</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {onts.map((ont) => (
                  <TableRow key={ont.serial}>
                    <TableCell className="font-mono text-sm">{ont.serial}</TableCell>
                    <TableCell className="font-medium">{ont.name || ont.description || '-'}</TableCell>
                    <TableCell>{getStatusBadge(ont.status)}</TableCell>
                    <TableCell className={`font-mono ${getSignalColor(ont.signal)}`}>
                      {ont.signal !== "-" ? `${ont.signal} dBm` : "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{ont.uptime}</TableCell>
                    <TableCell className="text-muted-foreground font-mono text-sm">{ont.pon_port || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Event Logs */}
      <Card className="border-border shadow-card mt-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-accent" />
            Event Logs
          </CardTitle>
          <CardDescription>
            Recent SmartOLT integration events and activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockEventLogs.map((log, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-xs text-muted-foreground font-mono w-36 shrink-0">
                    {log.timestamp}
                  </span>
                  {getEventBadge(log.type)}
                  <div>
                    <span className="font-medium">{log.event}</span>
                    <span className="text-muted-foreground ml-2">— {log.details}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
};

// Add missing React import for useEffect
import React from "react";

export default SmartOLTPage;
