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
  Server,
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Edit,
  RefreshCw,
  Wifi,
  Key,
  Database,
  Activity,
  Info,
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// Mock NAS clients
const mockNASClients = [
  { id: 1, name: "MikroTik-Main", ip: "192.168.88.1", secret: "••••••••", type: "Mikrotik", status: "Active", lastSeen: "2 min ago" },
  { id: 2, name: "MikroTik-Branch", ip: "192.168.89.1", secret: "••••••••", type: "Mikrotik", status: "Active", lastSeen: "5 min ago" },
  { id: 3, name: "Ubiquiti-AP1", ip: "192.168.90.10", secret: "••••••••", type: "Other", status: "Active", lastSeen: "1 min ago" },
  { id: 4, name: "Cisco-Core", ip: "10.0.0.1", secret: "••••••••", type: "Cisco", status: "Inactive", lastSeen: "3 days ago" },
];

// Mock authentication logs
const mockAuthLogs = [
  { timestamp: "2024-01-15 14:45:32", username: "john.kamau@isp", nasIp: "192.168.88.1", type: "Access-Accept", mac: "AA:BB:CC:DD:EE:01", reason: "Valid credentials" },
  { timestamp: "2024-01-15 14:44:18", username: "jane.wanjiku@isp", nasIp: "192.168.89.1", type: "Access-Accept", mac: "AA:BB:CC:DD:EE:02", reason: "Valid credentials" },
  { timestamp: "2024-01-15 14:43:55", username: "unknown_user", nasIp: "192.168.88.1", type: "Access-Reject", mac: "AA:BB:CC:DD:EE:03", reason: "User not found" },
  { timestamp: "2024-01-15 14:42:10", username: "peter.ochieng@isp", nasIp: "192.168.90.10", type: "Access-Accept", mac: "AA:BB:CC:DD:EE:04", reason: "Valid credentials" },
  { timestamp: "2024-01-15 14:41:30", username: "mary.akinyi@isp", nasIp: "192.168.88.1", type: "Access-Reject", mac: "AA:BB:CC:DD:EE:05", reason: "Account suspended" },
  { timestamp: "2024-01-15 14:40:22", username: "david.mwangi@isp", nasIp: "192.168.89.1", type: "Accounting-Start", mac: "AA:BB:CC:DD:EE:06", reason: "Session started" },
  { timestamp: "2024-01-15 14:38:15", username: "grace.njeri@isp", nasIp: "192.168.88.1", type: "Accounting-Stop", mac: "AA:BB:CC:DD:EE:07", reason: "Session ended (24h)" },
];

