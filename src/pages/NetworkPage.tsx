import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Router, Wifi, Settings, Terminal, CheckCircle, XCircle, Info, Loader2, Eye, EyeOff, Save, Cloud, Monitor } from "lucide-react";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNetworkConfiguration, TestMode } from "@/hooks/useNetworkConfiguration";
import { useAuth } from "@/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const networkConfigSchema = z.object({
  router_type: z.enum(["mikrotik-api", "mikrotik-radius", "none"]),
  connection_mode: z.enum(["hotspot", "pppoe", "ip-queue", "none"]),
  router_host: z.string().min(1, "Router host is required").max(255),
  api_port: z.coerce.number().min(1, "Port must be at least 1").max(65535, "Port must be at most 65535"),
  username: z.string().min(1, "Username is required").max(100),
  password: z.string().min(1, "Password is required").max(255),
  test_mode: z.enum(["cloud", "local"]),
});

type NetworkConfigFormValues = z.infer<typeof networkConfigSchema>;

const NetworkPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { currentTenant } = useAuth();
  const {
    config,
    isLoading,
    saveConfig,
    isSaving,
    testConnection,
    isTesting,
    hasConfig,
  } = useNetworkConfiguration();

  const form = useForm<NetworkConfigFormValues>({
    resolver: zodResolver(networkConfigSchema),
    defaultValues: {
      router_type: "mikrotik-api",
      connection_mode: "pppoe",
      router_host: "",
      api_port: 8728,
      username: "",
      password: "",
      test_mode: "cloud",
    },
  });

  // Populate form when config loads
  useEffect(() => {
    if (config) {
      form.reset({
        router_type: config.router_type as NetworkConfigFormValues["router_type"],
        connection_mode: config.connection_mode as NetworkConfigFormValues["connection_mode"],
        router_host: config.router_host || "",
        api_port: config.api_port || 8728,
        username: config.username || "",
        password: config.password || "",
        test_mode: (config.test_mode as TestMode) || "cloud",
      });
    }
  }, [config, form]);

  const onSubmit = (values: NetworkConfigFormValues) => {
    saveConfig({
      router_type: values.router_type,
      connection_mode: values.connection_mode,
      router_host: values.router_host,
      api_port: values.api_port,
      username: values.username,
      password: values.password,
      test_mode: values.test_mode,
    });
  };

  const handleTestConnection = () => {
    if (!hasConfig) {
      form.handleSubmit((values: NetworkConfigFormValues) => {
        saveConfig({
          router_type: values.router_type,
          connection_mode: values.connection_mode,
          router_host: values.router_host,
          api_port: values.api_port,
          username: values.username,
          password: values.password,
          test_mode: values.test_mode,
        });
      })();
    } else {
      testConnection();
    }
  };

  const currentTestMode = form.watch("test_mode");

  const isConnected = config?.is_connected ?? false;
  const isDirty = form.formState.isDirty;

  return (
    <SidebarLayout>
      <PageHeader
        title="Network Integration"
        description={`Configure router and Mikrotik integration settings${currentTenant ? ` for ${currentTenant.name}` : ""}.`}
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Router Configuration */}
            <div className="lg:col-span-2">
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Router className="h-5 w-5 text-accent" />
                    Router Configuration
                  </CardTitle>
                  <CardDescription>
                    Configure your Mikrotik router connection settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-10 w-full" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="router_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Router Type</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="mikrotik-api">Mikrotik API</SelectItem>
                                <SelectItem value="mikrotik-radius">Mikrotik RADIUS</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="connection_mode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Connection Mode</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="hotspot">Hotspot</SelectItem>
                                <SelectItem value="pppoe">PPPoE</SelectItem>
                                <SelectItem value="ip-queue">IP Queue Mode</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="router_host"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Router Host/IP</FormLabel>
                            <FormControl>
                              <Input placeholder="192.168.88.1" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="api_port"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>API Port</FormLabel>
                            <FormControl>
                              <Input type="number" placeholder="8728" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="admin" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type={showPassword ? "text" : "password"}
                                  placeholder="••••••••"
                                  {...field}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  {showPassword ? (
                                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                                  ) : (
                                    <Eye className="h-4 w-4 text-muted-foreground" />
                                  )}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  {/* Testing Mode Selector */}
                  <div className="pt-4 border-t border-border">
                    <FormField
                      control={form.control}
                      name="test_mode"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Testing Mode
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="grid gap-3 md:grid-cols-2"
                            >
                              <label
                                htmlFor="cloud"
                                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                  field.value === 'cloud'
                                    ? 'border-accent bg-accent/5'
                                    : 'border-border hover:border-muted-foreground/50'
                                }`}
                              >
                                <RadioGroupItem value="cloud" id="cloud" className="mt-0.5" />
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 font-medium">
                                    <Cloud className="h-4 w-4 text-accent" />
                                    Cloud Testing
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Test via cloud servers. Requires router to have a public IP or be exposed via port forwarding.
                                  </p>
                                </div>
                              </label>
                              <label
                                htmlFor="local"
                                className={`flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-colors ${
                                  field.value === 'local'
                                    ? 'border-accent bg-accent/5'
                                    : 'border-border hover:border-muted-foreground/50'
                                }`}
                              >
                                <RadioGroupItem value="local" id="local" className="mt-0.5" />
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 font-medium">
                                    <Monitor className="h-4 w-4 text-accent" />
                                    Local Testing
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    Test directly from your browser. Works when you're on the same network as the router.
                                  </p>
                                </div>
                              </label>
                            </RadioGroup>
                          </FormControl>
                          {currentTestMode === 'local' && (
                            <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                              <Info className="h-3 w-3" />
                              Local testing only checks reachability. For full API testing, use Cloud mode with a public IP.
                            </p>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full transition-colors ${
                          isConnected ? "bg-success animate-pulse-subtle" : "bg-destructive"
                        }`}
                      />
                      <span className="text-sm font-medium">
                        {isConnected ? "Connected" : hasConfig ? "Disconnected" : "Not Configured"}
                      </span>
                      {isDirty && (
                        <Badge variant="outline" className="text-xs">
                          Unsaved changes
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        variant="outline"
                        disabled={isSaving || isLoading}
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            Save Settings
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        variant="accent"
                        onClick={handleTestConnection}
                        disabled={isTesting || isSaving || isLoading}
                      >
                        {isTesting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Testing...
                          </>
                        ) : (
                          <>
                            <Wifi className="h-4 w-4" />
                            Test Connection
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Status & Info Panel */}
            <div className="space-y-6">
              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5 text-accent" />
                    Connection Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-5 w-16" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Router</span>
                        {isConnected ? (
                          <Badge variant="success" className="gap-1">
                            <CheckCircle className="h-3 w-3" />
                            Online
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="h-3 w-3" />
                            {hasConfig ? "Offline" : "Not Set"}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">API Version</span>
                        <span className="text-sm font-medium">
                          {config?.api_version || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Active Sessions</span>
                        <span className="text-sm font-medium">
                          {config?.active_sessions ?? "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Last Sync</span>
                        <span className="text-sm font-medium">
                          {config?.last_sync_at
                            ? formatDistanceToNow(new Date(config.last_sync_at), { addSuffix: true })
                            : "Never"}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border shadow-card">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Info className="h-5 w-5 text-accent" />
                    Quick Guide
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Mikrotik API:</strong> Direct connection to your router via the API port. Best for real-time management.
                  </p>
                  <p>
                    <strong className="text-foreground">RADIUS:</strong> Use FreeRADIUS for authentication. Ideal for large deployments.
                  </p>
                  <p>
                    <strong className="text-foreground">PPPoE:</strong> Point-to-Point Protocol over Ethernet. Most common for ISP connections.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>

      {/* Example Commands */}
      <Card className="mt-6 border-border shadow-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Terminal className="h-5 w-5 text-accent" />
            Example Mikrotik Commands
          </CardTitle>
          <CardDescription>
            These commands are automatically executed when managing subscribers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Add PPPoE Secret</Label>
              <pre className="bg-primary text-primary-foreground p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`/ppp secret add \\
  name="john.kamau@isp" \\
  password="secure123" \\
  service=pppoe \\
  profile=Premium_50Mbps \\
  local-address=10.0.0.1 \\
  remote-address=10.0.0.101`}
              </pre>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Disable User (Suspend)</Label>
              <pre className="bg-primary text-primary-foreground p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`/ppp secret set \\
  [find name="john.kamau@isp"] \\
  disabled=yes

# Or remove active session:
/ppp active remove \\
  [find name="john.kamau@isp"]`}
              </pre>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Create Bandwidth Profile</Label>
              <pre className="bg-primary text-primary-foreground p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`/ppp profile add \\
  name="Premium_50Mbps" \\
  local-address=10.0.0.1 \\
  rate-limit="50M/50M" \\
  only-one=yes`}
              </pre>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Check Active Connections</Label>
              <pre className="bg-primary text-primary-foreground p-4 rounded-lg text-xs font-mono overflow-x-auto">
{`/ppp active print \\
  where name="john.kamau@isp"

# Get connection details:
/interface pppoe-server \\
  monitor [find user="john.kamau@isp"]`}
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>
    </SidebarLayout>
  );
};

export default NetworkPage;