const RadiusPage = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isTesting, setIsTesting] = useState(false);
  const [enableAccounting, setEnableAccounting] = useState(true);
  const [enableCOA, setEnableCOA] = useState(true);
  const { toast } = useToast();

  const handleTestConnection = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setIsConnected(true);
      toast({
        title: "RADIUS Server Connected",
        description: "Successfully connected to FreeRADIUS server",
      });
    }, 1500);
  };

  const getAuthBadge = (type: string) => {
    switch (type) {
      case "Access-Accept":
        return <Badge variant="success" className="gap-1"><CheckCircle className="h-3 w-3" />Accept</Badge>;
      case "Access-Reject":
        return <Badge variant="destructive" className="gap-1"><XCircle className="h-3 w-3" />Reject</Badge>;
      case "Accounting-Start":
        return <Badge variant="outline" className="gap-1 text-accent border-accent"><Activity className="h-3 w-3" />Acct Start</Badge>;
      case "Accounting-Stop":
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" />Acct Stop</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    return status === "Active" 
      ? <Badge variant="success">Active</Badge>
      : <Badge variant="secondary">Inactive</Badge>;
  };

  return (
    <SidebarLayout>
      <PageHeader
        title="RADIUS Server Integration"
        description="Configure FreeRADIUS authentication and accounting settings."
      />

      <div className="space-y-6">
        {/* Connection Status Card */}
        <Card className="border-border shadow-card">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Server className="h-5 w-5 text-accent" />
              RADIUS Server Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full transition-colors ${
                      isConnected ? "bg-success animate-pulse-subtle" : "bg-destructive"
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Uptime: 45d 12h 33m</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Activity className="h-4 w-4" />
                  <span>Auth/min: 245</span>
                </div>
              </div>
              <Button
                variant="accent"
                onClick={handleTestConnection}
                disabled={isTesting}
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
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
          </CardContent>
        </Card>

        {/* RADIUS Configuration & Info */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="border-border shadow-card">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="h-5 w-5 text-accent" />
                  FreeRADIUS Configuration
                </CardTitle>
                <CardDescription>
                  Configure your RADIUS server connection and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>RADIUS Server Host</Label>
                    <Input placeholder="127.0.0.1" defaultValue="radius.netflow-isp.local" />
                  </div>
                  <div className="space-y-2">
                    <Label>Authentication Port</Label>
                    <Input placeholder="1812" defaultValue="1812" />
                  </div>
                  <div className="space-y-2">
                    <Label>Accounting Port</Label>
                    <Input placeholder="1813" defaultValue="1813" />
                  </div>
                  <div className="space-y-2">
                    <Label>CoA Port (Change of Authorization)</Label>
                    <Input placeholder="3799" defaultValue="3799" />
                  </div>
                  <div className="space-y-2">
                    <Label>Shared Secret</Label>
                    <Input type="password" placeholder="••••••••" defaultValue="radius_secret_key" />
                  </div>
                  <div className="space-y-2">
                    <Label>Database Backend</Label>
                    <Select defaultValue="mysql">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mysql">MySQL / MariaDB</SelectItem>
                        <SelectItem value="postgresql">PostgreSQL</SelectItem>
                        <SelectItem value="sqlite">SQLite</SelectItem>
                        <SelectItem value="ldap">LDAP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-border">
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Enable Accounting</Label>
                      <p className="text-xs text-muted-foreground">
                        Track session data and usage
                      </p>
                    </div>
                    <Switch
                      checked={enableAccounting}
                      onCheckedChange={setEnableAccounting}
                    />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="space-y-0.5">
                      <Label className="text-sm">Enable CoA (RFC 5176)</Label>
                      <p className="text-xs text-muted-foreground">
                        Dynamic session control
                      </p>
                    </div>
                    <Switch
                      checked={enableCOA}
                      onCheckedChange={setEnableCOA}
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                  <Button variant="outline">Save Configuration</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Info Panel */}
          <Card className="border-border shadow-card h-fit">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="h-5 w-5 text-accent" />
                RADIUS Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <div className="flex gap-3">
                <Key className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p><strong className="text-foreground">Authentication:</strong> Validate PPPoE/Hotspot credentials against your user database.</p>
              </div>
              <div className="flex gap-3">
                <Database className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p><strong className="text-foreground">Accounting:</strong> Track session duration, data usage, and connection history.</p>
              </div>
              <div className="flex gap-3">
                <Activity className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p><strong className="text-foreground">CoA Support:</strong> Disconnect users or change bandwidth in real-time without re-auth.</p>
              </div>
              <div className="flex gap-3">
                <Shield className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                <p><strong className="text-foreground">MAC Binding:</strong> Optional MAC address verification for added security.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* NAS Clients */}
        <Card className="border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Server className="h-5 w-5 text-accent" />
                NAS Clients
              </CardTitle>
              <CardDescription>
                Network Access Servers authorized to send RADIUS requests
              </CardDescription>
            </div>
            <Button variant="accent" size="sm">
              <Plus className="h-4 w-4" />
              Add NAS Client
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Secret</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockNASClients.map((nas) => (
                  <TableRow key={nas.id}>
                    <TableCell className="font-medium">{nas.name}</TableCell>
                    <TableCell className="font-mono text-sm">{nas.ip}</TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">{nas.secret}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{nas.type}</Badge>
                    </TableCell>
                    <TableCell>{getStatusBadge(nas.status)}</TableCell>
                    <TableCell className="text-muted-foreground">{nas.lastSeen}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
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

        {/* Authentication Logs */}
        <Card className="border-border shadow-card">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-accent" />
                Authentication Logs
              </CardTitle>
              <CardDescription>
                Recent authentication and accounting events
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>NAS IP</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>MAC Address</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockAuthLogs.map((log, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {log.timestamp}
                    </TableCell>
                    <TableCell className="font-medium">{log.username}</TableCell>
                    <TableCell className="font-mono text-sm">{log.nasIp}</TableCell>
                    <TableCell>{getAuthBadge(log.type)}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{log.mac}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{log.reason}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  );
};

export default RadiusPage;
